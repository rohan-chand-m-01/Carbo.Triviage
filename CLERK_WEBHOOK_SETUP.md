# Clerk Webhook Setup Guide

## 1. Configure Clerk Webhook

### Step 1: Create Webhook in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add webhook**

### Step 2: Configure Webhook Settings
- **Webhook URL**: `http://localhost:3001/api/webhooks/clerk`
- **Events to subscribe**: Select all events:
  - `user.created`
  - `user.updated` 
  - `user.deleted`
  - `organization.created`
  - `organization.updated`
  - `organization.deleted`
  - `organizationMembership.created`
  - `organizationMembership.updated`
  - `organizationMembership.deleted`

### Step 3: Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your `.env.local` file:

```env
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## 2. Update Environment Variables

Your `.env.local` file should now have:

```env
# Clerk Authentication - Production API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhZGluZy1kdWNrLTM5LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_7D4NO4zYUJmVw59oyJb5UUlx3WnB0HAK6wU59pDCrk
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here

# App URL (updated for port 3001)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 3. Test Webhook

### Step 1: Start Development Server
```bash
npm run dev
```
The app should be running on `http://localhost:3001`

### Step 2: Test Webhook Events
1. Go to Clerk Dashboard
2. Navigate to **Users** 
3. Create a test user
4. Check the webhook logs in Clerk Dashboard
5. Check your application logs for webhook processing

### Step 3: Verify Database
1. Check your PostgreSQL database
2. Verify the user was created in the `users` table
3. Verify the organization was created in the `organisations` table

## 4. Webhook Event Handlers

The webhook handler supports the following events:

### User Events
- **user.created**: Creates new user in database
- **user.updated**: Updates user email
- **user.deleted**: Deletes user and all related data

### Organization Events  
- **organization.created**: Creates new organization
- **organization.updated**: Updates organization name/logo
- **organization.deleted**: Deletes organization and all related data

### Membership Events
- **organizationMembership.created**: Adds user to organization
- **organizationMembership.updated**: Updates user role
- **organizationMembership.deleted**: Removes user from organization

## 5. Troubleshooting

### Common Issues

**Issue 1: Webhook signature verification failed**
- Ensure `CLERK_WEBHOOK_SECRET` is correctly set
- Check that the webhook URL is accessible from Clerk

**Issue 2: User not created in database**
- Check the application logs for errors
- Verify database connection is working
- Ensure Prisma schema is up to date

**Issue 3: Port conflicts**
- Update `NEXT_PUBLIC_APP_URL` to match your actual port
- Update webhook URL in Clerk Dashboard if needed

### Debugging
1. Check the browser console for errors
2. Check the terminal logs for webhook processing
3. Check Clerk Dashboard webhook logs
4. Verify database records are created/updated

## 6. Production Deployment

For production deployment:
1. Update webhook URL to your production domain
2. Ensure HTTPS is used (required for webhooks)
3. Set `NODE_ENV=production`
4. Update `NEXT_PUBLIC_APP_URL` to production URL

Example production webhook URL:
```
https://your-domain.com/api/webhooks/clerk
```

## 7. Security Notes

- Never expose `CLERK_SECRET_KEY` or `CLERK_WEBHOOK_SECRET` to the browser
- Always use HTTPS for webhook endpoints in production
- The webhook handler verifies all incoming requests using Svix
- All sensitive operations are logged for audit purposes
