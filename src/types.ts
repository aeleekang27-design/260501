export interface Product {
  id: string;
  name: string;
  nameFontSize?: number;
  nameDeleted?: boolean;
  price: number;
  priceFontSize?: number;
  priceDeleted?: boolean;
  originalPrice?: number;
  discount?: string;
  description: string;
  descriptionFontSize?: number;
  descriptionDeleted?: boolean;
  image: string;
  category: string;
  subCategory?: string;
  origin?: string;
  weight?: string;
  shippingInfo?: string;
  storageInfo?: string;
  badges?: string[];
  isSoldOutSoon?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
