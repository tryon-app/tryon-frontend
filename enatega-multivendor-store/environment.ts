/*****************************
 * environment.js
 * path: '/environment.js' (root of your project)
 ******************************/

import * as Updates from "expo-updates";
import { useContext } from "react";
import { ConfigurationContext } from "./lib/context/global/configuration.context";

const getEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext);

  if (env === "production" || env === "staging") {
    return {
      GRAPHQL_URL: "https://tryon.up.railway.app/graphql",
      WS_GRAPHQL_URL: "wss://tryon.up.railway.app/graphql",
      SENTRY_DSN:
        configuration?.restaurantAppSentryUrl ??
        "https://219c69a600ee14ff148cc4f6eae0f64e@o4509214447960064.ingest.de.sentry.io/4509240792318032",
    };
  }
  return {
    // GRAPHQL_URL: "http://10.97.4.84:8001/graphql",
    // WS_GRAPHQL_URL: "ws://10.97.4.84:8001/graphql",
    GRAPHQL_URL: "https://tryon.up.railway.app/graphql",
    WS_GRAPHQL_URL: "wss://tryon.up.railway.app/graphql",

    SENTRY_DSN:
      configuration?.restaurantAppSentryUrl ??
      "https://219c69a600ee14ff148cc4f6eae0f64e@o4509214447960064.ingest.de.sentry.io/4509240792318032",
  };
};

export default getEnvVars;
