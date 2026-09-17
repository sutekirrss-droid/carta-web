import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, RestaurantConfig, OrderItem, DietaryFilterState } from '../types';
import { MENU_CATEGORIES } from '../data/initialMenu';
import { formatPrice, getTagStyle } from '../lib/formatters';
import { getOptimizedImageProps, preloadImages } from '../lib/imageOptimization';
import { KoiIllustration } from './KoiIllustration';
import { LazyImage } from './LazyImage';
import { OrderSimulatorModal } from './OrderSimulatorModal';
import { AdvancedFilterModal } from './AdvancedFilterModal';
import { GoogleReviewCard } from './GoogleReviewCard';
import { FloatingOrderBar } from './FloatingOrderBar';
import { AddToCartNotification, ToastFeedback } from './AddToCartNotification';
import {
  SutekiLogo,
  SutekiHankoSeal,
  SutekiKoiPattern,
  SutekiBackgroundLayer,
  SutekiBrandIllustration,
  SUTEKI_BACKGROUND_TEXTURES,
  ChopstickWrapperGraphic,
} from './SutekiBrandAssets';
import {
  Search,
  Flame,
  Leaf,
  Users,
  Star,
  Wifi,
  Copy,
  Check,
  MapPin,
  Clock,
  Phone,
  X,
  Eye,
  Info,
  Sparkles,
  Sun,
  Moon,
  Wine,
  Camera,
  Palette,
  Layers,
  Lock,
  Calculator,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  Minus,
  MessageSquareHeart,
  Zap,
  LayoutList,
  LayoutGrid,
  ChefHat,
  Award,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';

const CATEGORY_EDITORIAL_INFO: Record<string, { kanji: string; sub: string }> = {
  'Entradas': { kanji: '前菜', sub: 'Aperitivos & Bites Nikkei' },
  'Piezas & Tiraditos': { kanji: '刺身', sub: 'Cortes Frescos & Sashimi Nikkei' },
  'Sushi Rolls': { kanji: '巻き寿司', sub: 'Rolls de Autor & Clásicos' },
  'Rolls Veggie': { kanji: '野菜', sub: 'Selección Vegetal & Fresca' },
  'Calentitos': { kanji: '温物', sub: 'Tempuras, Gyozas & Wok' },
  'Salads': { kanji: 'サラダ', sub: 'Bowls Frescos & Aderezos de la Casa' },
  'Platos Principales': { kanji: '主菜', sub: 'Especialidades Nikkei del Chef' },
  'Ramen': { kanji: '拉麺', sub: 'Caldos Artesanales & Fideos' },
  'Postres': { kanji: '甘味', sub: 'Finales Dulces Japoneses' },
  'Salsas & Extras': { kanji: '調味料', sub: 'Wasabi, Jengibre & Salsas Caseras' },
};

interface CustomerMenuProps {
  items: MenuItem[];
  config: RestaurantConfig;
  tableNumber?: string;
  onOpenAdmin: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  items,
  config,
  tableNumber: propTableNumber,
  onOpenAdmin,
  isDark,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedDishModal, setSelectedDishModal] = useState<MenuItem | null>(null);
  const [wifiCopied, setWifiCopied] = useState(false);
  const [isAmbienceModalOpen, setIsAmbienceModalOpen] = useState(false);
  const menuNavRef = useRef<HTMLElement>(null);

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);

    // Ensure category header and dishes are positioned clearly below the sticky search bar
    setTimeout(() => {
      if (cat === 'Todos') {
        if (menuNavRef.current) {
          const navRect = menuNavRef.current.getBoundingClientRect();
          const targetY = window.scrollY + navRect.bottom - 10;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      } else {
        const sectionId = `categoria-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const sectionEl = document.getElementById(sectionId);
        if (sectionEl) {
          sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (menuNavRef.current) {
          const navRect = menuNavRef.current.getBoundingClientRect();
          const targetY = window.scrollY + navRect.bottom - 10;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }
    }, 50);
  };

  const handleTagToggle = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));

    // If user is scrolled far down, scroll up to dishes so results are immediately visible
    if (menuNavRef.current) {
      const navRect = menuNavRef.current.getBoundingClientRect();
      if (navRect.top <= 100 && window.scrollY > 350) {
        const targetY = window.scrollY + navRect.bottom - 10;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  };

  // Authentic Suteki Background Texture state from Google Drive resources
  const [activePattern, setActivePattern] = useState<'aletas' | 'koi' | 'aletas-verde' | 'none'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('suteki_bg_pattern');
      if (saved && ['aletas', 'koi', 'aletas-verde', 'none'].includes(saved)) {
        return saved as 'aletas' | 'koi' | 'aletas-verde' | 'none';
      }
    }
    return config.backgroundPattern || 'aletas';
  });
  const [isPatternPickerOpen, setIsPatternPickerOpen] = useState(false);

  // Order Simulator & Bill Splitting State
  const [isOrderSimulatorOpen, setIsOrderSimulatorOpen] = useState(false);
  const [cartToast, setCartToast] = useState<ToastFeedback | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('suteki_order_simulator');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed
              .map((raw: any): OrderItem | null => {
                const dish = raw.dish || raw.item;
                if (!dish || typeof dish.price !== 'number') return null;
                return {
                  dishId: raw.dishId || dish.id,
                  dish: dish,
                  item: dish,
                  quantity: typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : 1,
                  note: raw.note || '',
                };
              })
              .filter((i): i is OrderItem => i !== null);
          }
        }
      } catch (e) {
        console.error('Error loading saved order simulator:', e);
      }
    }
    return [];
  });

  const handleAddToOrder = (dish: MenuItem) => {
    if (!dish || typeof dish.price !== 'number') return;
    setCartToast({ id: Date.now(), name: dish.name, count: 1 });
    setTimeout(() => {
      setCartToast((curr) => (curr && curr.name === dish.name ? null : curr));
    }, 2200);

    setOrderItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => (i.dishId || i.dish?.id || (i as any).item?.id) === dish.id
      );
      let updated: OrderItem[];
      if (existingIndex >= 0) {
        updated = prev.map((i, idx) =>
          idx === existingIndex
            ? { ...i, dish, item: dish, quantity: i.quantity + 1 }
            : i
        );
      } else {
        const newItem: OrderItem = {
          dishId: dish.id,
          dish: dish,
          item: dish,
          quantity: 1,
        };
        updated = [...prev, newItem];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('suteki_order_simulator', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleUpdateOrderQuantity = (dishId: string, delta: number) => {
    if (delta > 0) {
      const dishObj = items.find((i) => i.id === dishId);
      if (dishObj) {
        setCartToast({ id: Date.now(), name: dishObj.name, count: 1 });
        setTimeout(() => {
          setCartToast((curr) => (curr && curr.name === dishObj.name ? null : curr));
        }, 2200);
      }
    }

    setOrderItems((prev) => {
      const updated = prev
        .map((i) => {
          const id = i.dishId || i.dish?.id || (i as any).item?.id;
          if (id === dishId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter((i): i is OrderItem => i !== null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('suteki_order_simulator', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleRemoveFromOrder = (dishId: string) => {
    setOrderItems((prev) => {
      const updated = prev.filter((i) => {
        const id = i.dishId || i.dish?.id || (i as any).item?.id;
        return id !== dishId;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('suteki_order_simulator', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('suteki_order_simulator');
    }
  };

  const handleUpdateOrderNote = (dishId: string, note: string) => {
    setOrderItems((prev) => {
      const updated = prev.map((i) => {
        const id = i.dishId || i.dish?.id || (i as any).item?.id;
        return id === dishId ? { ...i, note } : i;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('suteki_order_simulator', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const [tableNumber, setTableNumber] = useState<string>(() => {
    if (propTableNumber) return propTableNumber;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('suteki_table_number') || '';
    }
    return '';
  });

  const handleTableNumberChange = (val: string) => {
    setTableNumber(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('suteki_table_number', val);
    }
  };

  // Advanced Dietary & Chef Filters
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilterState>({
    glutenFree: false,
    vegetarian: false,
    vegan: false,
    lactoseFree: false,
    sushimanSpecial: false,
    chefSpecial: false,
  });

  const activeDietaryCount = useMemo(() => {
    return Object.values(dietaryFilters).filter(Boolean).length;
  }, [dietaryFilters]);

  // Mobile fast-browse / compact card mode (default true for smaller mobile cards)
  const [isCompactMobile, setIsCompactMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('suteki_mobile_compact');
      if (saved !== null) return saved === 'true';
    }
    return true; // Default compact for faster, smoother mobile browsing
  });

  const toggleCompactMobile = () => {
    setIsCompactMobile((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('suteki_mobile_compact', String(next));
      }
      return next;
    });
  };

  const handlePatternChange = (pat: 'aletas' | 'koi' | 'aletas-verde' | 'none') => {
    setActivePattern(pat);
    if (typeof window !== 'undefined') {
      localStorage.setItem('suteki_bg_pattern', pat);
    }
    setIsPatternPickerOpen(false);
  };

  const cyclePattern = () => {
    const sequence: Array<'aletas' | 'koi' | 'aletas-verde' | 'none'> = ['aletas', 'koi', 'aletas-verde', 'none'];
    const nextIdx = (sequence.indexOf(activePattern) + 1) % sequence.length;
    handlePatternChange(sequence[nextIdx]);
  };

  // Group items by category (merging base, custom, and item categories)
  const categoriesList = useMemo(() => {
    const all = Array.from(
      new Set([
        ...MENU_CATEGORIES,
        ...(config.customCategories || []),
        ...items.map((i) => i.category).filter(Boolean),
      ])
    );
    return all.filter((cat) => items.some((i) => i.category === cat));
  }, [items, config.customCategories]);

  // Check if any items have pairing info
  const hasPairingItems = useMemo(() => {
    return items.some((i) => Boolean(i.pairing && i.pairing.trim()));
  }, [items]);

  // Additional custom tags
  const extraTags = useMemo(() => {
    return (config.customTags || []).filter((t) =>
      items.some((i) => i.tags?.includes(t))
    );
  }, [items, config.customTags]);

  // Price sorting: default (official menu order), asc (menor a mayor), desc (mayor a menor)
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');

  const handleTogglePriceSort = () => {
    setPriceSort((prev) => {
      if (prev === 'default') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'default';
    });
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    const list = items.filter((item) => {
      // Category filter
      if (activeCategory !== 'Todos' && item.category !== activeCategory) {
        return false;
      }
      // Tag filter
      if (activeTag) {
        if (activeTag === 'Favorito') {
          if (!item.tags.includes('Favorito') && !item.isChefSpecial) return false;
        } else if (activeTag === 'Maridaje') {
          if (!item.pairing || !item.pairing.trim()) return false;
        } else if (!item.tags.includes(activeTag)) {
          return false;
        }
      }
      // Dietary and Sushiman special filters
      if (dietaryFilters.glutenFree) {
        const isGlutenFree = item.tags.some(
          (t) =>
            t.toLowerCase().includes('tacc') ||
            t.toLowerCase().includes('celiac') ||
            t.toLowerCase().includes('gluten')
        );
        if (!isGlutenFree) return false;
      }
      if (dietaryFilters.vegetarian) {
        const isVeggie =
          item.tags.some(
            (t) =>
              t.toLowerCase().includes('veggie') ||
              t.toLowerCase().includes('vegetar')
          ) || item.category === 'Rolls Veggie';
        if (!isVeggie) return false;
      }
      if (dietaryFilters.vegan) {
        const isVegan = item.tags.some((t) => t.toLowerCase().includes('vegan'));
        if (!isVegan) return false;
      }
      if (dietaryFilters.lactoseFree) {
        const isLactoseFree = item.tags.some(
          (t) =>
            t.toLowerCase().includes('lactosa') ||
            t.toLowerCase().includes('sin lactosa')
        );
        if (!isLactoseFree) return false;
      }
      if (dietaryFilters.sushimanSpecial && !item.isSushimanSpecial) {
        return false;
      }
      if (dietaryFilters.chefSpecial && !item.isChefSpecial) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesPairing = item.pairing?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesPairing) return false;
      }
      return true;
    });

    if (priceSort === 'asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (priceSort === 'desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [items, activeCategory, activeTag, searchQuery, dietaryFilters, priceSort]);

  // Preload visible and priority thumbnails into browser cache for instant display
  useEffect(() => {
    const toPreload = filteredItems.slice(0, 14).map((item) => item.imageUrl);
    preloadImages(toPreload);
  }, [filteredItems]);

  useEffect(() => {
    const priorityItems = items
      .filter((i) => i.isChefSpecial || i.tags?.includes('Favorito'))
      .slice(0, 20)
      .map((i) => i.imageUrl);
    preloadImages(priorityItems);
  }, [items]);

  const handleCopyWifi = () => {
    if (config.wifiPassword) {
      navigator.clipboard.writeText(config.wifiPassword);
      setWifiCopied(true);
      setTimeout(() => setWifiCopied(false), 2200);
    }
  };

  return (
    <div
      className={`min-h-screen ${orderItems.length > 0 ? 'pb-32 sm:pb-36' : 'pb-20'} transition-colors duration-200 relative ${
        isDark ? 'bg-[#151514] text-[#F6EFE4]' : 'bg-[#F6EFE4] text-[#3C3C3B]'
      }`}
    >
      {/* Authentic Suteki Background Texture Layer from Google Drive Brand Assets */}
      <SutekiBackgroundLayer
        pattern={activePattern}
        opacity={config.backgroundPatternOpacity ?? 0.22}
        isDark={isDark}
      />

      {/* Restaurant Hero Banner */}
      <header
        className={`relative px-4 pt-8 pb-10 overflow-hidden shadow-sm transition-colors ${
          isDark
            ? 'bg-[#180A0A] text-[#F6EFE4]'
            : 'bg-[#992626] text-[#F6EFE4]'
        }`}
      >
        {/* Ambience Background Photo if configured */}
        {config.ambienceImageUrl && config.showAmbienceHero !== false && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={config.ambienceImageUrl}
              alt="Ambiente Suteki"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.48] contrast-110 saturate-110 transform scale-105 transition-all duration-700"
            />
            <div
              className={`absolute inset-0 ${
                isDark
                  ? 'bg-gradient-to-b from-[#2A0C0C]/85 via-[#180A0A]/85 to-[#151514]'
                  : 'bg-gradient-to-b from-[#B03A3A]/80 via-[#992626]/85 to-[#6B1818]/95'
              }`}
            />
          </div>
        )}

        {/* Japanese Koi / Aletas Pattern Overlay using Drive brand assets */}
        <SutekiKoiPattern
          opacity={isDark ? 0.32 : 0.42}
          patternType={activePattern !== 'none' ? activePattern : 'aletas'}
          blendMode={isDark ? 'screen' : 'overlay'}
        />

        {/* Japanese Hanko Seal floating in corner */}
        <div className="absolute top-4 right-4 z-20 hidden sm:block pointer-events-none select-none">
          <SutekiHankoSeal size="md" color="#F6EFE4" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Top Stamp & Mode indicator */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-mono tracking-widest uppercase text-white backdrop-blur-xs">
              <span>林 • 10年 de Identidad</span>
              {tableNumber && (
                <span className="bg-[#F6EFE4] text-[#DC5D5D] px-2 py-0.5 rounded-full font-bold">
                  {tableNumber.toUpperCase()}
                </span>
              )}
            </div>

            {/* Pattern / Trama Switcher Pill (Google Drive Brand Assets) */}
            <div className="relative inline-block">
              <button
                onClick={() => setIsPatternPickerOpen(!isPatternPickerOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-mono transition-all text-white border border-white/30 backdrop-blur-xs"
                title="Cambiar patrón de fondo oficial de Suteki (Aletas / Koi / Verde / Liso)"
              >
                <Layers className="w-3.5 h-3.5 text-amber-200" />
                <span>
                  Fondo: {activePattern === 'aletas' ? 'Aletas' : activePattern === 'koi' ? 'Koi' : activePattern === 'aletas-verde' ? 'Jade Verde' : 'Washi Liso'}
                </span>
              </button>

              {isPatternPickerOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1B] text-[#F6EFE4] border border-[#444442] rounded-2xl shadow-xl p-2 w-64 space-y-1 text-left">
                  <div className="px-2 py-1 text-[10px] font-mono tracking-widest text-[#DC5D5D] uppercase font-bold border-b border-[#333331] flex items-center justify-between">
                    <span>Tramas Oficiales Suteki</span>
                    <span className="text-[9px] text-[#F6EFE4]/60">Google Drive</span>
                  </div>
                  <button
                    onClick={() => handlePatternChange('aletas')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors ${
                      activePattern === 'aletas' ? 'bg-[#DC5D5D] text-white' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Trama Aletas</span>
                    </span>
                    <span className="text-[10px] opacity-70">Washi Oficial</span>
                  </button>
                  <button
                    onClick={() => handlePatternChange('koi')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors ${
                      activePattern === 'koi' ? 'bg-[#DC5D5D] text-white' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Trama Koi</span>
                    </span>
                    <span className="text-[10px] opacity-70">Peces en Washi</span>
                  </button>
                  <button
                    onClick={() => handlePatternChange('aletas-verde')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors ${
                      activePattern === 'aletas-verde' ? 'bg-[#DC5D5D] text-white' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Trama Jade Nikkei</span>
                    </span>
                    <span className="text-[10px] opacity-70">Verde Matcha</span>
                  </button>
                  <button
                    onClick={() => handlePatternChange('none')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors ${
                      activePattern === 'none' ? 'bg-[#DC5D5D] text-white' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Washi Liso</span>
                    </span>
                    <span className="text-[10px] opacity-70">Sin textura</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick night/day pill in header */}
            <button
              onClick={onToggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 hover:bg-black/40 text-[11px] font-mono transition-all text-white border border-white/20"
              title={isDark ? 'Cambiar a modo diurno' : 'Cambiar a modo noche para poca luz'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
                  <span>Modo Noche</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-200" strokeWidth={1.5} />
                  <span>Ambiente Tenue</span>
                </>
              )}
            </button>

            {/* Ambience & Salon Quick Pill */}
            {config.ambienceImageUrl && (
              <button
                onClick={() => setIsAmbienceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-mono transition-all text-amber-100 border border-amber-300/30 backdrop-blur-xs"
                title="Conocé nuestro mural, barra y ambiente"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
                <span>Salón & Barra</span>
              </button>
            )}
          </div>

          {/* Authentic Brand Lockup: Leaping Koi + Suteki + 林 • 10年 + Tagline */}
          <div className="my-2">
            <SutekiLogo
              variant="with-koi"
              colorMode="white"
              showTagline={true}
              className="transform hover:scale-[1.01] transition-transform"
            />
          </div>

          <p className="text-xs font-cubano text-white/80 tracking-wider uppercase mt-2">
            — {config.slogan} —
          </p>

          {/* Explanatory banner: Live Prices & In-person waiter order guide */}
          <div className="mt-3.5 max-w-xl mx-auto px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-mono text-center shadow-lg space-y-1">
            <div className="flex items-center justify-center gap-2 font-bold text-amber-300">
              <Eye className="w-3.5 h-3.5" />
              <span>Carta Digital Oficial • Precios y Detalle Completo</span>
            </div>
            <p className="text-[11px] text-white/90 leading-snug">
              El menú físico de la mesa no contiene precios. Acá tenés los valores oficiales, fotos e ingredientes para armar tu selección. <strong>Tu mozo tomará el pedido en tu mesa.</strong>
            </p>
          </div>

          {/* Daily Promo Callout Banner */}
          {config.promoText && (
            <div
              className={`mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-2xl shadow-sm border max-w-lg mx-auto ${
                isDark
                  ? 'bg-[#222221] text-[#F6EFE4] border-[#444442]'
                  : 'bg-[#F6EFE4] text-[#3C3C3B] border-white/40'
              }`}
            >
              {config.activePromoDiscount && (
                <span className="bg-[#DC5D5D] text-white font-cubano text-xs px-2.5 py-1 rounded-xl shrink-0">
                  {config.activePromoDiscount}
                </span>
              )}
              <span className="text-xs font-mono font-medium text-left truncate">
                {config.promoText}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Sticky Search and Category Navigation Bar */}
      <nav
        ref={menuNavRef}
        className={`sticky top-14 sm:top-16 z-30 backdrop-blur-md border-b shadow-xs py-2 px-3 sm:px-4 transition-colors ${
          isDark
            ? 'bg-[#181817]/95 border-[#2E2E2D]'
            : 'bg-[#F6EFE4]/95 border-[#B0AF9F]/30'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Row 1: Search bar (Full-width dedicated row: zero overlap with Veggie or filter pills) */}
          <div className="relative w-full">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-[#F6EFE4]/40' : 'text-[#3C3C3B]/50'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por plato, ingrediente, sabor..."
              className={`w-full pl-9 pr-9 py-2 text-xs rounded-2xl border focus:outline-none focus:border-[#DC5D5D] shadow-2xs transition-colors ${
                isDark
                  ? 'bg-[#242423] text-[#F6EFE4] border-[#383836] placeholder-[#F6EFE4]/40'
                  : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/40 placeholder-[#3C3C3B]/50'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs hover:text-[#DC5D5D] transition-colors ${
                  isDark ? 'text-[#F6EFE4]/50' : 'text-[#3C3C3B]/50'
                }`}
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Row 2: Quick Filter Pills (Dedicated horizontal scroller - Veggie is never covered) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 w-full">
            <button
              onClick={() => handleTagToggle('Veggie')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                activeTag === 'Veggie'
                  ? 'bg-[#93C2BC] text-white border-[#93C2BC] shadow-xs ring-2 ring-[#93C2BC]/20'
                  : isDark
                  ? 'bg-[#242423] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-white/80'
              }`}
            >
              <Leaf className="w-3 h-3 text-[#93C2BC]" strokeWidth={1.5} /> Veggie
            </button>

            <button
              onClick={() => handleTagToggle('Picante')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                activeTag === 'Picante'
                  ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] shadow-xs'
                  : isDark
                  ? 'bg-[#242423] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-white/80'
              }`}
            >
              <Flame className="w-3 h-3" strokeWidth={1.5} /> Picante
            </button>

            <button
              onClick={() => handleTagToggle('Favorito')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                activeTag === 'Favorito'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : isDark
                  ? 'bg-[#242423] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-white/80'
              }`}
            >
              <Star className="w-3 h-3" strokeWidth={1.5} /> Favoritos
            </button>

            {/* Sushiman Recommendation Quick Filter Pill */}
            <button
              onClick={() =>
                setDietaryFilters((prev) => ({
                  ...prev,
                  sushimanSpecial: !prev.sushimanSpecial,
                }))
              }
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                dietaryFilters.sushimanSpecial
                  ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] shadow-xs ring-2 ring-[#DC5D5D]/20'
                  : isDark
                  ? 'bg-[#2A1E20] text-[#F39C9D] border-[#5A2B32] hover:bg-[#341F23]'
                  : 'bg-rose-50 text-[#DC5D5D] border-[#DC5D5D]/30 hover:bg-rose-100'
              }`}
              title="Ver platos con recomendación especial del Sushiman"
            >
              <ChefHat className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Sushiman</span>
            </button>

            {/* Advanced Dietary Filter Button */}
            <button
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                activeDietaryCount > 0
                  ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] shadow-xs'
                  : isDark
                  ? 'bg-[#242423] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-white/80'
              }`}
              title="Abrir filtros dietarios y alérgenos (Sin TACC, Veggie, Vegano, etc.)"
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-300" strokeWidth={1.5} />
              <span>Filtros {activeDietaryCount > 0 ? `(${activeDietaryCount})` : ''}</span>
            </button>

            {/* Table Order & Bill Splitting Button */}
            <button
              onClick={() => setIsOrderSimulatorOpen(true)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                orderItems.length > 0
                  ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] shadow-sm'
                  : isDark
                  ? 'bg-[#242423] text-amber-300 border-amber-400/40 hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#DC5D5D] border-[#DC5D5D]/30 hover:bg-rose-50'
              }`}
              title="Ver tus platos elegidos para dictarle al mozo y cálculo de cuenta"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
              <span>Mis Platos {orderItems.length > 0 ? `(${orderItems.reduce((acc, i) => acc + (i.quantity || 0), 0)})` : ''}</span>
            </button>

            {/* Price Sort Toggle Button */}
            <button
              onClick={handleTogglePriceSort}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                priceSort !== 'default'
                  ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] shadow-xs ring-2 ring-[#DC5D5D]/20'
                  : isDark
                  ? 'bg-[#242423] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-white/80'
              }`}
              title="Ordenar platos por precio (el menú físico no contiene precios)"
            >
              <ArrowUpDown className="w-3 h-3 text-amber-300" strokeWidth={1.5} />
              <span>
                {priceSort === 'asc'
                  ? 'Precio: $ → $$$'
                  : priceSort === 'desc'
                  ? 'Precio: $$$ → $'
                  : 'Ordenar por Precio'}
              </span>
            </button>

            {/* Fast Browse / Card Density Toggle */}
            <button
              onClick={toggleCompactMobile}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                isCompactMobile
                  ? isDark
                    ? 'bg-[#2E1819] text-[#F39C9D] border-[#DC5D5D]/50 shadow-xs'
                    : 'bg-rose-50 text-[#DC5D5D] border-[#DC5D5D]/40 shadow-xs font-bold'
                  : isDark
                  ? 'bg-[#242423] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-white/80'
              }`}
              title={
                isCompactMobile
                  ? 'Modo tarjetas chicas activo (ver más rápido). Clic para cambiar a tarjetas grandes.'
                  : 'Cambiar a modo tarjetas chicas para recorrer más rápido'
              }
              aria-label="Alternar tamaño de tarjetas"
            >
              {isCompactMobile ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-[#DC5D5D]" strokeWidth={1.5} />
                  <span>Tarjetas Chicas</span>
                </>
              ) : (
                <>
                  <LayoutList className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                  <span>Tarjetas Grandes</span>
                </>
              )}
            </button>

            {/* Suteki Bella Vista Google Reviews Link */}
            <a
              href={config.googleReviewUrl || 'https://maps.app.goo.gl/3w6w8ZgM4V6Z7K9r9'}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1 border shrink-0 ${
                isDark
                  ? 'bg-[#242423] text-amber-300 border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Ver y dejar reseñas de Suteki Bella Vista en Google Maps"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" strokeWidth={1.5} /> Reseñas
            </a>

            {hasPairingItems && (
              <button
                onClick={() => handleTagToggle('Maridaje')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1 border shrink-0 ${
                  activeTag === 'Maridaje'
                    ? 'bg-gradient-to-r from-[#DC5D5D] to-rose-700 text-white border-[#DC5D5D] shadow-xs'
                    : isDark
                    ? 'bg-[#2A1E20] text-[#F39C9D] border-[#5A2B32] hover:bg-[#341F23]'
                    : 'bg-rose-50 text-[#DC5D5D] border-[#DC5D5D]/30 hover:bg-rose-100'
                }`}
                title="Ver platos con maridaje sugerido"
              >
                <Wine className="w-3 h-3" strokeWidth={1.5} /> Maridaje
              </button>
            )}

            {extraTags.slice(0, 2).map((customTag) => (
              <button
                key={customTag}
                onClick={() => handleTagToggle(customTag)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-medium transition-all flex items-center gap-1 border shrink-0 ${
                  activeTag === customTag
                    ? 'bg-[#3C3C3B] text-white border-[#3C3C3B] shadow-xs'
                    : isDark
                    ? 'bg-[#242423] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#2C2C2B]'
                    : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-white/80'
                }`}
              >
                {customTag}
              </button>
            ))}

            {/* In-Nav Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-[#2C2C2B] text-amber-300 border-[#444442] hover:bg-[#363635]'
                  : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/30 hover:bg-[#F6EFE4]'
              }`}
              title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro para luz tenue'}
              aria-label="Alternar tema oscuro o claro"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" strokeWidth={1.5} /> : <Moon className="w-4 h-4 text-[#3C3C3B]" strokeWidth={1.5} />}
            </button>

            {/* In-Nav Background Texture Cycler */}
            <button
              onClick={cyclePattern}
              className={`p-1.5 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-[#2C2C2B] text-white border-[#444442] hover:bg-[#363635]'
                  : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/30 hover:bg-[#F6EFE4]'
              }`}
              title={`Fondo: ${activePattern === 'aletas' ? 'Trama Aletas' : activePattern === 'koi' ? 'Trama Koi' : activePattern === 'aletas-verde' ? 'Trama Verde' : 'Liso'} (Click para alternar textura oficial de fondo)`}
              aria-label="Alternar textura de fondo de marca Suteki"
            >
              <Layers className={`w-4 h-4 ${activePattern !== 'none' ? 'text-[#DC5D5D]' : 'text-stone-400'}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* Row 3: Horizontal Category Scroller with animated layout indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 no-scrollbar px-0.5 w-full">
            <button
              onClick={() => handleCategorySelect('Todos')}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-brand font-bold whitespace-nowrap transition-colors shrink-0 ${
                activeCategory === 'Todos'
                  ? 'text-white'
                  : isDark
                  ? 'bg-[#242423] text-[#F6EFE4] border border-[#383836] hover:bg-[#2C2C2B]'
                  : 'bg-white text-[#3C3C3B] border border-[#B0AF9F]/30 hover:bg-[#F6EFE4]'
              }`}
            >
              {activeCategory === 'Todos' && (
                <motion.div
                  layoutId="activeCategoryBg"
                  className="absolute inset-0 bg-[#DC5D5D] rounded-xl shadow-xs"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                />
              )}
              <span className="relative z-10">Todos ({items.length})</span>
            </button>
            {categoriesList.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              const isCurrent = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-brand font-bold whitespace-nowrap transition-colors shrink-0 ${
                    isCurrent
                      ? 'text-white'
                      : isDark
                      ? 'bg-[#242423] text-[#F6EFE4] border border-[#383836] hover:bg-[#2C2C2B]'
                      : 'bg-white text-[#3C3C3B] border border-[#B0AF9F]/30 hover:bg-[#F6EFE4]'
                  }`}
                >
                  {isCurrent && (
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 bg-[#DC5D5D] rounded-xl shadow-xs"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                    />
                  )}
                  <span className="relative z-10">
                    {cat} <span className="text-[10px] opacity-80 font-mono">({count})</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Dishes Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div
            className={`text-center py-16 rounded-3xl p-8 border shadow-xs ${
              isDark
                ? 'bg-[#1F1F1E] border-[#333332] text-[#F6EFE4]'
                : 'bg-white border-[#B0AF9F]/30 text-[#3C3C3B]'
            }`}
          >
            <KoiIllustration className="w-20 h-20 mx-auto opacity-30 mb-3" />
            <h3 className="font-brand font-bold text-lg">
              No encontramos platos con esos filtros
            </h3>
            <p className={`text-xs font-mono mt-1 ${isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/60'}`}>
              Probá limpiando la búsqueda o seleccionando otra categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('Todos');
                setActiveTag(null);
              }}
              className="mt-4 px-4 py-2 bg-[#DC5D5D] text-white text-xs font-brand font-bold rounded-xl"
            >
              Ver carta completa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Authentic Brand Promos & Event Bar from SUTEKI branding-06.jpg */}
            {activeCategory === 'Todos' && !searchQuery && !activeTag && (
              <div className="mb-8 sm:mb-12 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-cubano text-[#DC5D5D] tracking-wider uppercase">
                      04. Eventos & Promos de la Semana
                    </span>
                    <span className="text-[10px] font-mono opacity-60 hidden sm:inline">
                      • Esta carta se actualiza según fecha y evento
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Martes Combo Verano Card */}
                  <div className="rounded-2xl p-4 bg-[#DC5D5D] text-white relative overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
                      <KoiIllustration className="w-28 h-28" color="#FFFFFF" secondaryColor="#FFFFFF" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-cubano tracking-tight">MARTES</span>
                        <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded-sm">
                          Combo Verano
                        </span>
                      </div>
                      <span className="text-lg font-cubano bg-[#F6EFE4] text-[#DC5D5D] px-2.5 py-0.5 rounded-lg shadow-xs">
                        20% OFF
                      </span>
                    </div>
                    <p className="text-xs font-mono opacity-95 relative z-10">
                      Vinchu mix 15 piezas + bebida artesanal incluida.
                    </p>
                  </div>

                  {/* Jueves Gringo 16 Card */}
                  <div
                    className={`rounded-2xl p-4 border relative overflow-hidden shadow-xs flex flex-col justify-between ${
                      isDark
                        ? 'bg-[#222221] border-[#DC5D5D]/50 text-[#F6EFE4]'
                        : 'bg-white border-[#DC5D5D]/50 text-[#3C3C3B]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-cubano text-[#DC5D5D] tracking-tight">JUEVES</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[#93C2BC]/20 text-[#153A35] font-bold">
                          Especial del Chef
                        </span>
                      </div>
                      <SutekiHankoSeal size="sm" />
                    </div>
                    <p className="text-xs font-mono opacity-85">
                      Gringo 16 • Salmón macerado con palta y tartar flambeado nikkei.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* If "Todos" is selected, group dishes by category with neat section headings */}
            {(activeCategory === 'Todos' ? categoriesList : [activeCategory]).map((cat, catIndex) => {
              const catDishes = filteredItems.filter((i) => i.category === cat);
              if (catDishes.length === 0) return null;

              const editorial = CATEGORY_EDITORIAL_INFO[cat];

              return (
                <div key={`${activeCategory}-${cat}`} className="space-y-0 animate-category-fade">
                  {/* Clean, compact separator between categories */}
                  {catIndex > 0 && activeCategory === 'Todos' && (
                    <div
                      role="separator"
                      aria-hidden="true"
                      className="pt-6 pb-4 sm:pt-8 sm:pb-6 flex items-center justify-center"
                    >
                      <div className="w-full flex items-center justify-center gap-3 sm:gap-4">
                        <div
                          className={`h-px flex-1 max-w-[60px] sm:max-w-[120px] ${
                            isDark
                              ? 'bg-gradient-to-r from-transparent via-[#DC5D5D]/25 to-transparent'
                              : 'bg-gradient-to-r from-transparent via-[#DC5D5D]/20 to-transparent'
                          }`}
                        />
                        <div
                          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase select-none ${
                            isDark ? 'text-[#F6EFE4]/35' : 'text-[#3C3C3B]/40'
                          }`}
                        >
                          <span className="text-[10px] text-[#DC5D5D] opacity-70">林</span>
                          <span className="tracking-[0.2em]">SUTEKI</span>
                          <span className="text-[10px] text-[#DC5D5D] opacity-70">林</span>
                        </div>
                        <div
                          className={`h-px flex-1 max-w-[60px] sm:max-w-[120px] ${
                            isDark
                              ? 'bg-gradient-to-l from-transparent via-[#DC5D5D]/25 to-transparent'
                              : 'bg-gradient-to-l from-transparent via-[#DC5D5D]/20 to-transparent'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Section Container with Compact & Fluid Vertical Spacing and scroll margin below sticky header */}
                  <section
                    id={`categoria-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="pt-2 pb-6 sm:pb-8 scroll-mt-36 sm:scroll-mt-44"
                  >
                    {/* Category Section Header */}
                    <div
                      className={`border-b pb-3 mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 ${
                        isDark ? 'border-[#383836]' : 'border-[#DC5D5D]/20'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {editorial?.kanji && (
                            <span className="text-xs font-mono text-[#DC5D5D] bg-[#DC5D5D]/10 px-2 py-0.5 rounded-md font-bold">
                              {editorial.kanji}
                            </span>
                          )}
                          <span
                            className={`text-[10px] sm:text-[11px] font-mono tracking-widest uppercase ${
                              isDark ? 'text-[#F6EFE4]/50' : 'text-[#3C3C3B]/55'
                            }`}
                          >
                            SECCIÓN {String(catIndex + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-brand font-black text-[#DC5D5D] tracking-tight">
                          {cat}
                        </h2>

                        {editorial?.sub && (
                          <p
                            className={`text-xs font-mono ${
                              isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                            }`}
                          >
                            {editorial.sub}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`text-xs font-mono px-3 py-1 rounded-full border shadow-2xs ${
                            isDark
                              ? 'bg-[#222221] border-[#383836] text-[#F6EFE4]/70'
                              : 'bg-white border-[#B0AF9F]/30 text-[#3C3C3B]/70'
                          }`}
                        >
                          {catDishes.length} {catDishes.length === 1 ? 'plato' : 'platos'}
                        </span>
                        {/* Quick View Density Pill on Mobile */}
                        <button
                          onClick={toggleCompactMobile}
                          className={`sm:hidden text-[10px] font-mono px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all ${
                            isCompactMobile
                              ? 'bg-[#DC5D5D]/15 text-[#DC5D5D] border-[#DC5D5D]/30 font-bold'
                              : isDark
                              ? 'bg-[#222221] border-[#383836] text-[#F6EFE4]/70'
                              : 'bg-white border-[#B0AF9F]/30 text-[#3C3C3B]/70'
                          }`}
                          title="Alternar entre tarjetas chicas y grandes"
                        >
                          <Zap className="w-3 h-3" />
                          <span>{isCompactMobile ? 'Chicas' : 'Grandes'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Dishes Grid */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 ${isCompactMobile ? 'gap-2.5 sm:gap-6' : 'gap-4.5 sm:gap-6'}`}>
                    {catDishes.map((dish, dishIndex) => {
                      const isUnavailable = !dish.available;

                      return (
                        <div
                          key={`${activeCategory}-${dish.id}`}
                          onClick={() => setSelectedDishModal(dish)}
                          style={{
                            animationDelay: `${Math.min(dishIndex * 0.04, 0.32)}s`,
                          }}
                          className={`animate-menu-item rounded-2xl ${
                            isCompactMobile
                              ? 'p-2.5 sm:p-3.5 gap-2.5 sm:gap-3.5'
                              : 'p-3.5 gap-3.5'
                          } border transition-all flex shadow-xs hover:shadow-md relative overflow-hidden cursor-pointer group ${
                            isDark
                              ? isUnavailable
                                ? 'bg-[#1C1C1B]/60 border-[#2A2A29] opacity-60'
                                : 'bg-[#20201F] border-[#333331] hover:border-[#DC5D5D]/70'
                              : isUnavailable
                              ? 'border-gray-200 bg-gray-50/70 opacity-75'
                              : 'border-[#B0AF9F]/30 hover:border-[#DC5D5D]/60 bg-white'
                          }`}
                        >
                          {/* Dish Image with Lazy Loading & Theme-Matching Placeholder */}
                          <div
                            className={`relative ${
                              isCompactMobile ? 'w-20 h-20 sm:w-28 sm:h-28' : 'w-24 h-24 sm:w-28 sm:h-28'
                            } rounded-xl overflow-hidden shrink-0`}
                          >
                            <LazyImage
                              src={dish.imageUrl}
                              alt={dish.name}
                              priority={dishIndex < 6}
                              thumb={true}
                              themePlaceholder={isDark ? 'dark' : (dish.isChefSpecial ? 'coral' : 'cream')}
                              isDark={isDark}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              wrapperClassName="w-full h-full"
                              fallbackIcon={
                                <div className="w-full h-full flex items-center justify-center text-[#B0AF9F]">
                                  <KoiIllustration className="w-10 h-10 opacity-30" />
                                </div>
                              }
                            />

                            {/* Unavailable Overlay */}
                            {isUnavailable && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-1 text-center">
                                <span className="text-[10px] font-brand font-bold text-white uppercase bg-red-600/90 px-2 py-0.5 rounded-md">
                                  Agotado
                                </span>
                              </div>
                            )}

                            {/* Chef Special Star */}
                            {dish.isChefSpecial && !isUnavailable && (
                              <div className="absolute top-1 left-1 bg-amber-500 text-white p-1 rounded-md shadow-xs z-10">
                                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" strokeWidth={1.5} />
                              </div>
                            )}

                            {/* Sushiman Special Badge on Image */}
                            {dish.isSushimanSpecial && !isUnavailable && (
                              <div className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-brand font-bold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-1 z-10 border border-[#DC5D5D]/50">
                                <Award className="w-2.5 h-2.5 text-[#DC5D5D]" strokeWidth={1.5} />
                                <span className={isCompactMobile ? 'hidden sm:inline' : 'inline'}>Sushiman</span>
                              </div>
                            )}

                            {/* Hover zoom eye badge */}
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              {/* Title & Unit */}
                              <div className="flex items-start justify-between gap-1">
                                <h3
                                  className={`font-brand font-bold ${
                                    isCompactMobile
                                      ? 'text-[13px] sm:text-base line-clamp-1 sm:line-clamp-none'
                                      : 'text-sm sm:text-base'
                                  } group-hover:text-[#DC5D5D] transition-colors leading-snug ${
                                    isDark ? 'text-[#F6EFE4]' : 'text-[#3C3C3B]'
                                  }`}
                                >
                                  {dish.name}
                                </h3>
                              </div>

                              {dish.isSushimanSpecial && !isCompactMobile && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DC5D5D]/10 text-[#DC5D5D] border border-[#DC5D5D]/25 text-[10px] font-brand font-bold">
                                    <Award className="w-3 h-3 text-[#DC5D5D]" strokeWidth={1.5} />
                                    <span>Recomendación del Sushiman</span>
                                  </span>
                                </div>
                              )}

                              {dish.unit && (
                                <span
                                  className={`inline-block ${
                                    isCompactMobile ? 'text-[9px] mt-0.5' : 'text-[10px] mt-1'
                                  } font-mono px-1.5 py-0.2 rounded-md border ${
                                    isDark
                                      ? 'bg-[#292928] text-[#F6EFE4]/80 border-[#40403E]'
                                      : 'bg-stone-100 text-[#3C3C3B]/75 border-stone-200'
                                  }`}
                                >
                                  {dish.unit}
                                </span>
                              )}

                              {/* Description */}
                              {dish.description && (
                                <p
                                  className={`text-[10.5px] sm:text-[11px] ${
                                    isCompactMobile ? 'line-clamp-1 sm:line-clamp-2 mt-0.5' : 'line-clamp-2 mt-1'
                                  } leading-relaxed ${
                                    isDark ? 'text-[#D0C9BD]' : 'text-[#3C3C3B]/75'
                                  }`}
                                >
                                  {dish.description}
                                </p>
                              )}

                              {/* Dietary Tags */}
                              {dish.tags.length > 0 && (
                                <div className={`flex items-center gap-1 sm:gap-1.5 flex-wrap ${isCompactMobile ? 'mt-1' : 'mt-1.5'}`}>
                                  {(isCompactMobile ? dish.tags.slice(0, 2) : dish.tags).map((tag) => {
                                    const style = getTagStyle(tag);
                                    return (
                                      <span
                                        key={tag}
                                        className={`text-[8.5px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded-md border ${
                                          isDark
                                            ? 'bg-[#292928] text-[#F6EFE4]/90 border-[#40403E]'
                                            : `${style.bg} ${style.text} ${style.border}`
                                        }`}
                                      >
                                        {tag}
                                      </span>
                                    );
                                  })}
                                  {isCompactMobile && dish.tags.length > 2 && (
                                    <span className="text-[8.5px] font-mono opacity-50 px-0.5">
                                      +{dish.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Pairing Recommendation */}
                              {dish.pairing && (
                                <div
                                  className={`${
                                    isCompactMobile ? 'hidden sm:flex' : 'flex'
                                  } items-center gap-1.5 mt-2 px-2.5 py-1 rounded-xl text-[10px] font-mono border ${
                                    isDark
                                      ? 'bg-[#2B1B1E] border-[#5E2B35] text-[#F39C9D]'
                                      : 'bg-[#DC5D5D]/8 border-[#DC5D5D]/20 text-[#DC5D5D]'
                                  }`}
                                >
                                  <Wine className="w-3 h-3 shrink-0" />
                                  <span className="line-clamp-1">
                                    <strong className="font-semibold">Maridaje:</strong> {dish.pairing}
                                  </span>
                                </div>
                              )}

                              {/* Price Scales / Alternative Medidas */}
                              {dish.priceScales && !isCompactMobile && (
                                <div
                                  className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-mono border leading-tight ${
                                    isDark
                                      ? 'bg-[#2A1E20] border-[#5A2B32] text-[#F39C9D]'
                                      : 'bg-[#DC5D5D]/6 border-[#DC5D5D]/20 text-[#C84545]'
                                  }`}
                                >
                                  <span className="text-[8px] uppercase font-bold tracking-wider opacity-80 block">
                                    Otras medidas / opciones:
                                  </span>
                                  <span className="font-semibold break-words">
                                    {dish.priceScales}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Price, Simulator Action, and Visual Info Prompt */}
                            <div
                              className={`flex items-center justify-between ${
                                isCompactMobile ? 'pt-1.5 mt-1.5' : 'pt-2 mt-2'
                              } border-t gap-2 ${
                                isDark ? 'border-[#2E2E2D]' : 'border-[#B0AF9F]/15'
                              }`}
                            >
                              <div className="flex flex-col min-w-0">
                                <span className={`font-mono font-bold ${isCompactMobile ? 'text-[13px] sm:text-base' : 'text-sm sm:text-base'} text-[#DC5D5D] leading-none`}>
                                  {formatPrice(dish.price)}
                                </span>
                                {dish.unit && !isCompactMobile && (
                                  <span
                                    className={`text-[9px] font-mono mt-0.5 leading-none ${
                                      isDark ? 'text-[#F6EFE4]/50' : 'text-[#3C3C3B]/60'
                                    }`}
                                  >
                                    porción {dish.unit}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {!isUnavailable &&
                                  (() => {
                                    const inTableItem = orderItems.find(
                                      (i) => (i.dishId || i.dish?.id || (i as any).item?.id) === dish.id
                                    );
                                    const inTableQty = inTableItem?.quantity || 0;

                                    if (inTableQty > 0) {
                                      return (
                                        <div
                                          className={`flex items-center rounded-xl border p-0.5 shadow-2xs ${
                                            isDark ? 'bg-[#2A1E20] border-[#5A2B32]' : 'bg-rose-50 border-[#DC5D5D]/30'
                                          }`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUpdateOrderQuantity(dish.id, -1);
                                            }}
                                            className="w-5 h-5 rounded-lg flex items-center justify-center text-[#DC5D5D] hover:bg-[#DC5D5D]/20 active:scale-90 transition-all"
                                            aria-label="Restar 1 de la mesa"
                                            title="Restar 1 de la mesa"
                                          >
                                            <Minus className="w-2.5 h-2.5" />
                                          </button>
                                          <span className="px-1.5 text-[11px] font-mono font-bold text-[#DC5D5D] select-none min-w-4 text-center">
                                            {inTableQty}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUpdateOrderQuantity(dish.id, 1);
                                            }}
                                            className="w-5 h-5 rounded-lg flex items-center justify-center text-white bg-[#DC5D5D] hover:bg-[#c94d4d] active:scale-90 transition-all shadow-2xs"
                                            aria-label="Sumar 1 a la mesa"
                                            title="Sumar 1 a la mesa"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      );
                                    }

                                    return (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToOrder(dish);
                                        }}
                                        className={`px-2 py-1 rounded-xl bg-[#DC5D5D]/10 hover:bg-[#DC5D5D] text-[#DC5D5D] hover:text-white transition-all ${
                                          isCompactMobile ? 'text-[9.5px]' : 'text-[10px]'
                                        } font-mono font-bold flex items-center gap-1 active:scale-95 border border-[#DC5D5D]/20 hover:border-[#DC5D5D]`}
                                        title="Anotar este plato en mi lista para pedirle al mozo"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Elegir</span>
                                      </button>
                                    );
                                  })()}

                                {isUnavailable ? (
                                  <span className="text-[10px] font-mono font-semibold text-red-400 bg-red-950/40 px-2 py-0.5 rounded-lg border border-red-800/60">
                                    Agotado
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[10px] font-mono group-hover:text-[#DC5D5D] transition-colors flex items-center gap-0.5 ${
                                      isDark ? 'text-[#F6EFE4]/50' : 'text-[#3C3C3B]/50'
                                    }`}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                </section>
              </div>
            );
          })}
          </div>
        )}
      </main>

      {/* Dish Detail Modal: Focused on understanding the dish, ingredients, and presentation */}
      <AnimatePresence>
        {selectedDishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
            onClick={() => setSelectedDishModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col ${
                isDark ? 'bg-[#1C1C1B] border-[#383836]' : 'bg-[#F6EFE4] border-[#B0AF9F]/40'
              }`}
            >
            {/* Modal Image with Theme-Matching Placeholder */}
            <div className="relative h-64 shrink-0">
              <LazyImage
                src={selectedDishModal.imageUrl}
                alt={selectedDishModal.name}
                themePlaceholder={isDark ? 'dark' : (selectedDishModal.isChefSpecial ? 'coral' : 'cream')}
                isDark={isDark}
                priority={true}
                thumb={false}
                className="w-full h-full object-cover"
                wrapperClassName="w-full h-full"
                fallbackIcon={
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <KoiIllustration className="w-24 h-24 opacity-30" />
                  </div>
                }
              />
              <button
                onClick={() => setSelectedDishModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Category Pill */}
              {selectedDishModal.category && (
                <span
                  className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-mono font-medium backdrop-blur-xs shadow-xs ${
                    isDark ? 'bg-black/75 text-[#F6EFE4]' : 'bg-white/95 text-[#3C3C3B]'
                  }`}
                >
                  {selectedDishModal.category}
                </span>
              )}

              {/* Availability tag */}
              {!selectedDishModal.available && (
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-xs">
                  Agotado por hoy
                </span>
              )}
            </div>

            {/* Modal Body: Purely informational */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-3">
                  <h2
                    className={`text-xl sm:text-2xl font-brand font-black leading-tight ${
                      isDark ? 'text-[#F6EFE4]' : 'text-[#3C3C3B]'
                    }`}
                  >
                    {selectedDishModal.name}
                  </h2>
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-[#DC5D5D]">
                      {formatPrice(selectedDishModal.price)}
                    </span>
                    {selectedDishModal.unit && (
                      <span
                        className={`text-xs font-mono ${
                          isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/60'
                        }`}
                      >
                        / {selectedDishModal.unit}
                      </span>
                    )}
                  </div>
                </div>

                {selectedDishModal.unit && (
                  <span
                    className={`text-xs font-mono block mt-1.5 px-2.5 py-1 rounded-lg border inline-block ${
                      isDark
                        ? 'bg-[#262625] text-[#F6EFE4]/80 border-[#383836]'
                        : 'bg-white/60 text-[#3C3C3B]/70 border-[#B0AF9F]/20'
                    }`}
                  >
                    Medida / Presentación base: <strong>{selectedDishModal.unit}</strong>
                  </span>
                )}
              </div>

              {/* Ingredients & Tasting Breakdown */}
              <div
                className={`rounded-2xl p-4 border space-y-1.5 ${
                  isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#DC5D5D] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Ingredientes & Preparación
                </span>
                <p
                  className={`text-xs sm:text-sm leading-relaxed font-mono ${
                    isDark ? 'text-[#E5DFD5]' : 'text-[#3C3C3B]/90'
                  }`}
                >
                  {selectedDishModal.description || 'Consultar con el mozo los ingredientes del día.'}
                </p>
              </div>

              {/* Sommelier Pairing Recommendation Box */}
              {selectedDishModal.pairing && (
                <div
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isDark
                      ? 'bg-gradient-to-br from-[#2D1B1E] via-[#241C1E] to-[#1C1C1B] border-[#5E2B35]'
                      : 'bg-gradient-to-br from-[#FFF5F5] via-[#FFF9F5] to-white border-[#DC5D5D]/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#DC5D5D] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Wine className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#DC5D5D] font-bold block">
                        Recomendación del Sommelier
                      </span>
                      <h4 className={`text-xs font-brand font-bold ${isDark ? 'text-[#F6EFE4]' : 'text-[#3C3C3B]'}`}>
                        Maridaje Sugerido para este plato
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#DC5D5D] dark:text-[#E37A7B] pl-8">
                    {selectedDishModal.pairing}
                  </p>
                  <p className={`text-[11px] font-mono pl-8 leading-relaxed ${isDark ? 'text-[#F6EFE4]/70' : 'text-[#3C3C3B]/70'}`}>
                    Equilibra los sabores del plato, potencia las notas frescas del corte y resalta los toques de la cocina Nikkei.
                  </p>
                </div>
              )}

              {/* Price Scales / Variations */}
              {selectedDishModal.priceScales && (
                <div
                  className={`p-3.5 rounded-2xl border ${
                    isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase font-bold block mb-1 ${
                      isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/60'
                    }`}
                  >
                    Otras medidas / Variantes disponibles:
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-bold text-[#DC5D5D] break-words leading-relaxed">
                    {selectedDishModal.priceScales}
                  </p>
                </div>
              )}

              {/* Dietary Tags */}
              {selectedDishModal.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap items-center">
                  <span
                    className={`text-[10px] font-mono uppercase font-semibold ${
                      isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/60'
                    }`}
                  >
                    Características:
                  </span>
                  {selectedDishModal.tags.map((t) => {
                    const style = getTagStyle(t);
                    return (
                      <span
                        key={t}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                          isDark
                            ? 'bg-[#2A2A29] text-[#F6EFE4] border-[#40403E]'
                            : `${style.bg} ${style.text} ${style.border}`
                        }`}
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Sushiman Master Recommendation Card */}
              {selectedDishModal.isSushimanSpecial && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    isDark
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : 'bg-rose-50/80 border-[#DC5D5D]/30 text-[#3C3C3B]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#DC5D5D]/15 text-[#DC5D5D] flex items-center justify-center shrink-0 border border-[#DC5D5D]/25">
                    <ChefHat className="w-5 h-5 text-[#DC5D5D]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-xs font-brand font-bold text-[#DC5D5D] block">
                      Recomendación Exclusiva del Sushiman
                    </span>
                    <p className="text-[11px] font-mono opacity-80 leading-snug">
                      Selección del maestro sushiman de Suteki: excelencia en frescura de pesca, temperatura de arroz shari y sazón Nikkei artesanal.
                    </p>
                  </div>
                </div>
              )}

              {/* Info notice: physical menu has no prices */}
              <div
                className={`p-3 rounded-2xl border text-xs font-mono flex items-start gap-2.5 ${
                  isDark
                    ? 'bg-[#231E17] border-[#4A3B22] text-amber-200/90'
                    : 'bg-amber-50/90 border-amber-200 text-amber-900'
                }`}
              >
                <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Precio oficial actualizado:</strong> El menú físico de la mesa no contiene precios. Acá tenés el valor y los ingredientes de este plato para dictárselo a tu mozo.
                </p>
              </div>

              {/* Action Buttons: Add to Simulator + Close */}
              <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-[#333331]' : 'border-[#B0AF9F]/30'}`}>
                {selectedDishModal.available &&
                  (() => {
                    const inTableItem = orderItems.find(
                      (i) => (i.dishId || i.dish?.id || (i as any).item?.id) === selectedDishModal.id
                    );
                    const inTableQty = inTableItem?.quantity || 0;

                    return (
                      <div className="space-y-2">
                        {inTableQty > 0 ? (
                          <div
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                              isDark ? 'bg-[#25181A] border-[#5A2830]' : 'bg-rose-50 border-[#DC5D5D]/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                              <div>
                                <span className="text-xs font-brand font-bold text-[#DC5D5D] block">
                                  En tu lista para el mozo ({inTableQty} {inTableQty === 1 ? 'unidad' : 'unidades'})
                                </span>
                                <span className="text-[10px] font-mono opacity-70">
                                  Total: {formatPrice(selectedDishModal.price * inTableQty)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateOrderQuantity(selectedDishModal.id, -1)}
                                className="w-8 h-8 rounded-xl border flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all text-[#DC5D5D]"
                                title="Restar 1 de mi lista"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center font-mono font-bold text-sm text-[#DC5D5D]">
                                {inTableQty}
                              </span>
                              <button
                                onClick={() => handleUpdateOrderQuantity(selectedDishModal.id, 1)}
                                className="w-8 h-8 rounded-xl bg-[#DC5D5D] text-white flex items-center justify-center hover:bg-[#c94d4d] active:scale-95 transition-all shadow-xs"
                                title="Sumar 1 a mi lista"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToOrder(selectedDishModal)}
                            className="w-full py-3 rounded-2xl bg-[#DC5D5D] hover:bg-[#c94d4d] text-white text-xs font-brand font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Anotar para pedirle al mozo</span>
                          </button>
                        )}

                        {orderItems.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedDishModal(null);
                              setIsOrderSimulatorOpen(true);
                            }}
                            className={`w-full py-2 text-center text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                              isDark ? 'text-rose-300 hover:text-white' : 'text-[#DC5D5D] hover:underline'
                            }`}
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>
                              Ver mis platos elegidos ({orderItems.reduce((acc, i) => acc + (i.quantity || 0), 0)} platos) →
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })()}

                <button
                  onClick={() => setSelectedDishModal(null)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-mono font-medium transition-colors border ${
                    isDark
                      ? 'bg-[#262625] text-[#F6EFE4]/80 border-[#383836] hover:bg-[#30302E]'
                      : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-[#F6EFE4]'
                  }`}
                >
                  Volver a la carta
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Featured Ambience & Dining Experience Showcase */}
      {config.ambienceImageUrl && (
        <section className="max-w-4xl mx-auto px-4 mt-12">
          <div
            className={`rounded-3xl overflow-hidden border shadow-sm transition-all ${
              isDark
                ? 'bg-[#1C1C1B] border-[#383836]'
                : 'bg-white border-[#B0AF9F]/30'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Photo */}
              <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-black">
                <LazyImage
                  src={config.ambienceImageUrl}
                  alt={config.ambienceTitle || 'Salón Suteki'}
                  themePlaceholder="coral"
                  isDark={isDark}
                  priority={true}
                  thumb={false}
                  className="w-full h-full object-cover object-center filter brightness-95 contrast-105 hover:scale-105 transition-transform duration-500"
                  wrapperClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none md:hidden" />
                <button
                  onClick={() => setIsAmbienceModalOpen(true)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono flex items-center gap-1.5 hover:bg-black transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ver Salón</span>
                </button>
              </div>

              {/* Text / Experience Description */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#DC5D5D]/10 text-[#DC5D5D] text-[11px] font-mono font-bold tracking-wider uppercase">
                      Experiencia & Salón
                    </span>
                    <span className="text-xs font-mono text-amber-500 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Barra Nikkei</span>
                    </span>
                  </div>

                  <h3 className="text-2xl font-brand font-black tracking-tight">
                    {config.ambienceTitle || 'Salón & Barra Nikkei Suteki'}
                  </h3>

                  <p
                    className={`text-xs md:text-sm leading-relaxed ${
                      isDark ? 'text-[#F6EFE4]/80' : 'text-[#3C3C3B]/80'
                    }`}
                  >
                    {config.ambienceDescription ||
                      'Mural de garzas y luna roja, iluminación cálida con faroles de madera y barra omakase en vivo para disfrutar la experiencia sushi en su máxima expresión.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div
                      className={`p-2.5 rounded-xl border text-xs font-mono ${
                        isDark ? 'bg-[#252524] border-[#383836]' : 'bg-[#F6EFE4]/60 border-[#B0AF9F]/30'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5 text-[#DC5D5D]">
                        <Sparkles className="w-3.5 h-3.5 text-[#DC5D5D]" strokeWidth={1.5} />
                        <span>Clima Íntimo</span>
                      </span>
                      <span className="text-[11px] opacity-75">Luces cálidas & Washi</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border text-xs font-mono ${
                        isDark ? 'bg-[#252524] border-[#383836]' : 'bg-[#F6EFE4]/60 border-[#B0AF9F]/30'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5 text-[#DC5D5D]">
                        <Utensils className="w-3.5 h-3.5 text-[#DC5D5D]" strokeWidth={1.5} />
                        <span>Barra en Vivo</span>
                      </span>
                      <span className="text-[11px] opacity-75">Armado al instante</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#B0AF9F]/20">
                  <span className={`text-xs font-mono flex items-center gap-1.5 ${isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/60'}`}>
                    <MapPin className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                    <span>{config.address}</span>
                  </span>
                  <button
                    onClick={() => setIsAmbienceModalOpen(true)}
                    className="text-xs font-brand font-bold text-[#DC5D5D] hover:underline flex items-center gap-1"
                  >
                    Ver detalles <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Ambience Modal */}
      {isAmbienceModalOpen && config.ambienceImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl my-8 transition-colors ${
              isDark ? 'bg-[#1C1C1B] border-[#444442] text-[#F6EFE4]' : 'bg-[#F6EFE4] border-[#B0AF9F]/40 text-[#3C3C3B]'
            }`}
          >
            {/* Image banner */}
            <div className="relative aspect-[16/10]">
              <LazyImage
                src={config.ambienceImageUrl}
                alt={config.ambienceTitle || 'Ambiente Suteki'}
                themePlaceholder="coral"
                isDark={isDark}
                priority={true}
                thumb={false}
                className="w-full h-full object-cover object-center filter contrast-105 brightness-95"
                wrapperClassName="w-full h-full"
              />
              <button
                onClick={() => setIsAmbienceModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-full text-white text-xs font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
                <span>Salón & Barra Nikkei</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#DC5D5D] font-bold">
                  Atmósfera & Espacio
                </span>
                <h3 className="text-2xl font-brand font-black mt-0.5">
                  {config.ambienceTitle || 'Salón & Barra Nikkei Suteki'}
                </h3>
              </div>

              <p className={`text-sm leading-relaxed ${isDark ? 'text-[#F6EFE4]/80' : 'text-[#3C3C3B]/80'}`}>
                {config.ambienceDescription ||
                  'Mural de garzas y luna roja, iluminación cálida con faroles de madera y barra omakase en vivo para disfrutar la experiencia sushi en su máxima expresión.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#252524] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'}`}>
                  <span className="text-xs font-brand font-bold text-[#DC5D5D] flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#DC5D5D]" strokeWidth={1.5} />
                    <span>Faroles de Madera</span>
                  </span>
                  <p className="text-[11px] font-mono opacity-75">Iluminación tenue y relajante pensada para una cena íntima.</p>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#252524] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'}`}>
                  <span className="text-xs font-brand font-bold text-[#DC5D5D] flex items-center gap-1.5 mb-1">
                    <Utensils className="w-3.5 h-3.5 text-[#DC5D5D]" strokeWidth={1.5} />
                    <span>Barra Tradicional</span>
                  </span>
                  <p className="text-[11px] font-mono opacity-75">Mirá en directo cómo los sushimen preparan cada bocado.</p>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#252524] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'}`}>
                  <span className="text-xs font-brand font-bold text-[#DC5D5D] flex items-center gap-1.5 mb-1">
                    <Palette className="w-3.5 h-3.5 text-[#DC5D5D]" strokeWidth={1.5} />
                    <span>Mural Artesanal</span>
                  </span>
                  <p className="text-[11px] font-mono opacity-75">Arte de garzas, luna roja y olas japonesas en las paredes.</p>
                </div>
              </div>

              <div className={`pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono ${isDark ? 'border-[#333331] text-[#F6EFE4]/70' : 'border-[#B0AF9F]/30 text-[#3C3C3B]/70'}`}>
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                    <span>{config.address}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                    <span>{config.schedule}</span>
                  </span>
                </span>
                <button
                  onClick={() => setIsAmbienceModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#DC5D5D] text-white font-brand font-bold hover:bg-[#c84e4e] transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suteki Bella Vista Google Reviews Card */}
      <div className="max-w-4xl mx-auto px-4 mt-10">
        <GoogleReviewCard reviewUrl={config.googleReviewUrl} isDark={isDark} />
      </div>

      {/* Restaurant Info Footer */}
      <footer
        className={`max-w-4xl mx-auto px-4 mt-8 pt-8 border-t text-center space-y-4 ${
          isDark ? 'border-[#2E2E2D]' : 'border-[#B0AF9F]/30'
        }`}
      >
        {/* Suteki Logo Footer */}
        <div className="flex flex-col items-center justify-center gap-3">
          <SutekiLogo
            variant="horizontal"
            colorMode={isDark ? 'coral' : 'coral'}
            showTagline={true}
          />
          
          <div className="flex items-center gap-3 pt-1">
            <ChopstickWrapperGraphic />
            <SutekiHankoSeal size="sm" />
          </div>

          {/* Official Suteki Brand Illustration (Recurso 1-8.png from Google Drive) */}
          <div className="pt-2 opacity-60 hover:opacity-100 transition-opacity flex flex-col items-center">
            <SutekiBrandIllustration className="w-44 sm:w-56 h-auto" />
            <span className="text-[10px] font-mono tracking-widest text-[#DC5D5D] uppercase mt-1">
              Patrimonio de Marca • 10年 Suteki Nikkei
            </span>
          </div>
        </div>

        {/* Wi-Fi & Credentials */}
        {config.wifiNetwork && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-mono shadow-xs ${
              isDark ? 'bg-[#20201F] border-[#383836] text-[#F6EFE4]' : 'bg-white border-[#B0AF9F]/30 text-[#3C3C3B]'
            }`}
          >
            <Wifi className="w-4 h-4 text-[#DC5D5D]" />
            <span>Red: <strong>{config.wifiNetwork}</strong></span>
            {config.wifiPassword && (
              <>
                <span>| Clave: <strong>{config.wifiPassword}</strong></span>
                <button
                  onClick={handleCopyWifi}
                  className="ml-1 text-[#DC5D5D] hover:underline flex items-center gap-1"
                >
                  {wifiCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div
          className={`flex flex-wrap justify-center items-center gap-6 text-xs font-mono ${
            isDark ? 'text-[#F6EFE4]/70' : 'text-[#3C3C3B]/70'
          }`}
        >
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#DC5D5D]" /> {config.address}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#DC5D5D]" /> {config.schedule}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-[#DC5D5D]" /> {config.phone}
          </span>
        </div>

        <div
          className={`pt-4 flex items-center justify-between text-[11px] font-mono border-t ${
            isDark ? 'border-[#2A2A29] text-[#F6EFE4]/50' : 'border-[#B0AF9F]/20 text-[#3C3C3B]/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>Suteki 10年 • Carta Digital Visual</span>
            <button
              onClick={onToggleTheme}
              className="text-xs hover:text-[#DC5D5D] transition-colors ml-2 flex items-center gap-1"
            >
              {isDark ? <Sun className="w-3 h-3 text-amber-300" /> : <Moon className="w-3 h-3" />}
              {isDark ? 'Modo Día' : 'Modo Noche'}
            </button>
          </div>
          <button
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-xs ${
              isDark
                ? 'bg-[#222221] text-[#DC5D5D] border-[#DC5D5D]/40 hover:bg-[#DC5D5D] hover:text-white'
                : 'bg-white text-[#DC5D5D] border-[#DC5D5D]/40 hover:bg-[#DC5D5D] hover:text-white'
            }`}
            title="Acceso de administración con PIN"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Acceso Admin</span>
          </button>
        </div>
      </footer>

      {/* Floating Animated Bottom Bar for Table Order & Bill Splitting */}
      <FloatingOrderBar
        orderItems={orderItems}
        tableNumber={tableNumber}
        isDark={isDark}
        onOpenOrder={() => setIsOrderSimulatorOpen(true)}
      />

      {/* Floating "+1 🍣" Add to order particle toast */}
      <AddToCartNotification feedback={cartToast} isDark={isDark} />

      {/* Order Simulator & Bill Splitting Modal */}
      <OrderSimulatorModal
        isOpen={isOrderSimulatorOpen}
        onClose={() => setIsOrderSimulatorOpen(false)}
        orderItems={orderItems}
        onUpdateQuantity={handleUpdateOrderQuantity}
        onRemoveItem={handleRemoveFromOrder}
        onClearOrder={handleClearOrder}
        onUpdateNote={handleUpdateOrderNote}
        tableNumber={tableNumber}
        onTableNumberChange={handleTableNumberChange}
        onAddMoreItems={() => setIsOrderSimulatorOpen(false)}
        availableMenuItems={items}
        onQuickAddItem={handleAddToOrder}
        restaurantPhone={config.phone}
        isDark={isDark}
      />

      {/* Advanced Dietary Filter Modal */}
      <AdvancedFilterModal
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        filters={dietaryFilters}
        onChangeFilters={setDietaryFilters}
        items={items}
        isDark={isDark}
      />
    </div>
  );
};
