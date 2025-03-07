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
  createdAt?: string;
}

export interface AssetAttribute {
  trait_type: string;
  value: string;
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
  refreshBalance: () => Promise<void>; // Added method to refresh balance

  // NFT methods
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

export enum FeedbackCategory {
  BUG = "bug",
  FEATURE = "feature",
  EXPERIENCE = "experience",
  OTHER = "other",
}

// Type pour les données de feedback
export interface Feedback {
  id?: string; // ID unique généré par le système
  userId?: string; // ID ou adresse du portefeuille de l'utilisateur
  category: string; // Catégorie du feedback (utiliser FeedbackCategory)
  subject: string; // Sujet/titre du feedback
  message: string; // Contenu détaillé du feedback
  rating: number; // Note donnée par l'utilisateur (1-5)
  email?: string; // Email optionnel pour le contact
  createdAt: Date | string; // Date de création du feedback
  status?: FeedbackStatus; // Statut du traitement
  adminResponse?: string; // Réponse éventuelle de l'admin
}

// Enumération des statuts de feedback
export enum FeedbackStatus {
  NEW = "new", // Nouveau feedback non traité
  IN_REVIEW = "in_review", // Feedback en cours d'examen
  COMPLETED = "completed", // Feedback traité
  REJECTED = "rejected", // Feedback rejeté (spam, etc.)
}

// Type pour les réponses de l'API de feedback
export interface FeedbackApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
