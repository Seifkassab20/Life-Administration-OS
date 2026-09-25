import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, RotateCcw, Target, Sparkles, Check, 
  ChevronUp, ChevronDown, Hash, Award, Flame 
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { HelpIcon } from './HelpIcon';

interface CounterWidgetProps {
  initialCount?: number;
  initialTarget?: number;
  title?: string;
  className?: string;
}

export const CounterWidget: React.FC<CounterWidgetProps> = ({
  initialCount = 0,
  initialTarget = 10,
  title = 'Document Activity Tracker',
  className = '',
}) => {
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem('laos_counter_value');
    return saved !== null ? Number(saved) : initialCount;
  });

  const [target, setTarget] = useState<number>(() => {
    const saved = localStorage.getItem('laos_counter_target');
    return saved !== null ? Number(saved) : initialTarget;
  });

  const [trackerName, setTrackerName] = useState<string>(() => {
    const saved = localStorage.getItem('laos_counter_name');
    return saved || title;
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem('laos_counter_value', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('laos_counter_target', target.toString());
  }, [target]);

  useEffect(() => {
    localStorage.setItem('laos_counter_name', trackerName);
  }, [trackerName]);

  const increment = (step = 1) => setCount((prev) => prev + step);
  const decrement = (step = 1) => setCount((prev) => Math.max(0, prev - step));
  const reset = () => setCount(0);

  const progressPercent = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
  const isGoalReached = target > 0 && count >= target;

  return (
    <div className={`glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950/95 ${className}`}>
      
      {/* Background Accent Glow */}
      <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isGoalReached ? 'bg-emerald-500/20' : 'bg-brand-500/15'
      }`} />

      {/* Header with Title and Minimize toggle */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            isGoalReached 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'gradient-brand text-white shadow-md shadow-brand-500/20'
          }`}>
            {isGoalReached ? <Award className="w-4 h-4 animate-bounce" /> : <Hash className="w-4 h-4" />}
          </div>

          {isEditingTitle ? (
            <input
              type="text"
              value={trackerName}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              onChange={(e) => setTrackerName(e.target.value)}
              className="bg-slate-950 border border-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-brand-500"
            />
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="group cursor-pointer flex items-center gap-1.5"
              title="Click to rename counter"
            >
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                {trackerName}
              </h3>
              <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                (edit)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <HelpIcon tabId="counter" size="sm" />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Counter' : 'Collapse Counter'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Main Counter Display and Quick Step Buttons */}
          <div className="flex items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            {/* Decrement Group */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => decrement(5)}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[11px] font-bold transition-all active:scale-90"
                title="Subtract 5"
              >
                -5
              </button>
              <button
                onClick={() => decrement(1)}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                title="Subtract 1"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Central Animated Number */}
            <div className="flex flex-col items-center justify-center text-center px-2">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-1">
                <AnimatedCounter value={count} duration={400} />
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                Target: {target}
              </span>
            </div>

            {/* Increment Group */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => increment(1)}
                className="w-10 h-10 rounded-xl gradient-brand text-white flex items-center justify-center transition-all active:scale-90 shadow-md shadow-brand-500/25"
                title="Add 1"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => increment(5)}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-brand-400 hover:text-brand-300 border border-slate-800 text-[11px] font-bold transition-all active:scale-90"
                title="Add 5"
              >
                +5
              </button>
            </div>
          </div>

          {/* Goal Progress Bar & Reset Action */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-brand-400" />
                <span>Goal Progress</span>
              </span>
              <span className={`font-bold font-mono ${isGoalReached ? 'text-emerald-400' : 'text-slate-200'}`}>
                {progressPercent}% ({count}/{target})
              </span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                    : 'gradient-brand'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Preset Buttons & Reset Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Quick set target:</span>
              {[5, 10, 25].map((val) => (
                <button
                  key={val}
                  onClick={() => setTarget(val)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                    target === val
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            <button
              onClick={reset}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10"
              title="Reset counter to 0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
