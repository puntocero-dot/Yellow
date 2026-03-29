import { NextRequest, NextResponse } from 'next/server';
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

async function sendTelegramRequest(token: string, method: string, payload: any) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Telegram API Error (${method}):`, await response.text());
    }
  } catch (error) {
    console.error(`Fetch Error (${method}):`, error);
  }
}

async function sendMessage(token: string, chatId: number, text: string, replyMarkup: any = null) {
  const payload: any = { chat_id: chatId, text, parse_mode: 'Markdown' };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  await sendTelegramRequest(token, 'sendMessage', payload);
}

async function editMessageText(token: string, chatId: number, messageId: number, text: string, replyMarkup: any = null) {
  const payload: any = { chat_id: chatId, message_id: messageId, text, parse_mode: 'Markdown' };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  await sendTelegramRequest(token, 'editMessageText', payload);
}

async function answerCallbackQuery(token: string, callbackQueryId: string, text: string) {
  const payload = { callback_query_id: callbackQueryId, text };
  await sendTelegramRequest(token, 'answerCallbackQuery', payload);
}


export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token');
  if (webhookSecret && incomingSecret !== webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const update = await request.json();
    if (!update || (!update.message && !update.callback_query)) {
      return NextResponse.json({ success: true });
    }

    if (update.message) {
      const chatId = update.message.chat?.id;
      const text = update.message.text;
      if (!chatId) return NextResponse.json({ success: true });

      // 1. Authorization Check (Persistent)
      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name, telegram_id')
        .eq('telegram_id', chatId.toString())
        .single();

      if (!user) {
        // User not linked yet. Check session state.
        const session = await getSession(supabase, chatId);
        
        if (session?.step === 'AWAITING_AUTH_EMAIL') {
          // Process email authentication
          const email = text?.toLowerCase().trim();
          if (!email || !email.includes('@')) {
            await sendMessage(token, chatId, '❌ Por favor, ingresa un correo electrónico válido.');
            return NextResponse.json({ success: true });
          }

          const { data: foundUser, error: findError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('email', email)
            .single();

          if (findError || !foundUser) {
            await sendMessage(token, chatId, '🚫 Lo siento, ese correo no está registrado en nuestro sistema de conductores. Contacta al administrador.');
            await resetSession(supabase, chatId);
          } else {
            // Link Telegram ID to this user
            const { error: updateError } = await supabase
              .from('users')
              .update({ telegram_id: chatId.toString() })
              .eq('id', foundUser.id);

            if (updateError) {
              // Try creating a linking column in session if users table update fails (optional fallback)
              console.error('Failed to link telegram_id in users table:', updateError);
              await sendMessage(token, chatId, '⚠️ Hubo un error al vincular tu cuenta. Asegúrate de que el administrador haya habilitado el campo `telegram_id` en la tabla `users`.');
            } else {
              await sendMessage(token, chatId, `✅ ¡Bienvenido, *${foundUser.full_name}*! Tu cuenta ha sido vinculada correctamente. Ya puedes usar el bot.`);
              await resetSession(supabase, chatId);
              await startExpenseFlow(supabase, token, chatId);
            }
          }
          return NextResponse.json({ success: true });
        } else {
          // Start Authentication Flow
          await updateSession(supabase, chatId, { step: 'AWAITING_AUTH_EMAIL' });
          await sendMessage(token, chatId, '👋 *¡Hola!* Para usar el bot de Yellow Express, primero debemos verificar tu cuenta.\n\nPor favor, *ingresa el correo electrónico* con el que estás registrado en el sistema.');
          return NextResponse.json({ success: true });
        }
      }

      // 2. Authorized User Actions
      if (text === '/start') {
        await sendMessage(token, chatId, `📦 *¡Bienvenido de nuevo, ${user.full_name}!* 🚚\n\nUsa /gasto para registrar un nuevo costo asociado a un viaje.`);
        await resetSession(supabase, chatId);
      } 
      else if (text === '/gasto' || text?.toLowerCase().includes('hola')) {
        await startExpenseFlow(supabase, token, chatId);
      } 
      else {
        const session = await getSession(supabase, chatId);
        if (session) {
          await handleTextInput(supabase, token, chatId, text, session);
        } else {
          await sendMessage(token, chatId, 'Usa /gasto para empezar.');
        }
      }
    } 
    else if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;
      const data = update.callback_query.data;
      
      // Secondary auth check for callbacks
      const { data: user } = await supabase.from('users').select('id').eq('telegram_id', chatId.toString()).single();
      if (!user) return NextResponse.json({ success: true });

      await handleCallback(supabase, token, chatId, messageId, data, update.callback_query.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fatal Bot Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

async function startExpenseFlow(supabase: any, token: string, chatId: number) {
  const { data: trips, error } = await supabase
    .from('trips')
    .select('id, name, departure_date')
    .order('departure_date', { ascending: false })
    .limit(5);

  if (error || !trips || trips.length === 0) {
    return sendMessage(token, chatId, '❌ No se encontraron viajes activos en la base de datos.');
  }

  const keyboard = trips.map((t: any) => [{
    text: `${t.name} (${new Date(t.departure_date).toLocaleDateString()})`,
    callback_data: `trip_${t.id}`
  }]);

  await updateSession(supabase, chatId, { step: 'SELECT_TRIP' });
  await sendMessage(token, chatId, '✈️ *Selecciona el viaje asociado:*', { inline_keyboard: keyboard });
}

async function handleCallback(supabase: any, token: string, chatId: number, messageId: number, data: string, queryId: string) {
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

    await editMessageText(token, chatId, messageId, '🏷️ *Selecciona la categoría del gasto:*', { inline_keyboard: categoryKeyboard });
  } 
  else if (data.startsWith('cat_')) {
    const cat = data.replace('cat_', '');
    await updateSession(supabase, chatId, { step: 'ENTER_AMOUNT', category: cat });
    await editMessageText(token, chatId, messageId, '💰 *Ingresa el monto del gasto (USD):*');
  }
  else if (data === 'confirm_save') {
    const { error } = await supabase
      .from('trip_expenses')
      .insert({
        trip_id: session.data.trip_id,
        category: session.data.category,
        amount: session.data.amount,
        description: session.data.description
      });

    if (error) {
      await answerCallbackQuery(token, queryId, '❌ Error al registrar');
      await sendMessage(token, chatId, '❌ Error al guardar en base de datos.');
      return;
    }

    await answerCallbackQuery(token, queryId, '✅ Gasto registrado');
    await editMessageText(token, chatId, messageId, `✅ *¡Gasto Guardado!*\n\n*Monto:* $${session.data.amount}\n*Descripción:* ${session.data.description}`);
    await resetSession(supabase, chatId);
  }
  else if (data === 'cancel_save') {
    await answerCallbackQuery(token, queryId, '❌ Cancelado');
    await editMessageText(token, chatId, messageId, '❌ Registro cancelado.');
    await resetSession(supabase, chatId);
  }
}

async function handleTextInput(supabase: any, token: string, chatId: number, text: string, session: any) {
  if (session.step === 'ENTER_AMOUNT') {
    const amount = parseFloat(text.replace(',', '.'));
    if (isNaN(amount)) return sendMessage(token, chatId, '❌ Ingresa un número válido.');
    
    await updateSession(supabase, chatId, { step: 'ENTER_DESCRIPTION', amount });
    await sendMessage(token, chatId, '📝 *Ingresa una descripción para el gasto:*');
  } 
  else if (session.step === 'ENTER_DESCRIPTION') {
    await updateSession(supabase, chatId, { step: 'CONFIRM', description: text });
    const cat = EXPENSE_CATEGORIES.find(c => c.value === session.data.category);
    
    const summary = `🛠️ *Confirmación:*\n\n*Cat:* ${cat?.icon} ${cat?.label}\n*Monto:* $${session.data.amount}\n*Desc:* ${text}\n\n¿Guardar?`;
    await sendMessage(token, chatId, summary, {
      inline_keyboard: [[{ text: '✅ Guardar', callback_data: 'confirm_save' }, { text: '❌ Cancelar', callback_data: 'cancel_save' }]]
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
