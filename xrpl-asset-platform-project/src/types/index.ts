import { Wallet as XRPLWallet, Client } from 'xrpl';

export interface Wallet extends XRPLWallet {
  address: string;
  seed: string;
}

export interface AssetAttribute {
  trait_type: string;
  value: string;
}

export interface Asset {
  name: string;
  description: string;
  type: string;
  value: number;
  currency: string;
  location?: string;
  imageUrl?: string;
  attributes: AssetAttribute[];
  createdAt?: string;
  owner?: string;
}

export interface TokenizationResult {
  success: boolean;
  tokenId?: string;
  txid?: string;
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
}
