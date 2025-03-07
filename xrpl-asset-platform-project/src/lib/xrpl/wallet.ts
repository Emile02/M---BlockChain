// src/lib/xrpl/wallet.ts
import { Client, FundWalletResponse } from "xrpl";
import { Wallet as WalletType } from "../../types";

// Create a new test wallet with funds from the Testnet faucet
export async function createTestWallet(client: Client): Promise<WalletType> {
  try {
    const fund_result: FundWalletResponse = await client.fundWallet();
    return fund_result.wallet as WalletType;
  } catch (error) {
    console.error("Error creating test wallet:", error);
    throw error;
  }
}

// Get account balance
export async function getAccountBalance(
  client: Client,
  address: string
): Promise<string> {
  try {
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });

    // Convert drops to XRP (1 XRP = 1,000,000 drops)
    const balanceInDrops = response.result.account_data.Balance;
    const balanceInXRP = Number(balanceInDrops) / 1000000;

    return balanceInXRP.toFixed(2);
  } catch (error) {
    console.error("Error getting account balance:", error);
    return "0.00";
  }
}

// Refresh balances for multiple accounts
export async function refreshMultipleBalances(
  client: Client,
  addresses: string[]
): Promise<Record<string, string>> {
  try {
    const balances: Record<string, string> = {};

    // Get balance for each address
    const promises = addresses.map(async (address) => {
      try {
        const balance = await getAccountBalance(client, address);
        balances[address] = balance;
      } catch (err) {
        console.error(`Error getting balance for ${address}:`, err);
        balances[address] = "0.00";
      }
    });

    await Promise.all(promises);
    return balances;
  } catch (error) {
    console.error("Error refreshing multiple balances:", error);
    return {};
  }
}

// Get account wallet from seed
export async function getAccountWallet(seed: string): Promise<WalletType> {
  try {
    const wallet = require("xrpl").Wallet.fromSeed(seed);
    return {
      address: wallet.address,
      seed: seed,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    console.error("Error getting wallet from seed:", error);
    throw error;
  }
}
