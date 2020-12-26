const RPC = require('discord-rpc')
const client = new RPC.Client({ transport: 'ipc' });

client.on('ready', () => {
    const startTimestamp = new Date();
      client.setActivity({
      details: 'In home screen',
      startTimestamp,
      largeImageKey: 'icon',
    });
});

client.login({clientId: '774605779952468022'}).catch(e => {})

module.exports = {
    setActivity(act) {
      client.setActivity(act)
    }
}