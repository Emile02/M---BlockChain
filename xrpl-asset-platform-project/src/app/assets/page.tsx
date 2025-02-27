"use client";

import { 
  Container, 
  Title, 
  Text, 
  Box, 
  Center, 
  Paper, 
  Button, 
  Group, 
  ThemeIcon 
} from '@mantine/core';
import { IconWallet, IconRocket } from '@tabler/icons-react';

export default function AssetsPage(): JSX.Element {
  return (
    <Container size="lg">
      <Box mb={40}>
        <Title order={1} mb="xs">Mes actifs tokenisés</Title>
        <Text c="dimmed" size="lg">
          Gérez et suivez vos actifs tokenisés sur le XRP Ledger.
        </Text>
      </Box>
      
      <Paper p="xl" radius="md" withBorder>
        <Center py={40}>
          <Box ta="center" maw={500}>
            <ThemeIcon size={80} radius="md" mb="md" variant="light" color="teal">
              <IconWallet size={40} />
            </ThemeIcon>
            <Title order={2} mb="md">Gestion d'actifs en développement</Title>
            <Text size="lg" mb="xl" c="dimmed">
              Notre interface de gestion d'actifs tokenisés est en cours de développement. 
              Elle vous permettra bientôt de visualiser, gérer et suivre tous vos actifs 
              tokenisés sur XRP Ledger.
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
