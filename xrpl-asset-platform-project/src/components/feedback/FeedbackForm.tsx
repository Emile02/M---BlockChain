"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconCheck,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useState } from "react";
import { useWallet } from "../../context/WalletContext";

interface FeedbackFormValues {
  category: string;
  subject: string;
  message: string;
  rating: number;
  email?: string;
}

export default function FeedbackForm() {
  const { wallet } = useWallet();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FeedbackFormValues>({
    initialValues: {
      category: "bug",
      subject: "",
      message: "",
      rating: 3,
      email: "",
    },
    validate: {
      subject: (value) => (value ? null : "Le sujet est requis"),
      message: (value) =>
        value.trim().length < 10
          ? "Veuillez fournir plus de détails (minimum 10 caractères)"
          : null,
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Email invalide" : null,
    },
  });

  const handleSubmit = async (values: FeedbackFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Simulation d'envoi de données - à remplacer par votre API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log de débogage - remplacer par l'envoi réel à l'API
      console.log({
        ...values,
        walletAddress: wallet?.address || "Non connecté",
        timestamp: new Date().toISOString(),
      });

      // Succès
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(
        "Une erreur est survenue lors de l'envoi de votre retour. Veuillez réessayer."
      );
      console.error("Erreur d'envoi de feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Center>
          <Stack spacing="md" align="center" py={30}>
            <IconCheck size={60} color="green" stroke={1.5} />
            <Title order={2}>Merci pour votre retour !</Title>
            <Text size="lg" ta="center" c="dimmed">
              Vos commentaires nous aident à améliorer la plateforme pour tous
              les utilisateurs.
            </Text>
            <Button
              mt="lg"
              onClick={() => setSubmitted(false)}
              leftSection={<IconMessageCircle size={16} />}
            >
              Envoyer un autre retour
            </Button>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="lg">
          <div>
            <Title order={2} mb="md">
              Partagez votre expérience
            </Title>
            <Text c="dimmed" size="sm">
              Vos commentaires sont essentiels pour améliorer notre plateforme
              de tokenisation d'actifs. Partagez ce que vous aimez ou ce qui
              pourrait être amélioré.
            </Text>
          </div>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Erreur"
              color="red"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Remplaçons le Select par un RadioGroup plus simple */}
          <RadioGroup
            label="Catégorie"
            description="Choisissez la catégorie qui correspond le mieux à votre retour"
            required
            {...form.getInputProps("category")}
          >
            <Radio value="bug" label="Signaler un bug" />
            <Radio value="feature" label="Suggérer une fonctionnalité" />
            <Radio value="experience" label="Expérience utilisateur" />
            <Radio value="other" label="Autre" />
          </RadioGroup>

          <TextInput
            label="Sujet"
            placeholder="Résumez brièvement votre retour"
            required
            {...form.getInputProps("subject")}
          />

          <Textarea
            label="Message"
            placeholder="Décrivez en détail votre expérience, problème ou suggestion..."
            minRows={5}
            required
            {...form.getInputProps("message")}
          />

          <div>
            <Text size="sm" fw={500} mb={8}>
              Évaluez votre expérience globale
            </Text>
            <Rating
              size="lg"
              value={form.values.rating}
              onChange={(value) => form.setFieldValue("rating", value)}
            />
          </div>

          <TextInput
            label="Email (optionnel)"
            description="Fournissez votre email si vous souhaitez être contacté à propos de ce retour"
            placeholder="votre@email.com"
            {...form.getInputProps("email")}
          />

          <Divider />

          <Group position="right">
            <Button type="reset" variant="outline" onClick={() => form.reset()}>
              Réinitialiser
            </Button>
            <Button type="submit" loading={loading}>
              Envoyer le retour
            </Button>
          </Group>

          {wallet && (
            <Box>
              <Text size="xs" c="dimmed">
                Soumis en tant que :
              </Text>
              <Badge color="blue" mt={5}>
                {wallet.address.substring(0, 10)}...
                {wallet.address.substring(wallet.address.length - 5)}
              </Badge>
            </Box>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
