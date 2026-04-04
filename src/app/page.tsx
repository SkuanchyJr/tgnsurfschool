"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Waves,
  Sun,
  Shield,
  Users,
  MapPin,
  Clock,
  Camera,
  Compass,
  ChevronDown,
  Star,
  Truck,
  CalendarDays,
  GraduationCap,
  Sparkles,
  Anchor,
  Phone,
  Mail,
  Instagram,
  Play,
  Check,
  Zap,
  Heart,
  Mountain,
} from "lucide-react";

/* ═══════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════ */

function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   FAQ DATA
   ═══════════════════════════════════════════ */

const faqData = [
  {
    q: "¿Necesito experiencia previa para apuntarme?",
    a: "No, nuestras clases están diseñadas para todos los niveles. Empezamos desde cero con una parte teórica y calentamiento antes de entrar al agua. Los monitores te acompañan en todo momento.",
  },
  {
    q: "¿Qué material necesito llevar?",
    a: "Nada. Todo el material está incluido: tabla de surf, neopreno y leash. Solo necesitas traer bañador, toalla, crema solar y muchas ganas.",
  },
  {
    q: "¿A partir de qué edad se puede participar?",
    a: "Las clases de surf y surfskate están abiertas a niños (a partir de 5-6 años) y adultos. La escuela de verano acepta niños y jóvenes de 5 a 18 años que sepan nadar.",
  },
  {
    q: "¿Qué pasa si no hay olas?",
    a: "Nos adaptamos a las condiciones del mar. Si no hay oleaje suficiente para surfear, organizamos sesiones de surfskate para trabajar la técnica fuera del agua. En la extraescolar, priorizamos surf con olas y surfskate cuando no las hay.",
  },
  {
    q: "¿Las clases incluyen seguros?",
    a: "Sí. Todas nuestras actividades incluyen seguro de responsabilidad civil y seguro de accidentes para tu tranquilidad.",
  },
  {
    q: "¿Dónde se realizan las clases?",
    a: "Nuestra base principal es Platja de la Pineda, pero nos desplazamos según las condiciones del mar a Platja del Miracle o Platja de l'Arrabassada para buscar el mejor spot. El surfskate se realiza en Skatepark Salou y Skatepark Reus.",
  },
  {
    q: "¿Cómo reservo una clase?",
    a: "Puedes reservar directamente desde nuestra web o contactarnos por WhatsApp al +34 678 502 482. Te confirmamos disponibilidad y horario al momento.",
  },
];

/* ═══════════════════════════════════════════
   FAQ ITEM COMPONENT
   ═══════════════════════════════════════════ */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-slate-200 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="text-lg font-semibold text-slate-900 group-hover:text-ocean-500 transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`text-ocean-500 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="flex flex-col w-full">

      {/* ─── 1. HERO ─────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-hero" />
        {/* Grain texture */}
        <div className="absolute inset-0 grain" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs sm:text-sm font-medium mb-8 uppercase tracking-[0.2em]"
          >
            <Compass size={14} className="text-ocean-300" />
            Tarragona · Costa Dorada · Mediterráneo
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold text-white tracking-tighter leading-[0.95] mb-8"
          >
            TU VIDA
            <br />
            <span className="text-gradient-ocean">EMPIEZA</span>
            <br />
            EN EL MAR
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl font-light leading-relaxed mb-12"
          >
            La primera escuela de surf de Tarragona. Aprende a surfear,
            conecta con el Mediterráneo y únete a una comunidad que vive
            el mar todos los días.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/#reservar" className="btn-primary text-lg px-10 py-4">
              Reserva Tu Clase <ArrowRight size={20} />
            </Link>
            <Link href="/precios" className="btn-secondary text-lg px-10 py-4">
              Ver Tarifas
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Scroll</span>
          <div className="w-[1px] h-10 bg-white/20 overflow-hidden rounded-full">
            <div className="w-full h-1/3 bg-ocean-400 rounded-full animate-scroll-indicator" />
          </div>
        </div>
      </section>

      {/* ─── 2. TRUST STRIP ──────────────────────────────────── */}
      <section className="relative z-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Star, label: "Primera escuela de surf", sub: "de Tarragona" },
                { icon: CalendarDays, label: "Desde noviembre", sub: "de 2020" },
                { icon: Shield, label: "Seguros incluidos", sub: "RC y accidentes" },
                { icon: Camera, label: "Fotos y vídeos", sub: "de cada sesión" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 justify-center md:justify-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-ocean-100 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-ocean-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 3. ABOUT / FOUNDER ──────────────────────────────── */}
      <section className="section-padding bg-sand-50 relative overflow-hidden">
        {/* Decorative shape */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-ocean-100/40 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Image Side */}
            <FadeIn direction="left" className="order-2 lg:order-1">
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop"
                    alt="Eric Faura — Fundador de TGN Surf School enseñando surf en Tarragona"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-6 -right-6 md:-right-10 glass-light p-5 rounded-2xl shadow-xl max-w-[220px] hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-ocean-500 flex items-center justify-center text-white shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">Eric Faura</p>
                      <p className="text-xs text-slate-500">
                        Fundador · Maestro de Ed. Primaria
                      </p>
                    </div>
                  </div>
                </div>
                {/* Accent blob */}
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-sunset-400/20 blur-2xl" />
              </div>
            </FadeIn>

            {/* Text Side */}
            <FadeIn direction="right" delay={0.2} className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 text-ocean-500 font-semibold text-sm uppercase tracking-widest mb-4">
                <Heart size={14} /> Nuestra Esencia
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                Mucho más que
                <br />
                <span className="text-gradient-sunset">una escuela.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                TGN Surf School nació en noviembre de 2020 de la mano de{" "}
                <strong>Eric Faura</strong>, maestro de Educación Primaria con
                una pasión inquebrantable por el mar y la enseñanza. Su visión:
                llevar el surf del Mediterráneo a otro nivel.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                No somos un simple alquiler de tablas. Somos un espacio de
                aprendizaje, superación y conexión con el entorno mediterráneo.
                Desde tu primera espuma hasta tu primera pared, te acompañamos
                en cada momento con una enseñanza profesional, segura y
                tremendamente divertida.
              </p>
              <Link
                href="/sobre-nosotros"
                className="inline-flex items-center gap-2 text-ocean-500 font-bold hover:gap-3 transition-all group"
              >
                Conoce nuestra historia
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 4. HOW IT WORKS ─────────────────────────────────── */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-ocean-500 font-semibold text-sm uppercase tracking-widest mb-4">
              <Zap size={14} /> Así funciona
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Tu experiencia surf en
              <span className="text-gradient-ocean"> 4 pasos</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {[
              {
                step: "01",
                icon: CalendarDays,
                title: "Reserva tu sesión",
                desc: "Elige tu horario online o por WhatsApp. Plazas limitadas para garantizar la mejor atención.",
              },
              {
                step: "02",
                icon: Compass,
                title: "El mar decide el spot",
                desc: "Analizamos oleaje, viento y condiciones para elegir la mejor playa del día: La Pineda, Miracle o l'Arrabassada.",
              },
              {
                step: "03",
                icon: Truck,
                title: "Llegamos equipados",
                desc: "Nuestra furgoneta llega al spot con todo el material: tablas, neoprenos, leash y más. Tú solo ven con ganas.",
              },
              {
                step: "04",
                icon: Waves,
                title: "Surfea y disfruta",
                desc: "Teoría, calentamiento en arena, surf en el agua con monitores. Fotos y vídeos incluidos para recordar la experiencia.",
              },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <FadeIn key={step} delay={i * 0.12}>
                <div className="relative flex flex-col items-start p-8 rounded-2xl bg-sand-50 border border-sand-200 hover:border-ocean-200 hover:shadow-lg transition-all duration-300 h-full group">
                  <span className="text-5xl font-extrabold text-ocean-100 mb-4 leading-none">
                    {step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-ocean-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. SERVICES ─────────────────────────────────────── */}
      <section className="section-padding gradient-dark-section relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ocean-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sunset-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-ocean-400 font-semibold text-sm uppercase tracking-widest mb-4">
              <Sparkles size={14} /> Nuestros Servicios
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Encuentra tu experiencia
            </h2>
            <p className="text-lg text-slate-400">
              Desde tu primera ola hasta tu primera maniobra. Programas para
              todos los niveles, edades y objetivos.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Clases de Surf",
                icon: Waves,
                img: "https://images.unsplash.com/photo-1526367790939-055decc93740?q=80&w=600&auto=format&fit=crop",
                desc: "Sesiones de 2 horas: teoría, calentamiento, práctica en arena y surf en el agua. Material completo incluido (tabla, neopreno y leash). Seguros, fotos y vídeos. Horarios flexibles.",
                price: "Desde 35€",
                href: "/clases",
              },
              {
                title: "Surfskate",
                icon: Mountain,
                img: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?q=80&w=600&auto=format&fit=crop",
                desc: "Sesiones de 1h 15min para trabajar la técnica fuera del agua. Material incluido (surfskate y protecciones). Seguros, fotos y vídeos. En Skatepark Salou y Skatepark Reus.",
                price: "Bono 5 clases 150€",
                href: "/clases#surfskate",
              },
              {
                title: "Escuela de Verano",
                icon: Sun,
                desc: "Para niños y jóvenes de 5 a 18 años. Surf, skate, paddle surf, yoga, talleres, formación y diploma. Grupos por edad y nivel. ¡Las mañanas más épicas del verano!",
                img: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=600&auto=format&fit=crop",
                price: "Desde 35€/día",
                href: "/programas#verano",
              },
              {
                title: "Extraescolar",
                icon: Users,
                img: "https://images.unsplash.com/photo-1596489391099-0785081c7e93?q=80&w=600&auto=format&fit=crop",
                desc: "Programa continuo para niños y adultos. Prioridad surf si hay olas, surfskate si no las hay. En playas de Tarragona y skateparks de la zona.",
                price: "Niños 59€/mes · Adultos 90€/mes",
                href: "/programas",
              },
              {
                title: "Grupos y Eventos",
                icon: Users,
                img: "https://images.unsplash.com/photo-1472745433479-4556f22e32c2?q=80&w=600&auto=format&fit=crop",
                desc: "Programas para grupos grandes, eventos corporativos, actividades escolares y team building. Diseñamos la experiencia a medida.",
                price: "Consultar",
                href: "/contacto",
              },
              {
                title: "Alquiler de Material",
                icon: Anchor,
                img: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?q=80&w=600&auto=format&fit=crop",
                desc: "Tablas de surf, neoprenos y todo el material que necesitas para tu sesión libre. Consulta disponibilidad y tarifas.",
                price: "Consultar",
                href: "/alquiler",
              },
            ].map(({ title, icon: Icon, img, desc, price, href }, i) => (
              <FadeIn key={title} delay={i * 0.1}>
                <Link href={href} className="group block h-full">
                  <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col hover:border-ocean-400/30 transition-all duration-500 hover:shadow-2xl hover:shadow-ocean-500/10">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={img}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <Icon size={18} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-lg">{title}</span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">{desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-ocean-400 font-bold text-sm">{price}</span>
                        <span className="text-white/50 group-hover:text-ocean-400 transition-colors flex items-center gap-1 text-sm">
                          Ver más <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. LOCATIONS ────────────────────────────────────── */}
      <section className="section-padding bg-sand-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <FadeIn direction="left">
              <span className="inline-flex items-center gap-2 text-ocean-500 font-semibold text-sm uppercase tracking-widest mb-4">
                <MapPin size={14} /> Nuestros Spots
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                Donde el mar
                <span className="text-gradient-ocean"> nos llama</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                No estamos atados a un solo sitio. Cada día analizamos las condiciones del oleaje,
                el viento y la marea para desplazarnos al mejor spot disponible.
                Nuestra furgoneta equipada con todo el material llega a la playa ideal para que
                tengas la mejor experiencia posible.
              </p>

              <div className="space-y-4">
                {[
                  {
                    name: "Platja de la Pineda",
                    sub: "Base principal · Ideales condiciones para aprender",
                    accent: "bg-ocean-500",
                  },
                  {
                    name: "Platja del Miracle",
                    sub: "Tarragona centro · Cuando el viento cambia de dirección",
                    accent: "bg-coral-500",
                  },
                  {
                    name: "Platja de l'Arrabassada",
                    sub: "Tarragona norte · Para días de swell especial",
                    accent: "bg-sunset-500",
                  },
                  {
                    name: "Skatepark Salou",
                    sub: "Surfskate · Sesiones técnicas en pista",
                    accent: "bg-slate-700",
                  },
                  {
                    name: "Skatepark Reus",
                    sub: "Surfskate · Alternativa cuando cambia la agenda",
                    accent: "bg-slate-700",
                  },
                ].map(({ name, sub, accent }) => (
                  <div
                    key={name}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-ocean-200 hover:shadow-md transition-all"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${accent} mt-1.5 shrink-0`}
                    />
                    <div>
                      <p className="font-bold text-slate-900">{name}</p>
                      <p className="text-sm text-slate-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
                    alt="Playas de Tarragona — spots de surf de TGN Surf School"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating location badge */}
                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 glass-light px-5 py-3 rounded-2xl shadow-lg hidden md:flex items-center gap-2">
                  <Truck size={18} className="text-ocean-500" />
                  <span className="text-sm font-semibold text-slate-900">
                    Operativa 100% móvil
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 7. SUMMER SCHOOL ────────────────────────────────── */}
      <section className="section-padding bg-gradient-to-br from-sunset-400/10 via-sand-50 to-coral-400/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sunset-400/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-coral-500 font-semibold text-sm uppercase tracking-widest mb-4">
              <Sun size={14} /> Escuela de Verano
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Los veranos más
              <span className="text-gradient-sunset"> épicos</span>
            </h2>
            <p className="text-lg text-slate-600">
              Para niños y jóvenes de 5 a 18 años que sepan nadar. Grupos por
              edad y nivel. Mañanas activas con la mejor energía del verano.
            </p>
          </FadeIn>

          {/* Activities grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {[
              { icon: Waves, label: "Surf" },
              { icon: Mountain, label: "Skate / Surfskate" },
              { icon: Anchor, label: "Paddle Surf" },
              { icon: Heart, label: "Yoga / Stretching" },
              { icon: Sparkles, label: "Talleres" },
              { icon: Camera, label: "Fotos y Vídeo" },
            ].map(({ icon: Icon, label }, i) => (
              <FadeIn key={label} delay={i * 0.07}>
                <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-slate-100 hover:border-sunset-300 hover:shadow-md transition-all text-center">
                  <div className="w-12 h-12 rounded-xl bg-sunset-400/10 flex items-center justify-center">
                    <Icon size={22} className="text-sunset-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{label}</span>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* What's included + Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeIn>
              <div className="bg-white rounded-2xl p-8 border border-slate-100 h-full">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Lo que incluye</h3>
                <ul className="space-y-3">
                  {[
                    "Surf, skate, longskate, surfskate",
                    "Paddle surf en días tranquilos",
                    "Yoga y stretching para equilibrio",
                    "Juegos y actividades en la playa",
                    "Formación sobre materiales y meteorología",
                    "Fotos y vídeos de cada sesión",
                    "Diploma al completar el programa",
                    "Todo el material incluido",
                    "Seguros de RC y accidentes",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-600">
                      <Check size={18} className="text-sunset-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-white rounded-2xl p-8 border border-slate-100 h-full">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Tarifas Escuela de Verano</h3>
                <div className="space-y-4">
                  {[
                    { plan: "1 día suelto", price: "35€" },
                    { plan: "1 semana", price: "110€", popular: true },
                    { plan: "2 semanas", price: "200€" },
                    { plan: "3 semanas", price: "265€" },
                  ].map(({ plan, price, popular }) => (
                    <div
                      key={plan}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        popular
                          ? "border-sunset-400 bg-sunset-400/5 shadow-sm"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{plan}</span>
                        {popular && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-sunset-500 bg-sunset-400/10 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-2xl font-extrabold text-slate-900">{price}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/programas#verano"
                  className="btn-primary w-full mt-6 justify-center bg-gradient-to-r from-sunset-500 to-coral-500 shadow-sunset-500/30"
                >
                  Reservar Escuela de Verano <ArrowRight size={18} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 8. EXTRAESCOLAR ─────────────────────────────────── */}
      <section className="section-padding bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <span className="inline-flex items-center gap-2 text-ocean-500 font-semibold text-sm uppercase tracking-widest mb-4">
                <GraduationCap size={14} /> Actividad Extraescolar
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                Surf y surfskate
                <span className="text-gradient-ocean"> todo el año</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Programa continuo para niños y adultos. Priorizamos surf cuando
                hay condiciones de olas y surfskate cuando no las hay, para que
                nunca pares de mejorar tu técnica. Ubicaciones en playas de
                Tarragona y skateparks de Salou y Reus.
              </p>

              {/* Pricing cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-6 rounded-2xl bg-ocean-100/50 border border-ocean-200/50">
                  <span className="text-sm font-medium text-ocean-600 uppercase tracking-wider">Niños</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">59€</span>
                    <span className="text-slate-500">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">+ 30€ matrícula</p>
                </div>
                <div className="p-6 rounded-2xl bg-ocean-100/50 border border-ocean-200/50">
                  <span className="text-sm font-medium text-ocean-600 uppercase tracking-wider">Adultos</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">90€</span>
                    <span className="text-slate-500">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">+ 30€ matrícula</p>
                </div>
              </div>

              <Link
                href="/programas"
                className="btn-primary inline-flex"
              >
                Ver Programa Completo <ArrowRight size={18} />
              </Link>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1596489391099-0785081c7e93?q=80&w=1000&auto=format&fit=crop"
                  alt="Actividad extraescolar TGN Surf School — surf y surfskate para niños y adultos"
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 9. PRICING / BONOS ──────────────────────────────── */}
      <section className="section-padding bg-sand-50 relative overflow-hidden" id="tarifas">
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-ocean-100/30 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-ocean-500 font-semibold text-sm uppercase tracking-widest mb-4">
              <Star size={14} /> Tarifas y Bonos
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Planes para cada surfer
            </h2>
            <p className="text-lg text-slate-600">
              Cuantas más sesiones reserves, mejor precio por clase. Elige el
              bono que mejor se adapte a ti.
            </p>
          </FadeIn>

          {/* Surf Pricing */}
          <FadeIn>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Waves size={20} className="text-ocean-500" /> Clases de Surf
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { plan: "1 clase grupal", price: "35€", perClass: "35€/clase", popular: false },
                { plan: "Bono 5 clases", price: "160€", perClass: "32€/clase", popular: false },
                { plan: "Bono 10 clases", price: "280€", perClass: "28€/clase", popular: true },
                { plan: "Bono 20 clases", price: "450€", perClass: "22,50€/clase", popular: false },
              ].map(({ plan, price, perClass, popular }) => (
                <div
                  key={plan}
                  className={`relative p-6 rounded-2xl border flex flex-col transition-all hover:shadow-lg ${
                    popular
                      ? "border-ocean-500 bg-ocean-500 text-white shadow-lg shadow-ocean-500/20"
                      : "border-slate-200 bg-white hover:border-ocean-200"
                  }`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-bold bg-sunset-400 text-slate-900 px-3 py-1 rounded-full">
                      Mejor valor
                    </span>
                  )}
                  <span className={`text-sm font-medium mb-3 ${popular ? "text-ocean-100" : "text-slate-500"}`}>
                    {plan}
                  </span>
                  <span className={`text-4xl font-extrabold mb-1 ${popular ? "text-white" : "text-slate-900"}`}>
                    {price}
                  </span>
                  <span className={`text-sm ${popular ? "text-ocean-200" : "text-ocean-500"} font-medium`}>
                    {perClass}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Surfskate Pricing */}
          <FadeIn delay={0.1}>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Mountain size={20} className="text-ocean-500" /> Surfskate
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-ocean-200 hover:shadow-lg transition-all">
                <span className="text-sm font-medium text-slate-500 mb-3 block">Bono 5 clases</span>
                <span className="text-4xl font-extrabold text-slate-900">150€</span>
                <span className="text-sm text-ocean-500 font-medium block mt-1">30€/clase</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="text-center">
            <Link href="/precios" className="btn-primary inline-flex">
              Ver Todas las Tarifas <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── 10. VIAJES (TEASER) ─────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-ocean-900/80 backdrop-blur-sm" />
        <div className="absolute inset-0 grain" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 text-sunset-400 font-semibold text-sm uppercase tracking-widest mb-6">
              <Play size={14} /> Próximamente
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              Surf trips con
              <br />
              <span className="text-gradient-sunset">TGN Surf School</span>
            </h2>
            <p className="text-xl text-white/60 max-w-xl mx-auto mb-10">
              Estamos preparando experiencias de viaje para que lleves tu surf a
              nuevos horizontes. Mantente atento.
            </p>
            <a
              href="https://wa.me/34678502482?text=Hola!%20Me%20interesa%20saber%20más%20sobre%20los%20surf%20trips"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex"
            >
              Avísame cuando estén listos <ArrowRight size={18} />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ─── 11. GALLERY ─────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-ocean-500 font-semibold text-sm uppercase tracking-widest mb-4">
              <Camera size={14} /> Galería
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Momentos reales
            </h2>
          </FadeIn>

          {/* Mosaic Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800&auto=format&fit=crop", span: "md:col-span-2 md:row-span-2", alt: "Surfeando una ola en Tarragona" },
              { src: "https://images.unsplash.com/photo-1455729552457-5c322b281c77?q=80&w=600&auto=format&fit=crop", span: "", alt: "Clase de surf en la playa" },
              { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop", span: "", alt: "Monitor de surf enseñando" },
              { src: "https://images.unsplash.com/photo-1526367790939-055decc93740?q=80&w=600&auto=format&fit=crop", span: "", alt: "Surf en el Mediterráneo" },
              { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", span: "", alt: "Playa de Tarragona al atardecer" },
              { src: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?q=80&w=600&auto=format&fit=crop", span: "md:col-span-2", alt: "Surfskate en skatepark" },
            ].map(({ src, span, alt }, i) => (
              <FadeIn key={i} delay={i * 0.08} className={span}>
                <div className="relative rounded-2xl overflow-hidden group aspect-square h-full">
                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3} className="text-center mt-10">
            <a
              href="https://instagram.com/tgnsurfschool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-ocean-500 font-bold hover:gap-3 transition-all"
            >
              <Instagram size={18} /> Más en @tgnsurfschool
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ─── 12. FAQ ─────────────────────────────────────────── */}
      <section className="section-padding bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-ocean-500 font-semibold text-sm uppercase tracking-widest mb-4">
              <Sparkles size={14} /> Preguntas Frecuentes
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              ¿Tienes dudas?
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-8 divide-slate-200">
              {faqData.map(({ q, a }) => (
                <FAQItem key={q} question={q} answer={a} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.3} className="text-center mt-10">
            <p className="text-slate-500 mb-3">¿No encuentras tu respuesta?</p>
            <a
              href="https://wa.me/34678502482"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-ocean-500 font-bold hover:gap-3 transition-all"
            >
              Escríbenos por WhatsApp <ArrowRight size={18} />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ─── 13. FINAL CTA ───────────────────────────────────── */}
      <section
        className="relative py-28 sm:py-36 overflow-hidden"
        id="reservar"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1416163781035-96a85f76ffc0?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 grain" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.05]">
              El mar te está
              <br />
              esperando.
            </h2>
            <p className="text-xl text-white/60 max-w-xl mx-auto mb-10">
              Reserva tu clase, elige tu bono o simplemente escríbenos. Estamos
              preparados para que vivas algo que no vas a olvidar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservas"
                className="btn-primary text-lg px-10 py-5"
              >
                Reservar Ahora <ArrowRight size={20} />
              </Link>
              <a
                href="https://wa.me/34678502482"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-lg px-10 py-5"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Hablar por WhatsApp
              </a>
            </div>
          </FadeIn>

          {/* Contact info */}
          <FadeIn delay={0.3}>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-white/40 text-sm">
              <a href="tel:+34678502482" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={16} /> +34 678 502 482
              </a>
              <a href="mailto:tgnsurfschool@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={16} /> tgnsurfschool@gmail.com
              </a>
              <a href="https://instagram.com/tgnsurfschool" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Instagram size={16} /> @tgnsurfschool
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
