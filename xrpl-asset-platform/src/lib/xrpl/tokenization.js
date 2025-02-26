// src/lib/xrpl/tokenization.js

import { Client, NFTokenMintFlags, convertStringToHex } from "xrpl";

/**
 * Tokenize a real-world asset on the XRP Ledger using NFTokenMint
 * @param {Client} client - Connected XRPL client instance
 * @param {Object} wallet - User's wallet containing address and seed
 * @param {Object} assetData - Metadata about the asset being tokenized
 * @returns {Object} Result of the tokenization process
 */
export async function tokenizeAsset(client, wallet, assetData) {
  if (!client || !client.isConnected() || !wallet) {
    return {
      success: false,
      error: "Client not connected or wallet unavailable",
    };
  }

  try {
    // Get fee using proper request method
    const feeResponse = await client.request({
      command: "fee",
    });

    const fee = feeResponse.result.drops.median_fee;
    console.log("Current fee:", fee);

    // Prepare metadata as URI (JSON blob)
    const metadataJson = JSON.stringify(assetData);
    const metadataHex = convertStringToHex(metadataJson);

    // Prepare NFToken mint transaction
    const transactionBlob = {
      TransactionType: "NFTokenMint",
      Account: wallet.address,
      NFTokenTaxon: 0, // Required, but can be set to 0 if not using taxonomy
      Flags: NFTokenMintFlags.tfTransferable, // Make the token transferable
      Fee: fee,
      URI: metadataHex,
      Memos: [
        {
          Memo: {
            MemoData: convertStringToHex(
              `RWA Tokenization - ${
                assetData.name
              } - ${new Date().toISOString()}`
            ),
          },
        },
      ],
    };

    // Sign and submit the transaction
    const tx = await client.submitAndWait(transactionBlob, {
      wallet,
    });

    console.log("Tokenization transaction result:", tx);

    if (tx.result.meta.TransactionResult === "tesSUCCESS") {
      // Extract the NFTokenID from transaction metadata
      const nfts = tx.result.meta.AffectedNodes.filter((node) => {
        return (
          node.CreatedNode && node.CreatedNode.LedgerEntryType === "NFTokenPage"
        );
      });

      let tokenId = "";
      if (nfts.length > 0) {
        const tokenPage = nfts[0].CreatedNode.NewFields;
        if (tokenPage && tokenPage.NFTokens && tokenPage.NFTokens.length > 0) {
          tokenId = tokenPage.NFTokens[0].NFToken.NFTokenID;
        }
      }

      return {
        success: true,
        tokenId: tokenId,
        hash: tx.result.hash,
        ledgerIndex: tx.result.ledger_index,
      };
    } else {
      return {
        success: false,
        error: `Transaction failed: ${tx.result.meta.TransactionResult}`,
      };
    }
  } catch (error) {
    console.error("Error in tokenization:", error);
    return {
      success: false,
      error: error.message || "Failed to tokenize asset",
    };
  }
}

/**
 * Get NFTokens owned by the wallet
 * @param {Client} client - Connected XRPL client instance
 * @param {string} address - Owner's wallet address
 * @returns {Array} List of NFTokens
 */
export async function getOwnedTokens(client, address) {
  if (!client || !client.isConnected() || !address) {
    return {
      success: false,
      error: "Client not connected or address unavailable",
    };
  }

  try {
    const response = await client.request({
      command: "account_nfts",
      account: address,
    });

    return {
      success: true,
      tokens: response.result.account_nfts,
    };
  } catch (error) {
    console.error("Error fetching owned tokens:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch owned tokens",
    };
  }
}

/**
 * Creates an offer to sell a tokenized asset
 * @param {Client} client - Connected XRPL client instance
 * @param {Object} wallet - User's wallet containing address and seed
 * @param {string} tokenId - ID of the token to sell
 * @param {string} amount - Amount to sell for (in drops)
 * @returns {Object} Result of the offer creation
 */
export async function createSellOffer(client, wallet, tokenId, amount) {
  if (!client || !client.isConnected() || !wallet) {
    return {
      success: false,
      error: "Client not connected or wallet unavailable",
    };
  }

  try {
    // Get fee using proper request method
    const feeResponse = await client.request({
      command: "fee",
    });

    const fee = feeResponse.result.drops.median_fee;

    const transactionBlob = {
      TransactionType: "NFTokenCreateOffer",
      Account: wallet.address,
      NFTokenID: tokenId,
      Amount: amount, // Amount in drops (not XRP)
      Flags: 1, // 1 = sell offer
      Fee: fee,
    };

    const tx = await client.submitAndWait(transactionBlob, {
      wallet,
    });

    if (tx.result.meta.TransactionResult === "tesSUCCESS") {
      return {
        success: true,
        offerIndex: tx.result.hash, // Not exactly the offer index, but can be used to reference
        hash: tx.result.hash,
      };
    } else {
      return {
        success: false,
        error: `Transaction failed: ${tx.result.meta.TransactionResult}`,
      };
    }
  } catch (error) {
    console.error("Error creating sell offer:", error);
    return {
      success: false,
      error: error.message || "Failed to create sell offer",
    };
  }
}

/**
 * Accept an offer to buy a tokenized asset
 * @param {Client} client - Connected XRPL client instance
 * @param {Object} wallet - User's wallet containing address and seed
 * @param {string} offerIndex - Index of the offer to accept
 * @returns {Object} Result of the offer acceptance
 */
export async function acceptBuyOffer(client, wallet, offerIndex) {
  if (!client || !client.isConnected() || !wallet) {
    return {
      success: false,
      error: "Client not connected or wallet unavailable",
    };
  }

  try {
    // Get fee using proper request method
    const feeResponse = await client.request({
      command: "fee",
    });

    const fee = feeResponse.result.drops.median_fee;

    const transactionBlob = {
      TransactionType: "NFTokenAcceptOffer",
      Account: wallet.address,
      NFTokenBuyOffer: offerIndex,
      Fee: fee,
    };

    const tx = await client.submitAndWait(transactionBlob, {
      wallet,
    });

    if (tx.result.meta.TransactionResult === "tesSUCCESS") {
      return {
        success: true,
        hash: tx.result.hash,
      };
    } else {
      return {
        success: false,
        error: `Transaction failed: ${tx.result.meta.TransactionResult}`,
      };
    }
  } catch (error) {
    console.error("Error accepting buy offer:", error);
    return {
      success: false,
      error: error.message || "Failed to accept buy offer",
    };
  }
}

/**
 * Get all NFT offers for a token
 * @param {Client} client - Connected XRPL client instance
 * @param {string} tokenId - ID of the token
 * @returns {Object} List of offers for the token
 */
export async function getTokenOffers(client, tokenId) {
  if (!client || !client.isConnected()) {
    return {
      success: false,
      error: "Client not connected",
    };
  }

  try {
    const sellOffers = await client.request({
      command: "nft_sell_offers",
      nft_id: tokenId,
    });

    const buyOffers = await client.request({
      command: "nft_buy_offers",
      nft_id: tokenId,
    });

    return {
      success: true,
      sellOffers: sellOffers.result.offers || [],
      buyOffers: buyOffers.result.offers || [],
    };
  } catch (error) {
    console.error("Error fetching token offers:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch token offers",
    };
  }
}
