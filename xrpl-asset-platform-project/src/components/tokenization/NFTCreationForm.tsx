"use client";

import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Text,
  TextInput,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconCheck,
  IconCoinMonero,
  IconPhoto,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { tokenizeAsset } from "../../lib/xrpl/tokenization";
import { Asset, AssetAttribute } from "../../types";

interface FormValues extends Omit<Asset, "attributes" | "owner"> {
  attributes: AssetAttribute[];
}

const assetTypes = [
  { value: "Real Estate", label: "Immobilier" },
  { value: "Artwork", label: "Œuvre d'art" },
  { value: "Collectible", label: "Collection" },
  { value: "Vehicle", label: "Véhicule" },
  { value: "Luxury Item", label: "Objet de luxe" },
  { value: "Other", label: "Autre" },
];

const currencies = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "JPY", label: "JPY" },
  { value: "XRP", label: "XRP" },
];

export default function TokenizeAssetForm(): JSX.Element {
  const { client, wallet, connected } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      description: "",
      type: "Real Estate",
      value: 0,
      currency: "USD", // Default to USD since that's what you likely want
      location: "",
      imageUrl: "",
      attributes: [],
    },
    validate: {
      name: (value) => (value ? null : "Le nom est requis"),
      description: (value) => (value ? null : "La description est requise"),
      value: (value) =>
        value && value > 0 ? null : "La valeur doit être positive",
    },
  });

  // Ajouter un nouvel attribut
  const addAttribute = (): void => {
    form.insertListItem("attributes", { trait_type: "", value: "" });
  };

  // Supprimer un attribut
  const removeAttribute = (index: number): void => {
    form.removeListItem("attributes", index);
  };

  const handleSubmit = async (values: FormValues): Promise<void> => {
    if (!connected || !client || !wallet) {
      setError("Portefeuille non connecté. Veuillez vous connecter d'abord.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Add required owner field and filter out empty attributes
      const filteredAttributes = values.attributes.filter(
        (attr) => attr.trait_type.trim() !== "" && attr.value.trim() !== ""
      );

      // Create a properly formatted asset with owner field
      const assetData: Asset = {
        ...values,
        owner: wallet.address, // Add the required owner field
        attributes: filteredAttributes,
      };

      // Ensure value and currency are explicitly included and correctly typed
      const cleanedAsset: Asset = {
        name: assetData.name,
        description: assetData.description,
        type: assetData.type,
        value: Number(assetData.value), // Ensure this is a number
        currency: assetData.currency, // Keep the user-selected currency
        imageUrl: assetData.imageUrl || "",
        owner: wallet.address,
        attributes: filteredAttributes.slice(0, 3), // Limit number of attributes
        location: assetData.location || "",
      };

      console.log("Tokenizing asset with data:", cleanedAsset);

      // Call the tokenization function
      const result = await tokenizeAsset(client, wallet, cleanedAsset);

      console.log("Tokenization result:", result);

      if (result.success && result.tokenId) {
        setSuccess(true);
        setTokenId(result.tokenId);
        form.reset();
      } else {
        setError(result.error || "Une erreur inconnue s'est produite");
      }
    } catch (err: any) {
      console.error("Error tokenizing asset:", err);
      setError(
        err.message || "Une erreur s'est produite lors de la tokenisation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Title order={3} fw={600} mb="md">
        Tokeniser un actif réel
      </Title>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Erreur"
          color="red"
          variant="filled"
          mb="lg"
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          icon={<IconCheck size={16} />}
          title="Tokenisation réussie"
          color="green"
          variant="filled"
          mb="lg"
        >
          <Text>Votre actif a été tokenisé avec succès!</Text>
          <Text size="sm" mt="xs">
            Token ID:{" "}
            <Box component="span" style={{ fontFamily: "monospace" }}>
              {tokenId}
            </Box>
          </Text>
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid columns={12} gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              required
              label="Nom de l'actif"
              placeholder="Appartement Luxueux"
              {...form.getInputProps("name")}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              required
              label="Type d'actif"
              placeholder="Sélectionnez le type"
              data={assetTypes}
              {...form.getInputProps("type")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              required
              label="Description"
              placeholder="Décrivez votre actif en détail..."
              autosize
              minRows={3}
              {...form.getInputProps("description")}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              required
              label="Valeur"
              placeholder="100000"
              hideControls
              leftSection={<IconCoinMonero size={rem(16)} />}
              {...form.getInputProps("value")}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Devise"
              placeholder="Sélectionnez une devise"
              data={currencies}
              defaultValue="USD"
              {...form.getInputProps("currency")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Localisation"
              placeholder="Paris, France"
              {...form.getInputProps("location")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="URL de l'image"
              placeholder="https://..."
              leftSection={<IconPhoto size={rem(16)} />}
              {...form.getInputProps("imageUrl")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">
                Attributs
              </Text>
              <Button
                variant="subtle"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={addAttribute}
              >
                Ajouter un attribut
              </Button>
            </Group>

            {form.values.attributes.map((attr, index) => (
              <Group key={index} mb="xs" align="flex-end">
                <TextInput
                  label="Nom de l'attribut"
                  placeholder="Surface"
                  style={{ flex: 1 }}
                  {...form.getInputProps(`attributes.${index}.trait_type`)}
                />
                <TextInput
                  label="Valeur de l'attribut"
                  placeholder="120 m²"
                  style={{ flex: 1 }}
                  {...form.getInputProps(`attributes.${index}.value`)}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeAttribute(index)}
                  mb={6}
                >
                  <IconX size={20} />
                </ActionIcon>
              </Group>
            ))}
          </Grid.Col>
        </Grid>

        <Divider my="xl" />

        <Button
          type="submit"
          loading={loading}
          disabled={!connected || !wallet}
          size="lg"
          fullWidth
          color="blue"
        >
          {loading ? "Tokenisation en cours..." : "Tokeniser l'actif"}
        </Button>
      </form>
    </Paper>
  );
}
