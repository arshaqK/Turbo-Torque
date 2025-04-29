export interface UserType {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export interface BrandType {
  _id: string;
  name: string;
  email: string;
  logo: string;
  isVerified: string;
  cars: string;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoading: boolean;
}

export interface EmailType {
  userEmail: string;
}

export interface NewCarVariantType {
  name: string;
  price: number;
  image: string;
  reviews: Array<{ rating: number; comment: string }>;
  transmission: "automatic" | "manual";
  engine: string;
  mileage: number;
  colors: Array<{ name: string; hex: string }>;
  deliveryTime: number; // In days
}

export interface NewCarType {
  name: string;
  variants: Array<NewCarVariantType>;
}

export interface targetItemType {
  id: string;
  type: string;
}
