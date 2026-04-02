export enum ListingType {
  SALE = 'SALE',
  EXCHANGE = 'EXCHANGE',
  FREE = 'FREE',
}

export interface Listing {
  id?: string;
  title: string;
  description: string;
  brand: string;
  composition: string;
  color: string;
  weight: string;
  length: string;
  type: ListingType;
  price?: number;
  city: string;
  postalCode: string;
  imageUrls: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
