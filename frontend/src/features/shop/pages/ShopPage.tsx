import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Star, Download, CheckCircle2, X, Loader2, BookOpen, TrendingUp, Users, Crown, ArrowRight, Sparkles, Copy, ExternalLink } from 'lucide-react';
import SEO from '@/shared/components/SEO';
import api from '@/services/api';
import toast from 'react-hot-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const CATEGORIES = [
  { id: 'all' as const, label: 'All', icon: '📚' },
  { id: 'pdf' as const, label: 'PDFs', icon: '📄' },
  { id: 'notes' as const, label: 'Notes', icon: '📝' },
  { id: 'interview-notes' as const, label: 'Interview Notes', icon: '🎤' },
  { id: 'company-specific' as const, label: 'Company Specific', icon: '🏢' },
];

interface ShopProduct {
  id: string; title: string; description: string; category: string;
  price: { amount: number; label: string } | 'free';
  icon: string; color: string; tags: string[];
  popular?: boolean; pages?: number; author?: string; download_url?: string;
}

function formatPrice(p: ShopProduct['price']) {
  if (p === 'free') return { text: 'Free', isFree: true, amount: 0 };
  return { text: p.label, isFree: false, amount: p.amount };
}

export default function ShopPage() {
  const isAuthenticated = !!localStorage.getItem('token');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [cart, setCart] = useState<ShopProduct[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Payment modal state
  const [payProduct, setPayProduct] = useState<ShopProduct | null>(null);
  const [payInfo, setPayInfo] = useState<any>(null);
  const [utr, setUtr] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    api.get('/shop/products')
      .then(res => setProducts(res.data?.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/shop/purchase/my-purchases')
        .then(res => {
          const verified = (res.data?.purchases || [])
            .filter((p: any) => p.status === 'verified')
            .map((p: any) => p.product_id);
          setPurchased(new Set(verified));
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
    }
    if (showFreeOnly) list = list.filter(p => p.price === 'free' || (typeof p.price === 'object' && p.price.amount === 0));
    return list;
  }, [products, activeCategory, search, showFreeOnly]);

  const cartTotal = cart.reduce((s, p) => {
    if (p.price === 'free') return s;
    return s + p.price.amount;
  }, 0);
  const hasPaidItems = cart.some(p => p.price !== 'free' && p.price.amount > 0);

  const toggleCart = (p: ShopProduct) => {
    setCart(prev => prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]);
  };

  const inCart = (id: string) => cart.some(x => x.id === id);

  const startPurchase = async (p: ShopProduct) => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase');
      return;
    }
    try {
      const res = await api.post('/shop/purchase/init', { product_id: p.id });
      setPayProduct(p);
      setPayInfo(res.data);
      setUtr('');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to start purchase');
    }
  };

  const verifyPurchase = async () => {
    if (!utr || utr.length < 5) {
      toast.error('Enter a valid UTR (min 5 chars)');
      return;
    }
    setVerifying(true);
    try {
      await api.post('/shop/purchase/verify', { utr, purchase_id: payInfo?.purchase_id });
      toast.success('Payment verified! You can now download.');
      if (payProduct) {
        setPurchased(prev => new Set([...prev, payProduct.id]));
        setCart(prev => prev.filter(x => x.id !== payProduct.id));
      }
      setPayProduct(null);
      setPayInfo(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async (p: ShopProduct) => {
    try {
      const res = await api.get(`/shop/purchase/download/${p.id}`);
      if (res.data?.download_url) {
        window.open(res.data.download_url, '_blank');
        toast.success('Download started');
      } else {
        toast.success(res.data?.message || 'Download link will be emailed');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Download failed');
    }
  };

  const handleAction = (p: ShopProduct) => {
    if (purchased.has(p.id) || p.price === 'free' || (typeof p.price === 'object' && p.price.amount === 0)) {
      handleDownload(p);
    } else {
      startPurchase(p);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <SEO title="Shop - CodeSprout" description="Premium interview preparation resources - PDFs, notes, company-specific guides" />
      <div className="min-h-screen pt-2 sm:pt-3 pb-16 bg-[#0a0a1a] relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400">Premium Resources</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight">Shop</h1>
              <p className="text-xl sm:text-2xl font-semibold text-white mb-3">Premium resources to ace your interviews</p>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">Curated interview materials, company insights, notes and more to help you land your dream job.</p>
              <a href="#resources" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm transition shadow-lg shadow-purple-500/25">
                Explore Resources <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-[36rem] lg:h-[36rem]">
              <img src="/shop-cart.png" alt="Shop Resources" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          </div>

          {/* Stats */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: BookOpen, label: 'Resources', value: products.length, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { icon: Crown, label: 'Free Items', value: products.filter(p => p.price === 'free' || (typeof p.price === 'object' && p.price.amount === 0)).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { icon: TrendingUp, label: 'Premium', value: products.filter(p => p.price !== 'free' && (typeof p.price === 'object' && p.price.amount > 0)).length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { icon: Users, label: 'Categories', value: CATEGORIES.length - 1, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              ].map((s, i) => (
                <div key={i} className="bg-[#111127] border border-slate-800/50 rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search + Filters */}
          <div id="resources" className="bg-[#111127] border border-slate-800/50 rounded-2xl p-5 mb-8">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition" />
              </div>
              <label className="flex items-center gap-2.5 px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl cursor-pointer hover:border-slate-600 transition">
                <input type="checkbox" checked={showFreeOnly} onChange={e => setShowFreeOnly(e.target.checked)} className="w-4 h-4 rounded accent-purple-500" />
                <span className="text-sm text-slate-300 whitespace-nowrap">Free only</span>
              </label>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${activeCategory === c.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'}`}>
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid / Empty / Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-slate-300 text-sm font-medium mb-1">No resources found matching your criteria</p>
              <p className="text-slate-500 text-xs">Try adjusting your search or filters</p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => {
                const price = formatPrice(p.price);
                const isPurchased = purchased.has(p.id);
                const isFree = price.isFree;
                return (
                  <motion.div key={p.id} variants={itemAnim} className="group bg-[#111127] border border-slate-800/50 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5">
                    <div className={`h-1.5 bg-gradient-to-r ${p.color}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-lg`}>{p.icon}</div>
                        <div className="flex flex-col items-end gap-1.5">
                          {p.popular && <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold flex items-center gap-1"><Star className="w-3 h-3" /> Popular</span>}
                          {isPurchased
                            ? <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Owned</span>
                            : isFree
                              ? <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">Free</span>
                              : <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold">{price.text}</span>}
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">{p.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.tags.slice(0, 3).map(t => <span key={t} className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300 text-[10px] font-medium border border-slate-700/50">{t}</span>)}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 pb-4 border-b border-slate-800/50">
                        {p.pages && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {p.pages} pages</span>}
                        {p.author && <span className="truncate ml-2 text-right">by {p.author}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!isFree && !isPurchased && (
                          <button onClick={() => toggleCart(p)} className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition ${inCart(p.id) ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border border-slate-700/50'}`}>
                            {inCart(p.id) ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                          </button>
                        )}
                        <button onClick={() => handleAction(p)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${isPurchased ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20' : isFree ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'}`}>
                          {isPurchased || isFree ? <><Download className="w-3.5 h-3.5" /> Download</> : <><ShoppingCart className="w-3.5 h-3.5" /> Buy {price.text}</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Cart drawer */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
            <div className="ml-auto w-full max-w-md bg-[#0a0a1a] border-l border-slate-800/50 h-full flex flex-col relative z-10">
              <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-purple-400" /> Cart ({cart.length})</h2>
                <button onClick={() => setShowCart(false)} className="p-2 rounded-lg hover:bg-slate-800/60 transition"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16"><ShoppingCart className="w-14 h-14 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">Your cart is empty</p></div>
                ) : cart.map(p => {
                  const price = formatPrice(p.price);
                  return (
                    <div key={p.id} className="flex items-center gap-3 bg-[#111127] border border-slate-800/50 rounded-xl p-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-base flex-shrink-0`}>{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{p.title}</div>
                        <div className="text-xs text-slate-500 capitalize">{p.category.replace('-', ' ')}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-bold ${price.isFree ? 'text-emerald-400' : 'text-purple-400'}`}>{price.text}</div>
                        <button onClick={() => toggleCart(p)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-800/50 space-y-3">
                  {hasPaidItems && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Total</span>
                      <span className="text-xl font-bold text-white">₹{cartTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">Pay via UPI on each item to download</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment modal */}
        {payProduct && payInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !verifying && setPayProduct(null)} />
            <div className="relative w-full max-w-md bg-[#111127] border border-slate-800/50 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              <button onClick={() => !verifying && setPayProduct(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800/60"><X className="w-5 h-5 text-slate-400" /></button>
              <h2 className="text-xl font-bold text-white mb-1">Complete Payment</h2>
              <p className="text-sm text-slate-400 mb-5">{payProduct.title}</p>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
                <div className="text-xs text-slate-400 mb-1">Amount to pay</div>
                <div className="text-3xl font-bold text-white">₹{payInfo.amount}</div>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">UPI ID</label>
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-white font-mono flex-1">{payInfo.upi_id}</span>
                    <button onClick={() => copyToClipboard(payInfo.upi_id)} className="p-1 hover:bg-slate-700/60 rounded"><Copy className="w-3.5 h-3.5 text-slate-400" /></button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Or pay via UPI link</label>
                  <a href={payInfo.upi_deep_link} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 text-sm text-white transition">
                    <ExternalLink className="w-4 h-4" /> Open UPI App
                  </a>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Enter UTR / Transaction ID</label>
                <input
                  value={utr}
                  onChange={e => setUtr(e.target.value)}
                  placeholder="12 digit UTR number"
                  className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">After paying, enter the UTR from your bank/UPI app to verify</p>
              </div>

              <button
                onClick={verifyPurchase}
                disabled={verifying || !utr}
                className="w-full mt-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify & Download'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
