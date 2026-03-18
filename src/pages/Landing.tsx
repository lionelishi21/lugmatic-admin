import { motion, useScroll, useTransform } from "framer-motion";
import { Check, Headphones, Radio, Gift, Sparkles, ArrowRight, ChevronDown, Music, Music2, Mic2, Menu, X, TrendingUp, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
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

const featuresList = [
  { icon: Headphones, label: "Hi-Fi Streaming", desc: "Lossless audio quality for every track" },
  { icon: Radio, label: "Live Sessions", desc: "Watch artists perform in real-time" },
  { icon: Gift, label: "Gift Artists", desc: "Support creators with direct gifts" },
  { icon: Sparkles, label: "Discover Music", desc: "Find emerging talent before they blow up" },
];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/artist';
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black overflow-x-hidden">
      {/* Nav */}
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
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
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

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(100,220,80,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(140,80,220,0.08),transparent_50%)]" />
          <motion.div
            style={{ y: heroY }}
            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"
          />

          {/* Dynamic floating music elements */}
          {[
            { x: "8%", y: "20%", size: 28, delay: 0, duration: 6 },
            { x: "88%", y: "30%", size: 22, delay: 1.5, duration: 7 },
            { x: "15%", y: "70%", size: 18, delay: 3, duration: 5.5 },
            { x: "78%", y: "75%", size: 24, delay: 0.8, duration: 6.5 },
            { x: "45%", y: "15%", size: 16, delay: 2.2, duration: 8 },
            { x: "92%", y: "55%", size: 20, delay: 4, duration: 7.5 },
            { x: "5%", y: "45%", size: 14, delay: 1, duration: 5 },
            { x: "70%", y: "12%", size: 26, delay: 3.5, duration: 6.8 },
          ].map((note, i) => (
            <motion.div
              key={`note-${i}`}
              className="absolute text-green-500/[0.08] pointer-events-none"
              style={{ left: note.x, top: note.y }}
              animate={{
                y: [0, -30, 0, 20, 0],
                x: [0, 15, -10, 5, 0],
                rotate: [0, 15, -10, 5, 0],
                opacity: [0.06, 0.12, 0.08, 0.14, 0.06],
              }}
              transition={{
                duration: note.duration,
                repeat: Infinity,
                delay: note.delay,
                ease: "easeInOut",
              }}
            >
              {i % 3 === 0 ? (
                <Music style={{ width: note.size, height: note.size }} />
              ) : i % 3 === 1 ? (
                <Music2 style={{ width: note.size, height: note.size }} />
              ) : (
                <Mic2 style={{ width: note.size, height: note.size }} />
              )}
            </motion.div>
          ))}

          {/* Animated equalizer bars */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[3px] h-32 opacity-[0.04] pointer-events-none overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
              <motion.div
                key={`eq-${i}`}
                className="w-[3px] bg-green-500 rounded-full origin-bottom"
                animate={{
                  scaleY: [
                    0.2 + Math.random() * 0.3,
                    0.5 + Math.random() * 0.5,
                    0.1 + Math.random() * 0.4,
                    0.6 + Math.random() * 0.4,
                    0.2 + Math.random() * 0.3,
                  ],
                }}
                transition={{
                  duration: 1.2 + Math.random() * 0.8,
                  repeat: Infinity,
                  delay: Math.random() * 1.5,
                  ease: "easeInOut",
                }}
                style={{ height: 80 + Math.random() * 40 }}
              />
            ))}
          </div>
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto px-6 w-full"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">
            {/* Left - Text Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center mb-8"
              >
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[12px] text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Dancehall &middot; Reggae &middot; Afrobeats
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-[clamp(3.5rem,8vw,7.5rem)] font-bold tracking-[-0.04em] leading-[0.9]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="block italic">LUGMATIC FOR</span>
                <span className="block text-green-500 drop-shadow-[0_0_40px_rgba(100,220,80,0.3)] italic">ARTISTS</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 text-zinc-400 text-lg md:text-xl max-w-lg leading-relaxed font-light"
              >
                Manage your music, engage with fans, and grow your career.
                Advanced analytics, live streaming, and direct fan gifting.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mt-10 flex flex-col sm:flex-row items-start gap-4"
              >
                {isAuthenticated ? (
                  <Link to={dashboardPath}>
                    <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-14 px-10 text-base rounded-full shadow-[0_0_30px_-5px_rgba(100,220,80,0.4)] hover:shadow-[0_0_40px_-5px_rgba(100,220,80,0.6)] transition-all flex items-center gap-2">
                      Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <button className="bg-green-500 hover:bg-green-400 text-black font-bold h-14 px-10 text-base rounded-full shadow-[0_0_30px_-5px_rgba(100,220,80,0.4)] hover:shadow-[0_0_40px_-5px_rgba(100,220,80,0.6)] transition-all flex items-center gap-2">
                        Start Free
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link to="/login">
                      <button className="h-14 px-10 text-base rounded-full border border-white/10 hover:bg-white/5 text-zinc-300 transition-all">
                        Log In
                      </button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-14 flex items-center gap-10 md:gap-14"
              >
                {[
                  { value: "50K+", label: "Listeners" },
                  { value: "10K+", label: "Tracks" },
                  { value: "500+", label: "Artists" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 tracking-wider uppercase">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Hero Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(34,197,94,0.15),transparent_70%)]" />

              <div className="relative w-full max-w-[500px] aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/[0.08] bg-zinc-900/50">
                <div className="w-full h-full bg-gradient-to-br from-green-500/10 via-black to-emerald-500/10 p-8 flex flex-col gap-6">
                  {/* Artist Header Mockup */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-green-500/50 flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-tr from-green-500/20 to-purple-500/20" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-zinc-800 rounded mb-2" />
                      <div className="h-3 w-20 bg-zinc-800/50 rounded" />
                    </div>
                    <motion.div 
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-[10px] font-bold"
                    >
                      LIVE
                    </motion.div>
                  </div>

                  {/* Stats Cards Mockup */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3 h-3 text-zinc-500" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Listeners</p>
                      </div>
                      <p className="text-2xl font-bold">12.4K</p>
                      <p className="text-[10px] text-green-500 mt-1">+12% vs last week</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-3 h-3 text-zinc-500" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Gifts</p>
                      </div>
                      <p className="text-2xl font-bold">$3.2K</p>
                      <p className="text-[10px] text-zinc-400 mt-1">24 new gifts</p>
                    </motion.div>
                  </div>

                  {/* Activity Chart Mockup */}
                  <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Engagement Growth</p>
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="flex-1 flex items-end gap-2 px-2">
                      {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          transition={{ delay: 1.2 + (i * 0.1), duration: 0.8 }}
                          className="flex-1 bg-green-500/20 border-t border-green-500/50 rounded-t-sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Artist Portal Active</p>
                      <p className="text-xs text-zinc-400 truncate">Monitoring performance</p>
                    </div>
                    <div className="flex items-end gap-[2px] h-6">
                      {[0, 1, 2, 3].map((bar) => (
                        <motion.div
                          key={`mini-eq-${bar}`}
                          className="w-[3px] bg-green-500 rounded-full"
                          animate={{
                            height: ["8px", "20px", "12px", "24px", "8px"],
                          }}
                          transition={{
                            duration: 0.8 + bar * 0.15,
                            repeat: Infinity,
                            delay: bar * 0.1,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {featuresList.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-default group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/15 transition-colors">
                  <f.icon className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{f.label}</p>
                  <p className="text-[11px] text-zinc-500 hidden sm:block">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-zinc-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(34,197,94,0.04),transparent)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[12px] tracking-[0.2em] uppercase text-green-500 mb-4">Platform</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              BUILT FOR THE CULTURE
            </h2>
            <p className="text-zinc-500 mt-4 max-w-md mx-auto">
              Everything you need to experience the best of Caribbean music.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
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
            ].map((feature, i) => (
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

      {/* Pricing Section */}
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

      {/* Footer */}
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
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
