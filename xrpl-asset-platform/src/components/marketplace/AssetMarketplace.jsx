"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useAcceptSellOffer,
  useCreateSellOffer,
  useTokens,
  useWalletAddress,
} from "@nice-xrpl/react-xrpl";
import {
  IconAlertCircle,
  IconCheck,
  IconCoin,
  IconEye,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import ConnectWallet from "../wallet/ConnectWallet";

export default function AssetMarketplace() {
  const { connected } = useWallet();
  const address = useWalletAddress();
  const tokens = useTokens();
  const createSellOffer = useCreateSellOffer();
  const acceptSellOffer = useAcceptSellOffer();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [sellPrice, setSellPrice] = useState("");
  const [sellOfferIndex, setSellOfferIndex] = useState("");

  const [opened, { open, close }] = useDisclosure(false);
  const [buyOpened, { open: openBuy, close: closeBuy }] = useDisclosure(false);

  // In a real application, you would have access to marketplace listings
  // Here, we'll use the user's own tokens as examples
  const [listedAssets, setListedAssets] = useState([]);

  const refreshMarketplace = () => {
    setLoading(true);

    // In a real app, you would fetch marketplace listings from a server
    // or use XRPL offers to find tokens for sale
    setTimeout(() => {
      // For now, we'll just use the user's tokens as examples
      if (tokens && tokens.length > 0) {
        const processed = tokens.map((token) => {
          let metadata = {};
          if (token.uri) {
            try {
              metadata = JSON.parse(token.uri);
            } catch (err) {
              console.error("Error parsing token metadata:", err);
            }
          }

          return {
            id: token.id,
            issuer: token.issuer,
            taxon: token.taxon || 0,
            metadata: metadata,
            price: "100000", // Example price in drops
          };
        });

        setListedAssets(processed);
      }

      setLoading(false);
    }, 1000);
  };

  const handleSellAsset = async () => {
    if (!connected || !address || !selectedAsset) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Convert XRP to drops (1 XRP = 1,000,000 drops)
      const amountInDrops = String(Math.floor(Number(sellPrice) * 1000000));

      // Use the hook to create a sell offer
      const result = await createSellOffer(selectedAsset.id, amountInDrops);

      if (result) {
        setSuccess(true);
        close(); // Close the modal
        refreshMarketplace(); // Refresh the marketplace
      } else {
        setError("Failed to create sell offer");
      }
    } catch (err) {
      console.error("Error selling asset:", err);
      setError(err.message || "Failed to sell asset");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAsset = async () => {
    if (!connected || !address) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Use the hook to accept a sell offer
      const result = await acceptSellOffer(sellOfferIndex);

      if (result) {
        setSuccess(true);
        closeBuy(); // Close the modal
        refreshMarketplace(); // Refresh the marketplace
      } else {
        setError("Failed to accept sell offer");
      }
    } catch (err) {
      console.error("Error buying asset:", err);
      setError(err.message || "Failed to buy asset");
    } finally {
      setLoading(false);
    }
  };

  const openSellModal = (asset) => {
    setSelectedAsset(asset);
    setError(null);
    setSuccess(false);
    setSellPrice("");
    open();
  };

  const openBuyModal = (asset) => {
    setSelectedAsset(asset);
    setError(null);
    setSuccess(false);
    setSellOfferIndex("");
    openBuy();
  };

  if (!connected || !address) {
    return (
      <Container size="sm">
        <Paper shadow="md" p="xl" radius="lg" withBorder>
          <Center>
            <Stack align="center" spacing="md">
              <Title order={3} ta="center">
                Connectez votre portefeuille
              </Title>
              <Text ta="center" c="dimmed">
                Vous devez connecter votre portefeuille pour accéder à la place
                de marché.
              </Text>
              <ConnectWallet />
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="lg">
          <Title order={4}>Place de marché des actifs tokenisés</Title>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconSearch size={16} />}
            onClick={refreshMarketplace}
            loading={loading}
          >
            Rechercher
          </Button>
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Erreur"
            color="red"
            variant="filled"
            mb="lg"
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Succès"
            color="green"
            variant="filled"
            mb="lg"
          >
            Transaction réussie !
          </Alert>
        )}

        {loading ? (
          <Center py="xl">
            <Stack align="center" spacing="md">
              <Loader size="md" />
              <Text size="sm" c="dimmed">
                Chargement des actifs disponibles...
              </Text>
            </Stack>
          </Center>
        ) : listedAssets.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">
              Aucun actif n'est actuellement en vente sur la place de marché.
              Cliquez sur "Rechercher" pour rafraîchir la liste.
            </Text>
          </Center>
        ) : (
          <SimpleGrid
            cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: "md", cols: 2 },
              { maxWidth: "xs", cols: 1 },
            ]}
          >
            {listedAssets.map((asset) => (
              <Card key={asset.id} shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section>
                  <Image
                    src={asset.metadata.imageUrl || "/placeholder-image.jpg"}
                    height={160}
                    alt={asset.metadata.name || "Asset"}
                    withPlaceholder
                  />
                </Card.Section>

                <Group justify="space-between" mt="md" mb="xs">
                  <Text weight={500}>
                    {asset.metadata.name || "Unnamed Asset"}
                  </Text>
                  <Badge color="blue" variant="light">
                    {asset.metadata.type || "Asset"}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed" mb="md" lineClamp={2}>
                  {asset.metadata.description || "No description available"}
                </Text>

                <Group justify="space-between" mt="md">
                  <Badge
                    color="green"
                    variant="filled"
                    leftSection={<IconCoin size={12} />}
                  >
                    {(Number(asset.price) / 1000000).toFixed(2)} XRP
                  </Badge>

                  <Group>
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      onClick={() => openSellModal(asset)}
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                    <Button
                      variant="light"
                      color="blue"
                      size="xs"
                      leftSection={<IconShoppingCart size={14} />}
                      onClick={() => openBuyModal(asset)}
                    >
                      Acheter
                    </Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Paper>

      {/* Sell Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={600}>Mettre en vente un actif</Text>}
        centered
      >
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Erreur"
            color="red"
            variant="filled"
            mb="lg"
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Succès"
            color="green"
            variant="filled"
            mb="lg"
          >
            Votre actif a été mis en vente avec succès !
          </Alert>
        )}

        <Box mb="md">
          <Text fw={500} mb="xs">
            Asset:
          </Text>
          <Text>{selectedAsset?.metadata?.name || "Unnamed Asset"}</Text>
          <Text size="sm" c="dimmed">
            ID: {selectedAsset?.id?.substring(0, 8)}...
          </Text>
        </Box>

        <Divider my="md" />

        <NumberInput
          label="Prix de vente (XRP)"
          placeholder="10.00"
          precision={2}
          min={0}
          step={0.1}
          value={sellPrice}
          onChange={(val) => setSellPrice(val)}
          rightSection={<IconCoin size={16} />}
          required
        />

        <Group justify="right" mt="xl">
          <Button variant="subtle" onClick={close}>
            Annuler
          </Button>
          <Button
            color="blue"
            loading={loading}
            onClick={handleSellAsset}
            disabled={!sellPrice}
          >
            Mettre en vente
          </Button>
        </Group>
      </Modal>

      {/* Buy Modal */}
      <Modal
        opened={buyOpened}
        onClose={closeBuy}
        title={<Text fw={600}>Acheter un actif</Text>}
        centered
      >
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Erreur"
            color="red"
            variant="filled"
            mb="lg"
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Succès"
            color="green"
            variant="filled"
            mb="lg"
          >
            Votre achat a été effectué avec succès !
          </Alert>
        )}

        <Box mb="md">
          <Text fw={500} mb="xs">
            Asset:
          </Text>
          <Text>{selectedAsset?.metadata?.name || "Unnamed Asset"}</Text>
          <Text size="sm" c="dimmed">
            ID: {selectedAsset?.id?.substring(0, 8)}...
          </Text>
          <Text size="sm" mt="xs">
            Prix:{" "}
            {selectedAsset
              ? (Number(selectedAsset.price) / 1000000).toFixed(2)
              : "?"}{" "}
            XRP
          </Text>
        </Box>

        <Divider my="md" />

        <TextInput
          label="Index de l'offre"
          placeholder="Entrez l'identifiant de l'offre"
          value={sellOfferIndex}
          onChange={(e) => setSellOfferIndex(e.currentTarget.value)}
          required
        />
        <Text size="xs" c="dimmed" mt="xs">
          Vous devez connaître l'index de l'offre pour acheter cet actif. Dans
          une application réelle, il serait automatiquement récupéré.
        </Text>

        <Group justify="right" mt="xl">
          <Button variant="subtle" onClick={closeBuy}>
            Annuler
          </Button>
          <Button
            color="blue"
            loading={loading}
            onClick={handleBuyAsset}
            disabled={!sellOfferIndex}
          >
            Confirmer l'achat
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
