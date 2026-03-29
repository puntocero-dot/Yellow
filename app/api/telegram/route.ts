import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured in Vercel' }, { status: 500 });
  }

  // Initialize clients inside the request to ensure env vars are ready
  const bot = new TelegramBot(token, { polling: false });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const update = await request.json();
    console.log('Update received:', update);

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === '/start') {
        await bot.sendMessage(chatId, '📦 *¡Bienvenido al Bot de Yellow Express!* 🚚\n\nUsa /gasto para registrar un nuevo costo asociado a un viaje.', { parse_mode: 'Markdown' });
        await resetSession(supabase, chatId);
      } 
      else if (text === '/gasto' || text?.toLowerCase().includes('hola')) {
        await startExpenseFlow(supabase, bot, chatId);
      } 
      else {
        const session = await getSession(supabase, chatId);
        if (!session) {
          await startExpenseFlow(supabase, bot, chatId);
        } else {
          await handleTextInput(supabase, bot, chatId, text, session);
        }
      }
    } 
    else if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;
      const data = update.callback_query.data;
      await handleCallback(supabase, bot, chatId, messageId, data, update.callback_query.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing Telegram update:', error);
    return NextResponse.json({ 
      error: 'Error interno en el bot', 
      details: error.message 
    }, { status: 500 });
  }
}

async function startExpenseFlow(supabase: any, bot: any, chatId: number) {
  const { data: trips, error } = await supabase
    .from('trips')
    .select('id, name, departure_date')
    .order('departure_date', { ascending: false })
    .limit(5);

  if (error || !trips || trips.length === 0) {
    return bot.sendMessage(chatId, '❌ No se encontraron viajes activos en la base de datos.');
  }

  const keyboard = trips.map((t: any) => [{
    text: `${t.name} (${new Date(t.departure_date).toLocaleDateString()})`,
    callback_data: `trip_${t.id}`
  }]);

  await updateSession(supabase, chatId, { step: 'SELECT_TRIP' });
  await bot.sendMessage(chatId, '✈️ *Selecciona el viaje asociado:*', {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard }
  });
}

async function handleCallback(supabase: any, bot: any, chatId: number, messageId: number, data: string, queryId: string) {
  const session = await getSession(supabase, chatId);
  if (!session) return;

  if (data.startsWith('trip_')) {
    const tripId = data.replace('trip_', '');
    await updateSession(supabase, chatId, { step: 'SELECT_CATEGORY', trip_id: tripId });
    
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
    await updateSession(supabase, chatId, { step: 'ENTER_AMOUNT', category: cat });
    await bot.editMessageText('💰 *Ingresa el monto del gasto (USD):*', {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown'
    });
  }
  else if (data === 'confirm_save') {
    await supabase
      .from('trip_expenses')
      .insert({
        trip_id: session.data.trip_id,
        category: session.data.category,
        amount: session.data.amount,
        description: session.data.description
      });

    await bot.answerCallbackQuery(queryId, { text: '✅ Gasto registrado' });
    await bot.editMessageText(`✅ *¡Gasto Guardado!*\n\n*Monto:* $${session.data.amount}\n*Descripción:* ${session.data.description}`, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown'
    });
    await resetSession(supabase, chatId);
  }
}

async function handleTextInput(supabase: any, bot: any, chatId: number, text: string, session: any) {
  if (session.step === 'ENTER_AMOUNT') {
    const amount = parseFloat(text.replace(',', '.'));
    if (isNaN(amount)) return bot.sendMessage(chatId, '❌ Ingresa un número válido.');
    
    await updateSession(supabase, chatId, { step: 'ENTER_DESCRIPTION', amount });
    await bot.sendMessage(chatId, '📝 *Ingresa una descripción para el gasto:*', { parse_mode: 'Markdown' });
  } 
  else if (session.step === 'ENTER_DESCRIPTION') {
    await updateSession(supabase, chatId, { step: 'CONFIRM', description: text });
    const cat = EXPENSE_CATEGORIES.find(c => c.value === session.data.category);
    
    const summary = `🛠️ *Confirmación:*\n\n*Cat:* ${cat?.icon} ${cat?.label}\n*Monto:* $${session.data.amount}\n*Desc:* ${text}\n\n¿Guardar?`;
    await bot.sendMessage(chatId, summary, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '✅ Guardar', callback_data: 'confirm_save' }, { text: '❌ Cancelar', callback_data: 'cancel_save' }]] }
    });
  }
}

// Session Helpers
async function getSession(supabase: any, userId: number) {
  const { data } = await supabase.from('bot_sessions').select('*').eq('user_id', userId).single();
  return data;
}

async function updateSession(supabase: any, userId: number, newData: any) {
  const current = await getSession(supabase, userId);
  const updatedData = { ...(current?.data || {}), ...newData };
  const step = newData.step || current?.step || 'START';
  
  await supabase.from('bot_sessions').upsert({
    user_id: userId,
    step: step,
    data: updatedData,
    updated_at: new Date().toISOString()
  });
}

async function resetSession(supabase: any, userId: number) {
  await supabase.from('bot_sessions').delete().eq('user_id', userId);
}
