import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";
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

/* ─── Scroll-synced video hook (frame-by-frame) ─── */
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
  const showcaseContainerRef = useRef<HTMLDivElement>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement>(null);

  /* ─── Hero: scroll progress for text overlays only (video autoplays) ─── */
  const { scrollYProgress: heroScrollRaw } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"],
  });
  const heroProgress = useSpring(heroScrollRaw, { damping: 80, stiffness: 600, mass: 0.2 });

  /* ─── Showcase: scroll-synced video ─── */
  const showcaseProgress = useScrollVideo(showcaseContainerRef, showcaseVideoRef);

  /* ─── Derived parallax transforms ─── */
  const heroTextOpacity = useTransform(heroProgress, [0, 0.35, 0.45], [1, 1, 0]);
  const heroTextY = useTransform(heroProgress, [0, 0.45], [0, -60]);
  const heroStatsOpacity = useTransform(heroProgress, [0.4, 0.5, 0.7, 0.8], [0, 1, 1, 0]);
  const heroStatsY = useTransform(heroProgress, [0.4, 0.5, 0.7, 0.8], [40, 0, 0, -40]);
  const heroCTAOpacity = useTransform(heroProgress, [0.75, 0.85, 0.95, 1], [0, 1, 1, 1]);
  const heroCTAY = useTransform(heroProgress, [0.75, 0.85, 0.95, 1], [40, 0, 0, 0]);

  const showcase1Opacity = useTransform(showcaseProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const showcase1Y = useTransform(showcaseProgress, [0, 0.2], [0, -40]);
  const showcase2Opacity = useTransform(showcaseProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0]);
  const showcase2Y = useTransform(showcaseProgress, [0.25, 0.35, 0.6, 0.7], [40, 0, 0, -40]);
  const showcase3Opacity = useTransform(showcaseProgress, [0.75, 0.85, 0.95, 1], [0, 1, 1, 1]);
  const showcase3Y = useTransform(showcaseProgress, [0.75, 0.85, 1], [40, 0, 0]);

  /* ─── Showase: Intense Video Parallax ─── */
  const showcaseVideoScale = useTransform(showcaseProgress, [0, 1], [1.0, 1.4]);
  const showcaseVideoY = useTransform(showcaseProgress, [0, 1], ["-10%", "10%"]);

  /* ─── Preload videos ─── */
  const preloadVideo = useCallback((ref: React.RefObject<HTMLVideoElement | null>) => {
    const v = ref.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    preloadVideo(showcaseVideoRef);
  }, [preloadVideo]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black overflow-x-hidden">
      {/* ═══ NAV: LIQUID GLASS ═══ */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-zinc-950/60 border-b border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

      {/* ═══ HERO: AUTOPLAY VIDEO BACKGROUND ═══ */}
      <section ref={heroContainerRef} className="relative" style={{ height: "150vh" }}>
        {/* Sticky video container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Video — always playing in background */}
          <video
            src="/lugmatic_3d1.mp4"
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.55) saturate(1.2)" }}
          />

          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* ─── Overlay 1: Hero text (Asymmetric Left) ─── */}
          <motion.div
            style={{ opacity: heroTextOpacity, y: heroTextY }}
            className="absolute inset-0 flex items-center z-10"
          >
            <div className="max-w-7xl mx-auto px-6 w-full lg:pr-[20vw]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="flex items-center mb-8"
              >
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[11px] font-medium tracking-wider uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  Live in the lab: Dancehall &middot; Reggae &middot; Afrobeats
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

          {/* ─── Overlay 2: Platform stats (Asymmetric Bento-ish) ─── */}
          <motion.div
            style={{ opacity: heroStatsOpacity, y: heroStatsY }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_1fr] gap-6 items-end">
                {[
                  { value: "50K+", label: "Active Listeners", icon: Users, color: "text-green-400", size: "p-10 md:col-span-1" },
                  { value: "10K+", label: "Tracks", icon: Music2, color: "text-emerald-400", size: "p-8 md:col-span-1" },
                  { value: "500+", label: "Artists Worldwide", icon: Globe, color: "text-teal-400", size: "p-8 md:col-span-1" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.1 }}
                    className={`${stat.size} rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-zinc-800/40 transition-all group relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                      <stat.icon className={`w-12 h-12 ${stat.color}`} />
                    </div>
                    <p className="text-5xl md:text-6xl font-bold tracking-tighter mb-2">{stat.value}</p>
                    <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── Overlay 3: CTA (Premium Asymmetric) ─── */}
          <motion.div
            style={{ opacity: heroCTAOpacity, y: heroCTAY }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-12 text-left">
              <div className="flex-1">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="text-6xl md:text-8xl font-bold tracking-tight italic mb-8 leading-[0.9]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  <span className="text-green-500 underline decoration-green-500/20 underline-offset-8">YOUR MUSIC.</span>
                  <br />
                  YOUR STAGE.
                </motion.h2>
                <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
                  Join thousands of artists already growing their career on Lugmatic. 
                  Full ownership. Direct earnings. Total control.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {isAuthenticated ? (
                    <Link to={dashboardPath}>
                      <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-16 px-12 text-lg rounded-full shadow-[0_20px_50px_-15px_rgba(34,197,94,0.4)] hover:shadow-[0_30px_60px_-15px_rgba(34,197,94,0.6)] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center gap-3">
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/login">
                        <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-16 px-12 text-lg rounded-full shadow-[0_20px_50px_-15px_rgba(34,197,94,0.4)] hover:shadow-[0_30px_60px_-15px_rgba(34,197,94,0.6)] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center gap-3">
                          Start Growing Free
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </Link>
                      <Link to="/login">
                        <button className="h-16 px-12 text-lg rounded-full border border-white/15 hover:bg-white/5 text-zinc-300 backdrop-blur-md hover:-translate-y-1 active:scale-[0.98] transition-all">
                          Log In
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden lg:block w-1/3 aspect-square rounded-[3rem] border border-white/10 bg-zinc-900/40 backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-50" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Music2 className="w-32 h-32 text-green-500/20 group-hover:scale-110 transition-transform duration-700" />
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SHOWCASE: SECOND SCROLL-DRIVEN VIDEO ═══ */}
      <section ref={showcaseContainerRef} className="relative" style={{ height: "220vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Video with Parallax */}
          <motion.video
            ref={showcaseVideoRef}
            src="/lugmatic_3d2.mp4"
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              filter: "brightness(0.5) saturate(1.3)",
              scale: showcaseVideoScale,
              y: showcaseVideoY
            }}
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

      {/* ═══ FEATURES: BENTO GRID ═══ */}
      <section id="features" className="py-24 relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(34,197,94,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="max-w-2xl"
            >
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-green-500 mb-4">The Infrastructure</p>
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter italic leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                EVERYTHING <span className="text-zinc-500">YOU</span> NEED
              </h2>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              className="text-zinc-500 max-w-sm text-lg leading-relaxed font-light"
            >
              A high-performance ecosystem designed specifically for the needs of modern Caribbean music creators.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
            {/* Bento Card 1: Live Sessions (Large) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="md:col-span-2 md:row-span-2 p-10 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative group overflow-hidden"
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-8 border border-green-500/20 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-500">
                  <Radio className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Live Artist Sessions</h3>
                <p className="text-zinc-500 text-lg leading-relaxed flex-1">Watch your favorite artists perform live. Interact, request songs, and send gifts in real-time with zero latency.</p>
                <div className="mt-8 flex items-center gap-2">
                   <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Live Engine Active</span>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors duration-1000" />
            </motion.div>

            {/* Bento Card 2: Support (Medium) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              className="md:col-span-2 md:row-span-1 p-10 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative group overflow-hidden"
            >
              <div className="relative z-10 flex items-start gap-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <Gift className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Direct Artist Support</h3>
                  <p className="text-zinc-500 leading-relaxed">Gift artists directly. Higher payouts mean more music from creators you love. Transparent 95/5 share.</p>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 3: Discovery (Small) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
              className="md:col-span-1 md:row-span-1 p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative group overflow-hidden"
            >
              <Sparkles className="w-8 h-8 text-amber-500/40 mb-6 group-hover:text-amber-500 group-hover:scale-110 transition-all" />
              <h3 className="text-xl font-bold mb-2">Discovery</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Find emerging talent before they blow up. Curated by humans, not algorithms.</p>
            </motion.div>

            {/* Bento Card 4: Audio (Small) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              className="md:col-span-1 md:row-span-1 p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative group overflow-hidden"
            >
              <Headphones className="w-8 h-8 text-blue-500/40 mb-6 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
              <h3 className="text-xl font-bold mb-2">Hi-Fi Audio</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Lossless quality streaming. Experience the true bass energy.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING: PREMIUM CARDS ═══ */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-[10px] font-bold tracking-[0.4em] uppercase text-green-500 mb-6"
            >
              Economics
            </motion.p>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CHOOSE YOUR <span className="text-zinc-500">STAGE</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.1 }}
                className={`group relative p-10 rounded-[2.5rem] border flex flex-col transition-all duration-700 ${plan.highlight
                  ? "bg-zinc-900/60 border-green-500/30 shadow-[0_40px_100px_-20px_rgba(34,197,94,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] py-16"
                  : "bg-zinc-900/30 border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-green-500 text-black text-[10px] font-bold tracking-[.25em] uppercase shadow-[0_10px_20px_-5px_rgba(34,197,94,0.4)]">
                    Most Active
                  </div>
                )}
                
                <div className="mb-10">
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{plan.description}</p>
                  <div className="flex items-baseline gap-2 mt-8">
                    <span className="text-6xl font-bold tracking-tighter">${plan.price}</span>
                    <span className="text-zinc-500 text-sm font-medium">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-4 group/item">
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-green-500/20 transition-colors">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <span className="text-sm text-zinc-400 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to={plan.href} className="mt-auto">
                  <button
                    className={`w-full h-16 text-sm font-bold rounded-2xl transition-all active:scale-[0.98] ${plan.highlight
                      ? "bg-green-500 text-black hover:bg-green-400 shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)]"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      }`}
                  >
                    {plan.buttonText}
                  </button>
                </Link>
                
                {/* Perpetual subtle shine effect on highlight card */}
                {plan.highlight && (
                  <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] overflow-hidden">
                    <motion.div 
                      animate={{ x: ['100%', '-100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER: ULTRA CLEAN ═══ */}
      <footer className="py-16 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 p-2 bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <img src={logo} alt="Lugmatic" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-bold tracking-tight italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  LUGMATIC
                </span>
              </div>
              <p className="text-zinc-500 max-w-xs text-sm leading-relaxed">
                The high-performance platform for Caribbean music creators. Built for the culture, powered by tech.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold tracking-[.3em] uppercase text-zinc-500">Social</span>
                <a href="#" className="text-sm text-zinc-400 hover:text-green-400 transition-colors">Twitter</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-green-400 transition-colors">Instagram</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-green-400 transition-colors">TikTok</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold tracking-[.3em] uppercase text-zinc-500">Legal</span>
                <a href="#" className="text-sm text-zinc-400 hover:text-green-400 transition-colors">Privacy</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-green-400 transition-colors">Terms</a>
              </div>
              <div className="flex flex-col gap-4 hidden md:flex">
                <span className="text-[10px] font-bold tracking-[.3em] uppercase text-zinc-500">Support</span>
                <a href="#" className="text-sm text-zinc-400 hover:text-green-400 transition-colors">Help Center</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-green-400 transition-colors">Contact</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] font-medium text-zinc-600 tracking-wider">
              &copy; {new Date().getFullYear()} LUGMATIC MUSIC GROUP. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[11px] font-bold text-zinc-800 tracking-tighter">
              MADE BY ARTISTS FOR ARTISTS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
