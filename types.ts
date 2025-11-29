export interface RentalListing {
  id: string;
  contactName: string;
  contactPhone: string;
  location: string;
  price: string;
  details: string;
  images: string[]; // Base64 strings
  timestamp: number;
}

export interface AdminCredentials {
  user: string;
  pass: string;
}