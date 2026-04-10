export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  skinProfile?: {
    skinType?: string;
    concerns?: string[];
    lastAssessment?: string;
  };
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
  };
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface Assessment {
  _id: string;
  user: string;
  answers: Record<string, string>;
  results: {
    skinType: { type: string; score: number };
    conditions: Array<{ name: string; severity: string; description: string }>;
    hydrationLevel: number;
    sensitivityLevel: string;
    concerns: string[];
    overallScore: number;
  };
  recommendations?: Product[];
  routine?: {
    morning: RoutineStep[];
    evening: RoutineStep[];
  };
  status: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  ingredients: string[];
  skinTypes: string[];
  concerns: string[];
  price: number;
  priceRange: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  buyUrl?: string;
  dermatologistApproved: boolean;
  tags: string[];
}

export interface Routine {
  _id: string;
  name: string;
  description: string;
  morning: RoutineStep[];
  evening: RoutineStep[];
  isActive: boolean;
  createdAt: string;
}

export interface RoutineStep {
  step: number;
  productCategory: string;
  product?: Product;
  instruction: string;
  duration?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}
