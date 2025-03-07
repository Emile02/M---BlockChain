// src/components/marketplace/NFTTradeModal.tsx
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconCoin,
  IconRefresh,
  IconShoppingCart,
  IconTag,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { xrpToDrops } from "xrpl";
import { useWallet } from "../../context/WalletContext";
import {
  acceptOffer,
  createBuyOffer,
  createSellOffer,
  getBuyOffers,
  getSellOffers,
  OfferType,
} from "../../lib/xrpl/trading";
import { Asset, TradingResponse } from "../../types";

interface NFTTradeModalProps {
  opened: boolean;
  onClose: () => void;
  asset: (Asset & { tokenId: string }) | null;
  onSuccessfulTrade?: () => void; // New callback for successful trades
}

export default function NFTTradeModal({
  opened,
  onClose,
  asset,
  onSuccessfulTrade,
}: NFTTradeModalProps) {
  const { client, wallet, refreshBalance } = useWallet();
  const [activeTab, setActiveTab] = useState<string | null>("sell");
  const [amount, setAmount] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [tradeResult, setTradeResult] = useState<TradingResponse | null>(null);
  const [sellOffers, setSellOffers] = useState<any[]>([]);
  const [buyOffers, setBuyOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [restrictBuyer, setRestrictBuyer] = useState<boolean>(false);

  // Réinitialiser le formulaire quand la modal s'ouvre ou que l'asset change
  useEffect(() => {
    if (opened && asset) {
      setAmount("");
      setDestination("");
      setExpirationDays(7);
      setError(null);
      setSuccess(false);
      setTradeResult(null);
      loadExistingOffers();
    }
  }, [opened, asset]);

  const loadExistingOffers = async () => {
    if (!client || !asset || !asset.tokenId) return;

    setLoadingOffers(true);

    // Utilisation de try/catch séparés pour chaque appel
    let fetchedSellOffers = [];
    let fetchedBuyOffers = [];

    try {
      fetchedSellOffers = await getSellOffers(client, asset.tokenId);
    } catch (sellError) {
      console.warn("Error loading sell offers:", sellError);
      // Continue execution even if there's an error
    }

    try {
      fetchedBuyOffers = await getBuyOffers(client, asset.tokenId);
    } catch (buyError) {
      console.warn("Error loading buy offers:", buyError);
      // Continue execution even if there's an error
    }

    setSellOffers(fetchedSellOffers);
    setBuyOffers(fetchedBuyOffers);
    setLoadingOffers(false);
  };

  const handleCreateSellOffer = async () => {
    if (!client || !wallet || !asset) {
      setError("Wallet not connected or asset not selected");
      return;
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (wallet.address !== asset.owner) {
      setError("You can only create sell offers for NFTs that you own");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convertir XRP en drops pour le XRPL
      const amountInDrops = xrpToDrops(amount);

      const result = await createSellOffer(
        client,
        wallet,
        asset.tokenId,
        amountInDrops,
        restrictBuyer ? destination : undefined,
        expirationDays
      );

      if (result.success) {
        setSuccess(true);
        setTradeResult(result);

        // Refresh balance after creating a sell offer
        await refreshBalance();

        // Notify parent component about successful trade
        if (onSuccessfulTrade) {
          onSuccessfulTrade();
        }
      } else {
        setError(result.error || "Failed to create sell offer");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuyOffer = async () => {
    if (!client || !wallet || !asset) {
      setError("Wallet not connected or asset not selected");
      return;
    }

    // Vérifier que l'utilisateur n'est pas déjà propriétaire du NFT
    if (wallet.address === asset.owner) {
      setError("You cannot create a buy offer for an NFT that you already own");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convertir XRP en drops pour le XRPL
      const amountInDrops = xrpToDrops(amount);

      const result = await createBuyOffer(
        client,
        wallet,
        asset.tokenId,
        asset.owner, // Propriétaire du NFT
        amountInDrops,
        expirationDays
      );

      if (result.success) {
        setSuccess(true);
        setTradeResult(result);

        // Refresh balance after creating a buy offer
        await refreshBalance();

        // Notify parent component about successful trade
        if (onSuccessfulTrade) {
          onSuccessfulTrade();
        }
      } else {
        setError(result.error || "Failed to create buy offer");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (
    offerIndex: string,
    offerType: OfferType
  ) => {
    if (!client || !wallet) {
      setError("Wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await acceptOffer(client, wallet, offerIndex, offerType);

      if (result.success) {
        setSuccess(true);
        setTradeResult(result);

        // Important: Refresh balance after accepting an offer
        await refreshBalance();

        // Notify parent component about successful trade to refresh ALL accounts
        if (onSuccessfulTrade) {
          onSuccessfulTrade();
        }
      } else {
        setError(result.error || "Failed to accept offer");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderOffersList = (offers: any[], offerType: OfferType) => {
    if (loadingOffers) {
      return (
        <Box p="md" ta="center">
          <Loader size="sm" />
          <Text size="sm" mt="xs">
            Loading offers...
          </Text>
        </Box>
      );
    }

    if (!offers || offers.length === 0) {
      return (
        <Box p="md" ta="center">
          <Text c="dimmed">
            No active {offerType === OfferType.SELL ? "sell" : "buy"} offers for
            this asset
          </Text>
        </Box>
      );
    }

    return (
      <Stack spacing="xs">
        {offers.map((offer, index) => {
          // Vérifier si l'utilisateur peut accepter l'offre
          let canAccept = false;
          if (wallet && asset) {
            if (offerType === OfferType.SELL) {
              // Pour accepter une offre de vente, l'utilisateur ne doit pas être le propriétaire
              canAccept = wallet.address !== asset.owner;
            } else {
              // Pour accepter une offre d'achat, l'utilisateur doit être le propriétaire
              canAccept = wallet.address === asset.owner;
            }
          }

          return (
            <Box
              key={index}
              p="sm"
              style={{ border: "1px solid #eee", borderRadius: "4px" }}
            >
              <Group position="apart">
                <Group>
                  <Badge
                    color={offerType === OfferType.SELL ? "blue" : "green"}
                  >
                    {offerType === OfferType.SELL ? "Sell" : "Buy"}
                  </Badge>
                  <Text weight={500}>
                    {offer.amount
                      ? `${parseInt(offer.amount) / 1000000} XRP`
                      : "Unknown amount"}
                  </Text>
                </Group>
                <Button
                  size="xs"
                  color={offerType === OfferType.SELL ? "blue" : "green"}
                  onClick={() =>
                    handleAcceptOffer(offer.nft_offer_index, offerType)
                  }
                  disabled={!canAccept}
                >
                  Accept
                </Button>
              </Group>
              <Text size="xs" c="dimmed">
                Offer ID: {offer.nft_offer_index}
              </Text>
              {offer.owner && (
                <Text size="xs" c="dimmed">
                  Owner: {offer.owner}
                </Text>
              )}
              {!canAccept && wallet && (
                <Text size="xs" color="orange" mt="xs">
                  {offerType === OfferType.SELL
                    ? "You must not be the owner to accept this sell offer"
                    : "You must be the owner to accept this buy offer"}
                </Text>
              )}
            </Box>
          );
        })}
      </Stack>
    );
  };

  const renderSuccess = () => (
    <Stack spacing="md" align="center" py="md">
      <IconCheck size={48} stroke={1.5} color="green" />
      <Text align="center" weight={700} size="lg">
        {tradeResult?.status === "accepted"
          ? "Offer Accepted!"
          : "Offer Created Successfully!"}
      </Text>
      <Text align="center" color="dimmed">
        {tradeResult?.status === "accepted"
          ? "The offer has been accepted and the NFT has been transferred."
          : `Your ${
              activeTab === "sell" ? "sell" : "buy"
            } offer has been submitted to the XRP Ledger.`}
      </Text>
      {tradeResult && tradeResult.offerIndex && (
        <Box>
          <Text align="center" size="sm" weight={500}>
            Offer Index:
          </Text>
          <Text
            align="center"
            size="xs"
            style={{ wordBreak: "break-all", fontFamily: "monospace" }}
          >
            {tradeResult.offerIndex}
          </Text>
        </Box>
      )}
      {tradeResult && tradeResult.txid && (
        <Box>
          <Text align="center" size="sm" weight={500}>
            Transaction ID:
          </Text>
          <Text
            align="center"
            size="xs"
            style={{ wordBreak: "break-all", fontFamily: "monospace" }}
          >
            {tradeResult.txid}
          </Text>
        </Box>
      )}
      <Button fullWidth onClick={onClose} color="green">
        Close
      </Button>
    </Stack>
  );

  const renderSellTab = () => {
    const isOwner = wallet && asset && wallet.address === asset.owner;

    if (!isOwner) {
      return (
        <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
          You don't own this NFT. You can only create sell offers for NFTs that
          you own.
        </Alert>
      );
    }

    return (
      <Stack spacing="md">
        <TextInput
          label="Selling Price (XRP)"
          placeholder="Enter amount in XRP"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Switch
          label="Restrict to specific buyer"
          checked={restrictBuyer}
          onChange={(event) => setRestrictBuyer(event.currentTarget.checked)}
        />

        {restrictBuyer && (
          <TextInput
            label="Buyer Address"
            placeholder="r..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        )}

        <NumberInput
          label="Offer Expiration (days)"
          min={1}
          max={30}
          value={expirationDays}
          onChange={(val) => setExpirationDays(val || 7)}
        />

        <Button
          fullWidth
          mt="md"
          leftSection={<IconTag size={16} />}
          onClick={handleCreateSellOffer}
          loading={loading}
        >
          Create Sell Offer
        </Button>
      </Stack>
    );
  };

  const renderBuyTab = () => {
    const isOwner = wallet && asset && wallet.address === asset.owner;

    return (
      <Stack spacing="md">
        {isOwner && (
          <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
            You already own this NFT. You cannot create a buy offer for it.
          </Alert>
        )}

        <TextInput
          label="Offer Amount (XRP)"
          placeholder="Enter amount in XRP"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={isOwner}
        />

        <NumberInput
          label="Offer Expiration (days)"
          min={1}
          max={30}
          value={expirationDays}
          onChange={(val) => setExpirationDays(val || 7)}
          disabled={isOwner}
        />

        <Button
          fullWidth
          mt="md"
          leftSection={<IconShoppingCart size={16} />}
          onClick={handleCreateBuyOffer}
          loading={loading}
          disabled={isOwner}
        >
          Create Buy Offer
        </Button>
      </Stack>
    );
  };

  const renderOffersTab = () => {
    // Vérifier que le tokenId est valide avant de tenter d'afficher les offres
    const hasValidTokenId = asset && asset.tokenId && asset.tokenId.length > 0;

    if (!hasValidTokenId) {
      return (
        <Box p="md" ta="center">
          <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
            Cannot load offers: Invalid or missing NFT identifier.
          </Alert>
        </Box>
      );
    }

    return (
      <Box mt="md">
        <Group position="right" mb="md">
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={loadExistingOffers}
            loading={loadingOffers}
            size="xs"
          >
            Refresh Offers
          </Button>
        </Group>

        <Text size="sm" weight={500} mb="md">
          Sell Offers
        </Text>
        {renderOffersList(sellOffers, OfferType.SELL)}

        <Divider my="md" />

        <Text size="sm" weight={500} mb="md">
          Buy Offers
        </Text>
        {renderOffersList(buyOffers, OfferType.BUY)}
      </Box>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Trade ${asset?.name || "Asset"}`}
      size="md"
    >
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack align="center" spacing="md" my="xl">
          <Loader size="lg" />
          <Text align="center">Processing your request...</Text>
        </Stack>
      ) : success ? (
        renderSuccess()
      ) : (
        <>
          {asset && (
            <Box mb="md">
              <Text size="sm" color="dimmed">
                Token ID: {asset.tokenId}
              </Text>
              <Text size="sm" color="dimmed">
                Owner: {asset.owner}
              </Text>
              <Text size="sm" color="dimmed">
                Type: {asset.type}
              </Text>
              <Group mt="xs">
                <IconCoin size={16} />
                <Text size="sm" weight={500}>
                  {asset.value} {asset.currency}
                </Text>
              </Group>
              {wallet && (
                <Badge
                  mt="xs"
                  color={wallet.address === asset.owner ? "green" : "blue"}
                >
                  {wallet.address === asset.owner
                    ? "You Own This NFT"
                    : "You Don't Own This NFT"}
                </Badge>
              )}
            </Box>
          )}

          <Divider my="md" />

          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="sell" icon={<IconTag size={14} />}>
                Sell
              </Tabs.Tab>
              <Tabs.Tab value="buy" icon={<IconShoppingCart size={14} />}>
                Buy
              </Tabs.Tab>
              <Tabs.Tab value="offers" icon={<IconCoin size={14} />}>
                Offers
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="sell" pt="xs">
              {renderSellTab()}
            </Tabs.Panel>

            <Tabs.Panel value="buy" pt="xs">
              {renderBuyTab()}
            </Tabs.Panel>

            <Tabs.Panel value="offers" pt="xs">
              {renderOffersTab()}
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </Modal>
  );
}
