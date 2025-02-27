import { Client } from 'xrpl';

// Connect to the XRP Ledger Testnet
export async function getClient(): Promise<Client> {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  return client;
}

// Disconnect from the XRP Ledger
export async function disconnectClient(client: Client | null): Promise<void> {
  if (client && client.isConnected()) {
    await client.disconnect();
  }
}
