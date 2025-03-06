// src/types.ts
import { Client } from "xrpl";
import { OfferType } from "./lib/xrpl/trading";

export interface Wallet {
  address: string;
  seed: string;
  publicKey?: string;
  privateKey?: string;
}

export interface Attribute {
  trait_type: string;
  value: string | number;
}

export interface Asset {
  name: string;
  description: string;
  type: string;
  value: number;
  currency: string;
  imageUrl?: string;
  location?: string;
  backgroundColor?: string;
  owner: string;
  attributes: Attribute[];
}

export interface TokenizationResult {
  success: boolean;
  tokenId?: string;
  txid?: string;
  error?: string;
}

export interface TradingResponse {
  success: boolean;
  offerIndex?: string;
  txid?: string;
  status?: "created" | "accepted" | "cancelled";
  error?: string;
}

export interface WalletContextType {
  client: Client | null;
  wallet: Wallet | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  balance: string;
  connectToXRPL: () => Promise<boolean>;
  createWallet: () => Promise<boolean>;
  disconnect: () => Promise<void>;

  // New methods
  tokenizeAsset: (asset: Asset) => Promise<TokenizationResult>;
  getAssets: () => Promise<(Asset & { tokenId: string })[]>;
  createSellOffer: (
    tokenId: string,
    amount: string,
    destination?: string,
    expirationDays?: number
  ) => Promise<TradingResponse>;
  createBuyOffer: (
    tokenId: string,
    owner: string,
    amount: string,
    expirationDays?: number
  ) => Promise<TradingResponse>;
  acceptOffer: (
    offerIndex: string,
    offerType: OfferType
  ) => Promise<TradingResponse>;
  cancelOffer: (offerIndex: string) => Promise<TradingResponse>;
  getSellOffers: (tokenId: string) => Promise<any[]>;
  getBuyOffers: (tokenId: string) => Promise<any[]>;
  getAccountOffers: () => Promise<any[]>;
  batchMintNFTs: (asset: Asset, count: number) => Promise<TokenizationResult>;
}
