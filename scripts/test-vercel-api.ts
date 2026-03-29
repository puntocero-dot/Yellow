import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theyellowexpress.com';
const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram`;

async function testVercelAPI() {
  console.log(`🧪 Enviando test a: ${webhookUrl}`);
  
  const mockUpdate = {
    update_id: 12345,
    message: {
      message_id: 999,
      chat: { id: 12345678, type: 'private' },
      date: Math.floor(Date.now() / 1000),
      text: 'hola'
    }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockUpdate)
    });

    const data = await response.json();
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Datos:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ El endpoint en Vercel respondió correctamente (200 OK)');
    } else {
      console.error('❌ El endpoint en Vercel devolvió un error.');
    }
  } catch (error) {
    console.error('❌ Error fatal al conectar con Vercel:', error);
  }
}

testVercelAPI();
