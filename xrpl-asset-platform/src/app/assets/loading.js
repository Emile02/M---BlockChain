import { Container, Skeleton, Stack } from "@mantine/core";

export default function Loading() {
  return (
    <Container size="lg">
      <Stack spacing="md">
        <Skeleton height={50} width={200} />
        <Skeleton height={30} width={300} />
        <Skeleton height={200} />
        <Skeleton height={400} />
      </Stack>
    </Container>
  );
}
