import { useEffect, useState } from 'react';
import { Grid, Card, Image, Text, Badge, Group, Button, Skeleton } from '@mantine/core';
import { useWallet } from '../../context/WalletContext';
import { getTokenizedAssets } from '../../lib/xrpl/tokenization';
import { Asset } from '../../types';

export default function TokenGallery() {
  const { client, connected, wallet } = useWallet();
  const [tokens, setTokens] = useState<(Asset & { tokenId: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTokens() {
      if (!client || !connected) return;
      
      setLoading(true);
      try {
        // Récupérer tous les tokens du réseau, pas seulement ceux de l'utilisateur actuel
        const allTokensRequests = [];
        
        // 1. D'abord, récupérer les tokens de l'utilisateur courant
        if (wallet) {
          allTokensRequests.push(getTokenizedAssets(client, wallet.address));
        }
        
        // 2. On pourrait ajouter d'autres adresses connues ici
        // allTokensRequests.push(getTokenizedAssets(client, "rAutreAdresse..."));
        
        const results = await Promise.all(allTokensRequests);
        const allTokens = results.flat();
        
        console.log("Tokens récupérés:", allTokens);
        setTokens(allTokens);
      } catch (error) {
        console.error("Erreur lors du chargement des tokens:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTokens();
  }, [client, connected, wallet]);

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
    <Grid>
      {tokens.map((token) => (
        <Grid.Col key={token.tokenId} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              {token.imageUrl ? (
                <Image
                  src={token.imageUrl}
                  height={160}
                  alt={token.name}
                  fallbackSrc="https://placehold.co/400x200?text=Asset+Image"
                />
              ) : (
                <Image
                  src={`https://placehold.co/400x200?text=${token.name}`}
                  height={160}
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

            <Text size="sm" c="dimmed" lineClamp={2}>
              {token.description || "Pas de description disponible"}
            </Text>

            <Group mt="md" justify="space-between">
              <Text fw={700}>
                {token.value} {token.currency}
              </Text>
              <Button variant="light" color="blue">
                Voir les détails
              </Button>
            </Group>
            
            <Text size="xs" c="dimmed" mt="sm">
              Token ID: {token.tokenId.substring(0, 8)}...
            </Text>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}
