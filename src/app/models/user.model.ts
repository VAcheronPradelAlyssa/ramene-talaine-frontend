export type AccountType = 'INDIVIDUAL' | 'PRO';

export interface User {
  id?: string;
  prenom: string;
  nom: string;
  email: string;
  password?: string;
  surnom: string;
  username?: string;
  ville?: string;
  bio?: string;
  avatarUrl?: string;
  accountType?: AccountType;
  role?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user: User;
}
