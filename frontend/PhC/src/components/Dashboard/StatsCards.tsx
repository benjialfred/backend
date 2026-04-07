// src/components/dashboard/StatsCards.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change: string;
  period: string;
}

interface StatsCardsProps {
  cards: StatCard[];
  loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ cards, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-white/5 rounded-xl"></div>
              <div className="h-4 bg-white/5 rounded w-16"></div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-white/5 rounded w-24"></div>
              <div className="h-3 bg-white/5 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const isPositive = card.change.startsWith('+');

        return (
          <div key={index} className="glass-panel p-6 hover-lift group border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
            {/* Background Hover Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`p-3 rounded-2xl bg-${card.color}-500/10 text-${card.color}-400 group-hover:bg-${card.color}-500/20 group-hover:text-${card.color}-300 transition-colors shadow-inner border border-white/5`}>
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-full border shadow-sm backdrop-blur-md ${isPositive
                  ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.change}
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-3xl font-display font-bold text-white tracking-tight group-hover:glow-text transition-all duration-300">{card.value}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{card.title}</p>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary-400 to-accent-400 group-hover:w-full transition-all duration-500 ease-out" />
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;