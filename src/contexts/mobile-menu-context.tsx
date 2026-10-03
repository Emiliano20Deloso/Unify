"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type MobileMenuContextValue = {
    isOpen: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    toggleMenu: () => void;
};

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

export const MobileMenuProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openMenu = useCallback(() => setIsOpen(true), []);
    const closeMenu = useCallback(() => setIsOpen(false), []);
    const toggleMenu = useCallback(() => setIsOpen((v) => !v), []);

    const value = useMemo(
        () => ({ isOpen, openMenu, closeMenu, toggleMenu }),
        [isOpen, openMenu, closeMenu, toggleMenu]
    );

    return <MobileMenuContext.Provider value={value}>{children}</MobileMenuContext.Provider>;
};

export const useMobileMenu = () => {
    const ctx = useContext(MobileMenuContext);
    if (!ctx) throw new Error("useMobileMenu must be used within MobileMenuProvider");
    return ctx;
};
