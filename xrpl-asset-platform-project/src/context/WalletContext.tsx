"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { getClient, disconnectClient } from "../lib/xrpl/client";
import { createTestWallet, getAccountBalance } from "../lib/xrpl/wallet";
import { Client } from "xrpl";
import { Wallet, WalletContextType } from "../types";

const WalletContext = createContext<WalletContextType>({
  client: null,
  wallet: null,
  connected: false,
  loading: false,
  error: null,
  balance: "0.00",
  connectToXRPL: async () => false,
  createWallet: async () => false,
  disconnect: async () => {},
});

export function useWallet(): WalletContextType {
  return useContext(WalletContext);
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps): JSX.Element {
  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.00");

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (client) {
        disconnectClient(client);
      }
    };
  }, [client]);

  // Update balance when wallet changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (client && wallet) {
        const balance = await getAccountBalance(client, wallet.address);
        setBalance(balance);
      }
    };

    fetchBalance();
  }, [client, wallet]);

  // Connect to the XRPL
  const connectToXRPL = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Connect to XRP Ledger
      const newClient = await getClient();
      setClient(newClient);
      setConnected(true);

      return true;
    } catch (err: any) {
      console.error("Error connecting to XRPL:", err);
      setError("Erreur de connexion au réseau XRPL. Veuillez réessayer.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create a test wallet
  const createWallet = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!client) {
        throw new Error("Client not connected");
      }

      // Create a test wallet with funds on Testnet
      const newWallet = await createTestWallet(client);
      setWallet(newWallet);

      // Get balance
      const balance = await getAccountBalance(client, newWallet.address);
      setBalance(balance);

      return true;
    } catch (err: any) {
      console.error("Error creating wallet:", err);
      setError("Erreur lors de la création du portefeuille. Veuillez réessayer.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect from the network
  const disconnect = async (): Promise<void> => {
    try {
      if (client) {
        await disconnectClient(client);
      }
      setClient(null);
      setWallet(null);
      setConnected(false);
      setBalance("0.00");
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  };

  const value: WalletContextType = {
    client,
    wallet,
    connected,
    loading,
    error,
    balance,
    connectToXRPL,
    createWallet,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
