export enum ListingType {
  SALE = 'SALE',
  EXCHANGE = 'EXCHANGE',
  FREE = 'FREE',
}

import type { User } from './user.model';

export type BrandRef = string | { id: number; name: string };

export interface Listing {
  id?: string;
  title: string;
  description: string;
  brand: BrandRef;
  composition: string;
  color: string;
  weight: string;
  length: string;
  type: ListingType;
  price?: number | null;
  city: string;
  postalCode: string;
  imageUrls: string[];
  createdAt?: Date;
  updatedAt?: Date;
  sellerName?: string;
  seller?: User;
  username?: string;
}
