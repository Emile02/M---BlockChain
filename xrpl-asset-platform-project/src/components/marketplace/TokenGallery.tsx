import { useEffect, useState } from 'react';
import { Grid, Card, Image, Text, Badge, Group, Button, Skeleton, Modal, TextInput } from '@mantine/core';
import { useWallet } from '../../context/WalletContext';
import { getTokenizedAssets } from '../../lib/xrpl/tokenization';
import { Asset } from '../../types';
import axios from "axios";

export default function TokenGallery() {
  const { client, connected, wallet } = useWallet();
  const [tokens, setTokens] = useState<(Asset & { tokenId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Asset | null>(null);
  const [amountToTrade, setAmountToTrade] = useState("");
  const [currencyToReceive, setCurrencyToReceive] = useState("XRP");
  const [expandedToken, setExpandedToken] = useState<string | null>(null); // Suivi du token sélectionné pour l'expansion

  useEffect(() => {
    async function loadTokens() {
      if (!client || !connected) return;

      setLoading(true);
      try {
        const accounts = await axios.get('http://localhost:8000/sessions/all');
        const allTokensRequests = [];

        for (const account of accounts.data.accounts) {
          allTokensRequests.push(getTokenizedAssets(client, account.address));
        }

        const results = await Promise.all(allTokensRequests);
        const allTokens = results.flat();

        setTokens(allTokens);
      } catch (error) {
        console.error("Erreur lors du chargement des tokens:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTokens();
  }, [client, connected, wallet]);

  // Fonction pour proposer un trade sur XRPL
  async function proposeTrade(selectedToken: Asset, amount: string, currencyToReceive: string) {
    if (!wallet || !client) return;

    let transaction: OfferCreate = {
      "TransactionType": "OfferCreate",
      "Account": wallet.address,
      "TakerGets": {}, // L'objet à échanger
      "TakerPays": {}, // Ce qu'on souhaite recevoir
      "Flags": 131072, // Optional: making the offer valid for trading
      "Expiration": Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    };

    // Si l'asset sélectionné est une devise émise, nous échangeons la devise émise contre des XRP
    if (selectedToken.currency !== "XRP") {
      // Échanger une devise émise contre des XRP
      transaction.TakerGets = {
        "value": amount,
        "currency": selectedToken.currency,
        "issuer": selectedToken.issuer, // Utilise l'émetteur de la devise émise
      };
      transaction.TakerPays = {
        "value": "10", // Par exemple, 10 XRP à donner
        "currency": "XRP",
      };
    } else {
      // Si on veut échanger des XRP contre une devise émise
      if (currencyToReceive === "XRP") {
        throw new Error('XRP ne peut pas être échangé contre XRP dans cette transaction');
      }

      // Échanger des XRP contre une devise émise
      transaction.TakerGets = {
        "value": "10", // Amount of XRP to give
        "currency": "XRP",
      };
      transaction.TakerPays = {
        "value": amount,
        "currency": currencyToReceive, // Devise émise à recevoir
        "issuer": wallet.address, // L'émetteur de la devise
      };
    }

    // Ne pas inclure XRP dans TakerGets ou TakerPays pour les deux côtés
    if (transaction.TakerGets.currency === "XRP" && transaction.TakerPays.currency === "XRP") {
      throw new Error('XRP ne peut pas être utilisé dans les deux champs TakerGets et TakerPays');
    }

    try {
      const response = await client.submit(transaction, { wallet });
      console.log('Trade proposé avec succès:', response);
      setTradeModalOpen(false); // Fermer la modal après soumission de la transaction
    } catch (error) {
      console.error('Erreur lors du trade:', error);
    }
  }

  if (loading) {
    return (
        <Grid>
          {[1, 2, 3, 4].map(i => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Skeleton height={400} radius="md" />
              </Grid.Col>
          ))}
        </Grid>
    );
  }

  if (tokens.length === 0) {
    return (
        <Text align="center" size="lg" mt="xl" c="dimmed">
          Aucun actif tokenisé trouvé. Commencez par en tokeniser un!
        </Text>
    );
  }

  return (
      <>
        <Grid>
          {tokens.map((token) => (
              <Grid.Col key={token.tokenId} span={expandedToken === token.tokenId ? 6 : { base: 12, sm: 6, md: 4, lg: 3 }}> {/* Agrandit la carte lorsque le token est sélectionné */}
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: expandedToken === token.tokenId ? 'auto' : '400px' }}>
                  <Card.Section>
                    {token.imageUrl ? (
                        <Image
                            src={token.imageUrl}
                            height={expandedToken === token.tokenId ? 300 : 160} // Agrandir l'image quand la carte est agrandie
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

                  <Text size="sm" c="dimmed" lineClamp={expandedToken === token.tokenId ? undefined : 2}>
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
                        {/* Ajouter d'autres champs si nécessaire */}
                      </>
                  )}

                  <Group mt="md" justify="space-between">
                    <Text fw={700}>
                      {token.value} {token.currency}
                    </Text>
                    <Button variant="light" color="blue" onClick={() => setExpandedToken(expandedToken === token.tokenId ? null : token.tokenId)}>
                      {expandedToken === token.tokenId ? "Réduire" : "Voir les détails"}
                    </Button>
                  </Group>

                  {/* Ajouter un bouton Trade si le token ne m'appartient pas */}
                  {wallet && token.owner !== wallet.address && (
                      <Button
                          variant="light"
                          color="green"
                          mt="md"
                          onClick={() => {
                            setSelectedToken(token);
                            setTradeModalOpen(true);
                          }}
                      >
                        Trade
                      </Button>
                  )}
                </Card>
              </Grid.Col>
          ))}
        </Grid>

        {/* Modal pour gérer le Trade */}
        <Modal
            opened={tradeModalOpen}
            onClose={() => setTradeModalOpen(false)}
            title="Proposer un Trade"
        >
          <TextInput
              label="Montant à échanger"
              placeholder="Entrez le montant à échanger"
              value={amountToTrade}
              onChange={(e) => setAmountToTrade(e.target.value)}
          />
          <TextInput
              label="Devise à recevoir"
              placeholder="Entrez la devise à recevoir"
              value={currencyToReceive}
              onChange={(e) => setCurrencyToReceive(e.target.value)}
          />
          <Group position="right" mt="md">
            <Button variant="light" color="green" mt="md" onClick={() => proposeTrade(selectedToken!!, '10', 'USD')}>Trade</Button>
          </Group>
        </Modal>
      </>
  );
}
