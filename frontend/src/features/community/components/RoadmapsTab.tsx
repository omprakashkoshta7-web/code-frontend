import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Plus, X, CheckCircle, ArrowRight } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import type { Roadmap, RoadmapProgress, RoadmapStep } from '../types/community';
import { useUser } from '@/shared/hooks/useUser';
import toast from 'react-hot-toast';

export default function RoadmapsTab({ community, communityId }: { community: any; communityId: string }) {
  const user = useUser() ?? {};
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [progress, setProgress] = useState<Record<string, RoadmapProgress>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', stepsInput: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const rRes = await communityApi.getRoadmaps(communityId);
      setRoadmaps(rRes.data);
      for (const rm of rRes.data) {
        try { const pRes = await communityApi.getRoadmapProgress(rm.id); const p = pRes.data.find(x => x.user_id === user.id); if (p) setProgress(prev => ({ ...prev, [rm.id]: p })); }
        catch { /* ignore */ }
      }
    } catch { /* ignore */ }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const steps: RoadmapStep[] = form.stepsInput.split('\n').filter(Boolean).map((line, i) => ({
      order: i + 1, title: line.trim(), description: '', topic_slug: '',
    }));
    try {
      await communityApi.createRoadmap({ community_id: communityId, title: form.title, description: form.description, steps });
      toast.success('Roadmap created!'); setShowForm(false); setForm({ title: '', description: '', stepsInput: '' }); load();
    } catch { toast.error('Failed to create'); }
  };

  const toggleStep = async (roadmapId: string, order: number) => {
    const existing = progress[roadmapId];
    const completed = existing ? [...existing.completed_steps] : [];
    const idx = completed.indexOf(order);
    if (idx >= 0) completed.splice(idx, 1); else completed.push(order);
    try {
      await communityApi.updateRoadmapProgress(roadmapId, completed);
      setProgress(prev => ({ ...prev, [roadmapId]: { id: '', roadmap_id: roadmapId, user_id: user.id, completed_steps: completed } }));
    } catch { toast.error('Failed to update'); }
  };

  const isOwner = community.created_by === user.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Map className="w-4 h-4 text-emerald-400" /> Learning Roadmaps</h3>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all text-xs">
            <Plus className="w-3.5 h-3.5" /> {showForm ? 'Cancel' : 'Create'}
          </button>
        )}
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={create} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Roadmap title" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm resize-none" rows={2} />
          <textarea value={form.stepsInput} onChange={e => setForm({ ...form, stepsInput: e.target.value })} placeholder="Steps (one per line)&#10;e.g.&#10;Arrays & Strings&#10;Hash Maps&#10;Two Pointers" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm resize-none" rows={5} />
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600">Create Roadmap</button>
        </motion.form>
      )}

      {roadmaps.length === 0 ? (
        <div className="text-center py-12 text-white/30 bg-white/5 rounded-xl border border-white/10">
          <Map className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm">No roadmaps yet.</p>
        </div>
      ) : (
        roadmaps.map((rm, i) => {
          const p = progress[rm.id];
          const done = p?.completed_steps?.length || 0;
          return (
            <motion.div key={rm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white break-words">{rm.title}</h4>
                  {rm.description && <p className="text-xs text-white/50 mt-0.5 break-words">{rm.description}</p>}
                </div>
                <span className="text-xs text-white/40 shrink-0 whitespace-nowrap">{done}/{rm.steps.length} complete</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-primary-500 rounded-full transition-all" style={{ width: `${(done / rm.steps.length) * 100}%` }} />
              </div>
              <div className="space-y-1">
                {rm.steps.map((step) => {
                  const completed = p?.completed_steps?.includes(step.order);
                  return (
                    <button key={step.order} onClick={() => toggleStep(rm.id, step.order)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs transition-all border text-left ${completed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}>
                      {completed ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />}
                      <span className={`break-words flex-1 min-w-0 ${completed ? 'line-through opacity-70' : ''}`}>Step {step.order}: {step.title}</span>
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
