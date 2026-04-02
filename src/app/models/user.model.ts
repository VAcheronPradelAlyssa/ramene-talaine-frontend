export interface User {
  id?: string;
  prenom: string;
  nom: string;
  email: string;
  password: string;
  surnom: string;
  ville?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}
