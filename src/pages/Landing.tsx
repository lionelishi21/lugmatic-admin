import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Check, Headphones, Radio, Gift, Sparkles, ArrowRight, ChevronDown, Music2, Menu, X, TrendingUp, Users, DollarSign, Zap, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import logo from '../assets/logo.png';
import { useAuth } from "../hooks/useAuth";

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for casual listeners",
    features: [
      "Access to all tracks",
      "Standard audio quality",
      "Limited skips",
      "With advertisements",
      "Mobile & Desktop access"
    ],
    buttonText: "Start Listening",
    highlight: false,
    href: "/login"
  },
  {
    name: "Regular",
    price: "20",
    description: "For true music lovers",
    features: [
      "No advertisements",
      "High-fidelity audio",
      "Unlimited skips",
      "Offline listening",
      "Artist exclusive content",
      "Direct artist support"
    ],
    buttonText: "Go Pro",
    highlight: true,
    href: "/login"
  },
  {
    name: "Family",
    price: "50",
    description: "The whole crew in one place",
    features: [
      "Everything in Regular",
      "Up to 6 accounts",
      "Family-friendly filters",
      "Shared family playlist",
      "Multi-device streaming",
      "Priority support"
    ],
    buttonText: "Choose Family",
    highlight: false,
    href: "/login"
  }
];

const featureCards = [
  {
    icon: Headphones,
    title: "High-Fidelity Audio",
    description: "Experience every beat and bassline exactly as the artist intended. Lossless quality streaming.",
    span: "md:col-span-1"
  },
  {
    icon: Radio,
    title: "Live Artist Sessions",
    description: "Watch your favorite dancehall and reggae artists perform live. Interact, request songs, and send gifts in real-time.",
    span: "md:col-span-2"
  },
  {
    icon: Gift,
    title: "Direct Artist Support",
    description: "Gift artists directly during streams and from their profiles. Higher payouts mean more music from creators you love.",
    span: "md:col-span-2"
  },
  {
    icon: Sparkles,
    title: "Discover New Artists",
    description: "Find emerging talent before they blow up. Explore curated playlists and personalized recommendations.",
    span: "md:col-span-1"
  }
];

/* ─── Scroll-synced video hook ─── */
function useScrollVideo(
  containerRef: React.RefObject<HTMLElement | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;
    video.currentTime = v * video.duration;
  });

  return scrollYProgress;
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/artist';

  /* ─── Video refs ─── */
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const showcaseContainerRef = useRef<HTMLDivElement>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement>(null);

  /* ─── Scroll-sync videos ─── */
  const heroProgress = useScrollVideo(heroContainerRef, heroVideoRef);
  const showcaseProgress = useScrollVideo(showcaseContainerRef, showcaseVideoRef);

  /* ─── Derived parallax transforms ─── */
  const heroTextOpacity = useTransform(heroProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const heroTextY = useTransform(heroProgress, [0, 0.35], [0, -80]);
  const heroStatsOpacity = useTransform(heroProgress, [0.3, 0.45, 0.65], [0, 1, 0]);
  const heroStatsY = useTransform(heroProgress, [0.3, 0.45, 0.65], [60, 0, -40]);
  const heroCTAOpacity = useTransform(heroProgress, [0.6, 0.75, 0.95], [0, 1, 0]);
  const heroCTAY = useTransform(heroProgress, [0.6, 0.75, 0.95], [80, 0, -60]);

  const showcase1Opacity = useTransform(showcaseProgress, [0, 0.2, 0.4], [0, 1, 0]);
  const showcase1Y = useTransform(showcaseProgress, [0, 0.2, 0.4], [60, 0, -60]);
  const showcase2Opacity = useTransform(showcaseProgress, [0.35, 0.55, 0.7], [0, 1, 0]);
  const showcase2Y = useTransform(showcaseProgress, [0.35, 0.55, 0.7], [60, 0, -60]);
  const showcase3Opacity = useTransform(showcaseProgress, [0.65, 0.8, 0.95], [0, 1, 0]);
  const showcase3Y = useTransform(showcaseProgress, [0.65, 0.8, 0.95], [60, 0, -60]);

  /* ─── Preload videos ─── */
  const preloadVideo = useCallback((ref: React.RefObject<HTMLVideoElement | null>) => {
    const v = ref.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    preloadVideo(heroVideoRef);
    preloadVideo(showcaseVideoRef);
  }, [preloadVideo]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black overflow-x-hidden">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/60 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10">
              <img src={logo} alt="Lugmatic" className="h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              LUGMATIC
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <button className="bg-green-500 hover:bg-green-400 text-black font-semibold text-[13px] rounded-full px-5 py-2 transition-all">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-4 py-2 text-zinc-400 hover:text-white text-[13px] font-medium transition-colors">Log in</button>
                </Link>
                <Link to="/login">
                  <button className="bg-green-500 hover:bg-green-400 text-black font-semibold text-[13px] rounded-full px-5 py-2 transition-all">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-16 left-0 w-full bg-black/95 border-b border-white/10 backdrop-blur-xl p-6"
          >
            <nav className="flex flex-col gap-6">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg text-zinc-400 hover:text-white transition-colors font-medium">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg text-zinc-400 hover:text-white transition-colors font-medium">Pricing</a>
              <div className="h-px bg-white/10 my-2" />
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg text-zinc-400 hover:text-white transition-colors font-medium">Log in</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold h-12 rounded-full text-base transition-all">
                  Get Started
                </button>
              </Link>
            </nav>
          </motion.div>
        )}
      </nav>

      {/* ═══ HERO: SCROLL-DRIVEN VIDEO SECTION ═══ */}
      <section ref={heroContainerRef} className="relative" style={{ height: "300vh" }}>
        {/* Sticky video container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Video */}
          <video
            ref={heroVideoRef}
            src="/lugmatic_3d1.mp4"
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.55) saturate(1.2)" }}
          />

          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* ─── Overlay 1: Hero text ─── */}
          <motion.div
            style={{ opacity: heroTextOpacity, y: heroTextY }}
            className="absolute inset-0 flex items-center z-10"
          >
            <div className="max-w-6xl mx-auto px-6 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center mb-8"
              >
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-md text-[12px] text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Dancehall &middot; Reggae &middot; Afrobeats
                </div>
              </motion.div>

              <h1
                className="text-[clamp(3.5rem,8vw,8rem)] font-bold tracking-[-0.04em] leading-[0.9]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="block italic">LUGMATIC FOR</span>
                <span className="block text-green-500 drop-shadow-[0_0_60px_rgba(100,220,80,0.4)] italic">ARTISTS</span>
              </h1>

              <p className="mt-6 text-zinc-300 text-lg md:text-xl max-w-lg leading-relaxed font-light">
                Manage your music, engage with fans, and grow your career.
                Advanced analytics, live streaming, and direct fan gifting.
              </p>

              {/* Scroll hint */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-16 flex items-center gap-2 text-zinc-500 text-sm"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Scroll to explore</span>
              </motion.div>
            </div>
          </motion.div>

          {/* ─── Overlay 2: Platform stats ─── */}
          <motion.div
            style={{ opacity: heroStatsOpacity, y: heroStatsY }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="max-w-4xl mx-auto px-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { value: "50K+", label: "Active Listeners", icon: Users, color: "text-green-400" },
                  { value: "10K+", label: "Tracks Uploaded", icon: Music2, color: "text-emerald-400" },
                  { value: "500+", label: "Artists Worldwide", icon: Globe, color: "text-teal-400" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] text-center hover:bg-white/[0.1] transition-all group"
                  >
                    <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                    <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{stat.value}</p>
                    <p className="text-sm text-zinc-400 tracking-wider uppercase">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── Overlay 3: CTA ─── */}
          <motion.div
            style={{ opacity: heroCTAOpacity, y: heroCTAY }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="text-center max-w-2xl mx-auto px-6">
              <h2
                className="text-5xl md:text-7xl font-bold tracking-[-0.03em] italic mb-6"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="text-green-500">YOUR MUSIC.</span> YOUR STAGE.
              </h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
                Join thousands of artists already growing their career on Lugmatic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Link to={dashboardPath}>
                    <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-14 px-10 text-base rounded-full shadow-[0_0_40px_-5px_rgba(100,220,80,0.5)] hover:shadow-[0_0_60px_-5px_rgba(100,220,80,0.7)] transition-all flex items-center gap-2">
                      Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-14 px-10 text-base rounded-full shadow-[0_0_40px_-5px_rgba(100,220,80,0.5)] hover:shadow-[0_0_60px_-5px_rgba(100,220,80,0.7)] transition-all flex items-center gap-2">
                        Start Free
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link to="/login">
                      <button className="h-14 px-10 text-base rounded-full border border-white/15 hover:bg-white/10 text-zinc-300 backdrop-blur-md transition-all">
                        Log In
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SHOWCASE: SECOND SCROLL-DRIVEN VIDEO ═══ */}
      <section ref={showcaseContainerRef} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Video */}
          <video
            ref={showcaseVideoRef}
            src="/lugmatic_3d2.mp4"
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.5) saturate(1.3)" }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />

          {/* ─── Showcase slide 1 ─── */}
          <motion.div
            style={{ opacity: showcase1Opacity, y: showcase1Y }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="text-center max-w-3xl mx-auto px-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/15 backdrop-blur-xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <Zap className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                BUILT FOR THE CULTURE
              </h3>
              <p className="text-zinc-400 text-lg mt-4 max-w-md mx-auto">
                From the streets of Kingston to the world stage — a platform designed for Caribbean music first.
              </p>
            </div>
          </motion.div>

          {/* ─── Showcase slide 2 ─── */}
          <motion.div
            style={{ opacity: showcase2Opacity, y: showcase2Y }}
            className="absolute inset-0 flex items-center z-10"
          >
            <div className="max-w-5xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: TrendingUp, title: "Real-Time Analytics", desc: "Track streams, engagement, and revenue as it happens." },
                { icon: DollarSign, title: "Direct Earnings", desc: "Fans gift you directly. Higher payouts, no middlemen." },
                { icon: Shield, title: "Artist Control", desc: "You own your content. Full control over releases and distribution." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="p-6 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.1] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 group-hover:scale-105 transition-all">
                    <item.icon className="w-5 h-5 text-green-500" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── Showcase slide 3 ─── */}
          <motion.div
            style={{ opacity: showcase3Opacity, y: showcase3Y }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="text-center max-w-2xl mx-auto px-6">
              <h3 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] italic mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="text-green-500">GO LIVE.</span> GET GIFTED.
              </h3>
              <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
                Stream live to your fans. Receive gifts in real-time. Build connections that last.
              </p>
              <div className="flex items-center justify-center gap-6">
                {[
                  { val: "$12K+", lbl: "Daily Gifts" },
                  { val: "1.2K", lbl: "Live Daily" },
                  { val: "99%", lbl: "Payout Rate" },
                ].map((s) => (
                  <div key={s.lbl} className="px-6 py-4 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08]">
                    <p className="text-2xl font-bold text-green-400">{s.val}</p>
                    <p className="text-[11px] text-zinc-500 tracking-wider uppercase mt-1">{s.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 relative bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(34,197,94,0.06),transparent)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[12px] tracking-[0.2em] uppercase text-green-500 mb-4">Platform</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              EVERYTHING YOU NEED
            </h2>
            <p className="text-zinc-500 mt-4 max-w-md mx-auto">
              Everything you need to experience the best of Caribbean music.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {featureCards.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`${feature.span} p-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all group hover:shadow-2xl hover:shadow-green-500/5`}
              >
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-5 group-hover:bg-green-500/15 group-hover:scale-105 transition-all">
                  <feature.icon className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(34,197,94,0.05),transparent)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[12px] tracking-[0.2em] uppercase text-green-500 mb-4">Pricing</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CHOOSE YOUR PLAN
            </h2>
            <p className="text-zinc-500 mt-4 max-w-md mx-auto">
              Transparent pricing. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border flex flex-col transition-all duration-500 ${plan.highlight
                  ? "border-green-500/40 bg-green-500/[0.04] shadow-[0_0_60px_-20px_rgba(100,220,80,0.15)] scale-105 z-10"
                  : "border-white/[0.06] bg-white/[0.02]"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-500 text-black text-[10px] font-bold tracking-widest uppercase">
                    Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-[13px] text-zinc-500">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-zinc-500 text-sm">/mo</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <span className="text-[13px] text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to={plan.href} className="mt-auto">
                  <button
                    className={`w-full h-12 font-semibold rounded-2xl transition-all ${plan.highlight
                      ? "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_-5px_rgba(100,220,80,0.3)]"
                      : "bg-white/[0.06] text-white hover:bg-white/10 border border-white/5"
                      }`}
                  >
                    {plan.buttonText}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
              <img src={logo} alt="Lugmatic" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              LUGMATIC
            </span>
          </div>
          <div className="flex gap-8 text-[13px] text-zinc-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
          <p className="text-[13px] text-zinc-600">
            &copy; 2026 Lugmatic Music Group
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
      `}</style>
    </div>
  );
}
