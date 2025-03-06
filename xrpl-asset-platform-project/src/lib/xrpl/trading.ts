// src/lib/xrpl/trading.ts
import { Client, Wallet } from "xrpl";
import { TradingResponse } from "../../types";

/**
 * Types d'offres NFT
 */
export enum OfferType {
  SELL = "sell",
  BUY = "buy",
}

/**
 * Créer une offre de vente pour un NFT
 *
 * @param client - Client XRPL connecté
 * @param wallet - Portefeuille de l'utilisateur
 * @param tokenId - ID du NFToken à vendre
 * @param amount - Montant pour la vente (en drops XRP)
 * @param destination - Acheteur spécifique (optionnel)
 * @param expirationDays - Jours avant expiration de l'offre (optionnel)
 * @returns Objet avec le résultat de la transaction
 */
export async function createSellOffer(
  client: Client,
  wallet: Wallet,
  tokenId: string,
  amount: string,
  destination?: string,
  expirationDays?: number
): Promise<TradingResponse> {
  try {
    // Calcul de la date d'expiration si fournie
    let expirationDate = null;
    if (expirationDays) {
      let d = new Date();
      d.setDate(d.getDate() + expirationDays);
      expirationDate = rippleTimeFromDate(d);
    }

    // Préparation de la transaction avec flag de vente (1)
    const transactionBlob: any = {
      TransactionType: "NFTokenCreateOffer",
      Account: wallet.address,
      NFTokenID: tokenId,
      Amount: amount,
      Flags: 1, // Flag pour offre de vente
    };

    // Ajout des champs optionnels si fournis
    if (expirationDate) {
      transactionBlob["Expiration"] = expirationDate;
    }

    if (destination) {
      transactionBlob["Destination"] = destination;
    }

    // Soumission de la transaction
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    // Vérification des résultats
    if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
      return {
        success: false,
        error: `Transaction failed: ${tx.result.meta.TransactionResult}`,
      };
    }

    // Récupération de l'indice de l'offre NFT depuis les métadonnées de la transaction
    let offerIndex = extractOfferIndex(tx);

    // Récupération de toutes les offres de vente pour trouver notre nouvelle offre si non trouvée directement
    if (!offerIndex) {
      try {
        const sellOffers = await client.request({
          method: "nft_sell_offers",
          nft_id: tokenId,
        });

        // La dernière offre est probablement celle que nous venons de créer
        if (
          sellOffers.result &&
          sellOffers.result.offers &&
          sellOffers.result.offers.length > 0
        ) {
          offerIndex = sellOffers.result.offers[0].nft_offer_index;
        }
      } catch (error) {
        console.log("Error getting sell offers after creation:", error);
        // Continue even if we can't fetch the offer index
      }
    }

    return {
      success: true,
      offerIndex,
      txid: tx.result.hash,
      status: "created",
    };
  } catch (error: any) {
    console.error("Error creating sell offer:", error);
    return {
      success: false,
      error: error.message || "Unknown error creating sell offer",
    };
  }
}

/**
 * Créer une offre d'achat pour un NFT
 *
 * @param client - Client XRPL connecté
 * @param wallet - Portefeuille de l'utilisateur
 * @param tokenId - ID du NFToken à acheter
 * @param owner - Propriétaire du NFT
 * @param amount - Montant offert (en drops XRP)
 * @param expirationDays - Jours avant expiration de l'offre (optionnel)
 * @returns Objet avec le résultat de la transaction
 */
export async function createBuyOffer(
  client: Client,
  wallet: Wallet,
  tokenId: string,
  owner: string,
  amount: string,
  expirationDays?: number
): Promise<TradingResponse> {
  try {
    // Vérifier que l'utilisateur n'est pas le propriétaire
    if (wallet.address === owner) {
      return {
        success: false,
        error: "You cannot create a buy offer for an NFT that you already own.",
      };
    }

    // Calcul de la date d'expiration si fournie
    let expirationDate = null;
    if (expirationDays) {
      let d = new Date();
      d.setDate(d.getDate() + expirationDays);
      expirationDate = rippleTimeFromDate(d);
    }

    // Préparation de la transaction - pas de flag pour offre d'achat
    const transactionBlob: any = {
      TransactionType: "NFTokenCreateOffer",
      Account: wallet.address,
      Owner: owner,
      NFTokenID: tokenId,
      Amount: amount,
    };

    // Ajout de l'expiration si fournie
    if (expirationDate) {
      transactionBlob["Expiration"] = expirationDate;
    }

    // Soumission de la transaction
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    // Vérification des résultats
    if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
      return {
        success: false,
        error: `Transaction failed: ${tx.result.meta.TransactionResult}`,
      };
    }

    // Récupération de l'indice de l'offre NFT
    let offerIndex = extractOfferIndex(tx);

    // Récupération des offres d'achat pour trouver notre offre
    if (!offerIndex) {
      try {
        const buyOffers = await client.request({
          method: "nft_buy_offers",
          nft_id: tokenId,
        });

        // La dernière offre est probablement celle que nous venons de créer
        if (
          buyOffers.result &&
          buyOffers.result.offers &&
          buyOffers.result.offers.length > 0
        ) {
          offerIndex = buyOffers.result.offers[0].nft_offer_index;
        }
      } catch (error) {
        console.log("Error getting buy offers after creation:", error);
        // Continue even if we can't fetch the offer index
      }
    }

    return {
      success: true,
      offerIndex,
      txid: tx.result.hash,
      status: "created",
    };
  } catch (error: any) {
    console.error("Error creating buy offer:", error);
    return {
      success: false,
      error: error.message || "Unknown error creating buy offer",
    };
  }
}

/**
 * Accepter une offre pour un NFT
 *
 * @param client - Client XRPL connecté
 * @param wallet - Portefeuille de l'utilisateur
 * @param offerIndex - Indice de l'offre à accepter
 * @param offerType - Type d'offre (vente ou achat)
 * @returns Objet avec le résultat de la transaction
 */
export async function acceptOffer(
  client: Client,
  wallet: Wallet,
  offerIndex: string,
  offerType: OfferType
): Promise<TradingResponse> {
  try {
    // Préparation de la transaction avec le champ approprié selon le type d'offre
    const transactionBlob: any = {
      TransactionType: "NFTokenAcceptOffer",
      Account: wallet.address,
    };

    // Ajouter le champ correspondant au type d'offre
    if (offerType === OfferType.SELL) {
      transactionBlob.NFTokenSellOffer = offerIndex;
    } else {
      transactionBlob.NFTokenBuyOffer = offerIndex;
    }

    // Soumission de la transaction
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    // Vérification des résultats
    if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
      return {
        success: false,
        error: `Transaction failed: ${tx.result.meta.TransactionResult}`,
      };
    }

    return {
      success: true,
      txid: tx.result.hash,
      status: "accepted",
    };
  } catch (error: any) {
    console.error(`Error accepting ${offerType} offer:`, error);
    return {
      success: false,
      error: error.message || `Unknown error accepting ${offerType} offer`,
    };
  }
}

/**
 * Accepter une offre de vente (pour compatibilité)
 */
export async function acceptSellOffer(
  client: Client,
  wallet: Wallet,
  offerIndex: string
): Promise<TradingResponse> {
  return acceptOffer(client, wallet, offerIndex, OfferType.SELL);
}

/**
 * Accepter une offre d'achat (pour compatibilité)
 */
export async function acceptBuyOffer(
  client: Client,
  wallet: Wallet,
  offerIndex: string
): Promise<TradingResponse> {
  return acceptOffer(client, wallet, offerIndex, OfferType.BUY);
}

/**
 * Annuler une offre (achat ou vente)
 *
 * @param client - Client XRPL connecté
 * @param wallet - Portefeuille de l'utilisateur (doit être le créateur de l'offre)
 * @param offerIndex - Indice de l'offre à annuler
 * @returns Objet avec le résultat de la transaction
 */
export async function cancelOffer(
  client: Client,
  wallet: Wallet,
  offerIndex: string
): Promise<TradingResponse> {
  try {
    // Préparation de la transaction
    const transactionBlob: any = {
      TransactionType: "NFTokenCancelOffer",
      Account: wallet.address,
      NFTokenOffers: [offerIndex],
    };

    // Soumission de la transaction
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    // Vérification des résultats
    if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
      return {
        success: false,
        error: `Transaction failed: ${tx.result.meta.TransactionResult}`,
      };
    }

    return {
      success: true,
      txid: tx.result.hash,
      status: "cancelled",
    };
  } catch (error: any) {
    console.error("Error cancelling offer:", error);
    return {
      success: false,
      error: error.message || "Unknown error cancelling offer",
    };
  }
}

/**
 * Récupérer les offres de vente pour un NFT
 *
 * @param client - Client XRPL connecté
 * @param tokenId - ID du NFToken
 * @returns Tableau des offres de vente
 */
export async function getSellOffers(client: Client, tokenId: string) {
  try {
    const response = await client.request({
      method: "nft_sell_offers",
      nft_id: tokenId,
    });

    return response.result.offers || [];
  } catch (error: any) {
    // Vérifier si c'est une erreur "object not found"
    if (error.data && error.data.error === "objectNotFound") {
      console.log("No sell offers found for this NFT");
      return [];
    }

    console.error("Error getting sell offers:", error);
    return [];
  }
}

/**
 * Récupérer les offres d'achat pour un NFT
 *
 * @param client - Client XRPL connecté
 * @param tokenId - ID du NFToken
 * @returns Tableau des offres d'achat
 */
export async function getBuyOffers(client: Client, tokenId: string) {
  try {
    const response = await client.request({
      method: "nft_buy_offers",
      nft_id: tokenId,
    });

    return response.result.offers || [];
  } catch (error: any) {
    // Vérifier si c'est une erreur "object not found"
    if (error.data && error.data.error === "objectNotFound") {
      console.log("No buy offers found for this NFT");
      return [];
    }

    console.error("Error getting buy offers:", error);
    return [];
  }
}

/**
 * Récupérer toutes les offres NFT créées par un compte
 *
 * @param client - Client XRPL connecté
 * @param address - Adresse du compte
 * @returns Tableau des objets d'offre
 */
export async function getAccountOffers(client: Client, address: string) {
  try {
    const response = await client.request({
      method: "account_objects",
      account: address,
      type: "nft_offer",
    });

    return response.result.account_objects || [];
  } catch (error: any) {
    console.error("Error getting account offers:", error);
    return [];
  }
}

// Fonctions utilitaires

/**
 * Convertir une date JavaScript en temps Ripple
 */
function rippleTimeFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000) - 946684800;
}

/**
 * Extraire l'indice d'offre des métadonnées de transaction
 */
function extractOfferIndex(tx: any): string | null {
  try {
    if (tx.result.meta.AffectedNodes) {
      for (const node of tx.result.meta.AffectedNodes) {
        if (
          node.CreatedNode &&
          node.CreatedNode.LedgerEntryType === "NFTokenOffer"
        ) {
          return node.CreatedNode.LedgerIndex;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting offer index:", error);
    return null;
  }
}
