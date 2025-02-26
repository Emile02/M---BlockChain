// src/lib/xrpl/test.js
import { Client } from "xrpl";

export async function testXRPLConnection() {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  try {
    await client.connect();
    console.log("✅ XRPL Connection successful");

    // Tester une fonction basique
    const serverInfo = await client.request({
      command: "server_info",
    });
    console.log("✅ Server info:", serverInfo);

    // Créer un compte de test
    const fund = await client.fundWallet();
    console.log("✅ Wallet created:", fund.wallet.address);

    // Demander le solde
    const balanceInfo = await client.request({
      command: "account_info",
      account: fund.wallet.address,
    });
    console.log("✅ Balance info:", balanceInfo);

    return {
      success: true,
      wallet: fund.wallet,
    };
  } catch (error) {
    console.error("❌ XRPL Test failed:", error);
    return {
      success: false,
      error,
    };
  } finally {
    client.disconnect();
  }
}
