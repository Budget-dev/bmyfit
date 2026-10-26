export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  avatarUrl?: string;
  provider: "google" | "password" | "anonymous" | "demo";
  createdAt: string;
  updatedAt?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
}

export interface SigninData {
  email: string;
  password: string;
}
