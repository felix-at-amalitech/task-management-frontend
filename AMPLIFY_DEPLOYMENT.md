# Deploying to AWS Amplify

This guide will help you deploy your Task Management application to AWS Amplify.

## Prerequisites

- An AWS account
- Your code pushed to a Git repository (GitHub, GitLab, BitBucket, or AWS CodeCommit)
- AWS CLI configured (optional, for manual deployments)

## Option 1: Deploy from Git repository (Recommended)

1. **Log in to the AWS Management Console**
   - Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)

2. **Create a new Amplify app**
   - Click "New app" → "Host web app"
   - Choose your Git provider and connect your repository
   - Select the repository and branch to deploy

3. **Configure build settings**
   - Amplify will automatically detect your `amplify.yml` file
   - Review the build settings to ensure they match your project requirements
   - The existing configuration should work as it uses pnpm for installation and building

4. **Update environment variables**
   - Add the following environment variables in the Amplify Console:
     - `VITE_API_BASE_URL`: Your actual API Gateway URL (not localhost)

5. **Update Amplify configuration**
   - Before deploying, update `src/amplify-config.ts` with the correct redirect URLs:

```typescript
// Update these URLs to match your Amplify app domain
redirectSignIn: ['https://your-amplify-app-domain.amplifyapp.com/'],
redirectSignOut: ['https://your-amplify-app-domain.amplifyapp.com/'],
```

6. **Update Cognito User Pool settings**
   - Go to the Cognito Console
   - Select your User Pool
   - Under "App integration" → "App client and analytics"
   - Add your Amplify app domain to the Callback URLs and Sign out URLs

7. **Deploy your app**
   - Click "Save and deploy"
   - Amplify will build and deploy your application

## Option 2: Manual deployment

If you prefer to deploy manually without connecting a Git repository:

1. **Create a deployment package**
   ```bash
   pnpm run build
   ```

2. **Create a new Amplify app**
   - Go to the AWS Amplify Console
   - Click "New app" → "Host web app" → "Deploy without Git provider"
   - Upload your `dist` folder as a zip file

3. **Configure your app**
   - Follow steps 4-6 from Option 1 to configure environment variables and update settings

## Post-deployment

After successful deployment:

1. **Test your application**
   - Navigate to your Amplify app URL
   - Verify that authentication works correctly
   - Test all functionality

2. **Set up a custom domain (optional)**
   - In the Amplify Console, go to "Domain management"
   - Add your custom domain and follow the instructions

## Troubleshooting

- **Authentication issues**: Ensure your Cognito User Pool has the correct callback URLs
- **API connection problems**: Verify your environment variables are set correctly
- **Build failures**: Check the build logs in the Amplify Console for specific errors