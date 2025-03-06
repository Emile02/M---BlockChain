// src/lib/xrpl/broker.ts
import { Client, Wallet } from "xrpl";
import { TradingResponse } from "../../types";

/**
 * Broker a sale between a buy offer and a sell offer
 * This allows a third-party to match buyers and sellers and earn a fee
 *
 * @param client - Connected XRPL client
 * @param wallet - Broker's wallet
 * @param sellOfferIndex - Index of the sell offer
 * @param buyOfferIndex - Index of the buy offer
 * @param brokerFee - Fee amount in drops for the broker (optional)
 * @returns Transaction result
 */
export async function brokerSale(
  client: Client,
  wallet: Wallet,
  sellOfferIndex: string,
  buyOfferIndex: string,
  brokerFee?: string
): Promise<TradingResponse> {
  try {
    // Prepare transaction for brokering the sale
    const transactionBlob: any = {
      TransactionType: "NFTokenAcceptOffer",
      Account: wallet.address,
      NFTokenSellOffer: sellOfferIndex,
      NFTokenBuyOffer: buyOfferIndex,
    };

    // Add broker fee if specified
    if (brokerFee) {
      transactionBlob.NFTokenBrokerFee = brokerFee;
    }

    // Submit transaction
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    // Check transaction results
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
    console.error("Error brokering sale:", error);
    return {
      success: false,
      error: error.message || "Unknown error brokering sale",
    };
  }
}

/**
 * Verify that a broker transaction is valid by checking the offer details
 *
 * @param client - Connected XRPL client
 * @param sellOfferIndex - Index of the sell offer
 * @param buyOfferIndex - Index of the buy offer
 * @returns Validation result with offer details if valid
 */
export async function validateBrokerTransaction(
  client: Client,
  sellOfferIndex: string,
  buyOfferIndex: string
): Promise<{
  valid: boolean;
  sellOffer?: any;
  buyOffer?: any;
  error?: string;
}> {
  try {
    // Get sell offer details
    let sellOffer;
    try {
      const sellOfferResponse = await client.request({
        command: "ledger_entry",
        index: sellOfferIndex,
        ledger_index: "validated",
      });
      sellOffer = sellOfferResponse.result.node;
    } catch (error) {
      return {
        valid: false,
        error: "Invalid sell offer: could not find offer in the ledger",
      };
    }

    // Get buy offer details
    let buyOffer;
    try {
      const buyOfferResponse = await client.request({
        command: "ledger_entry",
        index: buyOfferIndex,
        ledger_index: "validated",
      });
      buyOffer = buyOfferResponse.result.node;
    } catch (error) {
      return {
        valid: false,
        error: "Invalid buy offer: could not find offer in the ledger",
      };
    }

    // Verify both offers are for the same NFT
    if (sellOffer.NFTokenID !== buyOffer.NFTokenID) {
      return {
        valid: false,
        error: "Offers are not for the same NFT",
      };
    }

    // Verify sell offer amount is less than or equal to buy offer amount
    const sellAmount = parseInt(sellOffer.Amount);
    const buyAmount = parseInt(buyOffer.Amount);
    if (sellAmount > buyAmount) {
      return {
        valid: false,
        error: "Sell offer amount is greater than buy offer amount",
      };
    }

    // Verify offers haven't expired
    const currentLedgerTime = Math.floor(Date.now() / 1000) - 946684800; // Convert to Ripple time
    if (sellOffer.Expiration && sellOffer.Expiration < currentLedgerTime) {
      return {
        valid: false,
        error: "Sell offer has expired",
      };
    }
    if (buyOffer.Expiration && buyOffer.Expiration < currentLedgerTime) {
      return {
        valid: false,
        error: "Buy offer has expired",
      };
    }

    // All validations passed
    return {
      valid: true,
      sellOffer,
      buyOffer,
    };
  } catch (error: any) {
    console.error("Error validating broker transaction:", error);
    return {
      valid: false,
      error: error.message || "Unknown error validating broker transaction",
    };
  }
}

/**
 * Calculate the maximum broker fee that can be charged for a transaction
 *
 * @param sellOfferAmount - Amount in the sell offer (in drops)
 * @param buyOfferAmount - Amount in the buy offer (in drops)
 * @returns Maximum broker fee in drops
 */
export function calculateMaxBrokerFee(
  sellOfferAmount: string,
  buyOfferAmount: string
): string {
  // The broker fee cannot exceed the difference between the buy offer and sell offer
  const sellAmount = parseInt(sellOfferAmount);
  const buyAmount = parseInt(buyOfferAmount);
  const maxFee = buyAmount - sellAmount;

  return maxFee > 0 ? maxFee.toString() : "0";
}

/**
 * Get all possible brokerable offers
 * This finds pairs of buy and sell offers for the same NFT where the buy price >= sell price
 *
 * @param client - Connected XRPL client
 * @returns Array of brokerable offer pairs
 */
export async function getBrokerableOffers(client: Client): Promise<
  Array<{
    nftId: string;
    sellOffer: any;
    buyOffer: any;
    maxBrokerFee: string;
  }>
> {
  try {
    // This would be a complex function in a real implementation
    // It would require searching through all NFT offers in the ledger
    // For this example, we'll return a placeholder implementation

    // In a real application, you would:
    // 1. Get all NFT sell offers from the ledger
    // 2. For each NFT ID with sell offers, check if there are buy offers
    // 3. Match pairs where buy amount >= sell amount
    // 4. Calculate the max broker fee for each pair

    return [];
  } catch (error) {
    console.error("Error getting brokerable offers:", error);
    return [];
  }
}
