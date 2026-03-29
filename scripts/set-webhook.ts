import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theyellowexpress.com';

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env.local');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });
const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram`;

async function setup() {
  console.log(`🚀 Setting webhook to: ${webhookUrl}`);
  
  try {
    const result = await bot.setWebHook(webhookUrl);
    if (result) {
      console.log('✅ Webhook request sent successfully!');
      // Wait 2 seconds for Telegram to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      const info = await bot.getWebHookInfo();
      console.log('📊 Verifying Webhook info...');
      console.log('🔗 URL:', info.url || '❌ NOT SET');
      if (info.url) {
        console.log('✨ Success! The bot is now live on Vercel.');
      }
    } else {
      console.error('❌ Failed to set webhook.');
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
  }
}

setup();
