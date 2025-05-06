import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import * as Updates from "expo-updates";
import { useContext } from "react";
import { ConfigurationContext } from "./lib/context/global/configuration.context";
const getEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext);
  if (__DEV__) {
    loadDevMessages();
    loadErrorMessages();
  }
  if (!__DEV__) {
    return {
      GRAPHQL_URL: "https://tryon.up.railway.app/graphql",
      WS_GRAPHQL_URL: "wss://tryon.up.railway.app/graphql",
      SENTRY_DSN:
        configuration?.riderAppSentryUrl ??
        "https://219c69a600ee14ff148cc4f6eae0f64e@o4509214447960064.ingest.de.sentry.io/4509240792318032",
      // GOOGLE_MAPS_KEY: 'AIzaSyBk4tvTtPaSEAVSvaao2yISz4m8Q-BeE1M',
      GOOGLE_MAPS_KEY:configuration?.googleApiKey,
      ENVIRONMENT: "production",
    };
  }

  return {
    // GRAPHQL_URL: "http://10.97.10.65:8001/graphql",
    // WS_GRAPHQL_URL: "ws://10.97.10.65:8001/graphql",
    GRAPHQL_URL: "https://tryon.up.railway.app/graphql",
    WS_GRAPHQL_URL: "wss://tryon.up.railway.app/graphql",
    SENTRY_DSN:
      configuration?.riderAppSentryUrl ??
      "https://219c69a600ee14ff148cc4f6eae0f64e@o4509214447960064.ingest.de.sentry.io/4509240792318032",
    // GOOGLE_MAPS_KEY: 'AIzaSyBk4tvTtPaSEAVSvaao2yISz4m8Q-BeE1M',
    GOOGLE_MAPS_KEY:configuration?.googleApiKey,
    ENVIRONMENT: "development",
  };
};

export default getEnvVars;
