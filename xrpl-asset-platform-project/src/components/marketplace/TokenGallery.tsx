// src/components/marketplace/TokenGallery.tsx
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Skeleton,
  Text,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { getTokenizedAssets } from "../../lib/xrpl/tokenization";
import { Asset } from "../../types";
import NFTTradeModal from "./NFTTradeModal";

export default function TokenGallery() {
  const { client, connected, wallet, refreshBalance } = useWallet();
  const [tokens, setTokens] = useState<(Asset & { tokenId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    (Asset & { tokenId: string }) | null
  >(null);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Transformation de loadTokens en useCallback pour pouvoir l'utiliser dans les gestionnaires d'événements
  const loadTokens = useCallback(async () => {
    if (!client || !connected) return;

    setLoading(true);
    setError(null);

    try {
      // Récupérer tous les comptes depuis votre serveur backend
      const accountsResponse = await axios.get(
        "http://localhost:8000/sessions/all"
      );
      const allAccounts = accountsResponse.data.accounts;
      setAccounts(allAccounts);

      const allTokensRequests = [];

      // Pour chaque compte, récupérer ses NFTs
      for (const account of allAccounts) {
        allTokensRequests.push(getTokenizedAssets(client, account.address));
      }

      // Attendre que toutes les requêtes soient terminées
      const results = await Promise.all(allTokensRequests);

      // Combiner tous les résultats en une seule liste
      const allTokens = results.flat();

      // Si l'utilisateur est connecté, mettre en premier ses propres NFTs
      if (wallet) {
        // Trier les tokens pour que ceux possédés par l'utilisateur apparaissent en premier
        allTokens.sort((a, b) => {
          if (a.owner === wallet.address && b.owner !== wallet.address)
            return -1;
          if (a.owner !== wallet.address && b.owner === wallet.address)
            return 1;
          return 0;
        });
      }

      setTokens(allTokens);
      setLastRefresh(new Date());

      // Also refresh current user's balance
      if (wallet) {
        await refreshBalance();
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tokens:", error);
      setError("Failed to load tokenized assets. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [client, connected, wallet, refreshBalance]);

  // Charger les tokens au chargement du composant et lorsque wallet ou client change
  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const handleOpenTradeModal = (token: Asset & { tokenId: string }) => {
    setSelectedToken(token);
    setTradeModalOpen(true);
  };

  const handleCloseTradeModal = () => {
    setTradeModalOpen(false);
    // Refresh everything after a transaction
    loadTokens();
  };

  // Filtrer les tokens pour afficher uniquement ceux que l'utilisateur possède
  const myTokens = wallet
    ? tokens.filter((token) => token.owner === wallet.address)
    : [];

  // Filtrer les tokens pour afficher uniquement ceux que l'utilisateur ne possède pas
  const otherTokens = wallet
    ? tokens.filter((token) => token.owner !== wallet.address)
    : tokens;

  if (loading) {
    return (
      <Grid>
        {[1, 2, 3, 4].map((i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton height={400} radius="md" />
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error}
        <Button
          color="red"
          variant="outline"
          fullWidth
          mt="md"
          onClick={loadTokens}
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  if (tokens.length === 0) {
    return (
      <Text align="center" size="lg" mt="xl" c="dimmed">
        No tokenized assets found. Start by tokenizing an asset!
      </Text>
    );
  }

  return (
    <>
      <Box mb={20}>
        <Group position="apart">
          <Text size="xl" weight={700}>
            {wallet ? `My NFTs (${myTokens.length})` : "All NFTs"}
          </Text>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={loadTokens}
            disabled={loading}
          >
            Refresh
          </Button>
        </Group>
        {lastRefresh && (
          <Text size="xs" color="dimmed">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </Text>
        )}
      </Box>

      {/* Section "My NFTs" - uniquement si l'utilisateur est connecté et possède des NFTs */}
      {wallet && myTokens.length > 0 && (
        <>
          <Grid mb={30}>
            {myTokens.map((token) => (
              <Grid.Col
                key={token.tokenId}
                span={
                  expandedToken === token.tokenId
                    ? 6
                    : { base: 12, sm: 6, md: 4, lg: 3 }
                }
              >
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    height: expandedToken === token.tokenId ? "auto" : "400px",
                  }}
                >
                  <Card.Section>
                    {token.imageUrl ? (
                      <Image
                        src={token.imageUrl}
                        height={expandedToken === token.tokenId ? 300 : 160}
                        alt={token.name}
                        fallbackSrc="https://placehold.co/400x200?text=Asset+Image"
                      />
                    ) : (
                      <Image
                        src={`https://placehold.co/400x200?text=${token.name}`}
                        height={expandedToken === token.tokenId ? 300 : 160}
                        alt={token.name}
                      />
                    )}
                  </Card.Section>

                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{token.name}</Text>
                    <Badge color="green" variant="light">
                      You Own This
                    </Badge>
                  </Group>

                  <Text
                    size="sm"
                    c="dimmed"
                    lineClamp={expandedToken === token.tokenId ? undefined : 2}
                  >
                    {token.description || "No description available"}
                  </Text>

                  {expandedToken === token.tokenId && (
                    <>
                      <Text size="sm" c="dimmed" mt="md">
                        Token ID: {token.tokenId}
                      </Text>
                      <Text size="sm" c="dimmed" mt="md">
                        Owner: {token.owner}
                      </Text>
                      {token.location && (
                        <Text size="sm" c="dimmed" mt="md">
                          Location: {token.location}
                        </Text>
                      )}
                      {token.attributes && token.attributes.length > 0 && (
                        <>
                          <Text size="sm" fw={500} mt="md">
                            Attributes:
                          </Text>
                          {token.attributes.map((attr, index) => (
                            <Text key={index} size="sm" c="dimmed">
                              {attr.trait_type}: {attr.value}
                            </Text>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  <Group mt="md" justify="space-between">
                    <Text fw={700}>
                      {token.value} {token.currency}
                    </Text>
                    <Button
                      variant="light"
                      color="blue"
                      onClick={() =>
                        setExpandedToken(
                          expandedToken === token.tokenId ? null : token.tokenId
                        )
                      }
                    >
                      {expandedToken === token.tokenId
                        ? "Collapse"
                        : "View Details"}
                    </Button>
                  </Group>

                  <Group mt="md" justify="center">
                    <Button
                      variant="light"
                      color="green"
                      fullWidth
                      onClick={() => handleOpenTradeModal(token)}
                    >
                      Trade
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {otherTokens.length > 0 && (
            <Text size="xl" weight={700} mt={30} mb={20}>
              Marketplace
            </Text>
          )}
        </>
      )}

      {/* Section "Marketplace" - NFTs que l'utilisateur ne possède pas */}
      {otherTokens.length > 0 && (
        <Grid>
          {otherTokens.map((token) => (
            <Grid.Col
              key={token.tokenId}
              span={
                expandedToken === token.tokenId
                  ? 6
                  : { base: 12, sm: 6, md: 4, lg: 3 }
              }
            >
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  height: expandedToken === token.tokenId ? "auto" : "400px",
                }}
              >
                <Card.Section>
                  {token.imageUrl ? (
                    <Image
                      src={token.imageUrl}
                      height={expandedToken === token.tokenId ? 300 : 160}
                      alt={token.name}
                      fallbackSrc="https://placehold.co/400x200?text=Asset+Image"
                    />
                  ) : (
                    <Image
                      src={`https://placehold.co/400x200?text=${token.name}`}
                      height={expandedToken === token.tokenId ? 300 : 160}
                      alt={token.name}
                    />
                  )}
                </Card.Section>

                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>{token.name}</Text>
                  <Badge color="blue" variant="light">
                    {token.type}
                  </Badge>
                </Group>

                <Text
                  size="sm"
                  c="dimmed"
                  lineClamp={expandedToken === token.tokenId ? undefined : 2}
                >
                  {token.description || "No description available"}
                </Text>

                {expandedToken === token.tokenId && (
                  <>
                    <Text size="sm" c="dimmed" mt="md">
                      Token ID: {token.tokenId}
                    </Text>
                    <Text size="sm" c="dimmed" mt="md">
                      Owner: {token.owner}
                    </Text>
                    {token.location && (
                      <Text size="sm" c="dimmed" mt="md">
                        Location: {token.location}
                      </Text>
                    )}
                    {token.attributes && token.attributes.length > 0 && (
                      <>
                        <Text size="sm" fw={500} mt="md">
                          Attributes:
                        </Text>
                        {token.attributes.map((attr, index) => (
                          <Text key={index} size="sm" c="dimmed">
                            {attr.trait_type}: {attr.value}
                          </Text>
                        ))}
                      </>
                    )}
                  </>
                )}

                <Group mt="md" justify="space-between">
                  <Text fw={700}>
                    {token.value} {token.currency}
                  </Text>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() =>
                      setExpandedToken(
                        expandedToken === token.tokenId ? null : token.tokenId
                      )
                    }
                  >
                    {expandedToken === token.tokenId
                      ? "Collapse"
                      : "View Details"}
                  </Button>
                </Group>

                <Group mt="md" justify="center">
                  <Button
                    variant="light"
                    color="green"
                    fullWidth
                    onClick={() => handleOpenTradeModal(token)}
                  >
                    Trade
                  </Button>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Modal de trading */}
      <NFTTradeModal
        opened={tradeModalOpen}
        onClose={handleCloseTradeModal}
        asset={selectedToken}
        onSuccessfulTrade={loadTokens} // Add callback to refresh after trade
      />
    </>
  );
}
