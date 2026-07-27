import { Money } from './money';

export type ProductFreshnessGrade = 'ambient' | 'chilled' | 'frozen' | 'fresh';

export interface SupplierSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  rating: number | null;
}

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  supplier: SupplierSummary;
  category: CategorySummary;
  price: Money;
  priceCents: number;
  stockQuantity: number;
  inStock: boolean;
  freshnessGrade: ProductFreshnessGrade;
  tags: string[];
  allergens: string[];
  deliveryRegions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
