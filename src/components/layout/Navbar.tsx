"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-nosotros", label: "La Escuela" },
  { href: "/clases", label: "Clases" },
  { href: "/programas", label: "Programas" },
  { href: "/precios", label: "Precios" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Hide the public navbar on admin and instructor dashboards
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/area-privada")
  ) {
    return null;
  }

  const navBg = scrolled
    ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]"
    : isHome
      ? "bg-transparent"
      : "bg-white/90 backdrop-blur-xl";

  const textColor = scrolled || !isHome
    ? "text-slate-800"
    : "text-white";

  const activeColor = "text-ocean-500";

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${navBg}`}
        role="navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="TGN Surf School"
                width={140}
                height={56}
                className={`object-contain transition-all duration-300 w-auto h-11 lg:h-12 ${
                  scrolled || !isHome ? "brightness-0" : ""
                }`}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-[0.8125rem] font-medium tracking-wide uppercase transition-colors duration-200 rounded-lg
                    ${pathname === link.href
                      ? activeColor
                      : `${textColor} hover:text-ocean-500`
                    }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-ocean-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
              <Link
                href="/#reservar"
                className="ml-4 px-6 py-2.5 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-ocean-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Reservar Clase
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              className={`lg:hidden relative z-10 p-2.5 rounded-xl transition-colors ${
                isOpen ? "text-white" : textColor
              }`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menú de navegación"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-ocean-900/98 backdrop-blur-2xl lg:hidden flex flex-col"
          >
            <div className="flex-1 flex flex-col justify-center px-8 gap-2">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 text-3xl font-bold tracking-tight transition-colors ${
                      pathname === link.href
                        ? "text-ocean-400"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-8 flex flex-col gap-3"
              >
                <Link
                  href="/#reservar"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary text-center text-lg"
                >
                  Reservar Clase
                </Link>
                <a
                  href="tel:+34678502482"
                  className="flex items-center justify-center gap-2 py-3 text-white/60 hover:text-white transition-colors text-sm"
                >
                  <Phone size={16} />
                  +34 678 502 482
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
