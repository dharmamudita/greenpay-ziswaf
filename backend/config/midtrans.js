const midtransClient = require('midtrans-client');
require('dotenv').config();

// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-xWn-fSksEHT0Uo6vB0tXfJj1', // Default to sandbox if not set
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-86Tz9_1zT1_91F6D'
});

// Create Core API instance (if needed later for direct API calls without Snap UI)
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-xWn-fSksEHT0Uo6vB0tXfJj1',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-86Tz9_1zT1_91F6D'
});

module.exports = { snap, coreApi };
