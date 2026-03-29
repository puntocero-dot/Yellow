import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

// Initialization in Serverless
const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// We only initialize the bot object to use its message formatting and parsing utilities, 
// NOT for polling.
const bot = new TelegramBot(token || '', { polling: false });
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EXPENSE_CATEGORIES = [
  { value: 'flight', label: 'Vuelo', icon: '✈️' },
  { value: 'luggage', label: 'Maletas Extra', icon: '🧳' },
  { value: 'gas', label: 'Gasolina', icon: '⛽' },
  { value: 'taxes', label: 'Impuestos/Taxes', icon: '🏛️' },
  { value: 'food', label: 'Alimentación', icon: '🍔' },
  { value: 'transport', label: 'Transporte Local', icon: '🚗' },
  { value: 'packaging', label: 'Empaque/Materiales', icon: '📦' },
  { value: 'other', label: 'Otros', icon: '📋' },
];

export async function POST(request: NextRequest) {
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
  }

  try {
    const update = await request.json();
    console.log('Update received:', update);

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === '/start') {
        await bot.sendMessage(chatId, '📦 *¡Bienvenido al Bot de Yellow Express!* 🚚\n\nUsa /gasto para registrar un nuevo costo asociado a un viaje.', { parse_mode: 'Markdown' });
        await resetSession(chatId);
      } 
      else if (text === '/gasto') {
        await startExpenseFlow(chatId);
      } 
      else {
        await handleTextInput(chatId, text);
      }
    } 
    else if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;
      const data = update.callback_query.data;
      await handleCallback(chatId, messageId, data, update.callback_query.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Telegram update:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

async function startExpenseFlow(chatId: number) {
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('id, name, departure_date')
      .order('departure_date', { ascending: false })
      .limit(5);

    if (error || !trips || trips.length === 0) {
      return bot.sendMessage(chatId, '❌ No se encontraron viajes activos en la base de datos.');
    }

    const keyboard = trips.map(t => [{
      text: `${t.name} (${new Date(t.departure_date).toLocaleDateString()})`,
      callback_data: `trip_${t.id}`
    }]);

    await updateSession(chatId, { step: 'SELECT_TRIP' });
    await bot.sendMessage(chatId, '✈️ *Selecciona el viaje asociado:*', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (err) {
    console.error('Error starting flow:', err);
    await bot.sendMessage(chatId, '❌ Error al obtener los viajes.');
  }
}

async function handleCallback(chatId: number, messageId: number, data: string, queryId: string) {
  const session = await getSession(chatId);
  if (!session) return;

  if (data.startsWith('trip_')) {
    const tripId = data.replace('trip_', '');
    await updateSession(chatId, { step: 'SELECT_CATEGORY', trip_id: tripId });
    
    const categoryKeyboard = [];
    for (let i = 0; i < EXPENSE_CATEGORIES.length; i += 2) {
      const row = [{ text: `${EXPENSE_CATEGORIES[i].icon} ${EXPENSE_CATEGORIES[i].label}`, callback_data: `cat_${EXPENSE_CATEGORIES[i].value}` }];
      if (EXPENSE_CATEGORIES[i+1]) row.push({ text: `${EXPENSE_CATEGORIES[i+1].icon} ${EXPENSE_CATEGORIES[i+1].label}`, callback_data: `cat_${EXPENSE_CATEGORIES[i+1].value}` });
      categoryKeyboard.push(row);
    }

    await bot.editMessageText('🏷️ *Selecciona la categoría del gasto:*', {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: categoryKeyboard }
    });
  } 
  else if (data.startsWith('cat_')) {
    const cat = data.replace('cat_', '');
    await updateSession(chatId, { step: 'ENTER_AMOUNT', category: cat });
    await bot.editMessageText('💰 *Ingresa el monto del gasto (USD):*', {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown'
    });
  }
  else if (data === 'confirm_save') {
    try {
      const { error } = await supabase
        .from('trip_expenses')
        .insert({
          trip_id: session.data.trip_id,
          category: session.data.category,
          amount: session.data.amount,
          description: session.data.description
        });

      if (error) throw error;

      await bot.answerCallbackQuery(queryId, { text: '✅ Gasto registrado' });
      await bot.editMessageText(`✅ *¡Gasto Guardado!*\n\n*Monto:* $${session.data.amount}\n*Descripción:* ${session.data.description}`, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown'
      });
      await resetSession(chatId);
    } catch (err) {
      console.error('Error saving:', err);
      await bot.sendMessage(chatId, '❌ Error al guardar el gasto.');
    }
  }
}

async function handleTextInput(chatId: number, text: string) {
  const session = await getSession(chatId);
  if (!session) return;

  if (session.step === 'ENTER_AMOUNT') {
    const amount = parseFloat(text.replace(',', '.'));
    if (isNaN(amount)) return bot.sendMessage(chatId, '❌ Ingresa un número válido.');
    
    await updateSession(chatId, { step: 'ENTER_DESCRIPTION', amount });
    await bot.sendMessage(chatId, '📝 *Ingresa una descripción para el gasto:*', { parse_mode: 'Markdown' });
  } 
  else if (session.step === 'ENTER_DESCRIPTION') {
    await updateSession(chatId, { step: 'CONFIRM', description: text });
    const current = await getSession(chatId);
    const cat = EXPENSE_CATEGORIES.find(c => c.value === current?.data.category);
    
    const summary = `🛠️ *Confirmación:*\n\n*Cat:* ${cat?.icon} ${cat?.label}\n*Monto:* $${current?.data.amount}\n*Desc:* ${text}\n\n¿Guardar?`;
    await bot.sendMessage(chatId, summary, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '✅ Guardar', callback_data: 'confirm_save' }, { text: '❌ Cancelar', callback_data: 'cancel_save' }]] }
    });
  }
}

// Session Helpers using Supabase
async function getSession(userId: number) {
  const { data } = await supabase.from('bot_sessions').select('*').eq('user_id', userId).single();
  return data;
}

async function updateSession(userId: number, newData: any) {
  const current = await getSession(userId);
  const updatedData = { ...(current?.data || {}), ...newData };
  const step = newData.step || current?.step || 'START';
  
  await supabase.from('bot_sessions').upsert({
    user_id: userId,
    step: step,
    data: updatedData,
    updated_at: new Date().toISOString()
  });
}

async function resetSession(userId: number) {
  await supabase.from('bot_sessions').delete().eq('user_id', userId);
}
