// amplify-config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      // You must provide these values directly here.
      // Get these from your AWS Console:
      // userPoolId: Go to Cognito -> User Pools -> Your User Pool -> Pool details (e.g., 'eu-west-1_xxxxxxxxx')
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,

      // Hosted UI / OAuth configuration
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [import.meta.env.VITE_API_BASE_URL],
          redirectSignOut: [import.meta.env.VITE_API_BASE_URL],
          responseType: 'code',
        },
      },
    },
  }
});