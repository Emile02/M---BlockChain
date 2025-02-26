"use client";

import {
  ActionIcon,
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
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTokens, useWalletAddress } from "@nice-xrpl/react-xrpl";
import {
  IconBuildingSkyscraper,
  IconCertificate,
  IconCoin,
  IconDownload,
  IconExternalLink,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import ConnectWallet from "../wallet/ConnectWallet";

export default function AssetManagement() {
  const { connected } = useWallet();
  const address = useWalletAddress();
  const tokens = useTokens();

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);

  // Process tokens when they're loaded
  useEffect(() => {
    if (tokens && tokens.length > 0) {
      const processedAssets = tokens.map((token) => {
        // Parse the URI if it exists
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
          taxon: token.taxon,
          flags: token.flags,
          metadata: metadata,
        };
      });

      setAssets(processedAssets);
    } else {
      setAssets([]);
    }
  }, [tokens]);

  const viewAssetDetails = (asset) => {
    setSelectedAsset(asset);
    open();
  };

  const downloadAssetCertificate = (asset) => {
    // Create certificate data
    const certificateData = {
      assetId: asset.id,
      name: asset.metadata.name,
      description: asset.metadata.description,
      type: asset.metadata.type,
      value: `${asset.metadata.value} ${asset.metadata.currency}`,
      location: asset.metadata.location,
      issuer: asset.issuer,
      owner: address,
      timestamp: new Date().toISOString(),
      attributes: asset.metadata.attributes,
    };

    // Convert to JSON and create downloadable blob
    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    // Create download link and trigger download
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate-${asset.metadata.name.replace(
      /\s+/g,
      "-"
    )}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refreshAssets = () => {
    setLoading(true);
    // The tokens will be refreshed automatically by the hook
    setTimeout(() => setLoading(false), 1000);
  };

  if (!connected || !address) {
    return (
      <Container size="sm">
        <Paper shadow="md" p="xl" radius="lg" withBorder>
          <Center>
            <IconCertificate size={48} stroke={1.5} color="#228be6" />
          </Center>
          <Title order={3} fw={600} ta="center" mt="md" mb="sm">
            Connectez votre portefeuille pour voir vos actifs
          </Title>
          <Text ta="center" c="dimmed" mb="xl">
            Vous devez connecter votre portefeuille pour accéder à vos actifs
            tokenisés sur le XRP Ledger.
          </Text>
          <ConnectWallet />
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Title order={3}>Mes actifs tokenisés</Title>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={refreshAssets}
          loading={loading}
        >
          Rafraîchir
        </Button>
      </Group>

      {loading ? (
        <Center py="xl">
          <Stack align="center" spacing="md">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              Chargement de vos actifs...
            </Text>
          </Stack>
        </Center>
      ) : assets.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Center py={40}>
            <Box ta="center" maw={500}>
              <ThemeIcon
                size={80}
                radius="md"
                mb="md"
                variant="light"
                color="teal"
              >
                <IconBuildingSkyscraper size={40} />
              </ThemeIcon>
              <Title order={2} mb="md">
                Aucun actif trouvé
              </Title>
              <Text size="lg" mb="xl" c="dimmed">
                Vous n'avez pas encore d'actifs tokenisés. Commencez par
                tokeniser vos actifs réels.
              </Text>
              <Group justify="center">
                <Button
                  component="a"
                  href="/tokenize"
                  leftSection={<IconCertificate size={20} />}
                  size="md"
                >
                  Tokeniser un actif
                </Button>
              </Group>
            </Box>
          </Center>
        </Paper>
      ) : (
        <Tabs defaultValue="grid">
          <Tabs.List mb="md">
            <Tabs.Tab
              value="grid"
              leftSection={<IconBuildingSkyscraper size={16} />}
            >
              Affichage grille
            </Tabs.Tab>
            <Tabs.Tab value="table" leftSection={<IconCertificate size={16} />}>
              Affichage liste
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="grid">
            <SimpleGrid
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: "md", cols: 2 },
                { maxWidth: "xs", cols: 1 },
              ]}
            >
              {assets.map((asset) => (
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
                      {asset.metadata.value || "?"}{" "}
                      {asset.metadata.currency || "XRP"}
                    </Badge>

                    <Group>
                      <ActionIcon
                        color="blue"
                        variant="subtle"
                        onClick={() => viewAssetDetails(asset)}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                      <ActionIcon
                        color="teal"
                        variant="subtle"
                        onClick={() => downloadAssetCertificate(asset)}
                      >
                        <IconDownload size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="table">
            <Paper withBorder radius="md">
              <Table highlightOnHover>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Valeur</th>
                    <th>Localisation</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <Text weight={500}>
                          {asset.metadata.name || "Unnamed Asset"}
                        </Text>
                      </td>
                      <td>
                        <Badge color="blue" variant="light">
                          {asset.metadata.type || "Asset"}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          color="green"
                          variant="filled"
                          leftSection={<IconCoin size={12} />}
                        >
                          {asset.metadata.value || "?"}{" "}
                          {asset.metadata.currency || "XRP"}
                        </Badge>
                      </td>
                      <td>{asset.metadata.location || "N/A"}</td>
                      <td>
                        {asset.metadata.createdAt
                          ? new Date(
                              asset.metadata.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <Group spacing={4}>
                          <ActionIcon
                            color="blue"
                            variant="subtle"
                            onClick={() => viewAssetDetails(asset)}
                          >
                            <IconEye size={18} />
                          </ActionIcon>
                          <ActionIcon
                            color="teal"
                            variant="subtle"
                            onClick={() => downloadAssetCertificate(asset)}
                          >
                            <IconDownload size={18} />
                          </ActionIcon>
                          <ActionIcon
                            color="gray"
                            variant="subtle"
                            component="a"
                            href={`https://testnet.xrpl.org/nft/${asset.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconExternalLink size={18} />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={600}>Détails de l'actif</Text>}
        size="lg"
      >
        {selectedAsset && (
          <Box>
            <Group justify="space-between" mb="md">
              <div>
                <Text size="xl" weight={700}>
                  {selectedAsset.metadata.name || "Unnamed Asset"}
                </Text>
                <Badge color="blue" variant="light" size="lg">
                  {selectedAsset.metadata.type || "Asset"}
                </Badge>
              </div>
              <Badge
                color="green"
                variant="filled"
                size="lg"
                leftSection={<IconCoin size={14} />}
              >
                {selectedAsset.metadata.value || "?"}{" "}
                {selectedAsset.metadata.currency || "XRP"}
              </Badge>
            </Group>

            <Paper p="md" withBorder radius="md" mb="md">
              <Text size="sm" color="dimmed" mb={5}>
                Description
              </Text>
              <Text>
                {selectedAsset.metadata.description ||
                  "No description available"}
              </Text>
            </Paper>

            <SimpleGrid
              cols={2}
              breakpoints={[{ maxWidth: "xs", cols: 1 }]}
              mb="md"
            >
              <Paper p="md" withBorder radius="md">
                <Text size="sm" color="dimmed" mb={5}>
                  Localisation
                </Text>
                <Text>{selectedAsset.metadata.location || "N/A"}</Text>
              </Paper>
              <Paper p="md" withBorder radius="md">
                <Text size="sm" color="dimmed" mb={5}>
                  Date de création
                </Text>
                <Text>
                  {selectedAsset.metadata.createdAt
                    ? new Date(
                        selectedAsset.metadata.createdAt
                      ).toLocaleString()
                    : "N/A"}
                </Text>
              </Paper>
            </SimpleGrid>

            {selectedAsset.metadata.attributes &&
              selectedAsset.metadata.attributes.length > 0 && (
                <>
                  <Title order={5} mt="xl" mb="sm">
                    Attributs
                  </Title>
                  <Table>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Valeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAsset.metadata.attributes.map((attr, index) => (
                        <tr key={index}>
                          <td>{attr.trait_type}</td>
                          <td>{attr.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}

            <Divider my="lg" />

            <Title order={5} mb="sm">
              Informations techniques
            </Title>
            <SimpleGrid cols={2} breakpoints={[{ maxWidth: "xs", cols: 1 }]}>
              <Paper p="md" withBorder radius="md">
                <Text size="sm" color="dimmed" mb={5}>
                  Token ID
                </Text>
                <Text size="xs" style={{ wordBreak: "break-all" }}>
                  {selectedAsset.id}
                </Text>
              </Paper>
              <Paper p="md" withBorder radius="md">
                <Text size="sm" color="dimmed" mb={5}>
                  Émetteur
                </Text>
                <Text size="xs" style={{ wordBreak: "break-all" }}>
                  {selectedAsset.issuer}
                </Text>
              </Paper>
            </SimpleGrid>

            <Group justify="right" mt="xl">
              <Button
                variant="subtle"
                color="gray"
                component="a"
                href={`https://testnet.xrpl.org/nft/${selectedAsset.id}`}
                target="_blank"
                rel="noopener noreferrer"
                leftSection={<IconExternalLink size={16} />}
              >
                Explorer sur XRPL
              </Button>
              <Button
                color="teal"
                onClick={() => downloadAssetCertificate(selectedAsset)}
                leftSection={<IconDownload size={16} />}
              >
                Télécharger certificat
              </Button>
            </Group>
          </Box>
        )}
      </Modal>
    </Box>
  );
}
