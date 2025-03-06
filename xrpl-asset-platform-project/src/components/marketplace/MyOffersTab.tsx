// src/components/marketplace/MyOffersTab.tsx
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconRefresh,
  IconShoppingCart,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { getTokenizedAssets } from "../../lib/xrpl/tokenization";
import { cancelOffer, getAccountOffers } from "../../lib/xrpl/trading";

interface Offer {
  nft_offer_index: string;
  nft_id: string;
  amount: string;
  owner?: string;
  destination?: string;
  expiration?: number;
  flags: number;
  created_at?: string;
  asset_name?: string;
  asset_type?: string;
}

enum OfferType {
  SELL = 1,
  BUY = 0,
}

export default function MyOffersTab() {
  const { client, wallet, connected } = useWallet();
  const [sellOffers, setSellOffers] = useState<Offer[]>([]);
  const [buyOffers, setBuyOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nftDetails, setNftDetails] = useState<Record<string, any>>({});

  // Load user's offers
  const loadOffers = useCallback(async () => {
    if (!client || !wallet) return;

    setLoading(true);
    setError(null);

    try {
      // Get all offers
      const offers = await getAccountOffers(client, wallet.address);

      // Separate into sell and buy offers
      const sell: Offer[] = [];
      const buy: Offer[] = [];

      offers.forEach((offer: any) => {
        if (offer.Flags === OfferType.SELL) {
          sell.push({
            nft_offer_index: offer.index || offer.LedgerIndex,
            nft_id: offer.NFTokenID,
            amount: offer.Amount,
            destination: offer.Destination,
            expiration: offer.Expiration,
            flags: offer.Flags,
          });
        } else {
          buy.push({
            nft_offer_index: offer.index || offer.LedgerIndex,
            nft_id: offer.NFTokenID,
            amount: offer.Amount,
            owner: offer.Owner,
            expiration: offer.Expiration,
            flags: offer.Flags,
          });
        }
      });

      setSellOffers(sell);
      setBuyOffers(buy);

      // Get NFT details for all tokens in offers
      const nftIds = [
        ...new Set([
          ...sell.map((offer) => offer.nft_id),
          ...buy.map((offer) => offer.nft_id),
        ]),
      ];

      if (nftIds.length > 0) {
        await loadNftDetails(nftIds);
      }
    } catch (error) {
      console.error("Error loading offers:", error);
      setError("Failed to load your offers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [client, wallet]);

  // Load NFT details for better display
  const loadNftDetails = async (nftIds: string[]) => {
    if (!client || !wallet) return;

    try {
      // Get all NFTs from all accounts
      const accounts = await fetch("http://localhost:8000/sessions/all").then(
        (res) => res.json()
      );

      const allAssetsPromises = accounts.accounts.map((account: any) =>
        getTokenizedAssets(client, account.address)
      );

      const allAssetsResults = await Promise.all(allAssetsPromises);
      const allAssets = allAssetsResults.flat();

      // Create lookup for NFT details
      const details: Record<string, any> = {};

      allAssets.forEach((asset) => {
        if (nftIds.includes(asset.tokenId)) {
          details[asset.tokenId] = {
            name: asset.name,
            type: asset.type,
            value: asset.value,
            currency: asset.currency,
            imageUrl: asset.imageUrl,
            description: asset.description,
            owner: asset.owner,
          };
        }
      });

      setNftDetails(details);
    } catch (error) {
      console.error("Error loading NFT details:", error);
    }
  };

  // Cancel an offer
  const handleCancelOffer = async (offerIndex: string) => {
    if (!client || !wallet) return;

    setCancelLoading(offerIndex);

    try {
      const result = await cancelOffer(client, wallet, offerIndex);

      if (result.success) {
        // Reload offers to update the list
        await loadOffers();
      } else {
        setError(`Failed to cancel offer: ${result.error}`);
      }
    } catch (error) {
      console.error("Error cancelling offer:", error);
      setError("Failed to cancel offer. Please try again.");
    } finally {
      setCancelLoading(null);
    }
  };

  // Format XRP amount from drops
  const formatXrpAmount = (drops: string) => {
    if (!drops) return "Unknown";
    return `${parseInt(drops) / 1000000} XRP`;
  };

  // Load offers when component mounts or wallet changes
  useEffect(() => {
    if (connected && wallet && client) {
      loadOffers();
    }
  }, [connected, wallet, client, loadOffers]);

  if (!connected || !wallet) {
    return (
      <Box py={50} ta="center">
        <IconAlertCircle size={40} color="gray" />
        <Text size="xl" mt="md">
          Please connect your wallet to view your offers
        </Text>
      </Box>
    );
  }

  if (loading && sellOffers.length === 0 && buyOffers.length === 0) {
    return (
      <Box py={50} ta="center">
        <Loader size="md" />
        <Text mt="md">Loading your offers...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Group position="apart" mb={20}>
        <Title order={2}>My NFT Offers</Title>
        <Button
          leftSection={<IconRefresh size={16} />}
          variant="light"
          onClick={loadOffers}
          loading={loading}
        >
          Refresh
        </Button>
      </Group>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="lg"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Title order={3} mt={30} mb={15}>
        <Group spacing="xs">
          <IconTag size={20} />
          <span>My Sell Offers</span>
        </Group>
      </Title>

      {sellOffers.length === 0 ? (
        <Text c="dimmed" mb={30}>
          You don't have any active sell offers
        </Text>
      ) : (
        <Stack spacing="md" mb={30}>
          {sellOffers.map((offer) => (
            <Card
              key={offer.nft_offer_index}
              shadow="sm"
              p="md"
              radius="md"
              withBorder
            >
              <Group position="apart">
                <div>
                  <Group spacing="xs">
                    <Badge color="blue">Sell</Badge>
                    <Text weight={700} size="lg">
                      {formatXrpAmount(offer.amount)}
                    </Text>
                  </Group>

                  <Text size="sm" mt={5}>
                    {nftDetails[offer.nft_id]?.name ||
                      `NFT ${offer.nft_id.substring(0, 8)}...`}
                    {nftDetails[offer.nft_id]?.type &&
                      ` (${nftDetails[offer.nft_id].type})`}
                  </Text>

                  <Text size="xs" c="dimmed" mt={5}>
                    NFT ID: {offer.nft_id.substring(0, 10)}...
                    {offer.nft_id.substring(offer.nft_id.length - 10)}
                  </Text>

                  <Text size="xs" c="dimmed">
                    Offer ID: {offer.nft_offer_index.substring(0, 8)}...
                  </Text>

                  {offer.destination && (
                    <Text size="xs" c="dimmed">
                      Reserved for: {offer.destination.substring(0, 8)}...
                    </Text>
                  )}

                  {offer.expiration && (
                    <Text size="xs" c="dimmed">
                      Expires:{" "}
                      {new Date(
                        (offer.expiration + 946684800) * 1000
                      ).toLocaleDateString()}
                    </Text>
                  )}
                </div>

                <Button
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  variant="light"
                  onClick={() => handleCancelOffer(offer.nft_offer_index)}
                  loading={cancelLoading === offer.nft_offer_index}
                >
                  Cancel
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Divider my="xl" />

      <Title order={3} mt={30} mb={15}>
        <Group spacing="xs">
          <IconShoppingCart size={20} />
          <span>My Buy Offers</span>
        </Group>
      </Title>

      {buyOffers.length === 0 ? (
        <Text c="dimmed">You don't have any active buy offers</Text>
      ) : (
        <Stack spacing="md">
          {buyOffers.map((offer) => (
            <Card
              key={offer.nft_offer_index}
              shadow="sm"
              p="md"
              radius="md"
              withBorder
            >
              <Group position="apart">
                <div>
                  <Group spacing="xs">
                    <Badge color="green">Buy</Badge>
                    <Text weight={700} size="lg">
                      {formatXrpAmount(offer.amount)}
                    </Text>
                  </Group>

                  <Text size="sm" mt={5}>
                    {nftDetails[offer.nft_id]?.name ||
                      `NFT ${offer.nft_id.substring(0, 8)}...`}
                    {nftDetails[offer.nft_id]?.type &&
                      ` (${nftDetails[offer.nft_id].type})`}
                  </Text>

                  <Text size="xs" c="dimmed" mt={5}>
                    NFT ID: {offer.nft_id.substring(0, 10)}...
                    {offer.nft_id.substring(offer.nft_id.length - 10)}
                  </Text>

                  <Text size="xs" c="dimmed">
                    Offer ID: {offer.nft_offer_index.substring(0, 8)}...
                  </Text>

                  {offer.owner && (
                    <Text size="xs" c="dimmed">
                      Owner: {offer.owner.substring(0, 8)}...
                    </Text>
                  )}

                  {offer.expiration && (
                    <Text size="xs" c="dimmed">
                      Expires:{" "}
                      {new Date(
                        (offer.expiration + 946684800) * 1000
                      ).toLocaleDateString()}
                    </Text>
                  )}
                </div>

                <Button
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  variant="light"
                  onClick={() => handleCancelOffer(offer.nft_offer_index)}
                  loading={cancelLoading === offer.nft_offer_index}
                >
                  Cancel
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
