export interface PhotoPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'suteki-combo-suteki',
    name: 'Combo Suteki Especial',
    category: 'Sushi Rolls',
    url: '/api/plate-image/121562',
  },
  {
    id: 'suteki-shirashi-nikkei',
    name: 'Shirashi Nikkei',
    category: 'Piezas & Tiraditos',
    url: '/api/plate-image/121564',
  },
  {
    id: 'suteki-roll-new-york-phila',
    name: 'New York Phila Roll',
    category: 'Sushi Rolls',
    url: '/api/plate-image/120534',
  },
  {
    id: 'suteki-roll-avocado',
    name: 'Avocado Roll',
    category: 'Sushi Rolls',
    url: '/api/plate-image/121278',
  },
  {
    id: 'suteki-roll-teki',
    name: 'Teki Roll',
    category: 'Sushi Rolls',
    url: '/api/plate-image/121479',
  },
  {
    id: 'suteki-roll-buenos-aires',
    name: 'Buenos Aires Roll',
    category: 'Sushi Rolls',
    url: '/api/plate-image/121280',
  },
  {
    id: 'suteki-niguiri-salmon',
    name: 'Niguiri de Salmón',
    category: 'Piezas & Tiraditos',
    url: '/api/plate-image/121525',
  },
  {
    id: 'suteki-niguiri-nikkei',
    name: 'Niguiri Nikkei Sellado',
    category: 'Piezas & Tiraditos',
    url: '/api/plate-image/121529',
  },
  {
    id: 'suteki-tiradito-salmon',
    name: 'Tiradito de Salmón',
    category: 'Piezas & Tiraditos',
    url: '/api/plate-image/121535',
  },
  {
    id: 'suteki-bombas-salmon',
    name: 'Bombas de Salmón',
    category: 'Entradas',
    url: '/api/plate-image/495412',
  },
  {
    id: 'suteki-dumplings-cerdo',
    name: 'Dumplings de Cerdo',
    category: 'Entradas',
    url: '/api/plate-image/425025',
  },
  {
    id: 'suteki-gyosa-salmon',
    name: 'Gyosa de Salmón',
    category: 'Entradas',
    url: '/api/plate-image/143308',
  },
  {
    id: 'suteki-camote-furai',
    name: 'Camote Furai',
    category: 'Entradas',
    url: '/api/plate-image/121539',
  },
  {
    id: 'suteki-hot-salmon',
    name: 'Hot Salmón Crocante',
    category: 'Calentitos',
    url: '/api/plate-image/121509',
  },
  {
    id: 'suteki-salad-salmon-classic',
    name: 'Salad Salmón Classic',
    category: 'Salads',
    url: '/api/plate-image/120542',
  },
  {
    id: 'suteki-salad-salmon-crispy',
    name: 'Salad Salmón Crispy',
    category: 'Salads',
    url: '/api/plate-image/121287',
  },
  {
    id: 'suteki-ramen-saporo',
    name: 'Ramen Saporo Tradicional',
    category: 'Ramen',
    url: '/api/plate-image/330502',
  },
  {
    id: 'suteki-chow-mein-salmon',
    name: 'Chow Mein Wok Salmón',
    category: 'Platos Principales',
    url: '/api/plate-image/121544',
  },
  {
    id: 'suteki-curry-pollo',
    name: 'Pollo al Curry Aromático',
    category: 'Platos Principales',
    url: '/api/plate-image/121545',
  },
  {
    id: 'suteki-salsa-nikkei',
    name: 'Salsa Nikkei Clásica',
    category: 'Salsas & Extras',
    url: '/api/plate-image/121507',
  },
];

export const AMBIENCE_PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'suteki-mural-heron',
    name: 'Mural Garza, Luna Roja & Barra',
    category: 'Ambiente & Salón',
    url: 'https://images.unsplash.com/photo-1554502078-ef0fc409efce?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'suteki-bar-omakase',
    name: 'Barra Nikkei & Faroles de Madera',
    category: 'Ambiente & Salón',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'suteki-intimate-night',
    name: 'Luces Cálidas & Clima Íntimo',
    category: 'Ambiente & Salón',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'suteki-chef-station',
    name: 'Cocina Omakase en Vivo',
    category: 'Ambiente & Salón',
    url: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&w=1600&q=80',
  },
];
