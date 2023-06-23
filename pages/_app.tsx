import "../styles/globals.css";
import App, { AppContext, AppProps } from "next/app";
import getConfig from "next/config";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../lib/theme";

type MProps = AppProps & {
  cluster: string;
  production: boolean;
};

function MyApp({ Component, pageProps }: MProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  const { serverRuntimeConfig } = getConfig();
  const cfg = {
    cluster: serverRuntimeConfig.CLUSTER,
    production: serverRuntimeConfig.PRODUCTION,
  };
  return { ...appProps, ...cfg };
};

export default MyApp;
