"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  Container,
  Group,
  Indicator,
  Menu,
  Paper,
  rem,
  Text,
  Title,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBuildingStore,
  IconCertificate,
  IconCoin,
  IconHome,
  IconLogout,
  IconMessageDots,
  IconUser,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CSSProperties } from "react";
import { useWallet } from "../../context/WalletContext";

interface NavLink {
  link: string;
  label: string;
  icon: JSX.Element;
}

const HEADER_HEIGHT = rem(60);

export default function Navbar(): JSX.Element {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const { wallet, balance, disconnect } = useWallet();

  const links: NavLink[] = [
    { link: "/", label: "Accueil", icon: <IconHome size={18} /> },
    {
      link: "/tokenize",
      label: "Tokeniser",
      icon: <IconCertificate size={18} />,
    },
    {
      link: "/marketplace",
      label: "Marketplace",
      icon: <IconBuildingStore size={18} />,
    },
    { link: "/assets", label: "Mes actifs", icon: <IconWallet size={18} /> },
    {
      link: "/feedback",
      label: "Retours",
      icon: <IconMessageDots size={18} />,
    },
  ];

  const linkStyle: CSSProperties = {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: "4px",
    textDecoration: "none",
    color: "inherit",
    fontSize: "14px",
    fontWeight: 500,
  };

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      style={{
        ...linkStyle,
        backgroundColor: pathname === link.link ? "#e6f7ff" : "transparent",
      }}
      onClick={close}
    >
      <Group gap="xs">
        {link.icon}
        <span>{link.label}</span>
      </Group>
    </Link>
  ));

  return (
    <Box component="header" h={HEADER_HEIGHT} mb={20}>
      <Container
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title order={3} c="blue">
          <IconCertificate
            size={24}
            style={{ marginRight: 8, verticalAlign: "middle" }}
          />
          XRPL Asset Platform
        </Title>

        <Group gap={5} visibleFrom="sm">
          {items}
        </Group>

        <Group>
          {wallet && (
            <Menu
              position="bottom-end"
              width={260}
              transitionProps={{ transition: "pop-top-right" }}
              withinPortal
            >
              <Menu.Target>
                <Indicator
                  inline
                  color="green"
                  position="bottom-end"
                  withBorder
                  processing
                >
                  <ActionIcon radius="xl" size="lg" variant="subtle">
                    <Avatar color="blue" radius="xl">
                      <IconUser size={24} />
                    </Avatar>
                  </ActionIcon>
                </Indicator>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Portefeuille</Menu.Label>
                <Menu.Item>
                  <Group gap="xs">
                    <Badge
                      size="md"
                      variant="filled"
                      color="blue"
                      leftSection={<IconCoin size={12} />}
                    >
                      {balance} XRP
                    </Badge>
                    <Text
                      size="xs"
                      c="dimmed"
                      truncate
                      style={{ maxWidth: 180 }}
                    >
                      {wallet.address}
                    </Text>
                  </Group>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  component={Link}
                  href="/feedback"
                  leftSection={<IconMessageDots size={14} />}
                >
                  Envoyer un retour
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={disconnect}
                  color="red"
                >
                  Déconnecter
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper
              style={{
                ...styles,
                position: "absolute",
                top: HEADER_HEIGHT,
                left: 0,
                right: 0,
                zIndex: 1,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              }}
              withBorder
            >
              {items}
            </Paper>
          )}
        </Transition>
      </Container>
    </Box>
  );
}
