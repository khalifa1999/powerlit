# Supabase Auth Integration Setup Guide

## Overview
Your PowerLit app now uses Supabase for authentication! This allows users to:
- Sign up and sign in with email/password
- Save analyses to the cloud (associated with their account)
- Access their analyses from any device

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Set a project name (e.g., "powerlit-auth")
5. Set a secure database password (save this somewhere safe)
6. Choose a region close to your users
7. Click "Create new project"

### 2. Get Your API Keys

Once your project is created:

1. Go to Project Settings → API
2. Copy these values:
   - **URL**: `https://your-project.supabase.co`
   - **anon/public key**: starts with `eyJ...`

### 3. Configure Environment Variables

Edit your `.env` file and replace the placeholder values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

⚠️ **Important**: Never commit your actual `.env` file to git!

### 4. Set Up the Database

1. In the Supabase dashboard, go to the **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase_schema.sql` from this project
4. Click "Run"

This creates:
- The `analyses` table
- Row Level Security (RLS) policies to protect user data
- Indexes for performance

### 5. Test the Integration

1. Run your app locally:
   ```bash
   npm run dev
   ```

2. Navigate to `/analyze`

3. Try these flows:
   - **Anonymous user**: Can upload and analyze blueprints (but analyses aren't saved)
   - **Sign up**: Create an account with email/password
   - **Sign in**: Log in to see saved analyses
   - **Save analysis**: After analysis completes (if authenticated, it's auto-saved)
   - **View dashboard**: Access `/dashboard` to see all saved analyses

## Features Implemented

### Authentication
✅ Email/password sign up
✅ Email/password sign in  
✅ Sign out
✅ Session persistence (refreshes automatically)
✅ Auth state syncs across browser tabs

### Data Storage
✅ Analyses saved to Supabase database
✅ Each user's data is isolated (RLS policies)
✅ Analyses fetched on login
✅ Delete analysis functionality

### UI Updates
✅ Dashboard protected (shows login message if not authenticated)
✅ Header shows user email when logged in
✅ Login modal handles errors properly
✅ Sidebar logout button works

## Email Confirmation

By default, Supabase requires email confirmation. If you want to disable this for testing:

1. Go to Authentication → Providers → Email
2. Toggle off "Confirm email"
3. Save

For production, you should keep this enabled and implement email confirmation flows.

## Password Reset (Future Enhancement)

To implement password reset:

1. Add a "Forgot Password" link to the login modal
2. Use `supabase.auth.resetPasswordForEmail(email)`
3. Create a password reset callback page
4. Handle the `SIGNED_IN` event with type "recovery" in your auth state listener

## Troubleshooting

### "Cannot find module" errors
These are usually false positives from the LSP. The TypeScript build passes successfully.

### CORS errors
Make sure your Supabase project URL is correct in `.env`

### "User not authenticated" errors
- Check that the user is actually logged in (check browser DevTools → Application → Local Storage)
- Verify the RLS policies are set up correctly in Supabase

### Analyses not saving
- Check browser console for Supabase errors
- Verify database schema is created correctly
- Ensure `user_id` is being passed correctly

## Security Notes

1. **Never expose the service role key** in your frontend - only use the anon key
2. **RLS policies are active** - users can only access their own data
3. **HTTPS only** - Supabase enforces HTTPS in production
4. **Session management** - Tokens auto-refresh, sessions persist across page reloads

## Next Steps / Enhancements

- [ ] Add "Forgot Password" flow
- [ ] Add social auth (Google, GitHub)
- [ ] Add email confirmation resend functionality
- [ ] Implement rate limiting for analyses
- [ ] Add user profile management (update email, change password)
- [ ] Add loading states during auth operations
- [ ] Handle offline mode gracefully

## Files Changed

- `src/lib/supabase.ts` - New Supabase client
- `src/types/database.ts` - Database type definitions
- `src/stores/authStore.ts` - Complete rewrite for Supabase auth
- `src/components/Auth/LoginModal.tsx` - Updated to use Supabase methods
- `src/components/Layout/Header.tsx` - Updated logout button
- `src/components/Layout/Sidebar.tsx` - Updated logout button
- `src/pages/DashboardPage.tsx` - Added auth check, updated data structure
- `src/pages/AnalyzePage.tsx` - Updated to use saveAnalysis
- `src/App.tsx` - Added auth initialization
- `.env` - Added Supabase config variables
- `supabase_schema.sql` - Database schema setup

## Support

If you run into issues:
1. Check the browser console for errors
2. Verify your Supabase project is active
3. Check that environment variables are set correctly
4. Ensure the database schema is applied
