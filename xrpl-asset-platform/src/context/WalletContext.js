"use client";

import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createContext, useContext, useEffect, useState } from "react";
import { Client } from "xrpl";
import { testXRPLConnection } from "../lib/xrpl/test";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [savedWallet, setSavedWallet] = useLocalStorage({
    key: "xrpl-wallet",
    defaultValue: null,
  });

  const [client, setClient] = useState(null);
  const [wallet, setWallet] = useState(savedWallet);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);

  // Simplifions complètement la procédure de connexion
  const connectToXRPL = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser notre fonction de test pour confirmer que l'API fonctionne
      const testResult = await testXRPLConnection();

      if (!testResult.success) {
        throw new Error("API connection test failed");
      }

      // Créer un nouveau client que nous allons conserver
      const newClient = new Client("wss://s.altnet.rippletest.net:51233");
      await newClient.connect();

      setClient(newClient);
      setConnected(true);

      // Si un portefeuille est déjà sauvegardé, l'utiliser
      if (savedWallet) {
        setWallet(savedWallet);

        try {
          // Récupérer le solde avec un code minimaliste
          const accountInfo = await newClient.request({
            command: "account_info",
            account: savedWallet.address,
          });

          const xrpBalance =
            Number(accountInfo.result.account_data.Balance) / 1000000;
          setBalance(xrpBalance);

          notifications.show({
            title: "Connexion réussie",
            message: `Solde actuel: ${xrpBalance} XRP`,
            color: "green",
          });
        } catch (balanceError) {
          console.error("Balance check error:", balanceError);
          // Ne pas bloquer l'expérience utilisateur pour une erreur de solde
        }
      }

      return newClient;
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message);

      notifications.show({
        title: "Erreur de connexion",
        message: err.message,
        color: "red",
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Simplifier également la création de portefeuille
  const createWallet = async () => {
    if (!client || !client.isConnected()) {
      notifications.show({
        title: "Erreur",
        message: "Client non connecté. Veuillez vous connecter d'abord.",
        color: "red",
      });
      return null;
    }

    try {
      setLoading(true);

      const fundResult = await client.fundWallet();
      const newWallet = fundResult.wallet;

      setWallet(newWallet);
      setSavedWallet(newWallet);

      // Récupérer le solde du nouveau portefeuille
      const balanceInfo = await client.request({
        command: "account_info",
        account: newWallet.address,
      });

      const newBalance =
        Number(balanceInfo.result.account_data.Balance) / 1000000;
      setBalance(newBalance);

      notifications.show({
        title: "Portefeuille créé",
        message: `Adresse: ${newWallet.address.substring(0, 8)}...`,
        color: "green",
      });

      return newWallet;
    } catch (err) {
      console.error("Wallet creation error:", err);
      setError(err.message);

      notifications.show({
        title: "Erreur de création",
        message: err.message,
        color: "red",
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fonction simplifiée pour obtenir le solde
  const getBalance = async () => {
    if (!client || !client.isConnected() || !wallet) {
      console.warn("Cannot check balance - client not connected or no wallet");
      return 0;
    }

    try {
      const response = await client.request({
        command: "account_info",
        account: wallet.address,
      });

      const xrpBalance = Number(response.result.account_data.Balance) / 1000000;
      setBalance(xrpBalance);
      return xrpBalance;
    } catch (err) {
      console.error("Balance check error:", err);
      return balance; // Retourne le dernier solde connu
    }
  };

  // Déconnexion simplifiée
  const disconnect = async () => {
    if (client) {
      try {
        await client.disconnect();
      } catch (e) {
        console.warn("Error during disconnection:", e);
      }
    }

    setClient(null);
    setWallet(null);
    setConnected(false);
    setBalance(0);
    setSavedWallet(null);

    notifications.show({
      title: "Déconnexion",
      message: "Vous avez été déconnecté avec succès",
      color: "blue",
    });
  };

  // Nettoyage à la fermeture
  useEffect(() => {
    return () => {
      if (client && client.isConnected) {
        client.disconnect().catch(console.error);
      }
    };
  }, [client]);

  return (
    <WalletContext.Provider
      value={{
        client,
        wallet,
        connected,
        loading,
        error,
        balance,
        connectToXRPL,
        createWallet,
        getBalance,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
