// src/app/marketplace/page.tsx
"use client";

import { Box, Button, Container, Tabs, Text, Title } from "@mantine/core";
import {
  IconBuildingStore,
  IconCertificate,
  IconPlus,
  IconTag,
} from "@tabler/icons-react";
import { useState } from "react";
import MyOffersTab from "../../components/marketplace/MyOffersTab";
import TokenGallery from "../../components/marketplace/TokenGallery";
import NFTCreationForm from "../../components/tokenization/NFTCreationForm";
import { useWallet } from "../../context/WalletContext";

export default function MarketplacePage() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<string | null>("explore");
  const [isCreatingNFT, setIsCreatingNFT] = useState(false);

  if (!connected) {
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
      </Container>
    );
  }

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

      {isCreatingNFT ? (
        <>
          <Box mb={20}>
            <Button
              onClick={() => setIsCreatingNFT(false)}
              variant="subtle"
              color="gray"
            >
              ← Retour à la galerie
            </Button>
          </Box>
          <NFTCreationForm />
        </>
      ) : (
        <>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            mb={20}
          >
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab
                  value="explore"
                  leftSection={<IconBuildingStore size={16} />}
                >
                  Explorer
                </Tabs.Tab>
                <Tabs.Tab value="my-offers" leftSection={<IconTag size={16} />}>
                  Mes offres
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Button
              onClick={() => setIsCreatingNFT(true)}
              leftSection={<IconPlus size={16} />}
            >
              Créer un actif tokenisé
            </Button>
          </Box>

          {activeTab === "explore" && <TokenGallery />}
          {activeTab === "my-offers" && <MyOffersTab />}
        </>
      )}
    </Container>
  );
}
