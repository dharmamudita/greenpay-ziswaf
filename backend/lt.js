const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 5000, subdomain: 'greenpay-api-2026' });
  console.log(`Tunnel URL: ${tunnel.url}`);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
    process.exit(0);
  });
  
  // Keep the process alive
  setInterval(() => {}, 1000 * 60 * 60);
})();
