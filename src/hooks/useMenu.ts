import { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, RestaurantConfig } from '../types';
import { INITIAL_MENU_ITEMS, DEFAULT_RESTAURANT_CONFIG } from '../data/initialMenu';

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>(() => {
    // Try localStorage initial cache for instant hydration
    try {
      const cached = localStorage.getItem('suteki_menu_items');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_MENU_ITEMS;
  });

  const [config, setConfig] = useState<RestaurantConfig>(() => {
    try {
      const cached = localStorage.getItem('suteki_restaurant_config');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return DEFAULT_RESTAURANT_CONFIG;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const sseRef = useRef<EventSource | null>(null);

  // Fetch full data from server
  const fetchMenu = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          try {
            localStorage.setItem('suteki_menu_items', JSON.stringify(data.items));
          } catch {}
        }
        if (data.config) {
          setConfig(data.config);
          try {
            localStorage.setItem('suteki_restaurant_config', JSON.stringify(data.config));
          } catch {}
        }
        setLastSyncTime(new Date());
        setIsConnected(true);
      }
    } catch (err) {
      console.warn('Network request to /api/menu failed, using cached state:', err);
      setIsConnected(false);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  // Connect to SSE for real-time live synchronization
  useEffect(() => {
    fetchMenu(true);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/menu/events');
      sseRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'MENU_UPDATED') {
            fetchMenu(false);
          }
        } catch {
          // ignore parsing error
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // Polling fallback every 6 seconds in case SSE disconnects or proxy drops stream
    const pollInterval = setInterval(() => {
      fetchMenu(false);
    }, 6000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }, [fetchMenu]);

  // Quick toggle availability (instant 86'd out of stock / in stock)
  const toggleAvailability = useCallback(async (id: string) => {
    setIsSyncing(true);
    // Optimistic local update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available, updatedAt: new Date().toISOString().split('T')[0] } : item
      )
    );

    try {
      const res = await fetch(`/api/menu/item/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setItems((prev) => prev.map((it) => (it.id === id ? data.item : it)));
        }
      }
    } catch (err) {
      console.error('Failed to toggle availability on server:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, []);

  // Update item price
  const updatePrice = useCallback(async (id: string, newPrice: number) => {
    setIsSyncing(true);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: newPrice, updatedAt: new Date().toISOString().split('T')[0] } : item
      )
    );

    try {
      const res = await fetch(`/api/menu/item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setItems((prev) => prev.map((it) => (it.id === id ? data.item : it)));
        }
      }
    } catch (err) {
      console.error('Failed to update price on server:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, []);

  // Full item update
  const updateItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    setIsSyncing(true);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : item
      )
    );

    try {
      const res = await fetch(`/api/menu/item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setItems((prev) => prev.map((it) => (it.id === id ? data.item : it)));
        }
      }
    } catch (err) {
      console.error('Failed to update item on server:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, []);

  // Add new dish
  const addItem = useCallback(async (newItem: Partial<MenuItem>) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/menu/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setItems((prev) => [...prev, data.item]);
          return data.item;
        }
      }
    } catch (err) {
      console.error('Failed to add item on server:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, []);

  // Delete dish
  const deleteItem = useCallback(async (id: string) => {
    setIsSyncing(true);
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/menu/item/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete item on server:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, []);

  // Update restaurant configuration
  const updateConfig = useCallback(async (updates: Partial<RestaurantConfig>) => {
    setIsSyncing(true);
    setConfig((prev) => ({ ...prev, ...updates }));
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to update restaurant config:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, []);

  // Reset to original 102 items
  const resetToDefaults = useCallback(async () => {
    if (!confirm('¿Estás seguro de restablecer el menú con todos los 102 platos y precios originales de Suteki?')) {
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch('/api/menu/reset', { method: 'POST' });
      if (res.ok) {
        setItems([...INITIAL_MENU_ITEMS]);
        setConfig({ ...DEFAULT_RESTAURANT_CONFIG });
      }
    } catch (err) {
      console.error('Failed to reset menu:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, []);

  // Bulk price percentage adjustment (e.g. +10% or -5%)
  const bulkPriceAdjust = useCallback(async (percentage: number, targetCategory?: string) => {
    setIsSyncing(true);
    const updatedItems = items.map((item) => {
      if (!targetCategory || item.category === targetCategory) {
        const factor = 1 + percentage / 100;
        // Round to nearest 10 pesos for clean dining pricing
        const newPrice = Math.round((item.price * factor) / 10) * 10;
        return {
          ...item,
          price: newPrice,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });

    setItems(updatedItems);

    try {
      // Send updates to server
      for (const item of updatedItems) {
        if (!targetCategory || item.category === targetCategory) {
          await fetch(`/api/menu/item/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: item.price }),
          });
        }
      }
    } catch (err) {
      console.error('Failed to apply bulk price adjustment:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, [items]);

  // Import menu items (Excel / CSV / JSON)
  const importItems = useCallback(async (newItems: MenuItem[], mode: 'replace' | 'merge') => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/menu/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems, mode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
          try {
            localStorage.setItem('suteki_menu_items', JSON.stringify(data.items));
          } catch {}
        }
      } else {
        if (mode === 'replace') {
          setItems(newItems);
        } else {
          const map = new Map(items.map((i) => [i.id, i]));
          newItems.forEach((i) => map.set(i.id, i));
          setItems(Array.from(map.values()));
        }
      }
    } catch (err) {
      console.error('Failed to import items to server:', err);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }
  }, [items]);

  return {
    items,
    config,
    isLoading,
    isSyncing,
    isConnected,
    lastSyncTime,
    toggleAvailability,
    updatePrice,
    updateItem,
    addItem,
    deleteItem,
    updateConfig,
    resetToDefaults,
    bulkPriceAdjust,
    importItems,
    refresh: fetchMenu,
  };
}
