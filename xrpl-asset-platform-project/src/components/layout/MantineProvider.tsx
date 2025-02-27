"use client";

import { MantineProvider as Provider, createTheme, MantineThemeOverride } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ReactNode } from 'react';

const theme: MantineThemeOverride = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  colors: {
    brand: [
      '#E2F1FF',
      '#B5D9FF',
      '#88C0FF',
      '#5BA7FF',
      '#2E8EFF',
      '#0075FF',
      '#0062D6',
      '#004FAD',
      '#003C84',
      '#00295B',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});

interface MantineProviderProps {
  children: ReactNode;
}

export default function MantineProvider({ children }: MantineProviderProps): JSX.Element {
  return (
    <Provider theme={theme}>
      <Notifications position="top-right" />
      {children}
    </Provider>
  );
}
