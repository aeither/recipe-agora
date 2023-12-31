import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DataverseContextProvider } from "@dataverse/hooks";
import pacakage from "../package.json";
import app from "../output/app.json";
import "./global.css";
import { ModelParser, Output } from "@dataverse/model-parser";
import { WalletProvider } from "@dataverse/wallet-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const appVersion = pacakage.version;
const modelParser = new ModelParser(app as Output);
const walletProvider = new WalletProvider();

export const AppContext = React.createContext<{
  appVersion: string;
  modelParser: ModelParser;
  walletProvider: WalletProvider;
}>({
  appVersion,
  modelParser,
  walletProvider,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <DataverseContextProvider>
      <AppContext.Provider value={{ appVersion, modelParser, walletProvider }}>
        <App />
        <Toaster />
      </AppContext.Provider>
    </DataverseContextProvider>
  </ThemeProvider>
);
