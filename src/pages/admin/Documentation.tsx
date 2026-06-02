import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Music2, Users, Disc, Shield, CreditCard, 
  Settings, Zap, ShieldCheck, HelpCircle, Laptop,
  Cpu, FileText, Gift, Star, Radio
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  content: React.ReactNode;
}

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BookOpen,
      title: 'Lugmatic Ecosystem Documentation',
      description: 'System-wide feature guide and architecture overview for administrators and developers.',
      content: (
        <div className="space-y-8">
          <div className="p-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-3xl shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-4">Welcome to Lugmatic Admin</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed mb-4">
              Lugmatic is a next-generation music streaming, live battle (clash), and virtual economy platform. 
              The platform connects music artists directly with fans through mobile apps, web applications, 
              interactive live stages, and digital currency.
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              As an administrator, you have complete oversight over the music catalog, artist verification, 
              user security, stream moderation, live clash events, and financial payouts. Use this manual 
              to understand each workspace and feature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card border-black/5 dark:border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Laptop className="text-emerald-500" size={20} />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Workspace List</h4>
              <ul className="space-y-2.5 text-zinc-500 text-xs font-semibold">
                <li><span className="text-zinc-700 dark:text-zinc-300">lugmatic-music-webapp</span>: Fan streaming & Mixer website.</li>
                <li><span className="text-zinc-700 dark:text-zinc-300">lugmatic-artist</span>: This react dashboard.</li>
                <li><span className="text-zinc-700 dark:text-zinc-300">lugmatic-api</span>: Express & MongoDB REST backend.</li>
                <li><span className="text-zinc-700 dark:text-zinc-300">lugmatic_flutter</span>: Fan Android & iOS mobile app.</li>
                <li><span className="text-zinc-700 dark:text-zinc-300">lugmatic_artist_studio</span>: Artist broadcast & upload studio.</li>
              </ul>
            </div>

            <div className="premium-card border-black/5 dark:border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Cpu className="text-indigo-500" size={20} />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Tech Stack Overview</h4>
              <ul className="space-y-2.5 text-zinc-500 text-xs font-semibold">
                <li><span className="text-zinc-700 dark:text-zinc-300">Database</span>: MongoDB with Mongoose object modeling.</li>
                <li><span className="text-zinc-700 dark:text-zinc-300">Streaming API</span>: LiveKit WebRTC for low latency audio broadcast.</li>
                <li><span className="text-zinc-700 dark:text-zinc-300">Payment Processing</span>: Stripe Payment Intents & Webhooks.</li>
                <li><span className="text-zinc-700 dark:text-zinc-300">Cloud Storage</span>: Amazon S3 for music files and images.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'catalog',
      label: 'Catalog Management',
      icon: Music2,
      title: 'Catalog, Songs & Albums',
      description: 'Manage release pipelines, audio uploads, genres, and metadata.',
      content: (
        <div className="space-y-8">
          <div className="premium-card border-black/5 dark:border-white/5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <Music2 size={18} className="text-emerald-500" />
              Song Moderation Flow
            </h3>
            <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                When artists upload new tracks via their <span className="text-zinc-200">Artist Studio App</span>, the files are uploaded to S3 and stored in MongoDB with <code className="px-2 py-0.5 bg-zinc-900 border border-black/5 dark:border-white/5 text-emerald-400 rounded">isApproved: false</code>.
              </p>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-1">Upload & Queue</h4>
                  <p className="text-zinc-500 font-medium">Songs appear in the Admin Portal under "Song Management" with a "Pending Approval" tag.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-1">Metadata Review</h4>
                  <p className="text-zinc-500 font-medium">Verify that the title, artist credit, genre, cover artwork, and duration are correctly formatted and appropriate.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-1">Approve or Flag</h4>
                  <p className="text-zinc-500 font-medium">Click "Approve" (ShieldCheck icon) to publish the track globally, making it available for fans on the mobile and web clients.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card border-black/5 dark:border-white/5">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Disc size={16} className="text-indigo-400" /> Albums & EPs
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Albums link multiple song tracks together. Admins can create and edit albums directly, assign them to artists, configure genres, and upload high-resolution cover artwork which will be automatically resized and optimized.
              </p>
            </div>
            <div className="premium-card border-black/5 dark:border-white/5">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" /> Genre Classifications
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Genres organize songs into logical browse sections on the fan home feed. Use the "Genre Management" screen to add, rename, or assign distinct color accents to genres.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'users',
      label: 'User & Artist Moderation',
      icon: Users,
      title: 'Accounts, Roles & Verifications',
      description: 'Manage administrator roles, user accounts, and artist onboarding validation.',
      content: (
        <div className="space-y-8">
          <div className="premium-card border-black/5 dark:border-white/5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <ShieldCheck size={18} className="text-emerald-500" />
              Role Permissions Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-zinc-500 uppercase tracking-widest font-bold">
                    <th className="py-4">Role</th>
                    <th className="py-4">Permissions</th>
                    <th className="py-4">Platform Interface Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-zinc-600 dark:text-zinc-400">
                  <tr>
                    <td className="py-4 font-bold text-indigo-400 uppercase tracking-wide">Super Admin</td>
                    <td className="py-4">All settings, financial controls, payout execution, role edits, data wipes.</td>
                    <td className="py-4">Admin Dashboard (Full Access)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-purple-400 uppercase tracking-wide">Admin</td>
                    <td className="py-4">Catalog curation, user suspensions, artist verification, comments moderate.</td>
                    <td className="py-4">Admin Dashboard (Moderate Access)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-emerald-400 uppercase tracking-wide">Artist</td>
                    <td className="py-4">Upload music, create albums, start low-latency audio stream, receive gifts.</td>
                    <td className="py-4">Artist Studio App, Fan App</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">User (Fan)</td>
                    <td className="py-4">Listen to catalog, purchase coins, join streams, send gifts, vote in clashes.</td>
                    <td className="py-4">Fan Webapp, Fan Mobile App</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="premium-card border-black/5 dark:border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-indigo-400" /> Artist Verification Protocol
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              To keep the platform safe, artists must upload Government IDs (passport or license) and a Tax Registration Number (TRN) during onboarding. Admins review these documents on the <span className="text-zinc-200">"Approvals"</span> page. 
              Once verified, the admin toggles the verification status, adding the green check badge to the artist profile across the mobile app and fan webapp.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'streams',
      label: 'Clashes & Live Streams',
      icon: Radio,
      title: 'Low Latency Audio Battles',
      description: 'Manage LiveKit rooms, real-time broadcasts, and clash tournaments.',
      content: (
        <div className="space-y-8">
          <div className="premium-card border-black/5 dark:border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-3">
              <Radio size={18} className="text-emerald-500 animate-pulse" /> LiveKit Infrastructure
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              When an artist clicks "Go Live" in the <span className="text-zinc-200">Artist Studio App</span>, the system connects to a LiveKit Server instance to open an audio publishing channel. 
              Fans connecting via the mobile/web applications join as sub-receivers. The backend registers the active stream details and updates the status to <code className="px-2 py-0.5 bg-zinc-900 border border-black/5 dark:border-white/5 text-emerald-400 rounded">live</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card border-black/5 dark:border-white/5 space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Live Battle (Clashes)</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Clashes are scheduled dual-stream events where two DJs/Artists match up. Admins schedule clashes, designate rounds, and set voting weights. Fans vote inside the player stage in real-time, and scores are logged directly to MongoDB.
              </p>
            </div>
            <div className="premium-card border-black/5 dark:border-white/5 space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Stream Recording (Egress)</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Completed broadcasts are recorded automatically via LiveKit Egress. The backend process captures the audio stream, stores it as an MP4/MP3 in the S3 bucket, and publishes it as a replay track for fans.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'economy',
      label: 'Virtual Economy',
      icon: CreditCard,
      title: 'Coins, Gifting & Payouts',
      description: 'Platform monetization, Stripe integration, and payment settlements.',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card border-black/5 dark:border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Gift className="text-amber-500" size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Coin Purchases</h4>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
                Fans purchase virtual coins using credit cards via Stripe. Backend webhooks listen for <code className="text-amber-500">payment_intent.succeeded</code> to credit coin balances.
              </p>
            </div>

            <div className="premium-card border-black/5 dark:border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Star className="text-emerald-500" size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Digital Gifting</h4>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
                Fans send animated 2D/3D digital gifts to live streamers. The gift value in coins is deducted from the fan's balance and transferred to the artist's pending earnings.
              </p>
            </div>

            <div className="premium-card border-black/5 dark:border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <CreditCard className="text-indigo-500" size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Artist Payouts</h4>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
                Artists request payouts of their earnings. Admins verify their payout details (PayPal email, local bank transfer details, or Jamdex wallet) and complete the transactions.
              </p>
            </div>
          </div>

          <div className="premium-card border-black/5 dark:border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Gifts Customization</h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Admins can define new gifts under <span className="text-zinc-200">"Gift Management"</span> by setting the title, coin cost, active status, image thumbnail, and optional Lottie animation files. This updates the store list in real-time.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'moderation',
      label: 'Security & Settings',
      icon: Shield,
      title: 'Moderation & Global Configurations',
      description: 'Maintain platform health, content guidelines, and system variables.',
      content: (
        <div className="space-y-8">
          <div className="premium-card border-black/5 dark:border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="text-rose-500 animate-pulse" size={18} /> Content Moderation
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Fan comments on tracks, live chat messages, and artist posts can be moderated here. Use the "Comment Management" or "Content Moderation" tabs to search flagged content, check the author history, and permanently remove items violating terms of service.
            </p>
          </div>

          <div className="premium-card border-black/5 dark:border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="text-zinc-600 dark:text-zinc-400" size={18} /> Global Settings variables
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Use "System Settings" to configure:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500 text-xs font-semibold pl-2">
              <li><span className="text-zinc-700 dark:text-zinc-300">Revenue Split Percentage</span>: Admin commission share on coin sales.</li>
              <li><span className="text-zinc-700 dark:text-zinc-300">Minimum Payout Limit</span>: The threshold in USD/Coins for requesting payouts.</li>
              <li><span className="text-zinc-700 dark:text-zinc-300">LiveKit Server URL & Api Keys</span>: Active endpoints for audio streaming rooms.</li>
              <li><span className="text-zinc-700 dark:text-zinc-300">Maintenance Mode</span>: Toggling maintenance status to block user transactions during schema updates.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="space-y-12 pb-24">
      {/* Page Title Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">System Documentation</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Resources</span>
          </div>
        </div>
        <p className="text-zinc-500 text-xs font-semibold ml-1">Comprehensive usage guide and technical documentation for the platform.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Left Side Tab Navigation */}
        <div className="w-full xl:w-80 shrink-0">
          <div className="premium-card border-black/5 dark:border-white/5 !p-3 flex flex-col gap-2 bg-white dark:bg-[#0a0a0a]">
            <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 mb-2">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Documentation Topics</p>
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'text-white bg-white/5 border border-white/10 shadow-lg' 
                      : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-zinc-600'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Content Display */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* Content Header Card */}
              <div className="premium-card border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-2 leading-none">{currentTab.title}</h2>
                <p className="text-zinc-500 text-xs font-semibold">{currentTab.description}</p>
              </div>

              {/* Dynamic Content */}
              <div>
                {currentTab.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
