const { Client } = require('pg');

async function checkData() {
  const client = new Client({
    connectionString: "postgresql://postgres.ttqoeigoyoahvvyycqmk:Baskaran2026@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" // Using DIRECT_URL
  });

  try {
    await client.connect();
    console.log('--- Database Check ---');
    
    const tables = ['User', 'Store', 'Product', 'Order', 'ShippingRate', 'ShippingMethod'];
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`${table}: ${res.rows[0].count}`);
      } catch (e) {
        console.log(`${table}: Table doesn't exist`);
      }
    }
    
  } catch (err) {
    console.error('Connection error', err.stack);
  } finally {
    await client.end();
  }
}

checkData();
