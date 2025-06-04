// amplify-config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      // You must provide these values directly here.
      // Get these from your AWS Console:
      // userPoolId: Go to Cognito -> User Pools -> Your User Pool -> Pool details (e.g., 'eu-west-1_xxxxxxxxx')
      userPoolId: 'eu-west-1_IciZrik5J', // <-- REPLACE WITH YOUR ACTUAL USER POOL ID
      
      // userPoolClientId: Go to Cognito -> User Pools -> Your User Pool -> App integration -> App clients and analytics -> Your App client name (e.g., 'xxxxxxxxxxxxxxxxxxxxxxxxx')
      userPoolClientId: '5gploc2s0tpue4sskhm8h2n7h5', // <-- REPLACE WITH YOUR ACTUAL APP CLIENT ID
      
      // identityPoolId: Only needed if you're using Identity Pools for unauthenticated access or federated identities (e.g., 'eu-west-1:yyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy')
      // identityPoolId: 'eu-west-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // <-- UNCOMMENT AND REPLACE IF APPLICABLE

      // Hosted UI / OAuth configuration
      loginWith: {
        oauth: {
          // This looks correct based on your previous input, but double-check in AWS Console
          domain: 'https://task-management-felixcoldplunge.auth.eu-west-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['http://localhost:3000/'],
          redirectSignOut: ['http://localhost:3000/'],
          responseType: 'code',
        },
      },
    },
  },
  // Add other Amplify categories here if you are using them (e.g., Storage, API)
  // Storage: {
  //   S3: {
  //     bucket: 'YOUR_S3_BUCKET_NAME',
  //     region: 'YOUR_BUCKET_REGION',
  //   },
  // },
  // API: {
  //   REST: {
  //     // ...
  //   },
  // },
});