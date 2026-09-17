export interface MenuItem {
  id: string;
  category: string;
  name: string;
  nameEn?: string;
  unit: string;
  price: number;
  priceScales?: string;
  description: string;
  tags: string[];
  available: boolean;
  order: number;
  updatedAt: string;
  imageUrl?: string;
  isChefSpecial?: boolean;
  isSushimanSpecial?: boolean; // Insignia exclusiva: Sugerencia del Sushiman
  pairing?: string; // Sugerencia de maridaje (Vinos, Cervezas, Cócteles, etc.)
  allergens?: string[]; // Gluten, Lácteos, Mariscos, Frutos Secos, Sésamo, etc.
}

export interface RestaurantConfig {
  name: string;
  tagline: string;
  slogan: string;
  yearsBadge: string;
  address: string;
  phone: string;
  instagram: string;
  website: string;
  schedule: string;
  currencySymbol: string;
  wifiNetwork?: string;
  wifiPassword?: string;
  promoText?: string;
  activePromoDiscount?: string;
  qrTableNumber?: string;
  customCategories?: string[];
  customTags?: string[];
  ambienceImageUrl?: string;
  showAmbienceHero?: boolean;
  ambienceTitle?: string;
  ambienceDescription?: string;
  backgroundPattern?: 'aletas' | 'koi' | 'aletas-verde' | 'none';
  backgroundPatternOpacity?: number;
  adminPin?: string;
  googleReviewUrl?: string; // Enlace directo a reseñas de Google Maps de Suteki Bella Vista
  heroVideoUrl?: string;
  showHeroVideo?: boolean;
}

export interface OrderItem {
  dishId: string;
  dish: MenuItem;
  item?: MenuItem; // Para compatibilidad retroactiva con pedidos almacenados
  quantity: number;
  note?: string;
}

export interface DietaryFilterState {
  onlyGlutenFree: boolean;
  onlyVeggie: boolean;
  onlyVegan: boolean;
  excludeSeafood: boolean;
  excludeDairy: boolean;
  onlySushimanSpecial: boolean;
  onlySpicy: boolean;
  onlyPairing: boolean;
}

export interface MenuFilterState {
  searchQuery: string;
  selectedCategory: string;
  tagFilter: string | null;
  onlyAvailable: boolean;
  sortBy: 'order' | 'name' | 'price-asc' | 'price-desc';
}

export type AppViewMode = 'customer' | 'admin' | 'qr-studio';
