import React, { useState, useEffect } from 'react';
import { useMenu } from './hooks/useMenu';
import { AppViewMode } from './types';
import { BrandNavbar } from './components/BrandNavbar';
import { CustomerMenu } from './components/CustomerMenu';
import { AdminPanel } from './components/AdminPanel';
import { QrStudio } from './components/QrStudio';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SecurityPinModal } from './components/SecurityPinModal';

export default function App() {
  const {
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
  } = useMenu();

  // Admin authentication state saved in sessionStorage
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('suteki_admin_logged_in') === 'true';
    }
    return false;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGlobalPinModalOpen, setIsGlobalPinModalOpen] = useState(false);
  const [targetAdminView, setTargetAdminView] = useState<AppViewMode>('admin');

  // Dark mode state with persistence in localStorage and system preference fallback
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('suteki_theme');
      if (saved) return saved === 'dark';
      // Default to checking time of day or system preference (many restaurants are visited in the evening)
      const currentHour = new Date().getHours();
      if (currentHour >= 19 || currentHour < 6) return true;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('suteki_theme', next ? 'dark' : 'light');
      }
      return next;
    });
  };

  // Initial view detection based on URL query params
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const isAdminFlag = params.get('admin') === 'true';

      if (view === 'admin' || view === 'qr' || isAdminFlag) {
        const isAuth = sessionStorage.getItem('suteki_admin_logged_in') === 'true';
        if (isAuth) {
          return view === 'qr' ? 'qr-studio' : 'admin';
        }
      }
    }
    // Default to customer menu so a scanned QR shows the menu directly!
    return 'customer';
  });

  // If user came via ?admin=true or ?view=admin and is not authenticated, prompt login immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const isAdminFlag = params.get('admin') === 'true';

      if ((view === 'admin' || view === 'qr' || isAdminFlag) && !isAdminAuthenticated) {
        setTargetAdminView(view === 'qr' ? 'qr-studio' : 'admin');
        setIsLoginModalOpen(true);
      }
    }
  }, [isAdminAuthenticated]);

  const [tableNumber, setTableNumber] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mesa') || undefined;
    }
    return undefined;
  });

  // Sync viewMode to URL query params without reloading
  const handleViewChange = (newView: AppViewMode) => {
    // If requesting admin or qr-studio view and not authenticated, require PIN
    if ((newView === 'admin' || newView === 'qr-studio') && !isAdminAuthenticated) {
      setTargetAdminView(newView);
      setIsLoginModalOpen(true);
      return;
    }

    setViewMode(newView);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newView === 'customer') {
        url.searchParams.delete('view');
        url.searchParams.delete('admin');
      } else {
        url.searchParams.set('view', newView);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('suteki_admin_logged_in', 'true');
    }
    setIsLoginModalOpen(false);
    setViewMode(targetAdminView);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', targetAdminView);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('suteki_admin_logged_in');
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
    }
    setViewMode('customer');
  };

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-clip font-mono flex flex-col transition-colors duration-200 selection:bg-[#DC5D5D] selection:text-white ${
        isDark ? 'bg-[#151514] text-[#F6EFE4]' : 'bg-[#F6EFE4] text-[#3C3C3B]'
      }`}
    >
      {/* Top Navbar with Protected Controls for Staff */}
      <BrandNavbar
        currentView={viewMode}
        onViewChange={handleViewChange}
        config={config}
        isSyncing={isSyncing}
        isConnected={isConnected}
        tableParam={tableNumber}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenLogin={() => {
          setTargetAdminView('admin');
          setIsLoginModalOpen(true);
        }}
        onLogoutAdmin={handleLogout}
        onOpenPinModal={() => setIsGlobalPinModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {viewMode === 'customer' && (
          <CustomerMenu
            items={items}
            config={config}
            tableNumber={tableNumber}
            onOpenAdmin={() => {
              if (isAdminAuthenticated) {
                handleViewChange('admin');
              } else {
                setTargetAdminView('admin');
                setIsLoginModalOpen(true);
              }
            }}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        )}

        {viewMode === 'admin' && (
          <AdminPanel
            items={items}
            config={config}
            isSyncing={isSyncing}
            isConnected={isConnected}
            lastSyncTime={lastSyncTime}
            onToggleAvailability={toggleAvailability}
            onUpdatePrice={updatePrice}
            onUpdateItem={updateItem}
            onAddItem={addItem}
            onDeleteItem={deleteItem}
            onUpdateConfig={updateConfig}
            onBulkPriceAdjust={bulkPriceAdjust}
            onResetToDefaults={resetToDefaults}
            onViewCustomerMenu={() => handleViewChange('customer')}
            onOpenQrStudio={() => handleViewChange('qr-studio')}
            onOpenPinModal={() => setIsGlobalPinModalOpen(true)}
            onImportItems={importItems}
          />
        )}

        {viewMode === 'qr-studio' && (
          <QrStudio
            config={config}
            onOpenCustomerView={() => handleViewChange('customer')}
            onOpenPinModal={() => setIsGlobalPinModalOpen(true)}
            onUpdateConfig={updateConfig}
          />
        )}
      </div>

      {/* Security Admin PIN Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        expectedPin={config.adminPin || '2026'}
        isDark={isDark}
      />

      {/* Security Admin PIN Change Modal */}
      <SecurityPinModal
        isOpen={isGlobalPinModalOpen}
        onClose={() => setIsGlobalPinModalOpen(false)}
        currentPin={config.adminPin || '2026'}
        onSavePin={(newPin) => updateConfig({ adminPin: newPin })}
        isDark={isDark}
      />
    </div>
  );
}
