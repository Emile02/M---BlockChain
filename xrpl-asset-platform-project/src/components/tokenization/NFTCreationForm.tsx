// src/components/tokenization/NFTCreationForm.tsx
import {
  Alert,
  Button,
  Card,
  ColorInput,
  FileInput,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconCoin,
  IconUpload,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { Asset } from "../../types";

interface Attribute {
  trait_type: string;
  value: string;
}

export default function NFTCreationForm() {
  const { client, wallet, tokenizeAsset } = useWallet();

  // Basic NFT information
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Real Estate");
  const [value, setValue] = useState<number | "">(1000);
  const [currency, setCurrency] = useState("XRP");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  // Attributes
  const [attributes, setAttributes] = useState<Attribute[]>([
    { trait_type: "", value: "" },
  ]);

  // Batch minting
  const [isBatchMint, setIsBatchMint] = useState(false);
  const [nftCount, setNftCount] = useState<number | "">(1);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);

  // Handle adding new attribute
  const addAttribute = useCallback(() => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  }, [attributes]);

  // Handle removing an attribute
  const removeAttribute = useCallback(
    (index: number) => {
      const newAttributes = [...attributes];
      newAttributes.splice(index, 1);
      setAttributes(newAttributes);
    },
    [attributes]
  );

  // Handle attribute change
  const handleAttributeChange = useCallback(
    (index: number, field: "trait_type" | "value", value: string) => {
      const newAttributes = [...attributes];
      newAttributes[index][field] = value;
      setAttributes(newAttributes);
    },
    [attributes]
  );

  // Handle image upload
  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    try {
      // In a real application, you would upload the file to IPFS or another storage service
      // For this example, we'll just use a placeholder URL
      setImageUrl(
        `https://placehold.co/400x200?text=${encodeURIComponent(file.name)}`
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!client || !wallet) {
      setError("Please connect your wallet first");
      return;
    }

    if (!name || !type || value === "") {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Filter out empty attributes
      const filteredAttributes = attributes.filter(
        (attr) => attr.trait_type.trim() !== "" && attr.value.trim() !== ""
      );

      const asset: Asset = {
        name,
        description,
        type,
        value: typeof value === "number" ? value : 0,
        currency,
        imageUrl,
        attributes: filteredAttributes,
        owner: wallet.address,
        location: location || "",
        backgroundColor: backgroundColor || "#ffffff",
      };

      if (isBatchMint && nftCount && nftCount > 1) {
        // For now, we'll just mint a single token for simplicity
        // In a real implementation, this would be integrated with batch minting
        const result = await tokenizeAsset(asset);

        if (result.success) {
          setSuccess(true);
          setMintedTokenId(result.tokenId || null);
        } else {
          setError(result.error || "Failed to tokenize asset");
        }
      } else {
        const result = await tokenizeAsset(asset);

        if (result.success) {
          setSuccess(true);
          setMintedTokenId(result.tokenId || null);
        } else {
          setError(result.error || "Failed to tokenize asset");
        }
      }
    } catch (err: any) {
      console.error("Error tokenizing asset:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setName("");
    setDescription("");
    setType("Real Estate");
    setValue(1000);
    setCurrency("XRP");
    setLocation("");
    setImageUrl("");
    setBackgroundColor("#ffffff");
    setAttributes([{ trait_type: "", value: "" }]);
    setIsBatchMint(false);
    setNftCount(1);
    setError(null);
    setSuccess(false);
    setMintedTokenId(null);
  };

  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Title order={2} mb="md">
        Create New Tokenized Asset
      </Title>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="lg"
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          icon={<IconCheck size={16} />}
          title="Success"
          color="green"
          mb="lg"
        >
          Asset successfully tokenized!
          {mintedTokenId && (
            <Text size="sm" mt="xs">
              Token ID: {mintedTokenId}
            </Text>
          )}
        </Alert>
      )}

      <Stack spacing="md">
        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Asset Name"
              placeholder="E.g., Luxury Apartment 301"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Asset Type"
              placeholder="Select type"
              value={type}
              onChange={(value) => setType(value || "Real Estate")}
              data={[
                "Real Estate",
                "Artwork",
                "Vehicle",
                "Collectible",
                "Other",
              ]}
              required
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label="Description"
          placeholder="Detailed description of the asset"
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Value"
              placeholder="Asset value"
              value={value}
              onChange={(val) => setValue(val)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Currency"
              placeholder="Select currency"
              value={currency}
              onChange={(value) => setCurrency(value || "XRP")}
              data={["XRP", "USD", "EUR", "GBP", "JPY"]}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Location"
          placeholder="Physical location (if applicable)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <FileInput
          label="Upload Image"
          placeholder="Choose image file"
          accept="image/*"
          onChange={handleImageUpload}
          icon={<IconUpload size={14} />}
        />

        <ColorInput
          label="Background Color"
          placeholder="Choose a color"
          value={backgroundColor}
          onChange={setBackgroundColor}
          format="hex"
        />

        <Title order={4} mt="md">
          Attributes
        </Title>
        {attributes.map((attr, index) => (
          <Grid key={index} align="flex-end">
            <Grid.Col span={5}>
              <TextInput
                label={index === 0 ? "Trait Type" : ""}
                placeholder="E.g., Size"
                value={attr.trait_type}
                onChange={(e) =>
                  handleAttributeChange(index, "trait_type", e.target.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={5}>
              <TextInput
                label={index === 0 ? "Value" : ""}
                placeholder="E.g., Large"
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(index, "value", e.target.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Group>
                {index === attributes.length - 1 ? (
                  <Button variant="light" onClick={addAttribute} size="xs">
                    Add
                  </Button>
                ) : (
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => removeAttribute(index)}
                    size="xs"
                  >
                    Remove
                  </Button>
                )}
              </Group>
            </Grid.Col>
          </Grid>
        ))}

        <Switch
          label="Batch mint multiple tokens"
          checked={isBatchMint}
          onChange={(e) => setIsBatchMint(e.currentTarget.checked)}
          mt="md"
        />

        {isBatchMint && (
          <NumberInput
            label="Number of tokens to mint"
            description="Create multiple identical tokens at once"
            min={1}
            max={100}
            value={nftCount}
            onChange={(val) => setNftCount(val)}
          />
        )}

        <Group position="apart" mt="xl">
          <Button variant="light" onClick={handleReset}>
            Reset Form
          </Button>
          <Button
            leftSection={<IconCoin size={16} />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!wallet || !name || value === ""}
          >
            Tokenize Asset
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
