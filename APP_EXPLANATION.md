# Application and Authentication Architecture Overview

This document provides an overview of the Next.js application's structure and a detailed explanation of its authentication mechanism.

## 1. Application Overview

This is a modern, full-stack web application built with Next.js and the App Router. It serves as a platform with distinct user-facing and administrative sections.

### Key Features:
- **Dual Dashboards:** Separate, dedicated dashboard experiences for regular users (`/dashboard`) and administrators (`/admin`).
- **User Features:**
  - **Profile Management:** Users can manage their own profiles.
  - **Content Creation:** The application includes forms for creating what appears to be image or video content.
  - **Billing:** Users can manage their billing and subscription details.
- **Admin Features:**
  - **User Management:** Admins can view and manage all users.
  - **Content Monitoring:** Admins have oversight of user-generated "creations".
  - **System Settings:** Admins can configure application settings.

## 2. Authentication Architecture

The application uses a robust and secure authentication system powered by **`next-auth` (v4)**. This system is responsible for handling user sign-up, sign-in, session management, and authorization.

### Core Components:

#### a. Database and Schema (`prisma/schema.prisma`)
- **Database:** MongoDB is used as the database.
- **ORM:** Prisma acts as the Object-Relational Mapper, providing a typesafe way to interact with the database.
- **`User` Model:** The central `User` model in the schema defines the user's structure. Key authentication-related fields include:
    - `role`: A `String` that defaults to `"USER"`. This is critical for authorization.
    - `password`: A `String` to store the hashed password for users who sign up with credentials.
    - `profileComplete`: A `Boolean` flag to track if a user has completed the initial profile setup.

#### b. Authentication Providers (`app/api/auth/[...nextauth]/route.ts`)
The application supports two methods for authentication:
1.  **Google (OAuth):** Allows for secure, one-click sign-in via a user's Google account. It is configured with `allowDangerousEmailAccountLinking: true`, which links a Google sign-in to an existing email/password account if the emails match.
2.  **Credentials:** A traditional email and password system.
    - The `authorize` function validates user credentials by:
        1.  Finding the user in the database by their email.
        2.  Comparing the provided password against the stored hash using `bcrypt`.

#### c. Session Management (JWT Strategy)
- **Strategy:** The session strategy is set to `'jwt'` (JSON Web Tokens). This means user session data is stored in a secure, stateless token, not in the database.
- **Callbacks for Token Enrichment:**
    1.  `jwt` **callback:** After a user successfully signs in, this callback is triggered. It takes the `user` object from the database and adds important properties like `id`, `role`, and `profileComplete` into the JWT.
    2.  `session` **callback:** This callback receives the JWT and passes its properties (including the custom ones) to the client-side `session` object. This makes the user's ID and role available throughout the frontend for rendering UI components conditionally.

#### d. Route Protection and Authorization (`proxy.ts`)
This is the application's security gatekeeper for protected routes.
- **Technology:** It uses Next.js Proxy (formerly Middleware), specifically the `withAuth` higher-order function from `next-auth/middleware`.
- **Protected Routes:** The `matcher` configuration ensures this logic runs for any path under `/dashboard/*` and `/admin/*`.
- **Authorization Logic:**
    1.  It first ensures a user is authenticated (has a valid token).
    2.  It then inspects the `role` from the token (`req.nextauth.token.role`).
    3.  It enforces role-based access by redirecting users:
        - If an `TEAM_ADMIN` user tries to access the standard user dashboard (`/dashboard`), they are automatically redirected to the admin dashboard (`/admin/dashboard`).
        - If a non-admin `USER` attempts to access any admin route (`/admin`), they are sent back to their personal dashboard (`/dashboard`).

This layered approach ensures that authentication is securely handled and authorization rules are enforced at the network edge, before any page or API route is rendered.
