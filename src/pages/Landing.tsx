import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useMotionValue, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Headphones, Radio, Gift, Sparkles, ArrowRight, Zap, Users, DollarSign, TrendingUp, Apple, Smartphone, Menu, X, Shield, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import logo from '../assets/logo.png';
import { useAuth } from "../hooks/useAuth";
import mobileMockup from '../assets/mobile_mockup.png';


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

  /* ─── Refs ─── */
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const showcaseContainerRef = useRef<HTMLDivElement>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement>(null);

  /* ─── 3D MOUSE FOLLOW EFFECT ─── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const shouldReduceMotion = useReducedMotion();

  /* ─── Hero Scroll Logic (300vh) ─── */
  const { scrollYProgress: heroScrollRaw } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"]
  });
  const heroProgress = useSpring(heroScrollRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const heroTextOpacity = useTransform(heroProgress, [0, 0.1, 0.3, 0.35], [0, 1, 1, 0]);
  const heroTextY = useTransform(heroProgress, [0, 0.1, 0.3, 0.35], [shouldReduceMotion ? 0 : 30, 0, 0, shouldReduceMotion ? 0 : -50]);
  const heroTextScale = useTransform(heroProgress, [0, 0.1, 0.3, 0.35], [shouldReduceMotion ? 1 : 0.95, 1, 1, shouldReduceMotion ? 1 : 1.05]);

  const heroStatsOpacity = useTransform(heroProgress, [0.35, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const heroStatsY = useTransform(heroProgress, [0.35, 0.45, 0.6, 0.65], [shouldReduceMotion ? 0 : 40, 0, 0, shouldReduceMotion ? 0 : -40]);

  const heroCTAOpacity = useTransform(heroProgress, [0.65, 0.75, 1], [0, 1, 1]);
  const heroCTAY = useTransform(heroProgress, [0.65, 0.75, 1], [shouldReduceMotion ? 0 : 30, 0, 0]);

  /* ─── Showcase Scroll Logic ─── */
  const showcaseProgress = useScrollVideo(showcaseContainerRef, showcaseVideoRef);
  const showcase1Opacity = useTransform(showcaseProgress, [0, 0.1, 0.3, 0.35], [0, 1, 1, 0]);
  const showcase1Y = useTransform(showcaseProgress, [0, 0.1, 0.3, 0.35], [shouldReduceMotion ? 0 : 50, 0, 0, shouldReduceMotion ? 0 : -50]);
  const showcase1Scale = useTransform(showcaseProgress, [0, 0.1, 0.3, 0.35], [shouldReduceMotion ? 1 : 0.95, 1, 1, shouldReduceMotion ? 1 : 1.05]);

  const showcase2Opacity = useTransform(showcaseProgress, [0.35, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const showcase2Y = useTransform(showcaseProgress, [0.35, 0.45, 0.6, 0.65], [shouldReduceMotion ? 0 : 50, 0, 0, shouldReduceMotion ? 0 : -50]);

  const showcase3Opacity = useTransform(showcaseProgress, [0.65, 0.75, 1], [0, 1, 1]);
  const showcase3Y = useTransform(showcaseProgress, [0.65, 0.75, 1], [shouldReduceMotion ? 0 : 40, 0, 0]);

  const showcaseVideoScale = useTransform(showcaseProgress, [0, 1], [1.0, shouldReduceMotion ? 1.0 : 1.4]);
  const showcaseVideoY = useTransform(showcaseProgress, [0, 1], ["0%", shouldReduceMotion ? "0%" : "10%"]);

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
      <nav 
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-zinc-950/60 border-b border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        style={{ willChange: "backdrop-filter" }}
      >
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
            <a href="#apply" className="hover:text-white transition-colors">Apply</a>
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
                    Join the Roster
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

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-16 left-0 w-full bg-black/95 border-b border-white/10 backdrop-blur-xl p-6"
            >
              <div className="flex flex-col gap-6">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg text-zinc-400 hover:text-white transition-colors font-medium">Features</a>
                <a href="#apply" onClick={() => setMobileMenuOpen(false)} className="text-lg text-zinc-400 hover:text-white transition-colors font-medium">Apply</a>
                <div className="h-px bg-white/10 my-2" />
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg text-zinc-400 hover:text-white transition-colors font-medium">Log in</Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold h-12 rounded-full text-base transition-all">
                    Join the Roster
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══ HERO: 3D TILT & TYPOGRAPHY SCROLL ═══ */}
      <section 
        ref={heroContainerRef} 
        className="relative perspective-2000" 
        style={{ height: "120vh", willChange: "transform" }}
        onMouseMove={shouldReduceMotion ? undefined : handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Background Video with Tilt */}
          <motion.div 
            style={{ 
              rotateX, 
              rotateY,
              scale: 1.05,
              z: 0
            }}
            className="absolute inset-0 w-full h-full transform-gpu"
          >
            <video
              src="/lugmatic_3d1.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
              style={{ filter: "brightness(0.6) saturate(1.2)" }}
            />
          </motion.div>

          {/* Dark Overlay with Tilt */}
          <motion.div 
            style={{ rotateX, rotateY, z: 50 }}
            className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none transform-gpu" 
          />
          
          {/* Ambient following light */}
          <motion.div
            style={{
              x: useTransform(springX, [-0.5, 0.5], ["-50%", "50%"]),
              y: useTransform(springY, [-0.5, 0.5], ["-50%", "50%"]),
              opacity: 0.2
            }}
            className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] bg-green-500/20 rounded-full blur-[150px] pointer-events-none z-10"
          />

          {/* stage 1: Typography */}
          <motion.div
            style={{ 
              opacity: heroTextOpacity, 
              y: heroTextY,
              scale: heroTextScale,
              rotateX: useTransform(springY, [-0.5, 0.5], [10, -10]),
              rotateY: useTransform(springX, [-0.5, 0.5], [-10, 10]),
              z: 100
            }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 transform-gpu"
          >
            <div className="text-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold tracking-[.2em] uppercase text-green-500 mb-6">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  Live in the lab: Dancehall &middot; Reggae &middot; Afrobeats
                </div>
              </motion.div>

              <h1
                className="text-[clamp(3.5rem,8vw,9rem)] font-bold tracking-[-0.04em] leading-[0.85]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="block italic">LUGMATIC FOR</span>
                <span className="block text-green-500 drop-shadow-[0_0_60px_rgba(100,220,80,0.4)] italic">ARTISTS</span>
              </h1>

              <p className="mt-8 text-zinc-300 text-lg md:text-xl max-w-lg mx-auto leading-relaxed font-light">
                Manage your music, engage with fans, and grow your career.
                Advanced analytics, live streaming, and direct fan gifting.
              </p>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-12 flex flex-col items-center gap-2 text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Scroll to explore</span>
              </motion.div>
            </div>
          </motion.div>

          {/* stage 2: Stats */}
          <motion.div
            style={{ 
              opacity: heroStatsOpacity, 
              y: heroStatsY,
              rotateX: useTransform(springY, [-0.5, 0.5], [5, -5]),
              rotateY: useTransform(springX, [-0.5, 0.5], [-5, 5]),
              z: 80
            }}
            className="absolute inset-0 flex items-center justify-center z-20 transform-gpu"
          >
            <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
              {[
                { label: "Active Artists", value: "10K+", icon: Users },
                { label: "Total Revenue", value: "$4.5M+", icon: DollarSign },
                { label: "Fans Engaged", value: "2.8M+", icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="group">
                  <stat.icon className="w-10 h-10 text-green-500 mx-auto mb-6 opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                  <p className="text-7xl md:text-9xl font-bold tracking-tighter italic mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stat.value}</p>
                  <p className="text-zinc-500 text-sm font-bold tracking-[0.2em] uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* stage 3: CTA */}
          <motion.div
            style={{ 
              opacity: heroCTAOpacity, 
              y: heroCTAY,
              rotateX,
              rotateY,
              z: 150
            }}
            className="absolute inset-0 flex items-center justify-center z-10 transform-gpu"
          >
            <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
              <motion.h2
                className="text-7xl md:text-[10rem] font-bold tracking-tighter italic mb-10 leading-[0.8]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                COMMAND YOUR <br />
                <span className="text-green-500 drop-shadow-[0_0_80px_rgba(34,197,94,0.3)]">STAGE.</span>
              </motion.h2>
              <p className="text-zinc-400 text-xl md:text-2xl mb-14 max-w-2xl leading-relaxed">
                The high-performance platform for Caribbean music creators. 
                Stream, engage, and earn on the go.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {isAuthenticated ? (
                  <Link to={dashboardPath}>
                    <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-16 w-64 md:w-72 text-lg rounded-full shadow-[0_20px_50px_-15px_rgba(34,197,94,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                      Go to Studio
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-16 w-64 md:w-72 text-lg rounded-full shadow-[0_20px_50px_-15px_rgba(34,197,94,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                        Join the Roster
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </Link>
                    <a href="#download">
                      <button className="h-16 w-64 md:w-72 text-lg rounded-full border border-white/10 hover:bg-white/5 text-zinc-300 backdrop-blur-md hover:-translate-y-1 transition-all">
                        Download Mobile App
                      </button>
                    </a>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SHOWCASE: SCROLL-DRIVEN VIDEO ═══ */}
      <section 
        ref={showcaseContainerRef} 
        className="relative" 
        style={{ height: "110vh", willChange: "transform" }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

          {/* slide 1 */}
          <motion.div
            style={{ 
              opacity: showcase1Opacity, 
              y: showcase1Y,
              scale: showcase1Scale,
              rotateX: useTransform(springY, [-0.5, 0.5], [5, -5]),
              rotateY: useTransform(springX, [-0.5, 0.5], [-5, 5]),
              z: 50
            }}
            className="absolute inset-0 flex items-center justify-center z-10 transform-gpu"
          >
            <div className="text-center max-w-3xl px-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                <Zap className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-5xl md:text-7xl font-bold tracking-tighter italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                BUILT FOR THE CULTURE
              </h3>
              <p className="text-zinc-400 text-xl mt-6 max-w-md mx-auto leading-relaxed">
                From Kingston to the world stage — a platform designed for Caribbean music first.
              </p>
            </div>
          </motion.div>

          {/* slide 2 */}
          <motion.div
            style={{ 
              opacity: showcase2Opacity, 
              y: showcase2Y,
              rotateX: useTransform(springY, [-0.5, 0.5], [3, -3]),
              rotateY: useTransform(springX, [-0.5, 0.5], [-3, 3]),
              z: 40
            }}
            className="absolute inset-0 flex items-center z-10 transform-gpu"
          >
            <div className="max-w-5xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: TrendingUp, title: "Real-Time Analytics", desc: "Track streams, engagement, and revenue as it happens." },
                { icon: DollarSign, title: "Direct Earnings", desc: "Fans gift you directly. Higher payouts, no middlemen." },
                { icon: Shield, title: "Artist Control", desc: "You own your content. Full control over releases." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-white/10 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-all">
                    <item.icon className="w-5 h-5 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* slide 3 */}
          <motion.div
            style={{ 
              opacity: showcase3Opacity, 
              y: showcase3Y,
              rotateX,
              rotateY,
              z: 60
            }}
            className="absolute inset-0 flex items-center justify-center z-10 transform-gpu"
          >
            <div className="text-center max-w-2xl px-6">
              <h3 className="text-5xl md:text-7xl font-bold tracking-tighter italic mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="text-green-500">GO LIVE.</span> GET GIFTED.
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { val: "$12K+", lbl: "Daily Gifts" },
                  { val: "1.2K", lbl: "Live Daily" },
                  { val: "99%", lbl: "Payout Rate" },
                ].map((s) => (
                  <div key={s.lbl} className="px-8 py-6 rounded-[1.5rem] bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <p className="text-3xl font-bold text-green-400 tracking-tighter">{s.val}</p>
                    <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-2">{s.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ MOBILE SHOWCASE ═══ */}
      <section id="download" className="py-32 relative bg-zinc-950 overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 text-left">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold tracking-[.2em] uppercase text-green-500 mb-8">
                  Available Now
                </div>
                <h2 className="text-6xl md:text-8xl font-bold tracking-tighter italic mb-8 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  LUGMATIC STUDIO <br />
                  <span className="text-zinc-500 italic">IN YOUR POCKET</span>
                </h2>
                <p className="text-zinc-400 text-xl mb-12 leading-relaxed font-light max-w-xl">
                  Go live from your mobile device and interact with your fans anywhere. 
                  High-fidelity streaming, instant gifting, and real-time community engagement.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="https://apps.apple.com/app/lugmatic-studio" target="_blank" rel="noopener noreferrer" className="h-16 px-8 rounded-2xl bg-white text-black flex items-center gap-4 hover:bg-zinc-200 transition-all shadow-xl">
                    <Apple className="w-8 h-8" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">App Store</p>
                      <p className="text-xl font-bold -mt-1">Download</p>
                    </div>
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.lugmatic.studio" target="_blank" rel="noopener noreferrer" className="h-16 px-8 rounded-2xl bg-zinc-900 border border-white/10 text-white flex items-center gap-4 hover:bg-zinc-800 transition-all shadow-xl">
                    <Smartphone className="w-8 h-8 text-green-500" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Google Play</p>
                      <p className="text-xl font-bold -mt-1">Get it on</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
            <div className="flex-1 relative">
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10 w-full max-w-[420px] mx-auto"
                style={{ willChange: "transform" }}
              >
                <img src={mobileMockup} alt="Mobile App" className="w-full h-auto drop-shadow-[0_40px_100px_rgba(0,0,0,0.8)]" />
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-8 top-1/4 px-6 py-4 rounded-[1.5rem] bg-green-500 text-black shadow-2xl z-20 hidden md:block"
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">Live Viewers</p>
                  <p className="text-2xl font-bold tracking-tighter">41,200+</p>
                </motion.div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-500/10 rounded-full blur-[150px] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES BENTO ═══ */}
      <section id="features" className="py-32 relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(34,197,94,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-green-500 mb-6">The Infrastructure</p>
              <h2 className="text-7xl md:text-9xl font-bold tracking-tighter italic leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                EVERYTHING <span className="text-zinc-500">YOU</span> NEED
              </h2>
            </motion.div>
            <motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-zinc-500 max-w-sm text-xl font-light">
              A high-performance ecosystem designed specifically for Caribbean music creators.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 md:row-span-2 p-12 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 relative group overflow-hidden">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-10 border border-green-500/20 group-hover:scale-110 transition-all">
                  <Radio className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-4xl font-bold mb-6 tracking-tight">Live Artist Sessions</h3>
                <p className="text-zinc-500 text-lg leading-relaxed flex-1">Perform live, interact with fans, and receive gifts in real-time with zero latency.</p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 px-4 py-2 rounded-full border border-white/5">Live Engine Active</span>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 md:row-span-1 p-12 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 group flex items-start gap-10">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all flex-shrink-0">
                <Gift className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Direct Support</h3>
                <p className="text-zinc-500 text-lg leading-relaxed">Fans support you directly. Transparent 95/5 payout share.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-1 md:row-span-1 p-10 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 group">
              <Sparkles className="w-10 h-10 text-amber-500/40 mb-10 group-hover:text-amber-500 transition-all" />
              <h3 className="text-2xl font-bold mb-4">Discovery</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">Find emerging talent before they blow up.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-1 md:row-span-1 p-10 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 group">
              <Headphones className="w-10 h-10 text-blue-500/40 mb-10 group-hover:text-blue-500 transition-all" />
              <h3 className="text-2xl font-bold mb-4">Hi-Fi Audio</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">Lossless quality streaming across all devices.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ APPLY CTA ═══ */}
      <section id="apply" className="py-32 relative overflow-hidden bg-black text-center">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-green-500 mb-8">Join the Culture</p>
            <h2 className="text-7xl md:text-9xl font-bold tracking-tighter italic mb-12" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              READY TO <span className="text-green-500">ASCEND?</span>
            </h2>
            <p className="text-zinc-400 text-xl mb-16 max-w-2xl mx-auto font-light leading-relaxed">
              Submit your artist profile for review. Our team hand-selects creators for the Lugmatic roster to ensure the highest quality experience for the Caribbean community.
            </p>
            <Link to="/login">
              <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-20 px-16 text-xl rounded-full shadow-[0_20px_60px_-20px_rgba(34,197,94,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 mx-auto">
                Submit Your Application
                <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-24 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-16 mb-24">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <img src={logo} alt="Lugmatic" className="h-12 w-auto" />
                <span className="text-3xl font-bold italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>LUGMATIC</span>
              </div>
              <p className="text-zinc-500 max-w-xs text-lg font-light leading-relaxed">Built for the culture, powered by high-performance technology. Empowering the next generation of Caribbean artists.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
              <div className="flex flex-col gap-5">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500">Connect</span>
                <a href="#" className="text-zinc-400 hover:text-green-500 transition-colors">Instagram</a>
                <a href="#" className="text-zinc-400 hover:text-green-500 transition-colors">TikTok</a>
                <a href="#" className="text-zinc-400 hover:text-green-500 transition-colors">Twitter</a>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500">Legal</span>
                <a href="#" className="text-zinc-400 hover:text-green-500 transition-colors">Privacy</a>
                <a href="#" className="text-zinc-400 hover:text-green-500 transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] font-bold tracking-widest text-zinc-600 gap-6 uppercase">
            <p>&copy; {new Date().getFullYear()} LUGMATIC MUSIC GROUP. ALL RIGHTS RESERVED.</p>
            <p className="text-zinc-800">Designed for the world stage</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
