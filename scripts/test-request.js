const url = "https://theyellowexpress.com/api/telegram";

async function test() {
  console.log("Sending POST to", url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 12345,
        message: {
          message_id: 1,
          chat: { id: 123, type: 'private' },
          date: 123,
          text: 'hola'
        }
      })
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
