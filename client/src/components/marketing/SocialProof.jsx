import React from 'react';
import { motion } from 'framer-motion';
import { Star, Github } from 'lucide-react';

export default function SocialProof() {
  return (
    <section className="py-20 bg-background border-t border-white/5">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-8">
          Trusted by innovative hardware teams worldwide
        </p>
        
        {/* Mock Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-bold font-serif">Acme Robotics</div>
          <div className="text-xl font-black tracking-tighter">CIRCUIT<span className="text-primary">CO</span></div>
          <div className="text-xl font-medium tracking-widest">NEXUS AEROSPACE</div>
          <div className="text-xl font-bold italic">Quantum IoT</div>
          <div className="text-xl font-bold tracking-tight">SILICON<span className="font-light">WORKS</span></div>
        </div>

        {/* Stats & Badges */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          
          <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1 text-yellow-400 mb-2">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-sm text-text-secondary">Average rating on G2</div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2 text-white">
              <Github size={24} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">2.4k+</div>
            <div className="text-sm text-text-secondary">GitHub Stars</div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="text-primary mb-2 font-bold text-2xl">10M+</div>
            <div className="text-2xl font-bold text-white mb-1">Tasks</div>
            <div className="text-sm text-text-secondary">Tracked and completed</div>
          </div>

        </div>
      </div>
    </section>
  );
}
