
## 3. Authentication and Authorization (NextAuth.js)

Authentication and authorization are managed using `NextAuth.js`, configured primarily in `/lib/auth.ts` and utilized through Next.js API routes at `/app/api/auth/[...nextauth]/route.ts`.

**Key Components:**

*   **`lib/auth.ts`:** This file defines the `authOptions` object, which is the core configuration for NextAuth.js.
    *   **Adapter:** Uses `MongooseAdapter` to persist session data in MongoDB.
    *   **Providers:**
        *   **`CredentialsProvider (id: 'credentials')`:** Handles standard user login with email and password. It authenticates against the `User` model.
            *   **`authorize` function:**
                *   Connects to the database.
                *   Validates email and password.
                *   Compares the provided password with the hashed password stored in the `User` model using `bcrypt.compare`.
                *   Returns a `User` object (or throws an error) containing `id`, `name`, `email`, `role`, and `isApprovedForAuction`.
        *   **`CredentialsProvider (id: 'team-credentials')`:** Handles login for internal team members with email and password, authenticating against the `TeamMember` model.
            *   **`authorize` function:** Similar to the user provider, but checks against the `TeamMember` model.
            *   Includes a check to ensure the team member has an elevated role (`UserRole.USER` or `UserRole.VIEWER` are unauthorized for admin access).
            *   Returns a `User` object with `isApprovedForAuction: false` as team members are not typical auction bidders.
    *   **Session Strategy:** Configured to use `jwt` strategy for session management.
    *   **Callbacks:**
        *   **`jwt({ token, user })`:** This callback is executed whenever a JSON Web Token is created or updated. It ensures that user-specific data (`id`, `role`, `name`, `email`, `isApprovedForAuction`) is persisted in the JWT.
        *   **`session({ session, token })`:** This callback ensures that the `session.user` object mirrors the data stored in the JWT, making it accessible on the client-side.
    *   **`secret`:** Uses `process.env.NEXTAUTH_SECRET` for JWT signing.
    *   **`pages.signIn`:** Redirects unauthenticated users to `/login`.

*   **`/app/types.ts`:** Defines shared TypeScript interfaces and enums for roles and user properties.
    *   **`UserRole` enum:** `TEAM_ADMIN`, `USER`, `EDITOR`, `VIEWER`.
    *   **`User` interface (augmented via `next-auth.d.ts`):** Includes `id`, `name`, `email`, `role`, `isApprovedForAuction`, and `watchlist`.
    *   **`TeamMember` interface:** Similar to `User`, but specifically for team members, including `_id`, `name`, `email`, `role`, `image`.

*   **`next-auth.d.ts`:** This declaration file augments NextAuth.js's default types to include custom properties (`role`, `isApprovedForAuction`, `watchlist`) in the `Session` and `JWT` objects, providing type safety across the application.

**How it Works:**

1.  A user attempts to log in via a form (e.g., on `/login` or `/team-login`).
2.  The form data is sent to the appropriate NextAuth credentials provider.
3.  The `authorize` function in `lib/auth.ts` verifies the credentials against the MongoDB database.
4.  If successful, a JWT is created, and the `jwt` callback populates it with user/team member details.
5.  The `session` callback then makes these details available in the `session` object on the client-side (`useSession()`) and server-side (`getServerSession()`).
6.  The `isApprovedForAuction` flag on the `User` object is crucial for controlling bidding access, while the `role` determines access to different parts of the admin dashboard.
