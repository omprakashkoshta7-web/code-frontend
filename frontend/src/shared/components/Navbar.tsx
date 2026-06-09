import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, BookOpen, LogOut, LayoutDashboard,
  Star, Shield, Search, Command, Bell, Bookmark, TrendingUp, Gamepad2, ShoppingCart, FileText
} from 'lucide-react';
import { cn } from '@/shared/utils/helpers';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';
import { userStorage } from '@/shared/utils/userStorage';
import { NotificationBell } from '@/features/games/components/NotificationBell';

const navLinks = [
  { label: 'Topics', href: '/topics', icon: BookOpen },
  { label: 'Patterns', href: '/patterns', icon: Star },
  { label: 'Questions', href: '/questions', icon: TrendingUp },
  { label: 'Games', href: '/games', icon: Gamepad2 },
  { label: 'Resume', href: '/resume', icon: FileText },
  { label: 'Leaderboard', href: '/leaderboard', icon: Bell },
  { label: 'Community', href: '/communities', icon: Shield },
  { label: 'Shop', href: '/shop', icon: ShoppingCart },
  { label: 'Plan', href: '/pricing', icon: Bookmark },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const location = useLocation();

  const [user, setUser] = useState<any>(userStorage.getSync());
  useEffect(() => {
    userStorage.get().then(setUser);
    const onChange = () => userStorage.get().then(setUser);
    window.addEventListener('codesprout_user_change', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('codesprout_user_change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/questions/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.slice(0, 5));
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setShowUserMenu(false);
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className={cn(
        'fixed top-4 left-0 right-0 z-50 transition-all duration-300 mx-2 md:mx-4',
        scrolled
          ? 'bg-[#0B1020]/95 shadow-xl shadow-black/40 border border-white/10 rounded-2xl backdrop-blur-xl'
          : 'bg-[#0B1020]/60 backdrop-blur-2xl border border-white/5 rounded-2xl'
      )}>
        <div className="px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <img src="/logo.png" alt="CodeSprout" className="w-10 h-10 rounded-xl object-cover shadow-sm shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow" />
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400">CodeSprout</span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label + link.href}
                    to={link.href}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 lg:px-3.5 py-1.5 rounded-lg text-[12px] lg:text-[13px] font-medium transition-all duration-200 whitespace-nowrap',
                      active
                        ? 'text-white bg-white/10 shadow-sm'
                        : 'text-white/45 hover:text-white hover:bg-white/[0.06]'
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5 transition-colors', active ? 'text-purple-400' : 'text-white/30')} />
                    <span>{link.label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08] -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 hover:border-purple-500/30 hover:text-white hover:bg-purple-500/[0.06] transition-all text-[13px] w-36 lg:w-48 group focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                <Search className="w-3.5 h-3.5 shrink-0 group-hover:text-purple-400 transition-colors" />
                <span className="flex-1 text-left truncate">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-white/30 bg-white/5 rounded border border-white/10">
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              </button>

              {user && <NotificationBell />}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-purple-500/20 shadow-sm shadow-purple-500/20">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-white/40 transition-transform duration-200', showUserMenu && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute right-0 mt-2 w-60 bg-[#111827] rounded-2xl shadow-2xl shadow-black/40 border border-white/10 py-2 z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-white/40 mt-0.5 truncate">{user.email}</p>
                          </div>
                          <div className="p-1.5">
                            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors" onClick={() => setShowUserMenu(false)}>
                              <LayoutDashboard className="w-4 h-4 text-white/40" /> Dashboard
                            </Link>
                            <Link to="/bookmarks" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors" onClick={() => setShowUserMenu(false)}>
                              <Bookmark className="w-4 h-4 text-white/40" /> Bookmarks
                            </Link>
                            {user?.role === 'admin' && (
                              <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors" onClick={() => setShowUserMenu(false)}>
                                <Shield className="w-4 h-4" /> Admin Panel
                              </a>
                            )}
                          </div>
                          <div className="p-1.5 border-t border-white/5">
                            <button
                              onClick={() => { localStorage.removeItem('token'); userStorage.clear(); subscriptionStorage.clearAll(); window.dispatchEvent(new Event('codesprout_user_change')); window.location.href = '/'; }}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-3.5 py-1.5 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all">Log in</Link>
                  <Link to="/login" className="px-4 py-1.5 text-[13px] font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-sm shadow-purple-500/25 hover:shadow-purple-500/40">Sign up</Link>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5 text-white/60" />
              </button>
              {user && <NotificationBell />}
              <button className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="w-5 h-5 text-white/60" /> : <Menu className="w-5 h-5 text-white/60" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="lg:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                <button
                  onClick={() => { setIsOpen(false); setShowSearch(true); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:bg-white/[0.04] transition-colors"
                >
                  <Search className="w-4 h-4" /> Search questions...
                </button>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label + link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        isActive(link.href) ? 'text-white bg-white/10 shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive(link.href) ? 'text-purple-400' : 'text-white/30')} />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-white/5 mt-2 space-y-1">
                  {user ? (
                    <>
                      <div className="px-3 py-2.5">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/bookmarks" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors">
                        <Bookmark className="w-4 h-4" /> Bookmarks
                      </Link>
                      <button onClick={() => { localStorage.removeItem('token'); userStorage.clear(); subscriptionStorage.clearAll(); window.dispatchEvent(new Event('codesprout_user_change')); window.location.href = '/'; }} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-sm shadow-purple-500/25">
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed top-[10%] md:top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[70] px-3 md:px-0"
            >
              <div className="bg-[#111827] rounded-2xl shadow-2xl shadow-purple-500/10 border border-white/10 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
                  <Search className="w-5 h-5 text-white/40 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions, patterns, topics..."
                    className="flex-1 text-sm text-white placeholder-white/30 bg-transparent outline-none"
                  />
                  <kbd className="px-2 py-0.5 text-[10px] font-mono text-white/30 bg-white/5 rounded-lg border border-white/10">ESC</kbd>
                </div>
                {searchResults.length > 0 && (
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {searchResults.map((r: any) => (
                      <Link
                        key={r.id}
                        to={`/questions/${r.slug}`}
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-500/[0.06] hover:border hover:border-purple-500/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                            {r.title?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{r.title}</div>
                            <div className="text-xs text-white/40">{r.topic_name || r.topic}</div>
                          </div>
                        </div>
                        <span className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full',
                          r.difficulty === 'Easy' && 'bg-green-500/10 text-green-400',
                          r.difficulty === 'Medium' && 'bg-yellow-500/10 text-yellow-400',
                          r.difficulty === 'Hard' && 'bg-red-500/10 text-red-400',
                        )}>{r.difficulty}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-white/40">No results found</div>
                )}
                {searchQuery.length < 2 && (
                  <div className="px-4 py-4 text-center text-xs text-white/30">
                    Type to search across 1000+ questions
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
