'use client';
import { useStore } from '@/lib/store';
import { jobSlug, timeAgo } from '@/lib/utils';
import type { MixedJob } from '@/types';

interface Props {
  job: MixedJob;
  index: number;
}

export function JobCard({ job, index }: Props) {
  const { matchedJobs, savedSlugs, toggleSave } = useStore();

  const isIndia  = job._type === 'india';
  const rawJob   = isIndia ? (job._raw as any) : null;
  const slug     = rawJob ? jobSlug(rawJob.Company, rawJob.Role) : `${job.company}-${job.role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const score    = rawJob ? (matchedJobs[rawJob.Company + rawJob.Role] || 0) : 0;
  const isMatch  = score > 0;
  const isSaved  = savedSlugs.includes(slug);
  const isNew    = job._postedAt > Date.now() - 3 * 86400000;
  const ago      = rawJob ? timeAgo(rawJob.PostedDate) : '';

  return (
    <div className={`group relative bg-white/4 border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] ${isMatch ? 'border-[#00D4FF]/30 bg-[#00D4FF]/4' : 'border-white/8 hover:border-white/15'}`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#8B9CC8] mb-0.5 truncate">{job.company}</p>
          <h3 className="text-base font-bold text-white leading-snug line-clamp-2">{job.role}</h3>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isIndia ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>
            {isIndia ? '🇮🇳 India' : '🌍 Global'}
          </span>
          {isNew && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20">🆕 New</span>}
          {isMatch && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/20">✓ {Math.round(score)}% Match</span>}
          {!isNew && !isMatch && index < 25 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20">Trending</span>}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8B9CC8]">
        {job.location && <span>📍 {job.location}</span>}
        {job.stipend  && <span>{isIndia ? '₹' : '$'} {job.stipend}</span>}
        {job.jobType  && <span>💼 {job.jobType}</span>}
        {ago          && <span>🕐 {ago}</span>}
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-xs text-[#4A5578] leading-relaxed line-clamp-2">{job.description}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {job.applyLink && (
          <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-lg hover:shadow-[0_4px_14px_rgba(0,212,255,0.35)] hover:-translate-y-0.5 transition-all">
            🚀 Apply
          </a>
        )}
        {isIndia && rawJob?.Email && (
          <a href={`mailto:${rawJob.Email}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#8B9CC8] bg-white/5 border border-white/10 rounded-lg hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all">
            ✉️ Email HR
          </a>
        )}
        <button
          onClick={() => toggleSave(slug)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-lg transition-all ${isSaved ? 'text-[#00D4FF] border-[#00D4FF]/30 bg-[#00D4FF]/8' : 'text-[#8B9CC8] border-white/10 bg-white/5 hover:text-[#00D4FF] hover:border-[#00D4FF]/30'}`}>
          {isSaved ? '🔖 Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}
