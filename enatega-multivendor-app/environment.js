// /*****************************
//  * environment.js
//  * path: '/environment.js' (root of your project)
//  ******************************/

import { useContext } from 'react'
import ConfigurationContext from './src/context/Configuration'
import * as Updates from 'expo-updates'

const useEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext)
  if (env === 'production' || env === 'staging') {
    return {
      GRAPHQL_URL: 'https://tryon.up.railway.app/graphql',
      WS_GRAPHQL_URL: 'wss://tryon.up.railway.app/graphql',
      SERVER_URL: 'https://tryon.up.railway.app/',

      IOS_CLIENT_ID_GOOGLE: configuration?.iOSClientID,
      ANDROID_CLIENT_ID_GOOGLE: configuration?.androidClientID,
      AMPLITUDE_API_KEY: configuration?.appAmplitudeApiKey,
      GOOGLE_MAPS_KEY: configuration?.googleApiKey,
      EXPO_CLIENT_ID: configuration?.expoClientID,
      SENTRY_DSN: configuration?.customerAppSentryUrl ?? 'https://219c69a600ee14ff148cc4f6eae0f64e@o4509214447960064.ingest.de.sentry.io/4509240792318032',
      TERMS_AND_CONDITIONS: configuration?.termsAndConditions,
      PRIVACY_POLICY: configuration?.privacyPolicy,
      TEST_OTP: configuration?.testOtp,
      GOOGLE_PACES_API_BASE_URL: configuration?.googlePlacesApiBaseUrl
    }
  }

  return {
    // GRAPHQL_URL: 'http://10.97.34.172:8001/graphql',
    // WS_GRAPHQL_URL: 'ws://10.97.34.172:8001/graphql',
    // SERVER_URL: 'http://10.97.34.172:8001/',
    GRAPHQL_URL: 'https://tryon.up.railway.app/graphql',
    WS_GRAPHQL_URL: 'wss://tryon.up.railway.app/graphql',
    SERVER_URL: 'https://tryon.up.railway.app/',
    IOS_CLIENT_ID_GOOGLE: configuration?.iOSClientID,
    ANDROID_CLIENT_ID_GOOGLE: configuration?.androidClientID,
    AMPLITUDE_API_KEY: configuration?.appAmplitudeApiKey,
    GOOGLE_MAPS_KEY: configuration?.googleApiKey,
    EXPO_CLIENT_ID: configuration?.expoClientID,
    SENTRY_DSN:
      configuration?.customerAppSentryUrl ??
      'https://219c69a600ee14ff148cc4f6eae0f64e@o4509214447960064.ingest.de.sentry.io/4509240792318032',
    TERMS_AND_CONDITIONS: configuration?.termsAndConditions,
    PRIVACY_POLICY: configuration?.privacyPolicy,
    TEST_OTP: configuration?.testOtp,
    GOOGLE_PACES_API_BASE_URL: configuration?.googlePlacesApiBaseUrl
  }
}

export default useEnvVars
