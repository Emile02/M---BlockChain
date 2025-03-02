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

// Fonction pour récupérer les comptes actifs depuis le Ledger
export async function getAllAccounts(): Promise<string[]> {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  try {
    const response = await client.request({
      command: "ledger_data",
      ledger_index: "validated",
      limit: 100, // Ajuste selon tes besoins
    });

    const accounts = response.result.state
        .filter((entry: any) => entry.Account) // Vérifie que l'entrée contient un compte
        .map((entry: any) => entry.Account); // Récupère l'adresse du wallet

    console.log("Comptes XRPL actifs :", accounts);
    return accounts;
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes XRPL :", error);
    return [];
  } finally {
    await client.disconnect();
  }
}


