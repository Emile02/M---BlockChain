import { Client, convertStringToHex, NFTokenMint } from "xrpl";
import { Asset, TokenizationResult, Wallet } from "../../types";

export async function tokenizeAsset(
  client: Client,
  wallet: Wallet,
  assetData: Asset
): Promise<TokenizationResult> {
  try {
    // Simplifier les données pour éviter les problèmes de taille
    const simplifiedData = {
      name: assetData.name,
      type: assetData.type,
      value: assetData.value,
      currency: assetData.currency,
      imageUrl: assetData.imageUrl,
      description: assetData.description.substring(0, 100), // Limiter la taille
      timestamp: new Date().toISOString(),
      owner: wallet.address,
    };

    const assetURI = convertStringToHex(JSON.stringify(simplifiedData));

    // Créer la transaction avec le type correct
    const transactionBlob: NFTokenMint = {
      TransactionType: "NFTokenMint", // Doit être exactement cette chaîne littérale
      Account: wallet.address,
      NFTokenTaxon: 0,
      Flags: 8, // Valeur numérique pour tfTransferable
      URI: assetURI,
    };

    // Approche en deux étapes
    console.log("Préparation de la transaction...");
    const prepared = await client.autofill(transactionBlob);
    console.log("Signature de la transaction...");
    const signed = wallet.sign(prepared);

    console.log("Soumission de la transaction...");
    const tx_blob = signed.tx_blob;
    const result = await client.submit(tx_blob);

    console.log("Résultat:", result);

    if (
      result.result.engine_result !== "tesSUCCESS" &&
      result.result.engine_result !== "terQUEUED"
    ) {
      throw new Error(
        `Transaction échouée: ${result.result.engine_result_message}`
      );
    }

    // Attendre que la transaction soit validée
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Récupérer les NFTs
    const nftsResponse = await client.request({
      command: "account_nfts",
      account: wallet.address,
    });

    if (
      !nftsResponse.result.account_nfts ||
      nftsResponse.result.account_nfts.length === 0
    ) {
      throw new Error("Aucun NFT trouvé");
    }

    // Prendre le dernier NFT créé
    const nfts = nftsResponse.result.account_nfts;
    const lastNFT = nfts[nfts.length - 1];

    return {
      success: true,
      tokenId: lastNFT.NFTokenID,
      txid: result.result.tx_json.hash,
    };
  } catch (error: unknown) {
    console.error("Erreur complète:", error);
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
    console.log(`Récupération des NFTs pour le compte ${address}...`);

    const nfts = await client.request({
      command: "account_nfts",
      account: address,
      limit: 400, // Augmenter la limite pour récupérer plus de tokens
    });

    console.log(`${nfts.result.account_nfts.length} NFTs trouvés`);
    if (nfts.result.account_nfts.length > 0 ) {
      console.log(`${Object.keys(nfts.result)}`)
    }

    // Parse NFT data to extract asset information
    const assets = nfts.result.account_nfts
      .filter((nft) => nft.URI) // Filtrer les NFTs sans URI
      .map((nft) => {
        try {
          const hexURI = nft.URI;
          if (!hexURI) {
            throw new Error("URI is undefined");
          }
          const rawData = Buffer.from(hexURI, "hex").toString("utf8");

          try {
            // Essayer de parser les données JSON
            const assetData = JSON.parse(rawData) as Asset;

            return {
              tokenId: nft.NFTokenID,
              ...assetData,
            };
          } catch {
            // Si le parsing JSON échoue, utiliser les données brutes
            return {
              tokenId: nft.NFTokenID,
              name: `Token ${nft.NFTokenID.substring(0, 8)}...`,
              type: "Unknown",
              description: `Données brutes: ${rawData.substring(0, 50)}...`,
              value: 0,
              currency: "XRP",
              attributes: [],
            } as Asset & { tokenId: string };
          }
        } catch (err) {
          console.error("Erreur lors du décodage des données du NFT:", err);
          return {
            tokenId: nft.NFTokenID,
            name: `Token ${nft.NFTokenID.substring(0, 8)}...`,
            type: "Unknown",
            description: "Impossible de décoder les données du token",
            value: 0,
            currency: "XRP",
            attributes: [],
          } as Asset & { tokenId: string };
        }
      });

    return assets;
  } catch (error) {
    console.error("Erreur lors de la récupération des tokens:", error);
    return [];
  }
}
