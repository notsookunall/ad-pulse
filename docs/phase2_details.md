# Phase 2 — Authentication Implementation Details

This document provides a detailed technical breakdown of the Authentication system implemented in Phase 2 of the AdPulse AI project. The previously hardcoded/mocked authentication flows have been entirely replaced with a production-ready Supabase Auth integration.

## 1. Global Authentication State (`AuthContext.tsx`)
We created a React Context provider (`src/context/AuthContext.tsx`) to manage the global authentication state across the entire application.

**Key Features:**
* **Session Management:** Utilizes `supabase.auth.getSession()` on initial load and listens to real-time session changes via `supabase.auth.onAuthStateChange()`.
* **Profile Synchronization:** When a user logs in, the context automatically queries the `profiles` table to fetch their role (`admin` or `client`) and full name.
* **Resiliency & Fallback:** If the `profiles` table fails to load (e.g., due to strict or broken RLS policies, like the "infinite recursion" issue we encountered), the context automatically falls back to pulling the user's name and role directly from the JWT user metadata (`user_metadata`), ensuring the app doesn't crash.
* **Exposed Methods:** Exposes the `useAuth()` hook, granting any component access to `signIn`, `signOut`, `signUp`, `user`, `profile`, and `loading` states.

## 2. Route Protection (`ProtectedRoute.tsx`)
We implemented a strict role-based access control (RBAC) component (`src/components/ProtectedRoute.tsx`) to secure private pages.

**Logic Flow:**
* **Loading State:** Displays a full-screen, branded, pulsating loading spinner while Supabase determines the session status.
* **Unauthenticated Guard:** If no user session exists, redirects the visitor immediately to `/login`.
* **Role Verification:** 
  * Checks the `requiredRole` prop against the user's actual role from their Supabase profile.
  * If an `'admin'` attempts to access client pages (`/dashboard`), they are bounced to `/admin`.
  * If a `'client'` attempts to access admin pages (`/admin`), they are bounced to `/dashboard`.

## 3. The Authentication UIs
### The Login Page (`Login.tsx`)
* **Supabase Integration:** Replaced the mock `if (email.includes('admin'))` logic with a real `signInWithPassword()` Supabase JS call.
* **UX Improvements:** Added an `isLoading` state that disables the inputs and shows a spinning loader inside the submit button during the network request.
* **Error Handling:** Added visual error states to display exact messages directly from the Supabase API (e.g., "Invalid login credentials").
* **Smart Redirects:** Upon successful authentication, dynamically routes to `/admin` or `/dashboard` based on the user's role.

### The Signup Page (`Signup.tsx` - NEW)
* **Design Consistency:** Created a brand new `/signup` page that perfectly mirrors the existing glassmorphism aesthetic (gradients, glowing icons, glass-cards).
* **Validation:** Enforces front-end validation (passwords must be 6+ chars and match the confirmation field).
* **Supabase Integration:** 
  1. Calls `supabase.auth.signUp()`, attaching the user's `full_name` to their user metadata.
  2. Automatically triggers a secondary upsert to insert a new row in the public `profiles` table, defaulting them to the `'client'` role.
* **Auto-Routing:** On success, immediately routes the new user into the main `/dashboard`.

## 4. Layout Updates & Routing Updates
### Dashboard Layout (`DashboardLayout.tsx`)
* **Dynamic Header Info:** Replaced the hardcoded 'Admin User' and 'Alex Johnson' names and emails in the top right header. It now dynamically reads `profile.full_name` and `profile.email` from the `useAuth()` hook.
* **Dynamic Avatars:** Implemented a new helper function `getInitials()` that intelligently extracts the first letter of the first and last name of the active user to display in the user avatar circle.
* **Real Logout:** The logout button in the sidebar now executes `signOut()` through the Context provider before clearing the UI state and navigating out.

### Application Router (`App.tsx`)
* **Context Wrapping:** Wrapped the entire React Router inside the `<AuthProvider>` to make session data ubiquitous.
* **Route Groups:** Applied `<ProtectedRoute>` wrappers around the specific route trees:
  * The `/dashboard/*` tree is strictly protected by `<ProtectedRoute requiredRole="client" />`.
  * The `/admin/*` tree is strictly protected by `<ProtectedRoute requiredRole="admin" />`.
* **New Route:** Added the new `/signup` component to the public routing array.

## Conclusion of Phase 2
The application forms a secure perimeter. The database user identity aligns completely with the frontend experience, providing a sturdy foundation for Phase 3 where user-specific campaigns and payments will be fetched based on these authentic Supabase sessions.
