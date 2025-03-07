"use client";

import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Client } from "xrpl";
import { disconnectClient, getClient } from "../lib/xrpl/client";
import { getTokenizedAssets, tokenizeAsset } from "../lib/xrpl/tokenization";
import {
  acceptOffer,
  cancelOffer,
  createBuyOffer,
  createSellOffer,
  getAccountOffers,
  getBuyOffers,
  getSellOffers,
  OfferType,
} from "../lib/xrpl/trading";
import { createTestWallet, getAccountBalance } from "../lib/xrpl/wallet";
import {
  Asset,
  TokenizationResult,
  TradingResponse,
  Wallet,
  WalletContextType,
} from "../types";

// Create context with enhanced functionality
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
  refreshBalance: async () => {},
  // NFT methods
  tokenizeAsset: async () => ({ success: false, error: "Not implemented" }),
  getAssets: async () => [],
  createSellOffer: async () => ({ success: false, error: "Not implemented" }),
  createBuyOffer: async () => ({ success: false, error: "Not implemented" }),
  acceptOffer: async () => ({ success: false, error: "Not implemented" }),
  cancelOffer: async () => ({ success: false, error: "Not implemented" }),
  getSellOffers: async () => [],
  getBuyOffers: async () => [],
  getAccountOffers: async () => [],
  batchMintNFTs: async () => ({ success: false, error: "Not implemented" }),
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

  // Function to refresh balance - can be called after transactions
  const refreshBalance = async (): Promise<void> => {
    if (client && wallet) {
      try {
        const newBalance = await getAccountBalance(client, wallet.address);
        setBalance(newBalance);
      } catch (err) {
        console.error("Error refreshing balance:", err);
      }
    }
  };

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

      console.log("Connected");
      console.log("newWallet", newWallet.address);
      await axios.post("http://localhost:8000/sessions/add", {
        address: newWallet.address, // L'adresse du wallet dans le body de la requête
      });

      // Get balance
      const balance = await getAccountBalance(client, newWallet.address);
      setBalance(balance);

      return true;
    } catch (err: any) {
      console.error("Error creating wallet:", err);
      setError(
        "Erreur lors de la création du portefeuille. Veuillez réessayer."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect from the network
  const disconnect = async (): Promise<void> => {
    try {
      if (client) {
        console.log("Disconnecting client");
        if (wallet) {
          await axios.delete("http://localhost:8000/sessions/remove", {
            data: {
              address: wallet.address,
            },
          });
        }
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

  // =============== NFT METHODS =================

  // Tokenize an asset (mint NFT)
  const mintAsset = async (asset: Asset): Promise<TokenizationResult> => {
    try {
      if (!client || !wallet) {
        return {
          success: false,
          error: "Wallet not connected",
        };
      }

      const result = await tokenizeAsset(client, wallet, asset);

      // Refresh balance after tokenization (to account for fees)
      await refreshBalance();

      return result;
    } catch (error: any) {
      console.error("Error tokenizing asset:", error);
      return {
        success: false,
        error: error.message || "Failed to tokenize asset",
      };
    }
  };

  // Get all tokenized assets (NFTs)
  const getAssets = async (): Promise<(Asset & { tokenId: string })[]> => {
    try {
      if (!client || !wallet) {
        return [];
      }

      return await getTokenizedAssets(client, wallet.address);
    } catch (error) {
      console.error("Error getting assets:", error);
      return [];
    }
  };

  // Create a sell offer for an NFT
  const createNFTSellOffer = async (
    tokenId: string,
    amount: string,
    destination?: string,
    expirationDays?: number
  ): Promise<TradingResponse> => {
    try {
      if (!client || !wallet) {
        return {
          success: false,
          error: "Wallet not connected",
        };
      }

      const result = await createSellOffer(
        client,
        wallet,
        tokenId,
        amount,
        destination,
        expirationDays
      );

      // Refresh balance after creating offer (to account for fees)
      await refreshBalance();

      return result;
    } catch (error: any) {
      console.error("Error creating sell offer:", error);
      return {
        success: false,
        error: error.message || "Failed to create sell offer",
      };
    }
  };

  // Create a buy offer for an NFT
  const createNFTBuyOffer = async (
    tokenId: string,
    owner: string,
    amount: string,
    expirationDays?: number
  ): Promise<TradingResponse> => {
    try {
      if (!client || !wallet) {
        return {
          success: false,
          error: "Wallet not connected",
        };
      }

      const result = await createBuyOffer(
        client,
        wallet,
        tokenId,
        owner,
        amount,
        expirationDays
      );

      // Refresh balance after creating offer (to account for fees)
      await refreshBalance();

      return result;
    } catch (error: any) {
      console.error("Error creating buy offer:", error);
      return {
        success: false,
        error: error.message || "Failed to create buy offer",
      };
    }
  };

  // Accept an offer (buy or sell)
  const acceptNFTOffer = async (
    offerIndex: string,
    offerType: OfferType
  ): Promise<TradingResponse> => {
    try {
      if (!client || !wallet) {
        return {
          success: false,
          error: "Wallet not connected",
        };
      }

      const result = await acceptOffer(client, wallet, offerIndex, offerType);

      // Important: Refresh balance after accepting an offer
      // This is crucial for showing the updated XRP amount after a trade
      await refreshBalance();

      return result;
    } catch (error: any) {
      console.error("Error accepting offer:", error);
      return {
        success: false,
        error: error.message || "Failed to accept offer",
      };
    }
  };

  // Cancel an offer
  const cancelNFTOffer = async (
    offerIndex: string
  ): Promise<TradingResponse> => {
    try {
      if (!client || !wallet) {
        return {
          success: false,
          error: "Wallet not connected",
        };
      }

      const result = await cancelOffer(client, wallet, offerIndex);

      // Refresh balance after cancelling offer (to account for fees)
      await refreshBalance();

      return result;
    } catch (error: any) {
      console.error("Error cancelling offer:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel offer",
      };
    }
  };

  // Get sell offers for a token
  const getNFTSellOffers = async (tokenId: string): Promise<any[]> => {
    try {
      if (!client) {
        return [];
      }

      return await getSellOffers(client, tokenId);
    } catch (error) {
      console.error("Error getting sell offers:", error);
      return [];
    }
  };

  // Get buy offers for a token
  const getNFTBuyOffers = async (tokenId: string): Promise<any[]> => {
    try {
      if (!client) {
        return [];
      }

      return await getBuyOffers(client, tokenId);
    } catch (error) {
      console.error("Error getting buy offers:", error);
      return [];
    }
  };

  // Get all offers for an account
  const getAccountNFTOffers = async (): Promise<any[]> => {
    try {
      if (!client || !wallet) {
        return [];
      }

      return await getAccountOffers(client, wallet.address);
    } catch (error) {
      console.error("Error getting account offers:", error);
      return [];
    }
  };

  // Batch mint NFTs
  const batchMintNFTs = async (
    asset: Asset,
    count: number
  ): Promise<TokenizationResult> => {
    try {
      if (!client || !wallet) {
        return {
          success: false,
          error: "Wallet not connected",
        };
      }

      // For now, we'll just mint one token as a placeholder
      // In a real implementation, this would use the batch minting technique with tickets
      const result = await tokenizeAsset(client, wallet, asset);

      // Refresh balance after minting (to account for fees)
      await refreshBalance();

      return result;

      // TODO: Implement batch minting with tickets as shown in ripplex7-batch-minting.js
    } catch (error: any) {
      console.error("Error batch minting NFTs:", error);
      return {
        success: false,
        error: error.message || "Failed to batch mint NFTs",
      };
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
    refreshBalance,
    // NFT methods
    tokenizeAsset: mintAsset,
    getAssets,
    createSellOffer: createNFTSellOffer,
    createBuyOffer: createNFTBuyOffer,
    acceptOffer: acceptNFTOffer,
    cancelOffer: cancelNFTOffer,
    getSellOffers: getNFTSellOffers,
    getBuyOffers: getNFTBuyOffers,
    getAccountOffers: getAccountNFTOffers,
    batchMintNFTs,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
