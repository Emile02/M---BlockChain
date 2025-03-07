// src/lib/xrpl/tokenization.ts
import { Client, convertStringToHex } from "xrpl";
import { Asset, TokenizationResult, Wallet } from "../../types";

export async function tokenizeAsset(
  client: Client,
  wallet: Wallet,
  assetData: Asset
): Promise<TokenizationResult> {
  try {
    // Store minimal metadata but ensure we include value and currency
    const minimalMetadata = {
      name: assetData.name.substring(0, 50), // Limit name length
      type: assetData.type,
      description: assetData.description
        ? assetData.description.substring(0, 100)
        : "", // Limit description
      imageUrl: assetData.imageUrl || "",
      value: assetData.value, // Make sure we include the value
      currency: assetData.currency, // Make sure we include the currency
      owner: wallet.address,
    };

    // Convert metadata to hex - keeping it small
    const metadataHex = convertStringToHex(JSON.stringify(minimalMetadata));

    // Check if the hex is within size limits (256 bytes)
    if (metadataHex.length > 512) {
      // 512 hex chars = 256 bytes
      throw new Error(
        "Metadata too large. Please reduce the description or remove some fields."
      );
    }

    // Create the transaction BLOB
    const transactionBlob = {
      TransactionType: "NFTokenMint",
      Account: wallet.address,
      NFTokenTaxon: 0,
      Flags: 8, // tfTransferable
      URI: metadataHex,
      Fee: "12", // Ensure we specify a reasonable fee
    };

    console.log("Preparing NFT minting transaction:", transactionBlob);

    // Autofill the transaction details (sequence, fee, etc.)
    const prepared = await client.autofill(transactionBlob);

    // Sign the transaction
    const signed = wallet.sign(prepared);

    // Submit the transaction
    console.log("Submitting transaction...");
    const tx = await client.submitAndWait(signed.tx_blob);

    console.log("Transaction result:", tx.result.meta.TransactionResult);

    // Check transaction result
    if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(
        `Transaction failed: ${tx.result.meta.TransactionResult}`
      );
    }

    // Wait briefly before querying for the new token
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the NFTs for this account
    const nftsResponse = await client.request({
      command: "account_nfts",
      account: wallet.address,
    });

    if (
      !nftsResponse.result.account_nfts ||
      nftsResponse.result.account_nfts.length === 0
    ) {
      throw new Error("No NFTs found after minting");
    }

    // Get the latest NFT (assuming it's the one we just minted)
    const nfts = nftsResponse.result.account_nfts;
    const lastNFT = nfts[nfts.length - 1];

    return {
      success: true,
      tokenId: lastNFT.NFTokenID,
      txid: tx.result.hash,
    };
  } catch (error: unknown) {
    console.error("Error tokenizing asset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getTokenizedAssets(
  client: Client,
  address: string
): Promise<Array<Asset & { tokenId: string }>> {
  try {
    console.log(`Retrieving NFTs for account ${address}...`);

    const nfts = await client.request({
      command: "account_nfts",
      account: address,
      limit: 400, // Increase limit to retrieve more tokens
    });

    console.log(`${nfts.result.account_nfts.length} NFTs found`);

    // Parse NFT data to extract asset information
    const assets = nfts.result.account_nfts
      .filter((nft) => nft.URI) // Filter NFTs without URI
      .map((nft) => {
        try {
          const hexURI = nft.URI;
          if (!hexURI) {
            throw new Error("URI is undefined");
          }

          const rawData = Buffer.from(hexURI, "hex").toString("utf8");

          try {
            // Try to parse the JSON data
            const parsedData = JSON.parse(rawData);

            // Build a complete asset with default values for missing fields
            // But prioritize the stored values for currency and value
            return {
              tokenId: nft.NFTokenID,
              name:
                parsedData.name || `Token ${nft.NFTokenID.substring(0, 8)}...`,
              type: parsedData.type || "Unknown",
              description: parsedData.description || "",
              value: parsedData.value !== undefined ? parsedData.value : 0,
              currency: parsedData.currency || "XRP",
              imageUrl: parsedData.imageUrl || "",
              owner: address, // Set owner to the current address
              attributes: parsedData.attributes || [],
              location: parsedData.location || "",
              backgroundColor: parsedData.backgroundColor || "#ffffff",
            } as Asset & { tokenId: string };
          } catch (parseError) {
            // If JSON parsing fails, use raw data
            console.error("Error parsing NFT data:", parseError);
            return {
              tokenId: nft.NFTokenID,
              name: `Token ${nft.NFTokenID.substring(0, 8)}...`,
              type: "Unknown",
              description: `Raw data: ${rawData.substring(0, 50)}...`,
              value: 0,
              currency: "XRP",
              owner: address,
              attributes: [],
            } as Asset & { tokenId: string };
          }
        } catch (err) {
          console.error("Error decoding NFT data:", err);
          return {
            tokenId: nft.NFTokenID,
            name: `Token ${nft.NFTokenID.substring(0, 8)}...`,
            type: "Unknown",
            description: "Unable to decode token data",
            value: 0,
            currency: "XRP",
            owner: address,
            attributes: [],
          } as Asset & { tokenId: string };
        }
      });

    return assets;
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return [];
  }
}
