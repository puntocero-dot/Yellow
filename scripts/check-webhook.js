async function check() {
  const token = '8661612448:AAHocARAfns-qSsHiwy5jST79dsfwDCJqZA';
  const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
check();
