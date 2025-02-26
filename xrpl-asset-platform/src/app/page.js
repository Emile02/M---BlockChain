"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBuildingStore,
  IconCertificate,
  IconChartBar,
  IconCoins,
  IconScaleOutline,
  IconShieldLock,
  IconWallet,
} from "@tabler/icons-react";
import ConnectWallet from "../components/wallet/ConnectWallet";
import { useWallet } from "../context/WalletContext";

export default function HomePage() {
  const theme = useMantineTheme();
  const { connected, wallet } = useWallet();

  const features = [
    {
      icon: IconCertificate,
      title: "Tokenisation d'actifs",
      description:
        "Transformez vos actifs réels (immobilier, œuvres d'art, etc.) en tokens numériques sur le XRP Ledger.",
      color: "blue",
    },
    {
      icon: IconBuildingStore,
      title: "Place de marché",
      description:
        "Achetez et vendez facilement vos actifs tokenisés dans un environnement sécurisé et transparent.",
      color: "green",
    },
    {
      icon: IconWallet,
      title: "Gestion de portefeuille",
      description:
        "Gérez vos tokens, suivez leurs performances et sécurisez vos avoirs en un seul endroit.",
      color: "purple",
    },
    {
      icon: IconShieldLock,
      title: "Sécurité maximale",
      description:
        "La blockchain XRPL garantit la sécurité, l'immuabilité et la transparence de vos transactions.",
      color: "red",
    },
    {
      icon: IconScaleOutline,
      title: "Conformité réglementaire",
      description:
        "Notre plateforme respecte les normes et réglementations en vigueur pour les actifs numériques.",
      color: "yellow",
    },
    {
      icon: IconChartBar,
      title: "Analyse de marché",
      description:
        "Accédez à des données et analyses pour prendre des décisions éclairées sur vos investissements.",
      color: "cyan",
    },
  ];

  return (
    <Container size="xl">
      <Box
        py={50}
        style={{
          position: "relative",
          borderRadius: theme.radius.lg,
          overflow: "hidden",
          backgroundImage: "linear-gradient(45deg, #4DABF7 0%, #3BC9DB 100%)",
        }}
      >
        <Container size="md">
          <Box>
            <Title
              order={1}
              c="white"
              ta="center"
              style={{
                fontSize: rem(46),
                fontWeight: 900,
                lineHeight: 1.1,
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              Tokenisez, gérez et échangez
              <br />
              vos actifs sur{" "}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: "white", to: "yellow" }}
              >
                XRP Ledger
              </Text>
            </Title>

            <Text
              c="white"
              ta="center"
              size="xl"
              mt="xl"
              style={{
                maxWidth: 580,
                margin: "0 auto",
                opacity: 0.9,
                textShadow: "0 1px 5px rgba(0, 0, 0, 0.15)",
              }}
            >
              Transformez vos actifs du monde réel en tokens numériques
              sécurisés et échangeables sur la blockchain XRP Ledger
            </Text>

            <Group justify="center" mt={30}>
              <Button
                component="a"
                href="/tokenize"
                size="lg"
                radius="md"
                color="dark"
                leftSection={<IconCertificate size={20} />}
              >
                Tokeniser un actif
              </Button>
              <Button
                component="a"
                href="/marketplace"
                size="lg"
                radius="md"
                variant="white"
                color="dark"
                leftSection={<IconBuildingStore size={20} />}
              >
                Explorer le marché
              </Button>
            </Group>
          </Box>
        </Container>
      </Box>

      <Space h={60} />

      <Title order={2} ta="center" mb="xl">
        Fonctionnalités principales
      </Title>

      <SimpleGrid
        cols={3}
        spacing="xl"
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {features.map((feature, index) => (
          <Card key={index} shadow="md" radius="md" p="xl" withBorder>
            <ThemeIcon
              size={50}
              radius="md"
              variant="gradient"
              gradient={{
                from: feature.color,
                to: `${feature.color}.7`,
                deg: 45,
              }}
            >
              <feature.icon size={26} stroke={1.5} />
            </ThemeIcon>
            <Text fw={700} fz="lg" mt="md">
              {feature.title}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {feature.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Space h={60} />

      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="md">
          <IconCoins size={48} stroke={1.5} color={theme.colors.blue[6]} />
          <Title order={3} ta="center">
            Commencez dès maintenant
          </Title>
          <Text ta="center" c="dimmed" maw={600}>
            Connectez votre portefeuille XRP Ledger et commencez à explorer le
            monde de la tokenisation d'actifs réels. Un nouveau paradigme pour
            la propriété et l'échange d'actifs vous attend.
          </Text>
          <Divider w="100%" my="md" />
          {!connected || !wallet ? (
            <Box maw={400} w="100%">
              <ConnectWallet />
            </Box>
          ) : (
            <Button
              component="a"
              href="/tokenize"
              size="lg"
              rightSection={<IconArrowRight size={20} />}
            >
              Tokeniser mon premier actif
            </Button>
          )}
        </Stack>
      </Paper>

      <Space h={60} />
    </Container>
  );
}
