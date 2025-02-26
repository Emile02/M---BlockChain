"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  CopyButton,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconCoin,
  IconCopy,
  IconPlugConnected,
  IconWallet,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";

export default function ConnectWallet() {
  const {
    connectToXRPL,
    createWallet,
    disconnect,
    connected,
    wallet,
    loading,
    error,
    balance,
  } = useWallet();
  const [isClient, setIsClient] = useState(false);

  // S'assurer que le rendu se fait uniquement côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Text align="center">Chargement du portefeuille...</Text>
      </Paper>
    );
  }

  const handleConnect = async () => {
    await connectToXRPL();
  };

  const handleCreateWallet = async () => {
    await createWallet();
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group mb="md" justify="space-between">
        <Title order={4} fw={600}>
          <Group gap="xs">
            <IconWallet size={20} />
            <Text>Portefeuille XRPL</Text>
          </Group>
        </Title>
        {connected && (
          <Badge color="green" variant="light" size="lg">
            <Group gap={4}>
              <IconPlugConnected size={14} />
              <Text>Connecté</Text>
            </Group>
          </Badge>
        )}
      </Group>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Erreur"
          color="red"
          variant="filled"
          mb="md"
        >
          {error}
        </Alert>
      )}

      {!connected ? (
        <Stack gap="md">
          <Button
            onClick={handleConnect}
            loading={loading}
            fullWidth
            color="blue"
            leftSection={<IconPlugConnected size={16} />}
          >
            {loading ? "Connexion en cours..." : "Se connecter à XRPL"}
          </Button>
        </Stack>
      ) : !wallet ? (
        <Stack gap="md">
          <Text c="green" fw={500} mb={4}>
            ✓ Connecté au réseau XRPL
          </Text>

          <Button
            onClick={handleCreateWallet}
            loading={loading}
            fullWidth
            color="teal"
            leftSection={<IconWallet size={16} />}
          >
            {loading ? "Création en cours..." : "Créer un portefeuille de test"}
          </Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={500} size="sm">
              Adresse:
            </Text>
            <CopyButton value={wallet.address} timeout={2000}>
              {({ copied, copy }) => (
                <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              )}
            </CopyButton>
          </Group>

          <Box
            bg="gray.1"
            p="xs"
            style={{ borderRadius: 4, wordBreak: "break-all" }}
          >
            <Text size="xs">{wallet.address}</Text>
          </Box>

          <Group justify="space-between" align="center">
            <Text fw={500} size="sm">
              Solde:
            </Text>
            <Badge
              color="indigo"
              variant="filled"
              size="lg"
              leftSection={<IconCoin size={12} />}
            >
              {balance} XRP
            </Badge>
          </Group>

          <Divider my="xs" />

          <Button color="red" variant="light" onClick={disconnect}>
            Déconnecter
          </Button>
        </Stack>
      )}
    </Paper>
  );
}
