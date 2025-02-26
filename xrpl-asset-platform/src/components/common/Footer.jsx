"use client";

import { 
  Box, 
  Container, 
  Group, 
  Text, 
  ActionIcon, 
  Divider 
} from '@mantine/core';
import { 
  IconBrandTwitter, 
  IconBrandGithub, 
  IconBrandLinkedin 
} from '@tabler/icons-react';

export default function Footer() {
  return (
    <Box component="footer" py="xl" mt={40}>
      <Container size="xl">
        <Divider my="sm" />
        <Group justify="space-between" py="md">
          <Text size="sm" c="dimmed">
            © 2025 XRPL Asset Platform
          </Text>
          
          <Group gap={0} justify="right">
            <ActionIcon size="lg" variant="subtle" radius="xl">
              <IconBrandTwitter size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg" variant="subtle" radius="xl">
              <IconBrandGithub size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg" variant="subtle" radius="xl">
              <IconBrandLinkedin size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
