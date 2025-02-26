"use client";

import { Box, Container, Skeleton, Text, Title } from "@mantine/core";
import { Suspense } from "react";
import TokenizationContainer from "../../components/tokenization/TokenizationContainer";

export default function TokenizePage() {
  return (
    <Container size="lg">
      <Box mb={40}>
        <Title order={1} mb="xs">
          Tokenisez vos actifs réels
        </Title>
        <Text c="dimmed" size="lg">
          Convertissez vos actifs physiques en tokens numériques sur le XRP
          Ledger.
        </Text>
      </Box>

      <Suspense fallback={<LoadingSkeleton />}>
        <TokenizationContainer />
      </Suspense>
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <Skeleton height={200} radius="md" mb="xl" />
      <Skeleton height={400} radius="md" />
    </div>
  );
}
