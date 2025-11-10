"use client";
import { NAV_LINKS } from "@/constants";
import { 
  Navbar as ResizableNavbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle,
  NavbarLogo,
  NavbarButton
} from "../ui/resizable-navbar";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Transform NAV_LINKS to match the new navbar structure
  const navItems = NAV_LINKS.map(link => ({
    name: link.name,
    link: link.href
  }));

  return (
    <ResizableNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <NavbarButton href="" variant="primary">
          Reservar ahora
        </NavbarButton>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle 
            isOpen={isOpen} 
            onClick={() => setIsOpen(!isOpen)} 
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-white hover:text-[#ff3131] text-lg font-medium mb-2 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="text-red-500 hover:text-[#ff3131] text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <NavbarButton href="#" variant="primary" className="mt-4">
            Reservar ahora
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
};

export default Navbar;
