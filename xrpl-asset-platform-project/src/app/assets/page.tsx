"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Skeleton,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCoins,
  IconRefresh,
  IconRocket,
  IconShoppingCart,
  IconWallet,
} from "@tabler/icons-react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import NFTTradeModal from "../../components/marketplace/NFTTradeModal";
import { useWallet } from "../../context/WalletContext";
import { getTokenizedAssets } from "../../lib/xrpl/tokenization";
import { Asset } from "../../types";

export default function AssetsPage(): JSX.Element {
  const { client, connected, wallet } = useWallet();
  const [tokens, setTokens] = useState<(Asset & { tokenId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    (Asset & { tokenId: string }) | null
  >(null);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("all");

  // Fonction pour charger les tokens
  const loadTokens = useCallback(async () => {
    if (!client || !connected || !wallet) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer tous les comptes
      const accounts = await axios.get("http://localhost:8000/sessions/all");
      const allTokensRequests = [];

      // Pour chaque compte, récupérer ses NFTs
      for (const account of accounts.data.accounts) {
        allTokensRequests.push(getTokenizedAssets(client, account.address));
      }

      // Attendre que toutes les requêtes soient terminées
      const results = await Promise.all(allTokensRequests);

      // Combiner tous les résultats en une seule liste
      const allTokens = results.flat();

      // Filtrer pour ne garder que les tokens possédés par l'utilisateur connecté
      const myTokens = allTokens.filter(
        (token) => token.owner === wallet.address
      );

      setTokens(myTokens);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des tokens:", error);
      setError(
        "Impossible de charger vos actifs tokenisés. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  }, [client, connected, wallet]);

  // Charger les tokens au chargement du composant
  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const handleOpenTradeModal = (token: Asset & { tokenId: string }) => {
    setSelectedToken(token);
    setTradeModalOpen(true);
  };

  const handleCloseTradeModal = () => {
    setTradeModalOpen(false);
    // Rafraîchir les tokens après une transaction
    loadTokens();
  };

  // Filtrer les tokens créés par l'utilisateur (basé sur l'adresse de l'issuer si disponible)
  const createdTokens = tokens.filter(
    (token) => token.issuer === wallet?.address
  );

  // Filtrer les tokens achetés par l'utilisateur (tous les autres)
  const purchasedTokens = tokens.filter(
    (token) => token.issuer !== wallet?.address
  );

  // Rendu pour l'état de chargement
  if (loading) {
    return (
      <Container size="lg">
        <Box mb={40}>
          <Title order={1} mb="xs">
            Mes actifs tokenisés
          </Title>
          <Text c="dimmed" size="lg">
            Gérez et suivez vos actifs tokenisés sur le XRP Ledger.
          </Text>
        </Box>

        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton height={400} radius="md" />
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    );
  }

  // Rendu pour l'état d'erreur
  if (error) {
    return (
      <Container size="lg">
        <Box mb={40}>
          <Title order={1} mb="xs">
            Mes actifs tokenisés
          </Title>
          <Text c="dimmed" size="lg">
            Gérez et suivez vos actifs tokenisés sur le XRP Ledger.
          </Text>
        </Box>

        <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
          {error}
          <Button
            color="red"
            variant="outline"
            fullWidth
            mt="md"
            onClick={loadTokens}
          >
            Réessayer
          </Button>
        </Alert>
      </Container>
    );
  }

  // Rendu pour le cas où l'utilisateur n'est pas connecté
  if (!connected || !wallet) {
    return (
      <Container size="lg">
        <Box mb={40}>
          <Title order={1} mb="xs">
            Mes actifs tokenisés
          </Title>
          <Text c="dimmed" size="lg">
            Connectez votre portefeuille pour voir vos actifs tokenisés.
          </Text>
        </Box>

        <Box ta="center" py={50}>
          <ThemeIcon size={80} radius="md" mb="md" variant="light" color="blue">
            <IconWallet size={40} />
          </ThemeIcon>
          <Title order={2} mb="md">
            Connectez votre portefeuille
          </Title>
          <Text size="lg" mb="xl" c="dimmed">
            Vous devez connecter votre portefeuille XRPL pour accéder à vos
            actifs tokenisés.
          </Text>
          <Button
            component="a"
            href="/"
            variant="filled"
            color="blue"
            leftSection={<IconWallet size={20} />}
            size="md"
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Container>
    );
  }

  // Rendu pour le cas où l'utilisateur n'a pas d'actifs
  if (tokens.length === 0) {
    return (
      <Container size="lg">
        <Box mb={40}>
          <Title order={1} mb="xs">
            Mes actifs tokenisés
          </Title>
          <Text c="dimmed" size="lg">
            Gérez et suivez vos actifs tokenisés sur le XRP Ledger.
          </Text>
        </Box>

        <Box ta="center" py={50}>
          <ThemeIcon size={80} radius="md" mb="md" variant="light" color="teal">
            <IconCoins size={40} />
          </ThemeIcon>
          <Title order={2} mb="md">
            Vous n'avez pas encore d'actifs
          </Title>
          <Text size="lg" mb="xl" c="dimmed">
            Vous n'avez pas encore d'actifs tokenisés. Créez votre premier actif
            ou achetez-en un sur la marketplace.
          </Text>
          <Group justify="center" gap="md">
            <Button
              component="a"
              href="/tokenize"
              leftSection={<IconRocket size={20} />}
              size="md"
            >
              Tokeniser un actif
            </Button>
            <Button
              component="a"
              href="/marketplace"
              variant="outline"
              leftSection={<IconShoppingCart size={20} />}
              size="md"
            >
              Explorer la marketplace
            </Button>
          </Group>
        </Box>
      </Container>
    );
  }

  // Rendu principal avec les actifs
  return (
    <Container size="lg">
      <Box mb={40}>
        <Group position="apart">
          <div>
            <Title order={1} mb="xs">
              Mes actifs tokenisés
            </Title>
            <Text c="dimmed" size="lg">
              Gérez et suivez vos actifs tokenisés sur le XRP Ledger.
            </Text>
          </div>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={loadTokens}
            disabled={loading}
          >
            Actualiser
          </Button>
        </Group>
        {lastRefresh && (
          <Text size="xs" color="dimmed" mt="xs">
            Dernière actualisation: {lastRefresh.toLocaleTimeString()}
          </Text>
        )}
      </Box>

      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="all" icon={<IconCoins size={14} />}>
            Tous mes actifs ({tokens.length})
          </Tabs.Tab>
          <Tabs.Tab value="created" icon={<IconRocket size={14} />}>
            Actifs créés ({createdTokens.length})
          </Tabs.Tab>
          <Tabs.Tab value="purchased" icon={<IconShoppingCart size={14} />}>
            Actifs achetés ({purchasedTokens.length})
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Grid>
        {(activeTab === "all"
          ? tokens
          : activeTab === "created"
          ? createdTokens
          : purchasedTokens
        ).map((token) => (
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
                <Badge
                  color={token.issuer === wallet.address ? "teal" : "blue"}
                  variant="light"
                >
                  {token.issuer === wallet.address ? "Créé" : "Acheté"}
                </Badge>
              </Group>

              <Text
                size="sm"
                c="dimmed"
                lineClamp={expandedToken === token.tokenId ? undefined : 2}
              >
                {token.description || "Pas de description disponible"}
              </Text>

              {expandedToken === token.tokenId && (
                <>
                  <Text size="sm" c="dimmed" mt="md">
                    Token ID: {token.tokenId}
                  </Text>
                  <Text size="sm" c="dimmed" mt="md">
                    Propriétaire: {token.owner}
                  </Text>
                  {token.location && (
                    <Text size="sm" c="dimmed" mt="md">
                      Localisation: {token.location}
                    </Text>
                  )}
                  {token.attributes && token.attributes.length > 0 && (
                    <>
                      <Text size="sm" fw={500} mt="md">
                        Attributs:
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
                  {expandedToken === token.tokenId ? "Réduire" : "Voir détails"}
                </Button>
              </Group>

              <Group mt="md" justify="center">
                <Button
                  variant="light"
                  color="green"
                  fullWidth
                  leftSection={<IconShoppingCart size={16} />}
                  onClick={() => handleOpenTradeModal(token)}
                >
                  Mettre en vente
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Modal de trading */}
      <NFTTradeModal
        opened={tradeModalOpen}
        onClose={handleCloseTradeModal}
        asset={selectedToken}
      />
    </Container>
  );
}
