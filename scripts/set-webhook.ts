import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theyellowexpress.com';

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env.local');
  process.exit(1);
}

const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram`;

async function setup() {
  console.log(`🚀 Setting webhook to: ${webhookUrl}`);
  if (webhookSecret) {
    console.log('🔒 Using secret token for increased security.');
  }

  try {
    const payload: any = { url: webhookUrl };
    if (webhookSecret) {
      payload.secret_token = webhookSecret;
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook request sent successfully!');
      // Wait for propagation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const info = await infoRes.json();
      
      console.log('📊 Verifying Webhook info...');
      console.log('🔗 URL:', info.result.url || '❌ NOT SET');
      if (info.result.has_custom_certificate !== undefined) {
        console.log('✨ Success! The bot is now secure and live on Vercel.');
      }
    } else {
      console.error('❌ Failed to set webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
  }
}

setup();
