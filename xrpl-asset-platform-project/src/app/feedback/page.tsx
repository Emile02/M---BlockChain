"use client";

import {
  Box,
  Container,
  Grid,
  Group,
  List,
  Paper,
  SimpleGrid,
  Space,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBug,
  IconBulb,
  IconChartBar,
  IconMessageCircle,
  IconMessageDots,
  IconUserCircle,
} from "@tabler/icons-react";
import FeedbackForm from "../../components/feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <Container size="lg">
      <Box mb={50}>
        <Group position="center" mb="lg">
          <ThemeIcon color="blue" size={50} radius="lg">
            <IconMessageDots size={28} />
          </ThemeIcon>
        </Group>
        <Title order={1} align="center" mb="sm">
          Vos retours sont importants
        </Title>
        <Text align="center" c="dimmed" size="lg" mb={30} maw={700} mx="auto">
          Aidez-nous à améliorer la plateforme de tokenisation d'actifs sur XRP
          Ledger en partageant vos commentaires, suggestions et signalements de
          bugs.
        </Text>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
          <Paper p="lg" radius="md" withBorder>
            <ThemeIcon color="teal" size={40} radius="md">
              <IconBug size={20} />
            </ThemeIcon>
            <Title order={4} mt="md">
              Signaler un problème
            </Title>
            <Text c="dimmed" size="sm">
              Vous avez rencontré un bug ou un comportement inattendu ?
              Décrivez-le en détail pour nous aider à le corriger rapidement.
            </Text>
          </Paper>

          <Paper p="lg" radius="md" withBorder>
            <ThemeIcon color="violet" size={40} radius="md">
              <IconBulb size={20} />
            </ThemeIcon>
            <Title order={4} mt="md">
              Suggérer une idée
            </Title>
            <Text c="dimmed" size="sm">
              Avez-vous des idées pour améliorer la plateforme ou ajouter de
              nouvelles fonctionnalités ? Partagez-les avec nous !
            </Text>
          </Paper>

          <Paper p="lg" radius="md" withBorder>
            <ThemeIcon color="orange" size={40} radius="md">
              <IconMessageCircle size={20} />
            </ThemeIcon>
            <Title order={4} mt="md">
              Donner votre avis
            </Title>
            <Text c="dimmed" size="sm">
              Partagez votre expérience générale avec la plateforme, ce que vous
              aimez ou ce qui pourrait être amélioré.
            </Text>
          </Paper>
        </SimpleGrid>
      </Box>

      <Grid gutter={40}>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <FeedbackForm />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xl" radius="md" withBorder>
            <Title order={3} mb="md">
              Questions fréquentes
            </Title>

            <List spacing="md">
              <List.Item
                icon={
                  <ThemeIcon color="blue" radius="xl" size={24}>
                    <IconChartBar size={14} />
                  </ThemeIcon>
                }
              >
                <Text fw={500}>Comment mes retours sont-ils utilisés ?</Text>
                <Text size="sm" c="dimmed">
                  Vos commentaires sont examinés par notre équipe pour
                  identifier les améliorations prioritaires et résoudre les
                  problèmes signalés.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon color="blue" radius="xl" size={24}>
                    <IconUserCircle size={14} />
                  </ThemeIcon>
                }
              >
                <Text fw={500}>
                  Mes informations restent-elles confidentielles ?
                </Text>
                <Text size="sm" c="dimmed">
                  Oui, votre adresse de portefeuille et vos coordonnées ne sont
                  utilisées que pour le suivi de vos retours et ne seront jamais
                  partagées publiquement.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon color="blue" radius="xl" size={24}>
                    <IconMessageDots size={14} />
                  </ThemeIcon>
                }
              >
                <Text fw={500}>Vais-je recevoir une réponse ?</Text>
                <Text size="sm" c="dimmed">
                  Si vous avez fourni un email, nous pourrons vous contacter
                  pour obtenir plus de détails ou vous informer lorsque votre
                  suggestion est mise en œuvre.
                </Text>
              </List.Item>
            </List>

            <Space h="xl" />

            <Text fw={500}>Nous contacter</Text>
            <Text size="sm" c="dimmed">
              Pour toute question urgente ou assistance technique, vous pouvez
              également nous contacter directement à{" "}
              <Text span c="blue" inherit>
                support@xrplassetplatform.com
              </Text>
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
