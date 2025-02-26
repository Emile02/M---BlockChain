"use client";

import {
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconBuildingStore, IconRocket } from "@tabler/icons-react";

export default function MarketplacePage() {
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

      <Paper p="xl" radius="md" withBorder>
        <Center py={40}>
          <Box ta="center" maw={500}>
            <ThemeIcon
              size={80}
              radius="md"
              mb="md"
              variant="light"
              color="blue"
            >
              <IconBuildingStore size={40} />
            </ThemeIcon>
            <Title order={2} mb="md">
              Place de marché en développement
            </Title>
            <Text size="lg" mb="xl" c="dimmed">
              Notre place de marché pour les actifs tokenisés est actuellement
              en cours de développement. Elle sera disponible prochainement avec
              des fonctionnalités puissantes pour explorer, acheter et vendre
              des actifs tokenisés.
            </Text>
            <Group justify="center">
              <Button
                component="a"
                href="/tokenize"
                leftSection={<IconRocket size={20} />}
                size="md"
              >
                Tokeniser un actif en attendant
              </Button>
            </Group>
          </Box>
        </Center>
      </Paper>
    </Container>
  );
}
