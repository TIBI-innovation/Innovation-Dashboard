import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: string;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export const users: User[] = [
  {
    id: '1',
    username: 'maddie',
    passwordHash: '$2b$10$ua5Eyb4dpyl4lW7tRWFFGObFerKFEU.Osrxxefv1DktsH7yJ7pnKK',
    name: 'Maddie Rogers',
    role: 'admin',
  },
];

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(user: Omit<User, 'passwordHash'>): Promise<string> {
  return new SignJWT({
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}
