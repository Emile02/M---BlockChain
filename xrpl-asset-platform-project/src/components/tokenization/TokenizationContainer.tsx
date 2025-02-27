"use client";

import { useWallet } from '../../context/WalletContext';
import ConnectWallet from '../wallet/ConnectWallet';
import TokenizeAssetForm from './TokenizeAssetForm';
import { 
  Paper, 
  Title, 
  Text, 
  Group, 
  ThemeIcon, 
  Stack,
  Container,
  Center,
  Space
} from '@mantine/core';
import { 
  IconFileDescription, 
  IconCertificate, 
  IconCoin, 
  IconBuildingSkyscraper 
} from '@tabler/icons-react';

export default function TokenizationContainer(): JSX.Element {
  const { connected, wallet } = useWallet();
  
  if (!connected || !wallet) {
    return (
      <Container size="sm">
        <Paper shadow="md" p="xl" radius="lg" withBorder>
          <Center>
            <IconCertificate size={48} stroke={1.5} color="#228be6" />
          </Center>
          <Title order={3} fw={600} ta="center" mt="md" mb="sm">
            Connectez votre portefeuille pour tokeniser des actifs
          </Title>
          <Text ta="center" c="dimmed" mb="xl">
            Vous devez connecter votre portefeuille pour tokeniser vos actifs réels sur le XRP Ledger.
          </Text>
          <ConnectWallet />
        </Paper>
      </Container>
    );
  }
  
  return (
    <Stack gap="xl">
      <Paper p="xl" radius="md" withBorder>
        <Title order={4} mb="lg">Processus de tokenisation</Title>
        
        <Stack gap="lg">
          <Group wrap="nowrap" gap="xl">
            <ThemeIcon 
              size={48} 
              radius="xl" 
              color="blue"
              variant="filled"
            >
              <IconFileDescription size={24} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">Fournir les détails de l'actif</Text>
              <Text c="dimmed">
                Remplissez toutes les informations nécessaires concernant votre actif réel.
              </Text>
            </div>
          </Group>
          
          <Group wrap="nowrap" gap="xl">
            <ThemeIcon 
              size={48} 
              radius="xl" 
              color="cyan"
              variant="filled"
            >
              <IconCertificate size={24} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">Vérifier la propriété</Text>
              <Text c="dimmed">
                Assurez-vous que vous disposez des documents de propriété appropriés pour l'actif.
              </Text>
            </div>
          </Group>
          
          <Group wrap="nowrap" gap="xl">
            <ThemeIcon 
              size={48} 
              radius="xl" 
              color="teal"
              variant="filled"
            >
              <IconCoin size={24} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">Minter le token</Text>
              <Text c="dimmed">
                Soumettez la demande de tokenisation et signez la transaction avec votre portefeuille.
              </Text>
            </div>
          </Group>
          
          <Group wrap="nowrap" gap="xl">
            <ThemeIcon 
              size={48} 
              radius="xl" 
              color="green"
              variant="filled"
            >
              <IconBuildingSkyscraper size={24} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">Gérer votre token</Text>
              <Text c="dimmed">
                Une fois tokenisé, vous pouvez gérer et échanger votre actif sur la place de marché.
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>
      
      <Space h="md" />
      
      <TokenizeAssetForm />
    </Stack>
  );
}
