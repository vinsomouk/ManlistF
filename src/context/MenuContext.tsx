import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from 'react';

interface MenuContextType {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(
  undefined,
);

export const MenuProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((isOpen) => !isOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((isOpen) => !isOpen);
  };

  return (
    <MenuContext.Provider
      value={{
        isMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error(
      'useMenu must be used within a MenuProvider',
    );
  }

  return context;
};