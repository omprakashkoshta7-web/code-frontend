import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, Upload, Trash2, Loader2, ChevronRight, ArrowRight, Lock, Crown,
} from 'lucide-react';
import { resumeApi } from '../api/resumeApi';
import toast from 'react-hot-toast';

/* ─── types ─────────────────────────────────────────────────────────────── */
interface Template {
  id: string;
  name: string;
  description: string;
  category?: string;
  is_ats_friendly: boolean;
  columns: number;
  colors?: string[];
  sections?: string[];
  isPremium?: boolean;
}

interface Props {
  onComplete: (data: { templateId: string; formData: any; resumeText?: string }) => void;
  onCancel: () => void;
}

/* ─── mini resume preview per template type ─────────────────────────────── */
function MiniResume({ type, colors }: { type: string; colors: string[] }) {
  const accent = colors?.[0] || '#6d28d9';
  const bg = colors?.[1] || '#f8fafc';

  const layouts: Record<string, React.ReactNode> = {
    'ats-beginner': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-3 flex flex-col gap-2" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full bg-white/20 mx-auto" />
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase tracking-wide">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5">
              <div>john@email.com</div>
              <div>+1 234 567 890</div>
              <div>linkedin.com/in/john</div>
              <div>github.com/john</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase tracking-wide">Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['React','Node.js','TypeScript','Python','SQL'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}
            </div>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2" style={{ backgroundColor: bg }}>
          <div><div className="text-base font-bold" style={{ color: accent }}>John Doe</div><div className="text-[9px] text-gray-500">Software Engineer</div></div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[8px] text-gray-600 mt-1"><span className="font-semibold">Senior Dev</span> - Tech Co. <span className="text-gray-400">2022-Present</span></div>
            <div className="text-[8px] text-gray-600"><span className="font-semibold">Developer</span> - StartupX <span className="text-gray-400">2020-2022</span></div>
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[8px] text-gray-600 mt-1">B.Tech Computer Science - University Name</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Projects</div>
            <div className="text-[8px] text-gray-600 mt-1">E-Commerce Platform - React, Node.js, MongoDB</div>
          </div>
        </div>
      </div>
    ),
    'sde': (
      <div className="flex h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="w-full p-3 space-y-2">
          <div className="text-center pb-2 border-b-2" style={{ borderColor: accent }}>
            <div className="text-base font-bold" style={{ color: accent }}>John Doe</div>
            <div className="text-[9px] text-gray-500">Software Engineer</div>
            <div className="text-[8px] text-gray-400 mt-0.5">john@email.com | +1 234 567 890</div>
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {['Java','Python','SQL','Docker','AWS','Redis','Kafka','Microservices'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded border" style={{ borderColor: accent, color: accent }}>{s}</span>)}
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[8px] text-gray-600 mt-1">Senior Software Engineer at Tech Company (2022-Present)</div>
            <div className="text-[8px] text-gray-600">Led microservices architecture serving 1M+ users</div>
            <div className="text-[8px] text-gray-600 mt-1">Software Developer at StartupX (2020-2022)</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[8px] text-gray-600 mt-1">B.Tech Computer Science - University Name (2020-2024)</div>
          </div>
        </div>
      </div>
    ),
    'frontend': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-3 flex flex-col gap-2" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full bg-white/20 mx-auto" />
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5">
              <div>john@email.com</div>
              <div>+1 234 567 890</div>
              <div>linkedin.com/in/john</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase">Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['React','TypeScript','Tailwind','Next.js','Redux','CSS3','GraphQL'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[8px] text-white/70 mt-1">B.Tech CSE</div>
            <div className="text-[7px] text-white/50">University (2020-2024)</div>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2" style={{ backgroundColor: bg }}>
          <div className="pb-1 border-b-2" style={{ borderColor: accent }}>
            <div className="text-base font-bold" style={{ color: accent }}>John Doe</div>
            <div className="text-[9px] text-gray-500">Frontend Developer</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase" style={{ color: accent }}>Experience</div>
            <div className="text-[8px] text-gray-600 mt-1"><span className="font-semibold">Senior Frontend Dev</span> - Tech Co. (2022-Present)</div>
            <div className="text-[8px] text-gray-600 ml-2">Built scalable React apps with 99.9% uptime</div>
            <div className="text-[8px] text-gray-600 mt-1"><span className="font-semibold">Frontend Dev</span> - StartupX (2020-2022)</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase" style={{ color: accent }}>Projects</div>
            <div className="text-[8px] text-gray-600 mt-1">Design System - React, Storybook, Tailwind</div>
          </div>
        </div>
      </div>
    ),
    'backend': (
      <div className="flex h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="w-full p-3 space-y-2">
          <div className="text-center pb-2 border-b-2" style={{ borderColor: accent }}>
            <div className="text-base font-bold" style={{ color: accent }}>John Doe</div>
            <div className="text-[9px] text-gray-500">Backend Developer</div>
            <div className="text-[8px] text-gray-400 mt-0.5">john@email.com | linkedin.com/in/john</div>
          </div>
          <div className="flex flex-wrap gap-1">
            {['Java','Python','Node.js','SQL','Docker','AWS','Redis','Kafka','PostgreSQL'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded border" style={{ borderColor: accent, color: accent }}>{s}</span>)}
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[8px] text-gray-600 mt-1">Backend Engineer at Tech Co. (2022-Present)</div>
            <div className="text-[8px] text-gray-600">Designed REST APIs handling 10M+ requests/day</div>
            <div className="text-[8px] text-gray-600 mt-1">Junior Developer at StartupX (2020-2022)</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[8px] text-gray-600 mt-1">B.Tech Computer Science</div>
          </div>
        </div>
      </div>
    ),
    'ai-ml': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-3 flex flex-col gap-2" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full bg-white/20 mx-auto" />
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5">
              <div>john@email.com</div>
              <div>linkedin.com/in/john</div>
              <div>github.com/john</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase">ML/AI Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['TensorFlow','PyTorch','Scikit-learn','NLP','CV','Deep Learning','LLMs'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}
            </div>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2" style={{ backgroundColor: bg }}>
          <div className="flex justify-between items-start border-b pb-1" style={{ borderColor: accent }}>
            <div><div className="text-base font-bold" style={{ color: accent }}>John Doe</div><div className="text-[9px] text-gray-500">ML Engineer</div></div>
            <div className="text-right text-[8px] text-gray-400"><div>Ph.D. AI</div><div>Stanford</div></div>
          </div>
          <div><div className="text-[9px] font-bold uppercase" style={{ color: accent }}>Experience</div>
            <div className="text-[8px] text-gray-600 mt-1">ML Engineer at AI Corp (2022-Present)</div>
            <div className="text-[8px] text-gray-600">Built NLP pipelines processing 1M+ docs/day</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase" style={{ color: accent }}>Projects</div>
            <div className="text-[8px] text-gray-600 mt-1">Image Classification - ResNet, PyTorch, 95% accuracy</div>
          </div>
        </div>
      </div>
    ),
    'professional': (
      <div className="flex h-full text-[8px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex-1 p-3 space-y-2 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.25em]">Sarah Watson</div>
              <div className="text-[7px] text-orange-600 uppercase tracking-[0.15em] mt-1">Web Developer</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-200" />
          </div>
          <div className="text-[7px] text-slate-500">hello@watson.org · +1 123 234 3456 · New York</div>
          <div className="border-t border-slate-200 pt-2">
            <div className="text-[8px] font-semibold text-slate-600 uppercase tracking-[0.14em]">Summary</div>
            <div className="text-[7px] text-slate-500 mt-1">Driven web developer with a strong passion for creating exceptional web experiences and building beautiful user interfaces.</div>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="text-[8px] font-semibold text-slate-600 uppercase tracking-[0.14em]">Experience</div>
            <div className="text-[7px] text-slate-500 mt-1">Creative Studio · Senior Web Developer</div>
            <div className="text-[7px] text-slate-500">Built responsive user-friendly websites using HTML, CSS, and JavaScript.</div>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="text-[8px] font-semibold text-slate-600 uppercase tracking-[0.14em]">Education</div>
            <div className="text-[7px] text-slate-500 mt-1">San Francisco Bay University · B.Sc. Computer Science</div>
          </div>
        </div>
        <div className="w-[30%] p-3 bg-orange-100 flex flex-col gap-2">
          <div className="w-full h-20 rounded-2xl bg-orange-200" />
          <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-700">Languages</div>
          <div className="text-[7px] text-slate-600">English</div>
          <div className="text-[7px] text-slate-600">Spanish</div>
          <div className="border-t border-orange-200 pt-2" />
          <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-700">Skills</div>
          <div className="text-[7px] text-slate-600">JavaScript · TypeScript · HTML · CSS · React · Next.js</div>
        </div>
      </div>
    ),
    'fullstack': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-3 flex flex-col gap-2" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full bg-white/20 mx-auto" />
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5">
              <div>john@email.com</div>
              <div>+1 234 567 890</div>
              <div>linkedin.com/in/john</div>
              <div>github.com/john</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-white/90 uppercase">Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['React','Node.js','TypeScript','Python','SQL','Docker','AWS'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}
            </div>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2" style={{ backgroundColor: bg }}>
          <div><div className="text-base font-bold" style={{ color: accent }}>John Doe</div><div className="text-[9px] text-gray-500">Full Stack Developer</div></div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[8px] text-gray-600 mt-1">Full Stack Dev at Tech Co. (2022-Present)</div>
            <div className="text-[8px] text-gray-600">Built full-stack apps with React + Node.js</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Projects</div>
            <div className="text-[8px] text-gray-600 mt-1">E-Commerce Platform - Full stack with Stripe</div>
          </div>
          <div><div className="text-[9px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[8px] text-gray-600 mt-1">B.Tech Computer Science</div>
          </div>
        </div>
      </div>
    ),
    'executive': (
      <div className="flex flex-col h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="p-2.5 text-center border-b-2" style={{ backgroundColor: accent, borderColor: accent }}>
          <div className="text-sm font-bold text-white">Sarah Johnson</div>
          <div className="text-[8px] text-white/80">Chief Technology Officer</div>
          <div className="text-[7px] text-white/60 mt-0.5">sarah@exec.com | linkedin.com/in/sarah</div>
        </div>
        <div className="flex-1 p-2.5 space-y-1.5">
          <div><div className="text-[8px] font-bold text-gray-500 uppercase">Executive Summary</div>
            <div className="text-[7px] text-gray-600 mt-0.5">Visionary tech leader with 15+ years driving digital transformation...</div>
          </div>
          <div><div className="text-[8px] font-bold text-gray-500 uppercase">Leadership</div>
            <div className="text-[7px] text-gray-600">CTO at FinTech Corp 2019-Present</div>
            <div className="text-[7px] text-gray-600">VP Engineering at ScaleUp Inc 2015-2019</div>
          </div>
          <div className="flex gap-1">{['Strategy','Team Building','Cloud','AI','M&A'].map(s => <span key={s} className="text-[6px] px-1 py-0.5 rounded" style={{ backgroundColor: accent + '20', color: accent }}>{s}</span>)}</div>
        </div>
      </div>
    ),
    'minimalist': (
      <div className="flex flex-col h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="p-4 text-center border-b border-gray-200">
          <div className="text-base font-light text-gray-900">Alex Chen</div>
          <div className="text-[8px] text-gray-400 tracking-widest uppercase">Product Designer</div>
        </div>
        <div className="flex-1 p-3 space-y-2">
          <div className="flex justify-center gap-3 text-[6px] text-gray-400">alex@email.com · alex.design · @alex</div>
          <div className="border-t border-gray-100 pt-1.5">
            <div className="text-[7px] text-gray-500 font-medium uppercase tracking-widest">Experience</div>
            <div className="text-[7px] text-gray-600 mt-0.5">Lead Product Designer · Design Studio 2021-Present</div>
            <div className="text-[7px] text-gray-600">UX Designer · WebAgency 2019-2021</div>
          </div>
          <div className="border-t border-gray-100 pt-1">
            <div className="text-[7px] text-gray-500 font-medium uppercase tracking-widest">Skills</div>
            <div className="flex gap-1 mt-0.5">
              {['UX','UI','Figma','Prototyping','Research'].map(s => <span key={s} className="text-[6px] px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-500">{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    ),
    'creative': (
      <div className="flex flex-col h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="p-3 text-center relative" style={{ background: `linear-gradient(135deg, ${accent}, #ec4899)` }}>
          <div className="w-8 h-8 rounded-full border-2 border-white mx-auto mb-1 flex items-center justify-center text-white text-[9px] font-bold">MK</div>
          <div className="text-sm font-bold text-white">Maya Kapoor</div>
          <div className="text-[7px] text-white/80">Creative Director</div>
        </div>
        <div className="flex-1 p-2.5 space-y-1.5">
          <div className="flex gap-1">
            <div className="flex-1 rounded p-1.5 text-center" style={{ backgroundColor: accent + '15' }}>
              <div className="text-[9px] font-bold" style={{ color: accent }}>8+</div>
              <div className="text-[6px] text-gray-500">Years</div>
            </div>
            <div className="flex-1 rounded p-1.5 text-center" style={{ backgroundColor: accent + '15' }}>
              <div className="text-[9px] font-bold" style={{ color: accent }}>50+</div>
              <div className="text-[6px] text-gray-500">Projects</div>
            </div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Portfolio</div>
            <div className="text-[7px] text-gray-600">Brand identity, Web design, Motion graphics</div>
          </div>
        </div>
      </div>
    ),
    'technical': (
      <div className="flex h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="w-full p-3 space-y-1.5">
          <div className="text-center border-b pb-1.5" style={{ borderColor: accent }}>
            <div className="text-sm font-bold" style={{ color: accent }}>Ravi Sharma</div>
            <div className="text-[8px] text-gray-500">Staff Engineer</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-gray-500 uppercase mb-1">Tech Stack</div>
            {['Kubernetes','Go','Rust','PostgreSQL','Redis','Kafka','Docker','Terraform'].map(s => (
              <div key={s} className="flex items-center gap-1 mb-0.5">
                <span className="text-[6px] w-12 text-gray-500">{s}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: (60 + Math.random() * 35) + '%', backgroundColor: accent }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-[7px] text-gray-600 mt-1">Staff Eng @ TechCorp · 6 patents · OSS contributor</div>
        </div>
      </div>
    ),
    'academic': (
      <div className="flex h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="w-full p-3 space-y-1.5">
          <div className="border-l-2 pl-2" style={{ borderColor: accent }}>
            <div className="text-sm font-bold text-gray-900">Dr. Priya Patel</div>
            <div className="text-[8px] text-gray-500">PhD · Associate Professor</div>
          </div>
          <div><div className="text-[8px] font-bold text-gray-500 uppercase">Research Areas</div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {['NLP','Machine Learning','Computational Linguistics','AI Ethics'].map(s => <span key={s} className="text-[6px] px-1.5 py-0.5 rounded" style={{ backgroundColor: accent + '15', color: accent }}>{s}</span>)}
            </div>
          </div>
          <div><div className="text-[8px] font-bold text-gray-500 uppercase">Publications</div>
            <div className="text-[7px] text-gray-600">12 peer-reviewed papers · 800+ citations</div>
            <div className="text-[7px] text-gray-500 italic">"Neural Approaches to..." ACL 2024</div>
          </div>
          <div><div className="text-[8px] font-bold text-gray-500 uppercase">Education</div>
            <div className="text-[7px] text-gray-600">PhD Computer Science · Stanford 2018</div>
          </div>
        </div>
      </div>
    ),
    'modern-professional': (
      <div className="flex h-full text-xs">
        <div className="w-[38%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div>
            <div className="text-[7px] font-bold text-white/90 uppercase tracking-wide">Contact</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>+1 234 567 890</div>
              <div>hello@email.com</div>
              <div>123 Anywhere St.</div>
            </div>
          </div>
          <div>
            <div className="text-[7px] font-bold text-white/90 uppercase tracking-wide">About Me</div>
            <div className="text-[6px] text-white/70 mt-0.5 leading-tight">Creative professional with 5+ years of experience in visual design, UX/UI, and brand development.</div>
          </div>
          <div>
            <div className="text-[7px] font-bold text-white/90 uppercase tracking-wide">Skills</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>• Management Skills</div>
              <div>• Creativity</div>
              <div>• Digital Marketing</div>
            </div>
          </div>
          <div>
            <div className="text-[7px] font-bold text-white/90 uppercase tracking-wide">Language</div>
            <div className="text-[6px] text-white/70">English · Spanish</div>
          </div>
        </div>
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">Lorna Alvarado</div>
          <div className="text-[8px] text-gray-500">Marketing Manager</div>
          <div><div className="text-[7px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[6px] text-gray-600 mt-0.5">Bachelor of Business Management</div>
            <div className="text-[6px] text-gray-400">2015 - 2020</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Product Design Manager</span> · 2015 - 2020</div>
            <div className="text-[6px] text-gray-500">Creative Agency, Inc.</div>
          </div>
        </div>
      </div>
    ),
    'blackwhite-minimalist': (
      <div className="flex h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="w-full p-3 space-y-2">
          <div className="text-center pb-1 border-b border-gray-200">
            <div className="text-sm font-bold text-gray-900">Mariana Anderson</div>
            <div className="text-[8px] text-gray-500">Marketing Manager</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Education</div>
            <div className="text-[6px] text-gray-600">Bachelor of Business · Bonchille University</div>
            <div className="text-[6px] text-gray-400">2015 - 2020</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Experience</div>
            <div className="text-[6px] text-gray-600"><span className="font-semibold">Marketing Manager</span> · 2022 - Present</div>
            <div className="text-[6px] text-gray-500">Acme International Co.</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Expertise</div>
            <div className="text-[6px] text-gray-600">UX/UI · Wireframes · Storyboards · User Flows</div>
          </div>
        </div>
      </div>
    ),
    'bluegray-simple': (
      <div className="flex h-full text-xs">
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">Richard Sanchez</div>
          <div className="text-[8px] text-gray-500">Marketing Manager</div>
          <div><div className="text-[7px] font-bold uppercase flex items-center gap-1" style={{ color: accent }}>● Profile</div>
            <div className="text-[6px] text-gray-600 mt-0.5 leading-tight">Creative marketing professional with 10+ years experience in digital campaigns and brand strategy.</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase flex items-center gap-1" style={{ color: accent }}>● Work Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Senior Marketing Manager</span></div>
            <div className="text-[6px] text-gray-500">Beacon Studio · 2020 - PRESENT</div>
          </div>
        </div>
        <div className="w-[38%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div>
            <div className="text-[7px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>+123 456 7890</div>
              <div>hello@email.com</div>
            </div>
          </div>
          <div>
            <div className="text-[7px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>• Project Management</div>
              <div>• Public Relations</div>
              <div>• Time Management</div>
            </div>
          </div>
        </div>
      </div>
    ),
    'professional-modern': (
      <div className="flex h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="w-full p-3 space-y-2">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">Lorna Alvarado</div>
            <div className="text-[8px] text-gray-500">Marketing Manager</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Contact</div>
            <div className="text-[6px] text-gray-600 mt-0.5">+123 456 7890 · hello@email.com</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">About Me</div>
            <div className="text-[6px] text-gray-600 mt-0.5 leading-tight">Creative professional with 5+ years experience in visual design, UX/UI, and brand development.</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Skills</div>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {['Management','Creativity','Digital Marketing','Negotiation'].map(s => <span key={s} className="text-[5px] px-1 py-0.5 rounded bg-gray-100 text-gray-600">{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    ),
    'grayblue-sidebar': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0"><div>+1 234 567 890</div><div>hello@email.com</div></div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[6px] text-white/70 mt-0.5">BA Marketing · University 2015-2020</div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>• Marketing Strategy</div><div>• SEO/SEM</div><div>• Content Creation</div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">Olivia Sanchez</div>
          <div className="text-[8px] text-gray-500">Marketing Manager</div>
          <div><div className="text-[7px] font-bold uppercase border-b pb-0.5" style={{ borderColor: accent, color: accent }}>Summary</div>
            <div className="text-[6px] text-gray-600 mt-0.5 leading-tight">Creative marketing professional with 8+ years experience.</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase border-b pb-0.5" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Marketing Manager</span> · 2020-Present</div>
            <div className="text-[6px] text-gray-500">Acme International Co.</div>
          </div>
        </div>
      </div>
    ),
    'dark-sidebar-photo': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0"><div>+1 234 567 890</div><div>hello@email.com</div><div>linkedin.com/in/john</div></div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[6px] text-white/70 mt-0.5">BA Marketing · University 2015-2020</div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>• Marketing</div><div>• SEO</div><div>• Content</div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">Olivia Sanchez</div>
          <div className="text-[8px] text-gray-500">Marketing Manager</div>
          <div><div className="text-[7px] font-bold uppercase border-b pb-0.5" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Marketing Manager</span> · 2020-Present</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase border-b pb-0.5" style={{ borderColor: accent, color: accent }}>References</div>
            <div className="text-[6px] text-gray-600 mt-0.5">Harumi Kobayashi · CEO</div>
          </div>
        </div>
      </div>
    ),
    'gray-sidebar-right': (
      <div className="flex h-full text-xs">
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">Lorna Alvarado</div>
          <div className="text-[8px] text-gray-500">Digital Marketing Specialist</div>
          <div><div className="text-[7px] font-bold uppercase" style={{ color: accent }}>About Me</div>
            <div className="text-[6px] text-gray-600 mt-0.5 leading-tight">Creative professional with 5+ years experience in visual design, UX/UI, and brand development.</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase" style={{ color: accent }}>Work Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Marketing Manager</span> · 2020-Present</div>
            <div className="text-[6px] text-gray-500">Acme International Co.</div>
          </div>
        </div>
        <div className="w-[35%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0"><div>+1 234 567 890</div><div>hello@email.com</div></div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[6px] text-white/70 mt-0.5">BA Marketing · University 2015-2020</div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>• Marketing</div><div>• SEO</div><div>• Content</div>
            </div>
          </div>
        </div>
      </div>
    ),
    'centered-light': (
      <div className="flex h-full text-xs" style={{ backgroundColor: bg }}>
        <div className="w-full p-3 space-y-2">
          <div className="text-center pb-1 border-b border-gray-200">
            <div className="text-sm font-bold text-gray-900">Emaa Warner</div>
            <div className="text-[8px] text-gray-500">Accounting Executive</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Summary</div>
            <div className="text-[6px] text-gray-600 mt-0.5 leading-tight">Detail-oriented accounting executive with 7+ years experience.</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Education</div>
            <div className="text-[6px] text-gray-600">Bachelor of Marketing · University 2015-2019</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Skills</div>
            <div className="text-[6px] text-gray-600">Client Relations · Budgeting · Strategic Planning</div>
          </div>
          <div><div className="text-[7px] font-bold text-gray-500 uppercase">Experience</div>
            <div className="text-[6px] text-gray-600"><span className="font-semibold">Accounting Executive</span> · 2020-Present</div>
            <div className="text-[6px] text-gray-500">Acme International Co.</div>
          </div>
        </div>
      </div>
    ),
    'brown-sidebar': (
      <div className="flex h-full text-xs">
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">Lorna Alvarado</div>
          <div className="text-[8px] text-gray-500">Marketing Manager</div>
          <div><div className="text-[7px] font-bold uppercase" style={{ color: accent }}>About Me</div>
            <div className="text-[6px] text-gray-600 mt-0.5 leading-tight">Creative marketing professional with 8+ years experience in digital campaigns and brand strategy.</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase" style={{ color: accent }}>Education</div>
            <div className="text-[6px] text-gray-600 mt-0.5">BA Marketing · University 2015-2020</div>
          </div>
        </div>
        <div className="w-[35%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0">
              <div>• Project Management</div><div>• Public Relations</div><div>• Time Management</div>
            </div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[6px] text-white/70 mt-0.5">BA Marketing · University</div>
          </div>
        </div>
      </div>
    ),
    'dark-sidebar-right': (
      <div className="flex h-full text-xs">
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">Connor Hamilton</div>
          <div className="text-[8px] text-gray-500">Accounting Executive</div>
          <div><div className="text-[7px] font-bold uppercase border-b pb-0.5" style={{ borderColor: accent, color: accent }}>Work Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Accounting Executive</span> · 2020-Present</div>
            <div className="text-[6px] text-gray-500">Acme International Co.</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase border-b pb-0.5" style={{ borderColor: accent, color: accent }}>Projects</div>
            <div className="text-[6px] text-gray-600 mt-0.5">Financial Analysis Dashboard</div>
          </div>
        </div>
        <div className="w-[35%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[6px] text-white/70 mt-0.5 space-y-0"><div>+1 234 567 890</div><div>hello@email.com</div></div>
          </div>
          <div><div className="text-[7px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[6px] text-white/70 mt-0.5">BA Accounting · University</div>
          </div>
        </div>
      </div>
    ),
    'blank-canvas': (
      <div className="flex h-full text-xs">
        <div className="w-[30%] h-full p-2 flex flex-col gap-1" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-6 h-6 rounded-full border border-blue-400 overflow-hidden shrink-0 bg-blue-100 flex items-center justify-center text-[6px] font-bold text-blue-600">Y</div>
            <div className="text-[6px] leading-tight"><div className="font-bold text-gray-900">Your Name</div><div className="text-gray-500">Job Title</div></div>
          </div>
          <div><div className="text-[6px] font-bold text-blue-600 uppercase tracking-wide">Skills</div>
            <div className="text-[5px] text-gray-600 mt-0.5">React · Node.js · TypeScript</div>
          </div>
          <div><div className="text-[6px] font-bold text-blue-600 uppercase tracking-wide">Education</div>
            <div className="text-[5px] text-gray-600 mt-0.5">B.Tech CSE · University 2024</div>
          </div>
        </div>
        <div className="w-[70%] p-2 space-y-1" style={{ backgroundColor: bg }}>
          <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
            <div className="text-[6px] text-gray-400">✉️ your@email.com</div>
            <div className="text-[6px] text-gray-400">📞 +1 234 567 890</div>
          </div>
          <div><div className="text-[6px] font-bold text-blue-600 uppercase">Experience</div>
            <div className="text-[5px] text-gray-600 mt-0.5"><span className="font-semibold">Job Title</span> · Company Name · 2022-Present</div>
            <div className="text-[5px] text-gray-500">• Responsibility description here</div>
          </div>
          <div><div className="text-[6px] font-bold text-blue-600 uppercase">Projects</div>
            <div className="text-[5px] text-gray-600 mt-0.5">Project Name · Description here</div>
          </div>
        </div>
      </div>
    ),
    'blue-sidebar-profile': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div className="text-center"><div className="text-[8px] font-bold text-white">Sarah Johnson</div><div className="text-[6px] text-white/70">Product Designer</div></div>
          <div><div className="text-[6px] font-bold text-white/80 uppercase tracking-wide">Contact</div>
            <div className="text-[5px] text-white/60 mt-0.5 space-y-0">sarah@email.com · +1 234 567 890</div>
          </div>
          <div><div className="text-[6px] font-bold text-white/80 uppercase">Skills</div>
            <div className="text-[5px] text-white/60 mt-0.5 space-y-0"><div>• UX Research</div><div>• UI Design</div><div>• Figma</div></div>
          </div>
          <div><div className="text-[6px] font-bold text-white/80 uppercase">Languages</div><div className="text-[5px] text-white/60">English · Spanish</div></div>
        </div>
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">About Me</div>
          <div className="text-[6px] text-gray-600 leading-tight">Creative product designer with 5+ years of experience crafting user-centered digital experiences.</div>
          <div><div className="text-[7px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">B.Des</span> · Design School · 2016-2020</div>
          </div>
          <div><div className="text-[7px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Product Designer</span> · Design Co. · 2020-Present</div>
          </div>
        </div>
      </div>
    ),
    'orange-sidebar-profile': (
      <div className="flex h-full text-xs">
        <div className="w-[35%] h-full p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: accent }}>
          <div className="w-10 h-10 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div className="text-center"><div className="text-[8px] font-bold text-white">Lorna Alvarado</div><div className="text-[6px] text-white/70">Marketing Manager</div></div>
          <div><div className="text-[6px] font-bold text-white/80 uppercase">Contact</div>
            <div className="text-[5px] text-white/60 mt-0.5 space-y-0">+1 234 567 890 · lorna@email.com</div>
          </div>
          <div><div className="text-[6px] font-bold text-white/80 uppercase">Skills</div>
            <div className="text-[5px] text-white/60 mt-0.5 space-y-0"><div>• Marketing Strategy</div><div>• SEO</div><div>• Content</div></div>
          </div>
          <div><div className="text-[6px] font-bold text-white/80 uppercase">Education</div>
            <div className="text-[5px] text-white/60">BA Marketing · University</div>
          </div>
        </div>
        <div className="flex-1 p-2.5 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="text-sm font-bold text-gray-900">About Me</div>
          <div className="text-[6px] text-gray-600 leading-tight">Creative marketing manager with 8+ years experience in digital campaigns.</div>
          <div><div className="text-[7px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[6px] text-gray-600 mt-0.5"><span className="font-semibold">Marketing Manager</span> · Agency Inc. · 2020-Present</div>
          </div>
        </div>
      </div>
    ),
  };

  const premiumToFree: Record<string, string> = {
    'grayblue-premium': 'grayblue-sidebar',
    'dark-photo-premium': 'dark-sidebar-photo',
    'gray-right-premium': 'gray-sidebar-right',
    'centered-premium': 'centered-light',
    'brown-premium': 'brown-sidebar',
    'dark-right-premium': 'dark-sidebar-right',
  };
  return (
    <div className="w-full h-full rounded overflow-hidden border border-gray-200/30" style={{ backgroundColor: bg }}>
      {layouts[type] || layouts[premiumToFree[type]] || layouts['ats-beginner']}
    </div>
  );
}

/* ─── Large Resume Preview (for popup) ──────────────────────────────────── */
function LargeResumePreview({ template }: { template: Template }) {
  const accent = template.colors?.[0] || '#6d28d9';
  const bg = template.colors?.[1] || '#f8fafc';
  const isTwoCol = template.columns === 2;
  const tid = template.id;

  const renderExecutive = () => (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ minHeight: '500px' }}>
      <div className="p-5 text-white" style={{ backgroundColor: accent }}>
        <div className="text-xl font-bold">Sarah Johnson</div>
        <div className="text-xs text-white/80 mt-1">Chief Technology Officer</div>
        <div className="text-[10px] text-white/60 mt-1">sarah@executive.com | linkedin.com/in/sarah</div>
      </div>
      <div className="flex-1 p-5 space-y-3" style={{ backgroundColor: bg }}>
        <div><div className="text-[10px] font-bold text-gray-500 uppercase mb-1" style={{ color: accent }}>Executive Summary</div><div className="text-[9px] text-gray-600">Visionary technology executive with 15+ years driving digital transformation across Fortune 500 companies. Expertise in cloud strategy, team building, and M&A integration.</div></div>
        <div><div className="text-[10px] font-bold text-gray-500 uppercase mb-1" style={{ color: accent }}>Leadership Experience</div>
          <div className="space-y-2">
            <div><div className="text-[9px] font-semibold text-gray-800">Chief Technology Officer</div><div className="text-[8px] text-gray-500">FinTech Corp · 2019-Present</div><div className="text-[8px] text-gray-600">Led 200+ engineers, reduced cloud costs by 35%, drove AI strategy</div></div>
            <div><div className="text-[9px] font-semibold text-gray-800">VP Engineering</div><div className="text-[8px] text-gray-500">ScaleUp Inc. · 2015-2019</div><div className="text-[8px] text-gray-600">Scaled engineering from 20 to 120, built platform serving 10M+ users</div></div>
          </div>
        </div>
        <div><div className="text-[10px] font-bold text-gray-500 uppercase mb-1" style={{ color: accent }}>Board & Advisory</div><div className="text-[8px] text-gray-600">Advisory Board · TechStartups (2021-Present) | Mentor · Engineering Leadership Forum</div></div>
      </div>
    </div>
  );

  const renderMinimalist = () => (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ minHeight: '500px', backgroundColor: bg }}>
      <div className="p-6 text-center border-b border-gray-100"><div className="text-2xl font-light text-gray-900">Alex Chen</div><div className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Product Designer</div><div className="text-[9px] text-gray-400 mt-2">alex@email.com · alex.design · @alex</div></div>
      <div className="flex-1 p-6 space-y-3">
        <div><div className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mb-2">About</div><div className="text-[9px] text-gray-600">Design leader focused on creating intuitive, user-centered experiences. 8+ years in product design across B2B and B2C domains.</div></div>
        <div><div className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mb-2">Experience</div>
          <div><div className="text-[9px] font-semibold text-gray-800">Lead Product Designer</div><div className="text-[8px] text-gray-500">Design Studio · 2021-Present</div></div>
          <div className="mt-1.5"><div className="text-[9px] font-semibold text-gray-800">UX Designer</div><div className="text-[8px] text-gray-500">WebAgency · 2019-2021</div></div>
        </div>
        <div><div className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mb-2">Skills</div><div className="flex flex-wrap gap-1">{['UX Research','UI Design','Figma','Prototyping','Design Systems','User Testing'].map(s => <span key={s} className="text-[7px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{s}</span>)}</div></div>
      </div>
    </div>
  );

  const renderCreative = () => (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ minHeight: '500px' }}>
      <div className="p-5 text-center text-white" style={{ background: `linear-gradient(135deg, ${accent}, #ec4899)` }}>
        <div className="w-14 h-14 rounded-full border-2 border-white mx-auto mb-2 flex items-center justify-center text-white font-bold text-base">MK</div>
        <div className="text-lg font-bold">Maya Kapoor</div>
        <div className="text-xs text-white/80">Creative Director</div>
      </div>
      <div className="flex-1 p-5 space-y-3" style={{ backgroundColor: bg }}>
        <div className="flex gap-2">{['8+ Years','50+ Projects','20+ Clients'].map(s => <span key={s} className="flex-1 rounded p-2 text-center text-[9px] font-medium border" style={{ borderColor: accent + '30', backgroundColor: accent + '08', color: accent }}>{s}</span>)}</div>
        <div><div className="text-[10px] font-bold uppercase mb-1" style={{ color: accent }}>Portfolio</div><div className="text-[9px] text-gray-600">Brand identity for 20+ startups, Web design for e-commerce platforms, Motion graphics for product launches</div></div>
        <div><div className="text-[10px] font-bold uppercase mb-1" style={{ color: accent }}>Experience</div><div className="text-[9px] font-semibold text-gray-800">Creative Director · Studio M</div><div className="text-[8px] text-gray-500">2020-Present</div></div>
      </div>
    </div>
  );

  const renderTechnical = () => (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex" style={{ minHeight: '500px' }}>
      <div className="w-[40%] p-4" style={{ backgroundColor: accent + '10', borderRight: `1px solid ${accent}30` }}>
        <div className="text-[10px] font-bold uppercase mb-2" style={{ color: accent }}>Proficiency</div>
        {['Kubernetes','Go','Rust','PostgreSQL','Redis','Kafka','Docker','Terraform','AWS','Python'].map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 mb-1"><span className="text-[8px] w-14 text-gray-500">{s}</span><div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full rounded-full" style={{ width: (75 - i * 5) + '%', backgroundColor: accent }} /></div></div>
        ))}
      </div>
      <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
        <div><div className="text-lg font-bold" style={{ color: accent }}>Ravi Sharma</div><div className="text-[10px] text-gray-500">Staff Engineer · 6 patents</div><div className="text-[9px] text-gray-400 mt-0.5">ravi@email.com | github.com/ravi</div></div>
        <div><div className="text-[10px] font-bold uppercase border-b pb-0.5 mb-1" style={{ borderColor: accent, color: accent }}>Experience</div>
          <div className="text-[9px] font-semibold text-gray-800">Staff Engineer</div><div className="text-[8px] text-gray-500">TechCorp · 2021-Present</div>
          <div className="text-[9px] text-gray-600 mt-0.5">Led infrastructure serving 50M+ requests/day. 6 patents in distributed systems.</div>
          <div className="text-[9px] font-semibold text-gray-800 mt-1.5">Senior Backend Engineer</div><div className="text-[8px] text-gray-500">DataPlatform · 2018-2021</div>
        </div>
        <div><div className="text-[10px] font-bold uppercase border-b pb-0.5 mb-1" style={{ borderColor: accent, color: accent }}>Open Source</div><div className="text-[9px] text-gray-600">Core contributor to Kubernetes, Prometheus. 2K+ GitHub stars.</div></div>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ minHeight: '500px', backgroundColor: bg }}>
      <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: accent + '30' }}>
        <div className="w-1 rounded-full h-16" style={{ backgroundColor: accent }} />
        <div><div className="text-lg font-bold text-gray-900">Dr. Priya Patel</div><div className="text-xs text-gray-500">PhD · Associate Professor, Stanford University</div></div>
      </div>
      <div className="flex-1 p-5 space-y-3">
        <div><div className="text-[10px] font-bold uppercase mb-1" style={{ color: accent }}>Research Areas</div><div className="flex flex-wrap gap-1">{['NLP','Machine Learning','Computational Linguistics','AI Ethics'].map(s => <span key={s} className="text-[8px] px-2 py-0.5 rounded" style={{ backgroundColor: accent + '15', color: accent }}>{s}</span>)}</div></div>
        <div><div className="text-[10px] font-bold uppercase mb-1" style={{ color: accent }}>Publications</div><div className="text-[9px] text-gray-600">12 peer-reviewed papers · 800+ citations · h-index: 8</div><div className="text-[8px] text-gray-500 italic mt-0.5">"Neural Approaches to Cross-lingual IE" · ACL 2024</div></div>
        <div><div className="text-[10px] font-bold uppercase mb-1" style={{ color: accent }}>Teaching</div><div className="text-[9px] text-gray-600">CS224N: NLP (2020-Present) · CS229: ML (2018-2020)</div></div>
      </div>
    </div>
  );

  const layouts: Record<string, React.ReactNode> = {
    'ats-beginner': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-3" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full bg-white/20 mx-auto" />
          <div><div className="text-[10px] font-bold text-white/90 uppercase tracking-wide">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>john@email.com</div><div>+1 234 567 890</div><div>linkedin.com/in/john</div><div>github.com/john</div></div></div>
          <div><div className="text-[10px] font-bold text-white/90 uppercase tracking-wide">Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">{['React','Node.js','TypeScript','Python','SQL'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}</div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div><div className="text-lg font-bold" style={{ color: accent }}>John Doe</div><div className="text-xs text-gray-500">Software Engineer</div></div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Senior Dev</span> - Tech Co. <span className="text-gray-400">2022-Present</span></div>
            <div className="text-[9px] text-gray-600">Built scalable microservices serving 1M+ users</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Developer</span> - StartupX <span className="text-gray-400">2020-2022</span></div>
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[9px] text-gray-600 mt-1">B.Tech Computer Science - University (2020-2024)</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Projects</div>
            <div className="text-[9px] text-gray-600 mt-1">E-Commerce Platform - React, Node.js, MongoDB</div>
          </div>
        </div>
      </div>
    ),
    'sde': (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ backgroundColor: bg, minHeight: '500px' }}>
        <div className="p-5 text-center border-b-2" style={{ borderColor: accent }}>
          <div className="text-lg font-bold" style={{ color: accent }}>Ravi Kumar</div>
          <div className="text-xs text-gray-500">Senior Software Engineer</div>
          <div className="text-[10px] text-gray-400 mt-1">ravi@email.com | +1 234 567 890 | linkedin.com/in/ravi</div>
        </div>
        <div className="flex-1 p-5 space-y-3">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['Java','Python','SQL','Docker','AWS','Redis','Kafka','Microservices','System Design'].map(s => <span key={s} className="text-[8px] px-2 py-0.5 rounded border" style={{ borderColor: accent, color: accent }}>{s}</span>)}
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Senior Software Engineer</span> - Tech Company (2022-Present)</div>
            <div className="text-[9px] text-gray-600">Led microservices architecture serving 1M+ users across 50+ services</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Software Developer</span> - StartupX (2020-2022)</div>
            <div className="text-[9px] text-gray-600">Built scalable backend systems using Java Spring Boot & PostgreSQL</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[9px] text-gray-600 mt-1">B.Tech Computer Science - IIT Delhi (2020-2024)</div>
          </div>
        </div>
      </div>
    ),
    'frontend': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-3" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full bg-white/20 mx-auto" />
          <div><div className="text-[10px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>john@email.com</div><div>+1 234 567 890</div><div>linkedin.com/in/john</div></div></div>
          <div><div className="text-[10px] font-bold text-white/90 uppercase">Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">{['React','TypeScript','Tailwind','Next.js','Redux','CSS3','GraphQL'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}</div></div>
          <div><div className="text-[10px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[8px] text-white/70 mt-1">B.Tech CSE<br/>University<br/>2020-2024</div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="pb-1 border-b-2 mb-2" style={{ borderColor: accent }}>
            <div className="text-lg font-bold" style={{ color: accent }}>Alex Chen</div>
            <div className="text-xs text-gray-500">Frontend Developer</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Senior Frontend Dev</span> - Tech Co. (2022-Present)</div>
            <div className="text-[9px] text-gray-600 ml-2">Built scalable React apps with 99.9% uptime, served 2M+ users</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Frontend Dev</span> - StartupX (2020-2022)</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>Projects</div>
            <div className="text-[9px] text-gray-600 mt-1">Design System - React, Storybook, Tailwind CSS</div>
            <div className="text-[9px] text-gray-600">E-Commerce Dashboard - Analytics, Charts, Real-time data</div>
          </div>
        </div>
      </div>
    ),
    'backend': (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ backgroundColor: bg, minHeight: '500px' }}>
        <div className="p-5 text-center border-b-2" style={{ borderColor: accent }}>
          <div className="text-lg font-bold" style={{ color: accent }}>Maria Santos</div>
          <div className="text-xs text-gray-500">Backend Developer</div>
          <div className="text-[10px] text-gray-400 mt-1">maria@email.com | linkedin.com/in/maria</div>
        </div>
        <div className="flex-1 p-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {['Java','Python','Node.js','SQL','Docker','AWS','Redis','Kafka','PostgreSQL','GraphQL'].map(s => <span key={s} className="text-[8px] px-2 py-0.5 rounded border" style={{ borderColor: accent, color: accent }}>{s}</span>)}
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Backend Engineer</span> - Tech Co. (2022-Present)</div>
            <div className="text-[9px] text-gray-600">Designed REST APIs handling 10M+ requests/day with 99.9% uptime</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Junior Developer</span> - StartupX (2020-2022)</div>
            <div className="text-[9px] text-gray-600">Built and maintained microservices in Node.js and Python</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Architecture</div>
            <div className="flex gap-1 mt-1">{['REST APIs','Event-Driven','CQRS','Microservices','Serverless'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: accent + '15', color: accent }}>{s}</span>)}</div>
          </div>
        </div>
      </div>
    ),
    'ai-ml': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-3" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full bg-white/20 mx-auto" />
          <div><div className="text-[10px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>john@email.com</div><div>linkedin.com/in/john</div><div>github.com/john</div></div></div>
          <div><div className="text-[10px] font-bold text-white/90 uppercase">ML/AI Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">{['TensorFlow','PyTorch','Scikit-learn','NLP','CV','Deep Learning','LLMs'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}</div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="flex justify-between items-start border-b pb-1" style={{ borderColor: accent }}>
            <div><div className="text-lg font-bold" style={{ color: accent }}>Dr. Sarah Lee</div><div className="text-xs text-gray-500">ML Engineer</div></div>
            <div className="text-right text-[10px] text-gray-400"><div>Ph.D. AI</div><div>Stanford</div></div>
          </div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">ML Engineer</span> - AI Corp (2022-Present)</div>
            <div className="text-[9px] text-gray-600">Built NLP pipelines processing 1M+ docs/day with 95% accuracy</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Research Scientist</span> - Research Lab (2018-2022)</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>Projects</div>
            <div className="text-[9px] text-gray-600 mt-1">Image Classification - ResNet, PyTorch, 95% accuracy</div>
            <div className="text-[9px] text-gray-600">LLM Fine-tuning - LLaMA 2, QLoRA, instruction tuning</div>
          </div>
        </div>
      </div>
    ),
    'fullstack': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-3" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full bg-white/20 mx-auto" />
          <div><div className="text-[10px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>john@email.com</div><div>+1 234 567 890</div><div>linkedin.com/in/john</div><div>github.com/john</div></div></div>
          <div><div className="text-[10px] font-bold text-white/90 uppercase">Skills</div>
            <div className="flex flex-wrap gap-1 mt-1">{['React','Node.js','TypeScript','Python','SQL','Docker','AWS'].map(s => <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s}</span>)}</div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div><div className="text-lg font-bold" style={{ color: accent }}>Jordan Park</div><div className="text-xs text-gray-500">Full Stack Developer</div></div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Full Stack Dev</span> - Tech Co. (2022-Present)</div>
            <div className="text-[9px] text-gray-600">Built full-stack apps with React + Node.js serving 500K+ users</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Developer</span> - StartupX (2020-2022)</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Projects</div>
            <div className="text-[9px] text-gray-600 mt-1">E-Commerce Platform - Full stack with React, Node.js, Stripe</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[9px] text-gray-600 mt-1">B.Tech Computer Science - University (2020-2024)</div>
          </div>
        </div>
      </div>
    ),
    'modern-professional': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[38%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[9px] font-bold text-white/90 uppercase tracking-wide">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>+1 234 567 890</div><div>hello@email.com</div><div>123 Anywhere St.</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase tracking-wide">About Me</div>
            <div className="text-[8px] text-white/70 mt-1 leading-relaxed">Creative professional with 5+ years of experience in visual design, UX/UI, and brand development.</div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase tracking-wide">Skills</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>• Management Skills</div><div>• Creativity</div><div>• Digital Marketing</div><div>• Negotiation</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase tracking-wide">Language</div>
            <div className="text-[8px] text-white/70">English · Spanish</div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-xl font-bold text-gray-900">Lorna Alvarado</div>
          <div className="text-xs text-gray-500 mb-2">Marketing Manager</div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[9px] text-gray-600 mt-1">Bachelor of Business Management</div>
            <div className="text-[9px] text-gray-400">Bonchille University · 2015 - 2020</div></div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Product Design Manager</span> · 2015 - 2020</div>
            <div className="text-[9px] text-gray-500">Creative Agency, Inc.</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Marketing Specialist</span> · 2012 - 2015</div>
            <div className="text-[9px] text-gray-500">Digital Corp</div></div>
        </div>
      </div>
    ),
    'blackwhite-minimalist': (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-300 flex flex-col" style={{ backgroundColor: '#ffffff', minHeight: '500px' }}>
        <div className="p-5 text-center border-b border-gray-300">
          <div className="text-xl font-bold text-gray-900">Mariana Anderson</div>
          <div className="text-xs text-gray-600">Marketing Manager</div>
          <div className="text-[10px] text-gray-400 mt-1">mariana@email.com | +1 234 567 890</div>
        </div>
        <div className="flex-1 p-5 space-y-3">
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Education</div>
            <div className="text-[9px] text-gray-700 mt-1">Bachelor of Business · Bonchille University</div>
            <div className="text-[9px] text-gray-500">2015 - 2020</div></div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Experience</div>
            <div className="text-[9px] text-gray-700 mt-1"><span className="font-semibold">Marketing Manager</span> · 2022 - Present</div>
            <div className="text-[9px] text-gray-600">Acme International Co.</div>
            <div className="text-[9px] text-gray-700 mt-1.5"><span className="font-semibold">Junior Marketer</span> · 2020 - 2022</div>
            <div className="text-[9px] text-gray-600">Startup Ltd.</div></div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Expertise</div>
            <div className="text-[9px] text-gray-700 mt-1">UX/UI · Wireframes · Storyboards · User Flows · Prototyping</div></div>
        </div>
      </div>
    ),
    'bluegray-simple': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-base font-bold text-gray-900 uppercase tracking-wide">Richard Sanchez</div>
          <div className="text-xs text-gray-500">Marketing Manager</div>
          <div><div className="text-[10px] font-bold uppercase flex items-center gap-1" style={{ color: accent }}>● Profile</div>
            <div className="text-[9px] text-gray-600 mt-1 leading-relaxed">Creative marketing professional with 10+ years experience in digital campaigns and brand strategy development.</div></div>
          <div><div className="text-[10px] font-bold uppercase flex items-center gap-1" style={{ color: accent }}>● Work Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Senior Marketing Manager</span></div>
            <div className="text-[9px] text-gray-500">Beacon Studio · 2020 - PRESENT</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Marketing Coordinator</span></div>
            <div className="text-[9px] text-gray-500">Agency Co. · 2015 - 2020</div></div>
        </div>
        <div className="w-[38%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>+123 456 7890</div><div>hello@email.com</div><div>linkedin.com/in/richard</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>• Project Management</div><div>• Public Relations</div><div>• Time Management</div><div>• Leadership</div></div></div>
        </div>
      </div>
    ),
    'professional-modern': (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ backgroundColor: bg, minHeight: '500px' }}>
        <div className="p-5 text-center">
          <div className="text-xl font-bold text-gray-900">Lorna Alvarado</div>
          <div className="text-xs text-gray-500">Marketing Manager</div>
        </div>
        <div className="flex-1 p-5 pt-0 space-y-3">
          <div className="flex justify-center gap-4 text-[9px] text-gray-500">+123 456 7890 · hello@email.com · linkedin.com/in/lorna</div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b pb-1">About Me</div>
            <div className="text-[9px] text-gray-600 mt-1 leading-relaxed">Creative professional with 5+ years of experience in visual design, UX/UI, and brand development. Passionate about delivering impactful marketing campaigns.</div></div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b pb-1">Skills</div>
            <div className="flex flex-wrap gap-1.5 mt-1">{['Management','Creativity','Digital Marketing','Negotiation','SEO','Analytics'].map(s => <span key={s} className="text-[8px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">{s}</span>)}</div></div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b pb-1">Experience</div>
            <div className="text-[9px] text-gray-700 mt-1"><span className="font-semibold">Marketing Manager</span> · Acme International · 2020-Present</div>
            <div className="text-[9px] text-gray-600">Led team of 10 marketing professionals, increased ROI by 40%</div></div>
        </div>
      </div>
    ),
    'grayblue-sidebar': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>+1 234 567 890</div><div>hello@email.com</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[8px] text-white/70 mt-1">BA Marketing · University 2015-2020</div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>• Marketing Strategy</div><div>• SEO/SEM</div><div>• Content Creation</div><div>• Analytics</div></div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-xl font-bold text-gray-900">Olivia Sanchez</div>
          <div className="text-xs text-gray-500">Marketing Manager</div>
          <div><div className="text-[10px] font-bold uppercase border-b pb-1" style={{ borderColor: accent, color: accent }}>Summary</div>
            <div className="text-[9px] text-gray-600 mt-1 leading-relaxed">Creative marketing professional with 8+ years of experience driving brand growth and digital strategy for Fortune 500 companies.</div></div>
          <div><div className="text-[10px] font-bold uppercase border-b pb-1" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Marketing Manager</span> · Acme International · 2020-Present</div>
            <div className="text-[9px] text-gray-500">Led campaigns generating $5M+ in revenue</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Digital Marketing Specialist</span> · Agency X · 2016-2020</div></div>
        </div>
      </div>
    ),
    'dark-sidebar-photo': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>+1 234 567 890</div><div>hello@email.com</div><div>linkedin.com/in/user</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[8px] text-white/70 mt-1">BA Marketing · University 2015-2020</div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>• Marketing</div><div>• SEO</div><div>• Content Strategy</div></div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-xl font-bold text-gray-900">Olivia Sanchez</div>
          <div className="text-xs text-gray-500">Marketing Manager</div>
          <div><div className="text-[10px] font-bold uppercase border-b pb-1" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Marketing Manager</span> · Acme International · 2020-Present</div>
            <div className="text-[9px] text-gray-500">Managed $2M annual marketing budget</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">SEO Specialist</span> · Digital Agency · 2017-2020</div></div>
          <div><div className="text-[10px] font-bold uppercase border-b pb-1" style={{ borderColor: accent, color: accent }}>References</div>
            <div className="text-[9px] text-gray-600 mt-1">Harumi Kobayashi · CEO, Acme International</div>
            <div className="text-[9px] text-gray-600">Dr. James Wilson · Professor, University</div></div>
        </div>
      </div>
    ),
    'gray-sidebar-right': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-xl font-bold text-gray-900">Lorna Alvarado</div>
          <div className="text-xs text-gray-500">Digital Marketing Specialist</div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>About Me</div>
            <div className="text-[9px] text-gray-600 mt-1 leading-relaxed">Creative professional with 5+ years of experience in visual design, UX/UI, and brand development. Passionate about creating meaningful digital experiences.</div></div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>Work Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Marketing Manager</span> · Acme International · 2020-Present</div>
            <div className="text-[9px] text-gray-500">Led cross-functional marketing campaigns</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Digital Marketing Intern</span> · Agency Co. · 2019-2020</div></div>
        </div>
        <div className="w-[35%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>+1 234 567 890</div><div>hello@email.com</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[8px] text-white/70 mt-1">BA Marketing · University 2015-2020</div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>• Digital Strategy</div><div>• SEO/SEM</div><div>• Content Marketing</div></div></div>
        </div>
      </div>
    ),
    'centered-light': (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col" style={{ backgroundColor: bg, minHeight: '500px' }}>
        <div className="p-5 text-center border-b border-gray-200">
          <div className="text-xl font-bold text-gray-900">Emma Warner</div>
          <div className="text-xs text-gray-500">Accounting Executive</div>
        </div>
        <div className="flex-1 p-5 space-y-3">
          <div className="flex justify-center gap-3 text-[9px] text-gray-500">emma@email.com · +1 234 567 890 · linkedin.com/in/emma</div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Summary</div>
            <div className="text-[9px] text-gray-600 mt-1 leading-relaxed">Detail-oriented accounting executive with 7+ years of experience in financial reporting, auditing, and strategic financial planning.</div></div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Education</div>
            <div className="text-[9px] text-gray-600 mt-1">Bachelor of Marketing · University (2015-2019)</div></div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Skills</div>
            <div className="text-[9px] text-gray-600 mt-1">Client Relations · Budgeting · Strategic Planning · Financial Analysis</div></div>
          <div><div className="text-[10px] font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Experience</div>
            <div className="text-[9px] text-gray-700 mt-1"><span className="font-semibold">Accounting Executive</span> · Acme International · 2020-Present</div>
            <div className="text-[9px] text-gray-600">Managed $10M+ portfolio, reduced costs by 15%</div></div>
        </div>
      </div>
    ),
    'brown-sidebar': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-xl font-bold text-gray-900">Lorna Alvarado</div>
          <div className="text-xs text-gray-500">Marketing Manager</div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>About Me</div>
            <div className="text-[9px] text-gray-600 mt-1 leading-relaxed">Creative marketing professional with 8+ years of experience in digital campaigns, brand strategy, and team leadership.</div></div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>Education</div>
            <div className="text-[9px] text-gray-600 mt-1">BA Marketing · University (2015-2020)</div></div>
          <div><div className="text-[10px] font-bold uppercase" style={{ color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-700 mt-1"><span className="font-semibold">Marketing Manager</span> · Agency Inc. · 2020-Present</div>
            <div className="text-[9px] text-gray-600">Led 15-person team, managed $3M annual budget</div></div>
        </div>
        <div className="w-[35%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Skills</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>• Project Management</div><div>• Public Relations</div><div>• Time Management</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[8px] text-white/70 mt-1">BA Marketing<br/>University</div></div>
        </div>
      </div>
    ),
    'dark-sidebar-right': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-xl font-bold text-gray-900">Connor Hamilton</div>
          <div className="text-xs text-gray-500">Accounting Executive</div>
          <div><div className="text-[10px] font-bold uppercase border-b pb-1" style={{ borderColor: accent, color: accent }}>Work Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Accounting Executive</span> · Acme International · 2020-Present</div>
            <div className="text-[9px] text-gray-500">Managed financial reporting for $50M+ portfolio</div>
            <div className="text-[9px] text-gray-600 mt-1.5"><span className="font-semibold">Junior Accountant</span> · Finance Corp · 2017-2020</div></div>
          <div><div className="text-[10px] font-bold uppercase border-b pb-1" style={{ borderColor: accent, color: accent }}>Projects</div>
            <div className="text-[9px] text-gray-600 mt-1">Financial Analysis Dashboard · Automated reporting system</div></div>
        </div>
        <div className="w-[35%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Contact</div>
            <div className="text-[8px] text-white/70 mt-1 space-y-0.5"><div>+1 234 567 890</div><div>hello@email.com</div><div>linkedin.com/in/connor</div></div></div>
          <div><div className="text-[9px] font-bold text-white/90 uppercase">Education</div>
            <div className="text-[8px] text-white/70 mt-1">BA Accounting · University</div></div>
        </div>
      </div>
    ),
    'blank-canvas': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[30%] h-full p-3 flex flex-col gap-1.5" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-8 h-8 rounded-full border border-blue-400 overflow-hidden shrink-0 bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-600">Y</div>
            <div className="text-[9px] leading-tight"><div className="font-bold text-gray-900">Your Name</div><div className="text-gray-500">Job Title</div></div>
          </div>
          <div><div className="text-[8px] font-bold text-blue-600 uppercase tracking-wide">Skills</div>
            <div className="text-[7px] text-gray-600 mt-0.5">React · Node.js · TypeScript</div></div>
          <div><div className="text-[8px] font-bold text-blue-600 uppercase tracking-wide">Education</div>
            <div className="text-[7px] text-gray-600 mt-0.5">B.Tech CSE · University 2024</div></div>
        </div>
        <div className="w-[70%] p-3 space-y-1.5" style={{ backgroundColor: bg }}>
          <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
            <div className="text-[8px] text-gray-400">✉ your@email.com</div>
            <div className="text-[8px] text-gray-400">📞 +1 234 567 890</div>
          </div>
          <div><div className="text-[8px] font-bold text-blue-600 uppercase tracking-wide">Experience</div>
            <div className="text-[7px] text-gray-600 mt-0.5"><span className="font-semibold">Job Title</span> · Company Name · 2022-Present</div>
            <div className="text-[7px] text-gray-500">• Responsibility description here</div>
          </div>
          <div><div className="text-[8px] font-bold text-blue-600 uppercase tracking-wide">Projects</div>
            <div className="text-[7px] text-gray-600 mt-0.5">Project Name · Description</div>
          </div>
        </div>
      </div>
    ),
    'blue-sidebar-profile': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div className="text-center"><div className="text-[10px] font-bold text-white">Sarah Johnson</div><div className="text-[8px] text-white/70">Product Designer</div></div>
          <div><div className="text-[8px] font-bold text-white/80 uppercase tracking-wide">Contact</div>
            <div className="text-[7px] text-white/60 mt-1 space-y-0.5">sarah@email.com<br/>+1 234 567 890<br/>linkedin.com/in/sarah</div></div>
          <div><div className="text-[8px] font-bold text-white/80 uppercase">Skills</div>
            <div className="text-[7px] text-white/60 mt-1 space-y-0.5"><div>• UX Research</div><div>• UI Design</div><div>• Figma</div><div>• Prototyping</div></div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-base font-bold text-gray-900 uppercase tracking-wide">About Me</div>
          <div className="text-[9px] text-gray-600 leading-relaxed">Creative product designer with 5+ years of experience crafting user-centered digital experiences for web and mobile platforms.</div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Education</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">B.Des</span> · Design School · 2016-2020</div></div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Product Designer</span> · Design Co. · 2020-Present</div>
            <div className="text-[9px] text-gray-500">Led redesign of core product, improving UX by 40%</div></div>
        </div>
      </div>
    ),
    'orange-sidebar-profile': (
      <div className="flex h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>
        <div className="w-[35%] h-full p-4 flex flex-col gap-2.5" style={{ backgroundColor: accent }}>
          <div className="w-14 h-14 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-white/10" />
          <div className="text-center"><div className="text-[10px] font-bold text-white">Lorna Alvarado</div><div className="text-[8px] text-white/70">Marketing Manager</div></div>
          <div><div className="text-[8px] font-bold text-white/80 uppercase">Contact</div>
            <div className="text-[7px] text-white/60 mt-1 space-y-0.5">+1 234 567 890<br/>lorna@email.com</div></div>
          <div><div className="text-[8px] font-bold text-white/80 uppercase">Skills</div>
            <div className="text-[7px] text-white/60 mt-1 space-y-0.5"><div>• Marketing Strategy</div><div>• SEO</div><div>• Content Creation</div></div></div>
          <div><div className="text-[8px] font-bold text-white/80 uppercase">Education</div>
            <div className="text-[7px] text-white/60">BA Marketing · University</div></div>
        </div>
        <div className="flex-1 p-4 space-y-3" style={{ backgroundColor: bg }}>
          <div className="text-base font-bold text-gray-900 uppercase tracking-wide">About Me</div>
          <div className="text-[9px] text-gray-600 leading-relaxed">Creative marketing manager with 8+ years of experience driving digital campaigns, brand strategy, and team growth.</div>
          <div><div className="text-[10px] font-bold uppercase border-b" style={{ borderColor: accent, color: accent }}>Experience</div>
            <div className="text-[9px] text-gray-600 mt-1"><span className="font-semibold">Marketing Manager</span> · Agency Inc. · 2020-Present</div>
            <div className="text-[9px] text-gray-500">Managed $2M annual budget, led 12-person team</div></div>
        </div>
      </div>
    ),
  };

  const premiumToFree: Record<string, string> = {
    'grayblue-premium': 'grayblue-sidebar',
    'dark-photo-premium': 'dark-sidebar-photo',
    'gray-right-premium': 'gray-sidebar-right',
    'centered-premium': 'centered-light',
    'brown-premium': 'brown-sidebar',
    'dark-right-premium': 'dark-sidebar-right',
  };
  return <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-gray-200" style={{ minHeight: '500px' }}>{layouts[tid] || layouts[premiumToFree[tid]] || (isTwoCol ? layouts['grayblue-sidebar'] : layouts['ats-beginner'])}</div>;
}

/* ─── main wizard ───────────────────────────────────────────────────────── */

export default function TemplateWizard({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [filter, setFilter] = useState<'all' | 'simple' | 'professional' | 'modern' | 'creative'>('all');
  const [uploading, setUploading] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [importMode, setImportMode] = useState<'file' | 'paste'>('file');
  const fileRef = useRef<HTMLInputElement>(null);

  // form state for step 5
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', linkedin: '', github: '', skills: '', photo: '',
    experience: [{ role: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    projects: [{ title: '', description: '', link: '' }],
    certifications: [{ name: '', issuer: '', year: '' }],
    summary: '',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('unlockedTemplates') || '[]'); } catch { return []; }
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTemplate, setPaymentTemplate] = useState<Template | null>(null);

  const handleUnlock = (t: Template) => {
    if (!t.isPremium) return;
    setPaymentTemplate(t);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!paymentTemplate) return;
    const updated = [...new Set([...unlockedTemplates, paymentTemplate.id])];
    setUnlockedTemplates(updated);
    localStorage.setItem('unlockedTemplates', JSON.stringify(updated));
    setShowPaymentModal(false);
    setPaymentTemplate(null);
    setStep(2);
  };

  const FALLBACK_TEMPLATES: Template[] = [];

  useEffect(() => {
    resumeApi.getTemplates()
      .then(r => {
        const apiTemplates = r.data.templates || [];
        const merged = FALLBACK_TEMPLATES.map(ft => apiTemplates.find((at: any) => at.id === ft.id) || ft);
        apiTemplates.forEach((at: any) => {
          if (!merged.find((m: any) => m.id === at.id)) merged.push(at);
        });
        setTemplates(merged);
      })
      .catch(() => setTemplates(FALLBACK_TEMPLATES));
  }, []);

  const filtered = templates.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'simple') return t.is_ats_friendly;
    if (filter === 'professional') return t.category === 'professional';
    if (filter === 'modern') return t.columns === 2;
    if (filter === 'creative') return !t.is_ats_friendly;
    return true;
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await resumeApi.upload(file);
      const sections = res.data.sections || [];
      const text = sections.map((s: any) => s.value || '').join('\n');
      setForm(f => ({
        ...f,
        name: extractField(text, 'name') || f.name,
        email: extractField(text, 'email') || f.email,
        phone: extractField(text, 'phone') || f.phone,
        linkedin: extractField(text, 'linkedin') || f.linkedin,
        github: extractField(text, 'github') || f.github,
        summary: sections.find((s: any) => s.type === 'summary')?.value || f.summary,
        skills: sections.find((s: any) => s.type === 'skills')?.items?.join(', ') || f.skills,
      }));
      toast.success('Resume imported successfully!');
      setStep(5);
    } catch {
      toast.error('Failed to import resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const extractField = (text: string, field: string): string => {
    const lines = text.split('\n');
    for (const line of lines) {
      if (field === 'email' && /[\w.]+@[\w.]+\.\w+/.test(line)) {
        const m = line.match(/[\w.]+@[\w.]+\.\w+/);
        return m ? m[0] : '';
      }
      if (field === 'phone' && /\+?\d[\d\s-]{8,}/.test(line)) {
        const m = line.match(/\+?\d[\d\s-]{8,}/);
        return m ? m[0].trim() : '';
      }
      if (field === 'linkedin' && /linkedin\.com/.test(line)) {
        const m = line.match(/linkedin\.com\/[^\s]+/);
        return m ? m[0] : '';
      }
      if (field === 'github' && /github\.com/.test(line)) {
        const m = line.match(/github\.com\/[^\s]+/);
        return m ? m[0] : '';
      }
    }
    return '';
  };

  const handleStartBlank = () => setStep(5);

  const addEntry = (field: 'experience' | 'education' | 'projects' | 'certifications') => {
    const blank: Record<string, any> = {
      experience: { role: '', company: '', duration: '', description: '' },
      education: { degree: '', institution: '', year: '' },
      projects: { title: '', description: '', link: '' },
      certifications: { name: '', issuer: '', year: '' },
    };
    setForm(f => ({ ...f, [field]: [...f[field], blank[field]] }));
  };

  const removeEntry = (field: 'experience' | 'education' | 'projects' | 'certifications', idx: number) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_: any, i: number) => i !== idx) }));
  };

  const updateEntry = (field: 'experience' | 'education' | 'projects' | 'certifications', idx: number, key: string, val: string) => {
    setForm(f => {
      const arr = [...f[field]];
      arr[idx] = { ...arr[idx], [key]: val };
      return { ...f, [field]: arr };
    });
  };

  const handleFinish = () => {
    onComplete({ templateId: selectedTemplate?.id || 'ats-beginner', formData: form });
  };

  /* ── STEP 1: Template Gallery ──────────────────────────────────────── */
  if (step === 1) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-gray-900">
        {/* header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Start building your resume</h1>
          <p className="text-slate-400 text-sm sm:text-lg">Choose a design you like. You can customize or switch it later.</p>
        </div>

        {/* filter tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-3">
          {[
            { key: 'all' as const, label: 'All', icon: null },
            { key: 'simple' as const, label: 'Simple', icon: null },
            { key: 'professional' as const, label: 'Professional', icon: null },
            { key: 'modern' as const, label: 'Modern', icon: null },
            { key: 'creative' as const, label: 'Creative', icon: null },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                filter === f.key
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-violet-500/50 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* template grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {filtered.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="cursor-pointer group"
                onClick={() => {
                  if (t.isPremium && !unlockedTemplates.includes(t.id)) {
                    handleUnlock(t);
                    return;
                  }
                  setSelectedTemplate(t);
                  setStep(2);
                }}
              >
                <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-lg hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-violet-500/50">
                  <div className="h-80 overflow-hidden relative">
                    {t.isPremium && !unlockedTemplates.includes(t.id) && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity">
                        <Lock className="w-8 h-8 text-yellow-400 mb-2" />
                        <span className="text-yellow-400 font-bold text-sm">₹5 Unlock</span>
                        <span className="text-white/70 text-[10px] mt-1">Premium Template</span>
                      </div>
                    )}
                    {t.isPremium && (
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        <Crown className="w-3 h-3" /> PRO
                      </div>
                    )}
                    <MiniResume type={t.id} colors={t.colors || ['#6d28d9', '#f8fafc']} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentTemplate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl max-w-sm w-full p-6 border border-white/10 text-center" style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)' }}>
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Unlock Premium Template</h3>
              <p className="text-slate-400 text-sm mb-1">{paymentTemplate.name}</p>
              <p className="text-2xl font-bold text-yellow-400 mb-4">₹5</p>
              <p className="text-slate-500 text-xs mb-5">One-time payment · Lifetime access</p>
              <div className="flex gap-3">
                <button onClick={confirmPayment} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-semibold text-sm hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg shadow-yellow-500/25">
                  Pay ₹5 & Unlock
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  /* ── STEP 2: Template Detail Popup ─────────────────────────────────── */
  if (step === 2 && selectedTemplate) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col sm:flex-row shadow-2xl border border-white/10" style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)' }}>
          {/* left: large preview - full width on mobile, 55% on desktop */}
          <div className="w-full sm:w-[55%] p-3 sm:p-6 overflow-y-auto bg-gray-800/50 max-sm:max-h-[40vh]">
            <LargeResumePreview template={selectedTemplate} />
          </div>
          {/* right: info */}
          <div className="w-full sm:w-[45%] p-4 sm:p-8 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{selectedTemplate.name}</h2>
            <p className="text-slate-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{selectedTemplate.description}</p>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-sm text-slate-400">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" /> A4 / US-Letter Size</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" /> Editable Text</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" /> Fully customizable</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" /> Print ready format</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" /> Online resume with shareable link</li>
            </ul>
            <div className="flex gap-2 sm:gap-3">
              <button onClick={() => setStep(3)} className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm sm:text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25">
                Use this template
              </button>
              <button onClick={() => setStep(1)} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-white/10 text-slate-400 text-sm sm:text-base hover:bg-white/5 hover:text-white transition-colors">
                Back
              </button>
            </div>
            <button onClick={onCancel} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 hover:text-white">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ── STEP 3: Import or Start Blank Popup ───────────────────────────── */
  if (step === 3) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative" style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setStep(2)} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 hover:text-white">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Import your existing resume</h2>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Start faster by prefilling your resume content.</p>
          <div className="space-y-3 sm:space-y-4">
            <button onClick={() => setStep(4)} className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 text-base sm:text-lg">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" /> Import resume
            </button>
            <button onClick={handleStartBlank} className="w-full py-3 sm:py-4 rounded-xl border-2 border-white/10 text-slate-300 font-semibold hover:bg-white/5 hover:text-white transition-colors text-base sm:text-lg">
              Start from blank
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ── STEP 4: File Upload / Paste Text Popup ────────────────────────── */
  if (step === 4) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl max-w-lg w-full p-4 sm:p-8 shadow-2xl border border-white/10 relative" style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setStep(3)} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 hover:text-white">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Import Resume</h2>

          {/* tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6">
            <button onClick={() => setImportMode('file')} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${importMode === 'file' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              Resume File
            </button>
            <button onClick={() => setImportMode('paste')} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${importMode === 'paste' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              Paste Text
            </button>
          </div>

          {importMode === 'file' ? (
            <div>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.png,.jpg,.jpeg" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 sm:p-12 text-center cursor-pointer hover:border-violet-500/50 hover:bg-white/5 transition-all"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                    <p className="text-slate-400">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Choose a file or drag and drop it here</p>
                      <p className="text-slate-500 text-sm mt-1">.pdf, .docx, .png, .jpeg, .jpg</p>
                    </div>
                    <button className="mt-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25">
                      Select Resume
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <button
                onClick={() => {
                  if (!pasteText.trim()) { toast.error('Please paste your resume content'); return; }
                  setForm(f => ({ ...f, summary: pasteText }));
                  toast.success('Content imported!');
                  setStep(5);
                }}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
              >
                Import Text
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  /* ── STEP 5: Editor (Form + Live Preview) ──────────────────────────── */
  if (step === 5) {
    const accent = selectedTemplate?.colors?.[0] || '#6d28d9';
    const bg = selectedTemplate?.colors?.[1] || '#f8fafc';

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-gray-900">
        {/* top bar */}
        <div className="border-b border-white/10 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button onClick={() => setStep(1)} className="text-xs sm:text-sm text-slate-400 hover:text-white shrink-0">Templates</button>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-white truncate">{selectedTemplate?.name || 'Resume'}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowPreview(p => !p)} className="sm:hidden px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:bg-white/5">
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={handleFinish} className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs sm:text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-1 sm:gap-2">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Save Resume</span><span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>

        {/* content: form left + preview right */}
        <div className="flex flex-col sm:flex-row h-[calc(100vh-53px)]">
          {/* left: form - full width on mobile, hidden when preview shown */}
          <div className={`${showPreview ? 'hidden' : 'block'} sm:block w-full sm:w-[45%] overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5`}>
            {/* personal info */}
            <FormSection title="Personal Information" icon={<div className="w-5 h-5 rounded-full bg-violet-400/20" />}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                  {form.photo ? (
                    <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-slate-400 mb-1 block">Photo (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-violet-600/20 file:text-violet-300 hover:file:bg-violet-600/30 cursor-pointer"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setForm(f => ({ ...f, photo: ev.target?.result as string }));
                      reader.readAsDataURL(file);
                    }}
                  />
                  {form.photo && (
                    <button onClick={() => setForm(f => ({ ...f, photo: '' }))} className="text-[10px] text-red-400 hover:text-red-300 mt-1">Remove photo</button>
                  )}
                </div>
              </div>
              <Input label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="John Doe" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="john@email.com" />
                <Input label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+1 234 567 890" />
              </div>
              <Input label="Address / Location" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="New York, NY" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="LinkedIn" value={form.linkedin} onChange={v => setForm(f => ({ ...f, linkedin: v }))} placeholder="linkedin.com/in/johndoe" />
                <Input label="GitHub" value={form.github} onChange={v => setForm(f => ({ ...f, github: v }))} placeholder="github.com/johndoe" />
              </div>
            </FormSection>

            {/* summary */}
            <FormSection title="Professional Summary">
              <textarea
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="Write a brief professional summary..."
                className="w-full h-24 sm:h-28 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </FormSection>

            {/* experience */}
            <FormSection title="Experience" onAdd={() => addEntry('experience')}>
              {form.experience.map((exp, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 relative">
                  {form.experience.length > 1 && <button onClick={() => removeEntry('experience', i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                  <Input label="Role" value={exp.role} onChange={v => updateEntry('experience', i, 'role', v)} placeholder="Software Engineer" />
                  <Input label="Company" value={exp.company} onChange={v => updateEntry('experience', i, 'company', v)} placeholder="Company Name" />
                  <Input label="Duration" value={exp.duration} onChange={v => updateEntry('experience', i, 'duration', v)} placeholder="2022 - Present" />
                  <textarea value={exp.description} onChange={e => updateEntry('experience', i, 'description', e.target.value)} placeholder="Description..." className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50" />
                </div>
              ))}
            </FormSection>

            {/* education */}
            <FormSection title="Education" onAdd={() => addEntry('education')}>
              {form.education.map((edu, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 relative">
                  {form.education.length > 1 && <button onClick={() => removeEntry('education', i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                  <Input label="Degree" value={edu.degree} onChange={v => updateEntry('education', i, 'degree', v)} placeholder="B.Tech CSE" />
                  <Input label="Institution" value={edu.institution} onChange={v => updateEntry('education', i, 'institution', v)} placeholder="University Name" />
                  <Input label="Year" value={edu.year} onChange={v => updateEntry('education', i, 'year', v)} placeholder="2020 - 2024" />
                </div>
              ))}
            </FormSection>

            {/* skills */}
            <FormSection title="Technical Skills">
              <textarea
                value={form.skills}
                onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                placeholder="React, Node.js, TypeScript, Python, SQL..."
                className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </FormSection>

            {/* projects */}
            <FormSection title="Projects" onAdd={() => addEntry('projects')}>
              {form.projects.map((proj, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 relative">
                  {form.projects.length > 1 && <button onClick={() => removeEntry('projects', i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                  <Input label="Title" value={proj.title} onChange={v => updateEntry('projects', i, 'title', v)} placeholder="Project Name" />
                  <Input label="Link" value={proj.link} onChange={v => updateEntry('projects', i, 'link', v)} placeholder="github.com/..." />
                  <textarea value={proj.description} onChange={e => updateEntry('projects', i, 'description', e.target.value)} placeholder="Description..." className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50" />
                </div>
              ))}
            </FormSection>

            {/* certifications */}
            <FormSection title="Certifications" onAdd={() => addEntry('certifications')}>
              {form.certifications.map((cert, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 relative">
                  {form.certifications.length > 1 && <button onClick={() => removeEntry('certifications', i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                  <Input label="Name" value={cert.name} onChange={v => updateEntry('certifications', i, 'name', v)} placeholder="Certification Name" />
                  <Input label="Issuer" value={cert.issuer} onChange={v => updateEntry('certifications', i, 'issuer', v)} placeholder="Issuer" />
                  <Input label="Year" value={cert.year} onChange={v => updateEntry('certifications', i, 'year', v)} placeholder="2024" />
                </div>
              ))}
            </FormSection>
          </div>

          {/* right: live preview - full width on mobile when shown */}
          <div className={`${!showPreview ? 'hidden' : 'block'} sm:block w-full sm:w-[55%] overflow-y-auto p-3 sm:p-6 bg-gray-800/50`}>
            <ResumePreview
              template={selectedTemplate}
              form={form}
              accent={accent}
              bg={bg}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

/* ─── template-aware resume preview ───────────────────────────────────── */

function ResumePreview({ template, form, accent, bg }: {
  template: Template | null; form: any; accent: string; bg: string;
}) {
  const isTwoCol = template?.columns === 2;
  const tid = template?.id || '';

  // shared section renderers
  const Summary = () => form.summary ? (
    <div className="mb-4"><SectionTitle text="Professional Summary" accent={accent} /><p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p></div>
  ) : null;

  const Experience = () => form.experience.some((e: any) => e.role || e.company) ? (
    <div className="mb-4"><SectionTitle text="Experience" accent={accent} />
      {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
        <div key={i} className="mb-2">
          <div className="flex justify-between items-start"><span className="text-xs font-semibold text-gray-800">{exp.role}</span><span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span></div>
          <div className="text-[11px] text-gray-500">{exp.company}</div>
          {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
        </div>
      ))}
    </div>
  ) : null;

  const Education = () => form.education.some((e: any) => e.degree || e.institution) ? (
    <div className="mb-4"><SectionTitle text="Education" accent={accent} />
      {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
        <div key={i} className="mb-1.5">
          <div className="flex justify-between"><span className="text-xs font-semibold text-gray-800">{edu.degree}</span><span className="text-[10px] text-gray-400">{edu.year}</span></div>
          <div className="text-[11px] text-gray-500">{edu.institution}</div>
        </div>
      ))}
    </div>
  ) : null;

  const Skills = () => form.skills ? (
    <div className="mb-4"><SectionTitle text={tid.includes('ai') ? 'ML/AI Skills' : 'Technical Skills'} accent={accent} />
      <div className="flex flex-wrap gap-1">
        {form.skills.split(',').map((s: string, i: number) => s.trim() && (
          tid.includes('ai') || tid === 'frontend' || tid === 'frontend-advanced'
            ? <span key={i} className="text-[10px] px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>{s.trim()}</span>
            : <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border" style={{ borderColor: accent, color: accent }}>{s.trim()}</span>
        ))}
      </div>
    </div>
  ) : null;

  const Projects = () => form.projects.some((p: any) => p.title) ? (
    <div className="mb-4"><SectionTitle text="Projects" accent={accent} />
      {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
        <div key={i} className="mb-2">
          <div className="text-xs font-semibold text-gray-800">{proj.title}{proj.link ? <span className="text-[10px] text-gray-400 ml-2">{proj.link}</span> : ''}</div>
          {proj.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{proj.description}</div>}
        </div>
      ))}
    </div>
  ) : null;

  const Certs = () => form.certifications.some((c: any) => c.name) ? (
    <div className="mb-4"><SectionTitle text="Certifications" accent={accent} />
      {form.certifications.filter((c: any) => c.name).map((cert: any, i: number) => (
        <div key={i} className="mb-0.5 text-xs"><span className="font-semibold text-gray-800">{cert.name}</span><span className="text-gray-400 ml-1">{cert.issuer}{cert.year ? ` • ${cert.year}` : ''}</span></div>
      ))}
    </div>
  ) : null;

  /* ── Single column layout (ATS, SDE, Backend) ── */
  const SingleColumn = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      {/* header */}
      <div className="p-6" style={{ backgroundColor: bg }}>
        <div className="text-xl font-bold" style={{ color: accent }}>{form.name || 'Your Name'}</div>
        {tid === 'backend' ? (
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
            {form.email && <span>{form.email}</span>}{form.phone && <span>| {form.phone}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
            {form.email && <span>{form.email}</span>}
            {form.phone && <span>{form.phone}</span>}
            {form.linkedin && <span>{form.linkedin.replace('https://', '')}</span>}
            {form.github && <span>{form.github.replace('https://', '')}</span>}
          </div>
        )}
        {tid === 'backend' && (form.linkedin || form.github) && (
          <div className="text-[10px] text-gray-400 mt-1 flex gap-2">
            {form.linkedin && <span>{form.linkedin}</span>}{form.github && <span>{form.github}</span>}
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <Summary /><Experience /><Education /><Skills /><Projects /><Certs />
      </div>
    </div>
  );

  /* ── Two column layout (Frontend, AI/ML) ── */
  const TwoColumn = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      {/* sidebar */}
      <div className="w-[35%] p-4 flex flex-col" style={{ backgroundColor: accent }}>
        {form.photo ? <div className="w-14 h-14 rounded-full mx-auto mb-3 overflow-hidden border-2 border-white/30"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div> : <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-3" />}
        <div className="mb-4">
          <div className="text-[9px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Contact</div>
          <div className="space-y-0.5 text-[9px] text-white/70 break-all">
            {form.email && <div>{form.email}</div>}
            {form.phone && <div>{form.phone}</div>}
            {form.linkedin && <div>{form.linkedin}</div>}
            {form.github && <div>{form.github}</div>}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-[9px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Education</div>
          {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
            <div key={i} className="mb-1.5">
              <div className="text-[9px] font-semibold text-white/90">{edu.degree}</div>
              <div className="text-[8px] text-white/70">{edu.institution}</div>
              <div className="text-[8px] text-white/50">{edu.year}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[9px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Skills</div>
          <div className="flex flex-wrap gap-1">
            {form.skills.split(',').map((s: string, i: number) => s.trim() && (
              <span key={i} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s.trim()}</span>
            ))}
          </div>
        </div>
      </div>
      {/* main */}
      <div className="w-[65%] p-5 space-y-3" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-lg font-bold" style={{ color: accent }}>{form.name || 'Your Name'}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {form.email || 'email@example.com'} {form.phone && `| ${form.phone}`}
          </div>
        </div>
        <Summary /><Experience /><Projects /><Certs />
      </div>
    </div>
  );

  /* ── ATS Beginner layout (ultra-clean, single-column, minimal) ── */
  const AtsBeginnerLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="flex">
        <div className="w-[8px] shrink-0" style={{ backgroundColor: accent }} />
        <div className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-4">
            {form.photo ? <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200"><img src={form.photo} alt="" className="w-full h-full object-cover" /></div> : <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold" style={{ color: accent }}>{(form.name || 'Y')[0]}</div>}
            <div>
              <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
              <div className="text-xs text-gray-500 mt-0.5">{form.email}{form.phone ? ` | ${form.phone}` : ''}</div>
              <div className="flex gap-3 text-[10px] text-gray-400 mt-0.5">{form.linkedin && <span>{form.linkedin}</span>}{form.github && <span>{form.github}</span>}</div>
            </div>
          </div>
          <div className="space-y-3">
            <Summary /><Experience /><Education /><Skills /><Projects /><Certs />
          </div>
        </div>
      </div>
    </div>
  );

  /* ── SDE layout (tech-focused, centered header, pill skills) ── */
  const SdeLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="text-center p-6 border-b border-gray-100">
        <div className="text-2xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
        <div className="text-sm text-gray-500 font-medium mt-0.5">Software Engineer</div>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400 mt-2">
          {form.email && <span>{form.email}</span>}{form.phone && <span>{form.phone}</span>}{form.github && <span>{form.github}</span>}
        </div>
      </div>
      <div className="p-6 space-y-4">
        {form.skills && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-4">
            {form.skills.split(',').map((s: string, i: number) => s.trim() && (
              <span key={i} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: accent, color: accent }}>{s.trim()}</span>
            ))}
          </div>
        )}
        <Summary /><Experience /><Education /><Projects /><Certs />
      </div>
    </div>
  );

  /* ── Backend layout (system architecture focus, tech badges) ── */
  const BackendLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="p-5" style={{ backgroundColor: accent }}>
        <div className="text-xl font-bold text-white">{form.name || 'Your Name'}</div>
        <div className="text-xs text-white/80 mt-0.5">Backend Developer</div>
        <div className="text-[10px] text-white/60 mt-1 flex flex-wrap gap-x-3">{form.email && <span>{form.email}</span>}{form.phone && <span>{form.phone}</span>}{form.github && <span>{form.github}</span>}</div>
      </div>
      <div className="p-5 space-y-4">
        {form.skills && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.skills.split(',').map((s: string, i: number) => s.trim() && (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: accent + '15', color: accent }}>{s.trim()}</span>
            ))}
          </div>
        )}
        <Summary /><Experience /><Education /><Projects /><Certs />
      </div>
    </div>
  );

  /* ── Frontend layout (two-column, visual portfolio emphasis) ── */
  const FrontendLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[35%] p-4 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo ? <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-white/30"><img src={form.photo} alt="" className="w-full h-full object-cover" /></div> : <div className="w-14 h-14 rounded-full bg-white/20 mx-auto" />}
        <div><div className="text-[9px] font-bold text-white/90 uppercase tracking-wide mb-1">Contact</div>
          <div className="space-y-0.5 text-[9px] text-white/70 break-all">{form.email && <div>{form.email}</div>}{form.phone && <div>{form.phone}</div>}{form.linkedin && <div>{form.linkedin}</div>}</div></div>
        {form.skills && <div><div className="text-[9px] font-bold text-white/90 uppercase tracking-wide mb-1">Tech Stack</div>
          <div className="space-y-1">{form.skills.split(',').map((s: string, i: number) => s.trim() && <div key={i} className="text-[8px] text-white/70">{s.trim()}</div>)}</div></div>}
      </div>
      <div className="flex-1 p-5 space-y-3" style={{ backgroundColor: bg }}>
        <div className="border-b-2 pb-2" style={{ borderColor: accent }}>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-xs text-gray-500">Frontend Developer</div>
        </div>
        <Summary />
        <div><SectionTitle text="Portfolio" accent={accent} />
          {form.projects.filter((p: any) => p.title).length > 0 ? <Projects /> : <p className="text-xs text-gray-500">Showcase your frontend projects, designs, and live demos here.</p>}
        </div>
        <Experience /><Education /><Certs />
      </div>
    </div>
  );

  /* ── AI/ML layout (two-column, research & publications focus) ── */
  const AiMlLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[35%] p-4 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo ? <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-white/30"><img src={form.photo} alt="" className="w-full h-full object-cover" /></div> : <div className="w-14 h-14 rounded-full bg-white/20 mx-auto" />}
        <div><div className="text-[9px] font-bold text-white/90 uppercase mb-1">Contact</div>
          <div className="space-y-0.5 text-[9px] text-white/70 break-all">{form.email && <div>{form.email}</div>}{form.linkedin && <div>{form.linkedin}</div>}{form.github && <div>{form.github}</div>}</div></div>
        {form.skills && <div><div className="text-[9px] font-bold text-white/90 uppercase mb-1.5">ML/AI Skills</div>
          <div className="flex flex-wrap gap-1">{form.skills.split(',').map((s: string, i: number) => s.trim() && <span key={i} className="text-[7px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">{s.trim()}</span>)}</div></div>}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div><div className="text-[9px] font-bold text-white/90 uppercase mb-1">Research</div>
            <div className="space-y-1">{form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="text-[8px] text-white/70">{edu.degree}<br/>{edu.institution}</div>
            ))}</div></div>)}
      </div>
      <div className="flex-1 p-5 space-y-3" style={{ backgroundColor: bg }}>
        <div className="flex justify-between items-start border-b pb-1" style={{ borderColor: accent }}>
          <div><div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div><div className="text-xs text-gray-500">AI/ML Engineer</div></div>
          <div className="text-right text-[10px] text-gray-400"><div>Research</div><div>Publications</div></div>
        </div>
        <Summary /><Experience /><Projects /><Certs />
      </div>
    </div>
  );

  /* ── Fullstack layout (sidebar + main, different styling) ── */
  const FullstackLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[30%] p-4 flex flex-col gap-3" style={{ backgroundColor: accent }}>
        {form.photo ? <div className="w-14 h-14 rounded-full mx-auto overflow-hidden border-2 border-white/30"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div> : <div className="w-12 h-12 rounded-full bg-white/20 mx-auto" />}
        <div>
          <div className="text-[9px] font-bold text-white/90 uppercase mb-1">Contact</div>
          <div className="space-y-0.5 text-[8px] text-white/70 break-all">
            {form.email && <div>{form.email}</div>}
            {form.phone && <div>{form.phone}</div>}
            {form.linkedin && <div>{form.linkedin}</div>}
            {form.github && <div>{form.github}</div>}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-white/90 uppercase mb-1">Skills</div>
          <div className="space-y-0.5">
            {form.skills.split(',').map((s: string, i: number) => s.trim() && (
              <div key={i} className="text-[8px] text-white/70">{s.trim()}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 p-5 space-y-3" style={{ backgroundColor: bg }}>
        <div className="text-xl font-bold" style={{ color: accent }}>{form.name || 'Your Name'}</div>
        <Summary /><Experience /><Education /><Projects /><Certs />
      </div>
    </div>
  );

  /* ── Executive layout ── */
  const ExecutiveLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="p-6 text-white" style={{ backgroundColor: accent }}>
        <div className="text-2xl font-bold">{form.name || 'Your Name'}</div>
        <div className="text-sm text-white/80 mt-1">{form.email || 'email@example.com'}{form.phone && ` | ${form.phone}`}</div>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <SectionTitle text="Professional Summary" accent={accent} />
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
            {form.summary || 'Visionary technology executive with 15+ years of experience driving digital transformation, leading engineering organizations, and delivering scalable solutions that generate measurable business impact.'}
          </p>
        </div>
        <Experience />
        <Education />
        <Skills />
        <Projects />
        <Certs />
        <div>
          <SectionTitle text="Board & Advisory" accent={accent} />
          <div className="text-xs text-gray-600">Advisory Board Member · TechStartups Inc. (2021-Present)</div>
          <div className="text-xs text-gray-600">Mentor · Engineering Leadership Forum (2020-Present)</div>
        </div>
      </div>
    </div>
  );

  /* ── Minimalist layout ── */
  const MinimalistLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="p-8 text-center border-b border-gray-100">
        <div className="text-3xl font-light text-gray-900 tracking-tight">{form.name || 'Your Name'}</div>
        <div className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">{form.email || 'email@example.com'}</div>
        <div className="flex justify-center gap-3 text-[11px] text-gray-400 mt-2">
          {form.phone && <span>{form.phone}</span>}
          {form.linkedin && <span>{form.linkedin}</span>}
          {form.github && <span>{form.github}</span>}
        </div>
      </div>
      <div className="p-8 space-y-6">
        {form.summary && (
          <div>
            <div className="text-[9px] font-medium text-gray-400 uppercase tracking-[0.15em] mb-2">About</div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        <div>
          <div className="text-[9px] font-medium text-gray-400 uppercase tracking-[0.15em] mb-3">Experience</div>
          {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-gray-800">{exp.role}</span>
                <span className="text-[10px] text-gray-400">{exp.duration}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{exp.company}</div>
              {exp.description && <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{exp.description}</div>}
            </div>
          ))}
        </div>
        <Education />
        <Skills />
        <Projects />
        <Certs />
      </div>
    </div>
  );

  /* ── Creative layout ── */
  const CreativeLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="p-6 text-center text-white" style={{ background: `linear-gradient(135deg, ${accent}, #ec4899)` }}>
        {form.photo ? <div className="w-18 h-18 rounded-full border-2 border-white mx-auto mb-2 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div> : (
          <div className="w-16 h-16 rounded-full border-2 border-white mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">
            {(form.name || 'YN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'YN'}
          </div>
        )}
        <div className="text-xl font-bold">{form.name || 'Your Name'}</div>
        <div className="text-sm text-white/80">{form.email || 'email@example.com'}</div>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3 text-center border" style={{ borderColor: accent + '30', backgroundColor: accent + '08' }}>
            <div className="text-lg font-bold" style={{ color: accent }}>{form.experience.filter((e: any) => e.role).length || 3}+</div>
            <div className="text-[10px] text-gray-500">Positions</div>
          </div>
          <div className="rounded-lg p-3 text-center border" style={{ borderColor: accent + '30', backgroundColor: accent + '08' }}>
            <div className="text-lg font-bold" style={{ color: accent }}>{form.projects.filter((p: any) => p.title).length || 5}+</div>
            <div className="text-[10px] text-gray-500">Projects</div>
          </div>
          <div className="rounded-lg p-3 text-center border" style={{ borderColor: accent + '30', backgroundColor: accent + '08' }}>
            <div className="text-lg font-bold" style={{ color: accent }}>{form.skills.split(',').length || 8}</div>
            <div className="text-[10px] text-gray-500">Skills</div>
          </div>
        </div>
        <Summary />
        <Experience />
        <Education />
        <Skills />
        <Projects />
        <Certs />
      </div>
    </div>
  );

  /* ── Technical layout ── */
  const TechnicalLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="p-5 border-b" style={{ borderColor: accent + '30', backgroundColor: bg }}>
        <div className="text-xl font-bold" style={{ color: accent }}>{form.name || 'Your Name'}</div>
        <div className="text-xs text-gray-500 mt-1">{form.email || 'email@example.com'} {form.phone && `| ${form.phone}`}</div>
        <div className="flex gap-3 text-[11px] text-gray-400 mt-1">{form.linkedin && <span>{form.linkedin}</span>}{form.github && <span>{form.github}</span>}</div>
      </div>
      <div className="flex" style={{ minHeight: '700px' }}>
        <div className="w-[40%] p-4 border-r" style={{ borderColor: accent + '20', backgroundColor: accent + '05' }}>
          <div className="mb-4">
            <SectionTitle text="Tech Stack" accent={accent} />
            {['Kubernetes', 'Go', 'Rust', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Terraform', 'AWS', 'Python'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 mb-1">
                <span className="text-[10px] w-16 text-gray-600">{s}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: (70 - i * 5) + '%', backgroundColor: accent }} />
                </div>
              </div>
            ))}
          </div>
          <Certs />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Summary />
          <Experience />
          <Education />
          <Projects />
        </div>
      </div>
    </div>
  );

  /* ── Academic layout ── */
  const AcademicLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="flex items-start gap-4 p-6 border-b" style={{ borderColor: accent + '30' }}>
        <div className="w-1 rounded-full h-20" style={{ backgroundColor: accent }} />
        <div>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-xs text-gray-500 mt-1">{form.email || 'email@example.com'} {form.phone && `| ${form.phone}`}</div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <SectionTitle text="Research Interests" accent={accent} />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {['Natural Language Processing', 'Machine Learning', 'Computational Linguistics', 'AI Ethics', 'Information Retrieval'].map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: accent + '15', color: accent }}>{s}</span>
            ))}
          </div>
        </div>
        <Education />
        <div>
          <SectionTitle text="Publications" accent={accent} />
          <div className="space-y-2">
            <div className="text-xs text-gray-600">1. Patel, P., et al. "Neural Approaches to Cross-lingual Information Extraction." ACL 2024.</div>
            <div className="text-xs text-gray-600">2. Patel, P., & Smith, J. "Efficient Transformers for Low-Resource Languages." EMNLP 2023.</div>
            <div className="text-xs text-gray-600">3. Patel, P., et al. "Ethical Considerations in Large Language Models." FAccT 2022.</div>
          </div>
        </div>
        <div>
          <SectionTitle text="Teaching" accent={accent} />
          <div className="text-xs text-gray-600">CS224N: Natural Language Processing (2020-Present)</div>
          <div className="text-xs text-gray-600">CS229: Machine Learning (2018-2020)</div>
        </div>
        <Skills />
      </div>
    </div>
  );

  /* ── Modern Professional CV layout ── */
  const ModernProfessionalLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[38%] p-5 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo ? <div className="w-20 h-20 rounded-full mx-auto border-3 border-white/30 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div> : (
          <div className="w-20 h-20 rounded-full mx-auto border-3 border-white/30 bg-white/10 flex items-center justify-center text-white text-xl font-bold">
            {(form.name || 'YN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Contact</div>
          <div className="space-y-1 text-[9px] text-white/80">
            {form.phone && <div className="flex items-center gap-1.5">📞 {form.phone}</div>}
            {form.email && <div className="flex items-center gap-1.5">✉️ {form.email}</div>}
            {form.linkedin && <div className="flex items-center gap-1.5">🔗 {form.linkedin}</div>}
          </div>
        </div>
        {form.summary && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">About Me</div>
            <p className="text-[9px] text-white/80 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Skills</div>
            <div className="space-y-1">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <div key={i} className="text-[9px] text-white/80">• {s.trim()}</div>
              ))}
            </div>
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="text-[9px] font-semibold text-white/90">{edu.degree}</div>
                <div className="text-[8px] text-white/70">{edu.institution}</div>
                <div className="text-[8px] text-white/60">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-sm text-gray-500 mt-0.5">{form.email || 'email@example.com'}</div>
        </div>
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.projects.some((p: any) => p.title) && (
          <div>
            <SectionTitle text="Projects" accent={accent} />
            {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-800">{proj.title}{proj.link ? <span className="text-[10px] text-gray-400 ml-2">{proj.link}</span> : ''}</div>
                {proj.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.certifications.some((c: any) => c.name) && (
          <div>
            <SectionTitle text="References" accent={accent} />
            {form.certifications.filter((c: any) => c.name).map((cert: any, i: number) => (
              <div key={i} className="text-[11px] text-gray-600"><span className="font-semibold">{cert.name}</span> · {cert.issuer}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Black & White Minimalist layout ── */
  const BlackWhiteLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px' }}>
      <div className="p-8 text-center border-b border-gray-200">
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{form.name || 'Your Name'}</div>
        <div className="text-sm text-gray-500 mt-1 tracking-wide">{form.email || 'email@example.com'}</div>
        <div className="flex justify-center gap-3 text-[11px] text-gray-500 mt-2">
          {form.phone && <span>{form.phone}</span>}
          {form.linkedin && <span>{form.linkedin}</span>}
          {form.github && <span>{form.github}</span>}
        </div>
      </div>
      <div className="p-8 space-y-6">
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Experience</div>
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-gray-900">{exp.role}</span>
                  <span className="text-[10px] text-gray-400">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-1 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-gray-900">{edu.degree}</span>
                  <span className="text-[10px] text-gray-400">{edu.year}</span>
                </div>
                <div className="text-[11px] text-gray-500">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Expertise</div>
            <div className="text-[11px] text-gray-600">{form.skills.split(',').map((s: string) => s.trim()).filter(Boolean).join(' · ')}</div>
          </div>
        )}
        {form.projects.some((p: any) => p.title) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Projects</div>
            {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-900">{proj.title}</div>
                {proj.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ProfessionalResumeLayout = () => (
    <div className="mx-auto max-w-[600px] border-8 border-orange-300 bg-white shadow-2xl rounded-[2rem] overflow-hidden" style={{ minHeight: '850px' }}>
      <div className="relative p-8 bg-white">
        <div className="absolute top-8 right-8 w-28 h-28 rounded-3xl overflow-hidden bg-slate-200 shadow-inner">
          {form.photo ? <img src={form.photo} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-300" />}
        </div>
        <div className="max-w-[calc(100%-8rem)]">
          <div className="text-4xl font-bold text-slate-900">{form.name || 'Sarah Watson'}</div>
          <div className="text-sm uppercase tracking-[0.24em] text-orange-600 mt-2">{form.summary || 'Web Developer'}</div>
          <div className="text-[11px] text-slate-500 mt-4">{form.email || 'hello@watson.org'} · {form.phone || '+1 223 234 3456'} · {form.location || 'New York'}</div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">Professional Summary</div>
              <div className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{form.summary || 'Driven and enthusiastic Web Developer with a strong passion for creating exceptional web experiences. Experienced in manual testing, test automation, tracking tools, and A/B testing.'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">Professional Experience</div>
              {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
                <div key={i} className="mb-5 last:mb-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{exp.role || 'Web Developer'}</div>
                      <div className="text-[11px] text-slate-500">{exp.company || 'Google Inc.'}</div>
                    </div>
                    <div className="text-[10px] text-slate-400">{exp.duration || '2018 - Present'}</div>
                  </div>
                  {exp.description && <div className="text-[11px] text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">Education</div>
              {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
                <div key={i} className="mb-4">
                  <div className="text-sm font-semibold text-slate-900">{edu.degree || 'Bachelor of Science in Computer Science'}</div>
                  <div className="text-[11px] text-slate-500">{edu.institution || 'San Francisco Bay University'}</div>
                  <div className="text-[10px] text-slate-400">{edu.year || '2014 - 2018'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 p-5 bg-orange-50">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">Languages</div>
              <div className="text-[11px] text-slate-700">{form.languages || 'English · Spanish'}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5 bg-orange-50">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">Favorite Quote</div>
              <div className="text-[11px] text-slate-700 italic">{form.quote || 'Great websites aren’t built in a day; they are crafted with passion, dedication, and attention to detail.'}</div>
            </div>
            {form.skills && (
              <div className="rounded-3xl border border-slate-200 p-5 bg-orange-50">
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">Skills</div>
                <div className="space-y-2 text-[11px] text-slate-700">
                  {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block" />
                      <span>{s.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Blue & Gray Simple Professional layout ── */
  const BlueGrayLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-xl font-bold text-gray-900 uppercase tracking-wide">{form.name || 'YOUR NAME'}</div>
          <div className="text-sm text-gray-500 mt-0.5">{form.email || 'email@example.com'}</div>
        </div>
        <div>
          <SectionTitle text="Profile" accent={accent} />
          {form.summary ? (
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          ) : (
            <p className="text-[11px] text-gray-600 leading-relaxed">Creative marketing professional with extensive experience in digital campaigns and brand strategy.</p>
          )}
        </div>
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Work Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <SectionTitle text="Education" accent={accent} />
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-800">{edu.degree}</div>
                <div className="text-[11px] text-gray-500">{edu.institution}</div>
                <div className="text-[10px] text-gray-400">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-[38%] p-5 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo ? <div className="w-20 h-20 rounded-full mx-auto border-3 border-white/30 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div> : (
          <div className="w-20 h-20 rounded-full mx-auto border-3 border-white/30 bg-white/10 flex items-center justify-center text-white text-xl font-bold">
            {(form.name || 'YN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Contact</div>
          <div className="space-y-1 text-[9px] text-white/80">
            {form.phone && <div>{form.phone}</div>}
            {form.email && <div>{form.email}</div>}
            {form.linkedin && <div>{form.linkedin}</div>}
          </div>
        </div>
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Skills</div>
            <div className="space-y-1">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <div key={i} className="text-[9px] text-white/80">• {s.trim()}</div>
              ))}
            </div>
          </div>
        )}
        {form.certifications.some((c: any) => c.name) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Languages</div>
            {form.certifications.filter((c: any) => c.name).map((cert: any, i: number) => (
              <div key={i} className="text-[9px] text-white/80">• {cert.name}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Professional Modern layout ── */
  const ProfessionalModernLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px', backgroundColor: bg }}>
      <div className="p-8 text-center border-b border-gray-100">
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{form.name || 'Your Name'}</div>
        <div className="text-sm text-gray-500 mt-1 tracking-wide">{form.email || 'email@example.com'}</div>
        <div className="flex justify-center gap-3 text-[11px] text-gray-500 mt-2">
          {form.phone && <span>{form.phone}</span>}
          {form.linkedin && <span>{form.linkedin}</span>}
          {form.github && <span>{form.github}</span>}
        </div>
      </div>
      <div className="p-8 space-y-6">
        {form.summary && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">About Me</div>
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-gray-900">{edu.degree}</span>
                  <span className="text-[10px] text-gray-400">{edu.year}</span>
                </div>
                <div className="text-[11px] text-gray-500">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Experience</div>
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
        {form.projects.some((p: any) => p.title) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Projects</div>
            {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-800">{proj.title}{proj.link ? <span className="text-[10px] text-gray-400 ml-2">{proj.link}</span> : ''}</div>
                {proj.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.certifications.some((c: any) => c.name) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">References</div>
            {form.certifications.filter((c: any) => c.name).map((cert: any, i: number) => (
              <div key={i} className="text-[11px] text-gray-600"><span className="font-semibold">{cert.name}</span> · {cert.issuer}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Gray Blue Sidebar layout ── */
  const GrayBlueSidebarLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[35%] p-5 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo && <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/30 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>}
        <div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Contact</div>
          <div className="space-y-1 text-[9px] text-white/80">
            {form.phone && <div>{form.phone}</div>}
            {form.email && <div>{form.email}</div>}
            {form.linkedin && <div>{form.linkedin}</div>}
          </div>
        </div>
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="text-[9px] font-semibold text-white/90">{edu.degree}</div>
                <div className="text-[8px] text-white/70">{edu.institution}</div>
                <div className="text-[8px] text-white/60">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Skills</div>
            <div className="space-y-1">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <div key={i} className="text-[9px] text-white/80">• {s.trim()}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-sm text-gray-500 mt-0.5">{form.email || 'email@example.com'}</div>
        </div>
        {form.summary && (
          <div>
            <SectionTitle text="Summary" accent={accent} />
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Work Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.projects.some((p: any) => p.title) && (
          <div>
            <SectionTitle text="Projects" accent={accent} />
            {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-800">{proj.title}{proj.link ? <span className="text-[10px] text-gray-400 ml-2">{proj.link}</span> : ''}</div>
                {proj.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Dark Sidebar Photo layout ── */
  const DarkSidebarPhotoLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[35%] p-5 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo && <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/30 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>}
        <div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Contact</div>
          <div className="space-y-1 text-[9px] text-white/80">
            {form.phone && <div>{form.phone}</div>}
            {form.email && <div>{form.email}</div>}
            {form.linkedin && <div>{form.linkedin}</div>}
            {form.github && <div>{form.github}</div>}
          </div>
        </div>
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="text-[9px] font-semibold text-white/90">{edu.degree}</div>
                <div className="text-[8px] text-white/70">{edu.institution}</div>
                <div className="text-[8px] text-white/60">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Skills</div>
            <div className="space-y-1">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <div key={i} className="text-[9px] text-white/80">• {s.trim()}</div>
              ))}
            </div>
          </div>
        )}
        {form.certifications.some((c: any) => c.name) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">References</div>
            {form.certifications.filter((c: any) => c.name).map((cert: any, i: number) => (
              <div key={i} className="mb-1">
                <div className="text-[9px] font-semibold text-white/90">{cert.name}</div>
                <div className="text-[8px] text-white/70">{cert.issuer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-sm text-gray-500 mt-0.5">{form.email || 'email@example.com'}</div>
        </div>
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.projects.some((p: any) => p.title) && (
          <div>
            <SectionTitle text="Projects" accent={accent} />
            {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-800">{proj.title}{proj.link ? <span className="text-[10px] text-gray-400 ml-2">{proj.link}</span> : ''}</div>
                {proj.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Gray Sidebar Right layout ── */
  const GraySidebarRightLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-sm text-gray-500 mt-0.5">{form.email || 'email@example.com'}</div>
        </div>
        {form.summary && (
          <div>
            <SectionTitle text="About Me" accent={accent} />
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Work Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <SectionTitle text="Education" accent={accent} />
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-gray-900">{edu.degree}</span>
                  <span className="text-[10px] text-gray-400">{edu.year}</span>
                </div>
                <div className="text-[11px] text-gray-500">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-[35%] p-5 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo && <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/30 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>}
        <div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Contact</div>
          <div className="space-y-1 text-[9px] text-white/80">
            {form.phone && <div>{form.phone}</div>}
            {form.email && <div>{form.email}</div>}
            {form.linkedin && <div>{form.linkedin}</div>}
          </div>
        </div>
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="text-[9px] font-semibold text-white/90">{edu.degree}</div>
                <div className="text-[8px] text-white/70">{edu.institution}</div>
                <div className="text-[8px] text-white/60">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Skills</div>
            <div className="space-y-1">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <div key={i} className="text-[9px] text-white/80">• {s.trim()}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ── Centered Light layout ── */
  const CenteredLightLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '800px', backgroundColor: bg }}>
      <div className="p-8 text-center border-b border-gray-200">
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{form.name || 'Your Name'}</div>
        <div className="text-sm text-gray-500 mt-1 tracking-wide">{form.email || 'email@example.com'}</div>
        <div className="flex justify-center gap-3 text-[11px] text-gray-500 mt-2">
          {form.phone && <span>{form.phone}</span>}
          {form.linkedin && <span>{form.linkedin}</span>}
          {form.github && <span>{form.github}</span>}
        </div>
      </div>
      <div className="p-8 space-y-6">
        {form.summary && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Summary</div>
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-gray-900">{edu.degree}</span>
                  <span className="text-[10px] text-gray-400">{edu.year}</span>
                </div>
                <div className="text-[11px] text-gray-500">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Experience</div>
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Brown Sidebar layout ── */
  const BrownSidebarLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-sm text-gray-500 mt-0.5">{form.email || 'email@example.com'}</div>
        </div>
        {form.summary && (
          <div>
            <SectionTitle text="About Me" accent={accent} />
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <SectionTitle text="Education" accent={accent} />
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-900">{edu.degree}</div>
                <div className="text-[11px] text-gray-500">{edu.institution}</div>
                <div className="text-[10px] text-gray-400">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-[35%] p-5 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo && <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/30 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>}
        <div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Skills</div>
          <div className="space-y-1">
            {form.skills.split(',').map((s: string, i: number) => s.trim() && (
              <div key={i} className="text-[9px] text-white/80">• {s.trim()}</div>
            ))}
          </div>
        </div>
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="text-[9px] font-semibold text-white/90">{edu.degree}</div>
                <div className="text-[8px] text-white/70">{edu.institution}</div>
                <div className="text-[8px] text-white/60">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Dark Sidebar Right layout ── */
  const DarkSidebarRightLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        <div>
          <div className="text-xl font-bold text-gray-900">{form.name || 'Your Name'}</div>
          <div className="text-sm text-gray-500 mt-0.5">{form.email || 'email@example.com'}</div>
        </div>
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Work Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-800">{exp.role}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-gray-500">{exp.company}</div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.projects.some((p: any) => p.title) && (
          <div>
            <SectionTitle text="Projects" accent={accent} />
            {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-xs font-semibold text-gray-800">{proj.title}{proj.link ? <span className="text-[10px] text-gray-400 ml-2">{proj.link}</span> : ''}</div>
                {proj.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <SectionTitle text="Education" accent={accent} />
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-gray-900">{edu.degree}</span>
                  <span className="text-[10px] text-gray-400">{edu.year}</span>
                </div>
                <div className="text-[11px] text-gray-500">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-[35%] p-5 flex flex-col gap-4" style={{ backgroundColor: accent }}>
        {form.photo && <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/30 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>}
        <div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Contact</div>
          <div className="space-y-1 text-[9px] text-white/80">
            {form.phone && <div>{form.phone}</div>}
            {form.email && <div>{form.email}</div>}
            {form.linkedin && <div>{form.linkedin}</div>}
          </div>
        </div>
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide mb-1.5">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="text-[9px] font-semibold text-white/90">{edu.degree}</div>
                <div className="text-[8px] text-white/70">{edu.institution}</div>
                <div className="text-[8px] text-white/60">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Blank Canvas Builder layout ── */
  const BlankCanvasLayout = () => {
    const accentColor = '#2563eb';
    return (
      <div className="mx-auto max-w-[210mm] bg-white" style={{ minHeight: '297mm', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Top accent bar */}
        <div className="h-2" style={{ backgroundColor: accentColor }} />

        {/* Header Section */}
        <div className="flex gap-8 px-8 pt-7 pb-5">
          {form.photo ? (
            <div className="w-28 h-28 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-lg"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>
          ) : (
            <div className="w-28 h-28 rounded-full shrink-0 border-3 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 shadow-sm">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </div>
          )}
          <div className="flex-1 min-w-0 self-center">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{form.name || 'Your Name'}</h1>
            <div className="w-12 h-1 rounded-full mt-2 mb-2" style={{ backgroundColor: accentColor }} />
            <p className="text-sm text-gray-500 font-medium">{form.summary ? form.summary.split(' ').slice(0, 8).join(' ') + (form.summary.split(' ').length > 8 ? '...' : '') : 'Job Title / Professional Role'}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 text-[11px] text-gray-500">
              {form.email && <span className="flex items-center gap-1.5"><span style={{ color: accentColor }}>✉</span> {form.email}</span>}
              {form.phone && <span className="flex items-center gap-1.5"><span style={{ color: accentColor }}>📞</span> {form.phone}</span>}
              {form.address && <span className="flex items-center gap-1.5"><span style={{ color: accentColor }}>📍</span> {form.address}</span>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-gray-400">
              {form.linkedin && <span className="flex items-center gap-1.5"><span style={{ color: accentColor }}>🔗</span> {form.linkedin}</span>}
              {form.github && <span className="flex items-center gap-1.5"><span style={{ color: accentColor }}>🐙</span> {form.github}</span>}
            </div>
          </div>
        </div>

        {/* Thin divider */}
        <div className="mx-8 border-t border-gray-200" />

        {/* Body: Two Column */}
        <div className="flex px-8 pt-5 pb-8 gap-6">
          {/* Left Sidebar (32%) */}
          <div className="w-[32%] space-y-5 shrink-0">
            {/* Profile / Summary */}
            {form.summary && (
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2.5 flex items-center gap-2" style={{ color: accentColor }}>
                  <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  Profile
                </h3>
                <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
              </div>
            )}

            {/* Skills */}
            {form.skills && (
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2.5 flex items-center gap-2" style={{ color: accentColor }}>
                  <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                    <span key={i} className="text-[10px] px-2.5 py-1 rounded-md font-medium" style={{ color: accentColor, backgroundColor: accentColor + '10' }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {form.education.some((e: any) => e.degree || e.institution) && (
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2.5 flex items-center gap-2" style={{ color: accentColor }}>
                  <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  Education
                </h3>
                <div className="space-y-3">
                  {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: accentColor }} />
                        {i < form.education.filter((e: any) => e.degree || e.institution).length - 1 && <div className="w-px flex-1 mt-0.5" style={{ backgroundColor: accentColor + '30' }} />}
                      </div>
                      <div className="pb-1">
                        <div className="text-[11px] font-semibold text-gray-800">{edu.degree}</div>
                        <div className="text-[10px] text-gray-500">{edu.institution}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{edu.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {form.certifications.some((c: any) => c.name) && (
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2.5 flex items-center gap-2" style={{ color: accentColor }}>
                  <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  Certifications
                </h3>
                <div className="space-y-2">
                  {form.certifications.filter((c: any) => c.name).map((cert: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[9px] mt-0.5" style={{ color: accentColor }}>✓</span>
                      <div>
                        <div className="text-[11px] font-medium text-gray-800">{cert.name}</div>
                        {cert.issuer && <div className="text-[9px] text-gray-400">{cert.issuer}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {form.certifications.filter((c: any) => c.name && !c.issuer && !c.year).length > 0 && (
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2 flex items-center gap-2" style={{ color: accentColor }}>
                  <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  Languages
                </h3>
                <div className="space-y-1">
                  {form.certifications.filter((c: any) => c.name && !c.issuer && !c.year).map((lang: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: '80%', backgroundColor: accentColor }} />
                      </div>
                      <span className="text-[10px] text-gray-600 w-12 text-right">{lang.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-gray-200 shrink-0 self-stretch" />

          {/* Right Main (65%) */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Work Experience */}
            {form.experience.some((e: any) => e.role || e.company) && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 flex items-center gap-2" style={{ color: accentColor }}>
                  <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  Work Experience
                </h3>
                <div className="space-y-4">
                  {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
                    <div key={i} className="relative pl-4 border-l-2 pb-3" style={{ borderColor: accentColor + '30' }}>
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{exp.role}</div>
                          <div className="text-[10px] font-medium text-gray-500">{exp.company}</div>
                        </div>
                        <span className="text-[9px] font-medium whitespace-nowrap ml-2 mt-0.5 px-2 py-0.5 rounded-full" style={{ color: accentColor, backgroundColor: accentColor + '10' }}>{exp.duration}</span>
                      </div>
                      {exp.description && (
                        <ul className="mt-1.5 space-y-0.5">
                          {exp.description.split('\n').filter(Boolean).map((line: string, j: number) => (
                            <li key={j} className="text-[11px] text-gray-600 flex items-start gap-2">
                              <span className="text-[7px] mt-1 shrink-0" style={{ color: accentColor }}>●</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {form.projects.some((p: any) => p.title) && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 flex items-center gap-2" style={{ color: accentColor }}>
                  <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  Projects
                </h3>
                <div className="space-y-3">
                  {form.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
                    <div key={i} className="rounded-lg p-3" style={{ backgroundColor: accentColor + '06', borderLeft: `3px solid ${accentColor}` }}>
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-semibold text-gray-800">{proj.title}</div>
                        {proj.link && <span className="text-[9px] text-gray-400 ml-2 shrink-0">{proj.link}</span>}
                      </div>
                      {proj.description && <div className="text-[11px] text-gray-600 mt-1 whitespace-pre-wrap">{proj.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section (standalone, not from certs) */}
            {form.certifications.some((c: any) => c.name && c.issuer && c.year) && form.education.length === 0 && form.projects.length === 0 && form.experience.length === 0 && form.summary && !form.skills ? null : null}
          </div>
        </div>
      </div>
    );
  };

  /* ── Blue Sidebar Profile layout ── */
  const BlueSidebarProfileLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[35%] p-5 flex flex-col gap-4 text-white" style={{ backgroundColor: accent }}>
        {form.photo ? (
          <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/40 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/30 bg-white/10 flex items-center justify-center text-white text-2xl font-bold">
            {(form.name || 'YN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <div className="text-lg font-bold">{form.name || 'Your Name'}</div>
          <div className="text-[11px] text-white/80 mt-0.5">{form.email || 'Job Title'}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-white/90">Contact</div>
          <div className="space-y-1 text-[11px] text-white/80">
            {form.phone && <div>📞 {form.phone}</div>}
            {form.email && <div>✉️ {form.email}</div>}
            {form.linkedin && <div>🔗 {form.linkedin}</div>}
          </div>
        </div>
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-white/90">Skills</div>
            <div className="space-y-1">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <div key={i} className="text-[11px] text-white/80">• {s.trim()}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        {form.summary && (
          <div>
            <SectionTitle text="Summary" accent={accent} />
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <SectionTitle text="Education" accent={accent} />
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2 flex justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-800">{edu.degree}</div>
                  <div className="text-[11px] text-gray-500">{edu.institution}</div>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{edu.year}</span>
              </div>
            ))}
          </div>
        )}
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{exp.role}</div>
                    <div className="text-[11px] text-gray-500">{exp.company}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.certifications.some((c: any) => c.name) && (
          <div>
            <SectionTitle text="References" accent={accent} />
            {form.certifications.filter((c: any) => c.name).map((cert: any, i: number) => (
              <div key={i} className="text-[11px] text-gray-600"><span className="font-semibold">{cert.name}</span> · {cert.issuer}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Orange Sidebar Profile layout ── */
  const OrangeSidebarProfileLayout = () => (
    <div className="mx-auto max-w-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex" style={{ minHeight: '800px' }}>
      <div className="w-[35%] p-5 flex flex-col gap-4 text-white" style={{ backgroundColor: accent }}>
        {form.photo ? (
          <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/40 overflow-hidden"><img src={form.photo} alt="Profile" className="w-full h-full object-cover" /></div>
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto border-3 border-white/30 bg-white/10 flex items-center justify-center text-white text-2xl font-bold">
            {(form.name || 'YN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <div className="text-lg font-bold">{form.name || 'Your Name'}</div>
          <div className="text-[11px] text-white/80 mt-0.5">{form.email || 'Job Title'}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-white/90">Contact</div>
          <div className="space-y-1 text-[11px] text-white/80">
            {form.phone && <div>📞 {form.phone}</div>}
            {form.email && <div>✉️ {form.email}</div>}
          </div>
        </div>
        {form.skills && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-white/90">Interests / Skills</div>
            <div className="space-y-1">
              {form.skills.split(',').map((s: string, i: number) => s.trim() && (
                <div key={i} className="text-[11px] text-white/80">• {s.trim()}</div>
              ))}
            </div>
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-white/90">Education</div>
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="text-[11px] font-semibold text-white/90">{edu.degree}</div>
                <div className="text-[10px] text-white/70">{edu.institution}</div>
                <div className="text-[9px] text-white/60">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-6 space-y-4" style={{ backgroundColor: bg }}>
        {form.summary && (
          <div>
            <SectionTitle text="About Me" accent={accent} />
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
          </div>
        )}
        {form.experience.some((e: any) => e.role || e.company) && (
          <div>
            <SectionTitle text="Work Experience" accent={accent} />
            {form.experience.filter((e: any) => e.role || e.company).map((exp: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{exp.role}</div>
                    <div className="text-[11px] text-gray-500">{exp.company}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                </div>
                {exp.description && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-wrap">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
        {form.education.some((e: any) => e.degree || e.institution) && (
          <div>
            <SectionTitle text="Education" accent={accent} />
            {form.education.filter((e: any) => e.degree || e.institution).map((edu: any, i: number) => (
              <div key={i} className="mb-2 flex justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-800">{edu.degree}</div>
                  <div className="text-[11px] text-gray-500">{edu.institution}</div>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{edu.year}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // pick layout based on template id
  switch (tid) {
    case 'ats-beginner': return <AtsBeginnerLayout />;
    case 'sde': return <SdeLayout />;
    case 'backend': return <BackendLayout />;
    case 'frontend': return <FrontendLayout />;
    case 'ai-ml': return <AiMlLayout />;
    case 'fullstack': return <FullstackLayout />;
    case 'executive': return <ExecutiveLayout />;
    case 'minimalist': return <MinimalistLayout />;
    case 'creative': return <CreativeLayout />;
    case 'technical': return <TechnicalLayout />;
    case 'academic': return <AcademicLayout />;
    case 'modern-professional': return <ModernProfessionalLayout />;
    case 'blackwhite-minimalist': return <BlackWhiteLayout />;
    case 'bluegray-simple': return <BlueGrayLayout />;
    case 'professional-modern': return <ProfessionalModernLayout />;
    case 'professional': return <ProfessionalResumeLayout />;
    case 'grayblue-sidebar': return <GrayBlueSidebarLayout />;
    case 'dark-sidebar-photo': return <DarkSidebarPhotoLayout />;
    case 'gray-sidebar-right': return <GraySidebarRightLayout />;
    case 'centered-light': return <CenteredLightLayout />;
    case 'brown-sidebar': return <BrownSidebarLayout />;
    case 'dark-sidebar-right': return <DarkSidebarRightLayout />;
    case 'blank-canvas': return <BlankCanvasLayout />;
    case 'blue-sidebar-profile': return <BlueSidebarProfileLayout />;
    case 'orange-sidebar-profile': return <OrangeSidebarProfileLayout />;
    /* premium templates reuse same layouts */
    case 'grayblue-premium': return <GrayBlueSidebarLayout />;
    case 'dark-photo-premium': return <DarkSidebarPhotoLayout />;
    case 'gray-right-premium': return <GraySidebarRightLayout />;
    case 'centered-premium': return <CenteredLightLayout />;
    case 'brown-premium': return <BrownSidebarLayout />;
    case 'dark-right-premium': return <DarkSidebarRightLayout />;
    default: if (isTwoCol) return <TwoColumn />; return <SingleColumn />;
  }
}

function SectionTitle({ text, accent }: { text: string; accent: string }) {
  return <div className="text-[10px] font-bold uppercase border-b-2 pb-0.5 mb-1.5" style={{ borderColor: accent, color: accent }}>{text}</div>;
}

/* ─── reusable form components ──────────────────────────────────────────── */

function FormSection({ title, icon, children, onAdd }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; onAdd?: () => void;
}) {
  return (
    <div className="rounded-xl p-5 border border-white/10 shadow-lg shadow-purple-900/20" style={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="text-xs text-violet-400 hover:text-violet-300 font-medium">+ Add</button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
      />
    </div>
  );
}
