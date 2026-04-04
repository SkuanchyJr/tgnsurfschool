"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Instagram, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";

const locations = [
  "Platja de la Pineda",
  "Platja del Miracle",
  "Platja de l'Arrabassada",
  "Skatepark Salou",
  "Skatepark Reus",
];

const exploreLinks = [
  { href: "/sobre-nosotros", label: "Nuestra Historia" },
  { href: "/clases", label: "Clases de Surf" },
  { href: "/clases#surfskate", label: "Surfskate" },
  { href: "/programas", label: "Extraescolares" },
  { href: "/programas#verano", label: "Escuela de Verano" },
  { href: "/precios", label: "Tarifas y Bonos" },
  { href: "/alquiler", label: "Alquiler de Material" },
];

export function Footer() {
  const pathname = usePathname();

  // Hide the footer on admin and instructor dashboards
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/area-privada")
  ) {
    return null;
  }

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-ocean-500 via-ocean-400 to-sunset-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Link href="/" className="w-max">
              <Image
                src="/logo.png"
                alt="TGN Surf School"
                width={150}
                height={55}
                className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity h-auto"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              La primera escuela de surf de Tarragona. Pasión por el mar,
              educación deportiva y comunidad en la Costa Dorada desde 2020.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/tgnsurfschool"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-ocean-500 hover:border-ocean-500 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-ocean-400">
              Explorar
            </h4>
            <ul className="flex flex-col gap-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-ocean-400">
              Ubicaciones
            </h4>
            <ul className="flex flex-col gap-2.5">
              {locations.map((loc) => (
                <li key={loc} className="flex items-start gap-2 text-sm text-slate-400">
                  <MapPin size={14} className="text-ocean-500 shrink-0 mt-0.5" />
                  {loc}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + CTA */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-ocean-400">
              Contacto
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="tel:+34678502482"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Phone size={16} className="text-ocean-500" />
                  +34 678 502 482
                </a>
              </li>
              <li>
                <a
                  href="mailto:tgnsurfschool@gmail.com"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Mail size={16} className="text-ocean-500" />
                  tgnsurfschool@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/tgnsurfschool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Instagram size={16} className="text-ocean-500" />
                  @tgnsurfschool
                </a>
              </li>
            </ul>

            <div className="mt-2">
              <Link
                href="/#reservar"
                className="block w-full text-center px-6 py-3 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-wider"
              >
                Reservar Clase
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} TGN Surf School. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link href="/legal" className="hover:text-white transition-colors">
              Aviso Legal
            </Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
