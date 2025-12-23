import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../models/User';
import TeamMember from '../models/TeamMember'; // Import TeamMember model
import dbConnect from './mongodb';
import bcrypt from 'bcryptjs';
import { MongooseAdapter } from 'next-auth-mongoose-adapter';
import { UserRole } from '../app/types'; // Import UserRole enum

export const authOptions: AuthOptions = {
  adapter: MongooseAdapter(process.env.MONGODB_URL!),
  providers: [
    CredentialsProvider({
      id: 'credentials', // Default customer login
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error('Invalid credentials');
        }

        // Return the user object, which will be available in the JWT callback
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isApprovedForAuction: user.isApprovedForAuction,
        };
      },
    }),
    CredentialsProvider({
        id: 'team-credentials', // Team member login
        name: 'Team Credentials',
        credentials: {
          email: { label: 'Email', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          await dbConnect();
  
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }
  
          const teamMember = await TeamMember.findOne({ email: credentials.email }).select('+password');
  
          if (!teamMember) {
            throw new Error('Invalid team credentials');
          }

          // Ensure the team member has an elevated role (e.g., TEAM_ADMIN, EDITOR)
          if (teamMember.role === UserRole.USER || teamMember.role === UserRole.VIEWER) {
            throw new Error('Unauthorized team role');
          }
  
          const isPasswordCorrect = await bcrypt.compare(credentials.password, teamMember.password);
  
          if (!isPasswordCorrect) {
            throw new Error('Invalid team credentials');
          }
  
          // Return the team member object
          return {
            id: teamMember._id.toString(),
            name: teamMember.name,
            email: teamMember.email,
            role: teamMember.role,
            isApprovedForAuction: false, // Team members are not typically approved for auction bidding
          };
        },
      }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // User is either a regular User or a TeamMember
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.isApprovedForAuction = user.isApprovedForAuction;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole; // Cast to UserRole
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isApprovedForAuction = token.isApprovedForAuction as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};
