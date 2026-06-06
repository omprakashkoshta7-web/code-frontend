import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, CheckCircle, X, Plus } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import type { WeeklyChallenge, ChallengeProgress } from '../types/community';
import { useUser } from '@/shared/hooks/useUser';
import toast from 'react-hot-toast';

export default function ChallengesTab({ community, communityId }: { community: any; communityId: string }) {
  const user = useUser() ?? {};
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', days: 7 });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const cRes = await communityApi.getChallenges(communityId);
      setChallenges(cRes.data);
      for (const ch of cRes.data) {
        try { const pRes = await communityApi.getChallengeProgress(ch.id); const p = pRes.data.find(x => x.user_id === user.id); if (p) setProgress(prev => ({ ...prev, [ch.id]: p })); }
        catch { /* ignore */ }
      }
    } catch { /* ignore */ }
  };

  const createChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + form.days * 86400000).toISOString();
    const days = Array.from({ length: form.days }, (_, i) => ({
      day: i + 1, title: `Day ${i + 1}`, question_slug: '', question_title: '',
    }));
    try {
      await communityApi.createChallenge({ community_id: communityId, title: form.title, description: form.description, days, start_date: startDate, end_date: endDate });
      toast.success('Challenge created!'); setShowForm(false); setForm({ title: '', description: '', days: 7 }); load();
    } catch { toast.error('Failed to create'); }
  };

  const toggleDay = async (challengeId: string, day: number) => {
    const existing = progress[challengeId];
    const completed = existing ? [...existing.completed_days] : [];
    const idx = completed.indexOf(day);
    if (idx >= 0) completed.splice(idx, 1); else completed.push(day);
    try {
      await communityApi.updateChallengeProgress(challengeId, completed);
      setProgress(prev => ({ ...prev, [challengeId]: { id: '', challenge_id: challengeId, user_id: user.id, completed_days: completed } }));
    } catch { toast.error('Failed to update'); }
  };

  const isOwner = community.created_by === user.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Weekly Challenges</h3>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all text-xs">
            <Plus className="w-3.5 h-3.5" /> {showForm ? 'Cancel' : 'Create'}
          </button>
        )}
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={createChallenge} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Challenge title" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm resize-none" rows={2} />
          <input type="number" value={form.days} onChange={e => setForm({ ...form, days: parseInt(e.target.value) || 7 })} min={1} max={30} className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" />
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600">Create</button>
        </motion.form>
      )}

      {challenges.length === 0 ? (
        <div className="text-center py-12 text-white/30 bg-white/5 rounded-xl border border-white/10">
          <Calendar className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm">No challenges yet.</p>
        </div>
      ) : (
        challenges.map((ch, i) => {
          const p = progress[ch.id];
          const done = p?.completed_days?.length || 0;
          return (
            <motion.div key={ch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white break-words">{ch.title}</h4>
                  {ch.description && <p className="text-xs text-white/50 mt-0.5 break-words">{ch.description}</p>}
                </div>
                <span className="text-xs text-white/40 shrink-0 whitespace-nowrap">{done}/{ch.days.length} days</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-primary-500 to-amber-500 rounded-full transition-all" style={{ width: `${(done / ch.days.length) * 100}%` }} />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-1.5">
                {ch.days.map(day => {
                  const completed = p?.completed_days?.includes(day.day);
                  return (
                    <button key={day.day} onClick={() => toggleDay(ch.id, day.day)}
                      className={`p-2 rounded-lg text-center text-xs transition-all border ${completed ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>
                      <div className="font-bold">{day.day}</div>
                      <div className="text-[8px] truncate">{day.title}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
