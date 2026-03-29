/**
 * Yellow Express Telegram Bot
 * Used to register expenses directly from Telegram.
 */

import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not defined in .env.local');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Categories should match app/admin/finances/page.tsx
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

// Simple state management for users
const userState: Record<number, {
  step: 'SELECT_TRIP' | 'SELECT_CATEGORY' | 'ENTER_AMOUNT' | 'ENTER_DESCRIPTION' | 'CONFIRM';
  tripId?: string;
  category?: string;
  amount?: number;
  description?: string;
}> = {};

console.log('Bot is running...');

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📦 *¡Bienvenido al Bot de Yellow Express!* 🚚\n\nUsa /gasto para registrar un nuevo costo asociado a un viaje.', { parse_mode: 'Markdown' });
});

bot.onText(/\/gasto/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Fetch active trips (not cancelled, but usually those departing soon or current)
    const { data: trips, error } = await supabase
      .from('trips')
      .select('id, name, departure_date')
      .order('departure_date', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!trips || trips.length === 0) {
      return bot.sendMessage(chatId, '❌ No se encontraron viajes activos.');
    }

    const keyboard = trips.map(t => [{
      text: `${t.name} (${new Date(t.departure_date).toLocaleDateString()})`,
      callback_data: `trip_${t.id}`
    }]);

    userState[chatId] = { step: 'SELECT_TRIP' };
    bot.sendMessage(chatId, '✈️ *Selecciona el viaje asociado:*', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    bot.sendMessage(chatId, '❌ Error al obtener los viajes.');
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId || !userState[chatId]) return;

  const data = query.data;
  const state = userState[chatId];

  if (data?.startsWith('trip_')) {
    state.tripId = data.replace('trip_', '');
    state.step = 'SELECT_CATEGORY';
    
    const categoryKeyboard = [];
    for (let i = 0; i < EXPENSE_CATEGORIES.length; i += 2) {
      const row = [
        { text: `${EXPENSE_CATEGORIES[i].icon} ${EXPENSE_CATEGORIES[i].label}`, callback_data: `cat_${EXPENSE_CATEGORIES[i].value}` }
      ];
      if (EXPENSE_CATEGORIES[i+1]) {
        row.push({ text: `${EXPENSE_CATEGORIES[i+1].icon} ${EXPENSE_CATEGORIES[i+1].label}`, callback_data: `cat_${EXPENSE_CATEGORIES[i+1].value}` });
      }
      categoryKeyboard.push(row);
    }

    bot.editMessageText('🏷️ *Selecciona la categoría del gasto:*', {
      chat_id: chatId,
      message_id: query.message?.message_id,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: categoryKeyboard }
    });
  } 
  else if (data?.startsWith('cat_')) {
    state.category = data.replace('cat_', '');
    state.step = 'ENTER_AMOUNT';
    
    bot.editMessageText('💰 *Ingresa el monto del gasto (USD):*', {
      chat_id: chatId,
      message_id: query.message?.message_id,
      parse_mode: 'Markdown'
    });
  }
  else if (data === 'confirm_save') {
    try {
      const { error } = await supabase
        .from('trip_expenses')
        .insert({
          trip_id: state.tripId,
          category: state.category,
          amount: state.amount,
          description: state.description
        });

      if (error) throw error;

      bot.answerCallbackQuery(query.id, { text: '✅ Gasto registrado correctamente' });
      bot.editMessageText(`✅ *¡Gasto Guardado!*\n\n*Monto:* $${state.amount}\n*Descripción:* ${state.description}`, {
        chat_id: chatId,
        message_id: query.message?.message_id,
        parse_mode: 'Markdown'
      });
      delete userState[chatId];
    } catch (error) {
      console.error('Error saving expense:', error);
      bot.sendMessage(chatId, '❌ Error al guardar el gasto en la base de datos.');
    }
  }
  else if (data === 'cancel_save') {
    bot.editMessageText('❌ Registro cancelado.', {
      chat_id: chatId,
      message_id: query.message?.message_id
    });
    delete userState[chatId];
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const state = userState[chatId];
  if (!state || msg.text?.startsWith('/')) return;

  if (state.step === 'ENTER_AMOUNT') {
    const amount = parseFloat(msg.text || '');
    if (isNaN(amount)) {
      return bot.sendMessage(chatId, '❌ Por favor ingresa un número válido para el monto.');
    }
    state.amount = amount;
    state.step = 'ENTER_DESCRIPTION';
    bot.sendMessage(chatId, '📝 *Ingresa una descripción para el gasto:*', { parse_mode: 'Markdown' });
  } 
  else if (state.step === 'ENTER_DESCRIPTION') {
    state.description = msg.text || '';
    state.step = 'CONFIRM';
    
    const cat = EXPENSE_CATEGORIES.find(c => c.value === state.category);
    
    const summary = `🛠️ *Confirmación de Gasto:*\n\n` +
      `*Categoría:* ${cat?.icon} ${cat?.label}\n` +
      `*Monto:* $${state.amount?.toFixed(2)}\n` +
      `*Descripción:* ${state.description}\n\n` +
      `¿Deseas guardar este gasto?`;

    bot.sendMessage(chatId, summary, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Guardar', callback_data: 'confirm_save' },
            { text: '❌ Cancelar', callback_data: 'cancel_save' }
          ]
        ]
      }
    });
  }
});
