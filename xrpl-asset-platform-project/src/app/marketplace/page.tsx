// src/app/marketplace/page.tsx
"use client";

import { Box, Button, Container, Tabs, Text, Title } from "@mantine/core";
import { IconBuildingStore, IconCertificate } from "@tabler/icons-react";
import TokenGallery from "../../components/marketplace/TokenGallery";
import { useWallet } from "../../context/WalletContext";

export default function MarketplacePage() {
  const { connected } = useWallet();

  return (
    <Container size="lg">
      <Box mb={40}>
        <Title order={1} mb="xs">
          Place de marché
        </Title>
        <Text c="dimmed" size="lg">
          Explorez et échangez des actifs tokenisés sur le XRP Ledger.
        </Text>
      </Box>

      {!connected ? (
        <Box ta="center" py={50}>
          <Text size="xl" mb="lg">
            Connectez votre portefeuille pour accéder à la place de marché
          </Text>
          <Button
            component="a"
            href="/"
            leftSection={<IconCertificate size={20} />}
            size="lg"
          >
            Retour à l&apos;accueil
          </Button>
        </Box>
      ) : (
        <Tabs defaultValue="explore">
          <Tabs.List mb="xl">
            <Tabs.Tab
              value="explore"
              leftSection={<IconBuildingStore size={16} />}
            >
              Explorer
            </Tabs.Tab>
            <Tabs.Tab
              value="my-offers"
              leftSection={<IconCertificate size={16} />}
            >
              Mes offres
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="explore">
            <TokenGallery />
          </Tabs.Panel>

          <Tabs.Panel value="my-offers">
            <Text ta="center" size="lg" c="dimmed">
              Fonctionnalité en développement
            </Text>
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  );
}
