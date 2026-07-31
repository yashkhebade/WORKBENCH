import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "../ui/button";
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-text-secondary mb-8">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Built for Hardware Engineering Teams • Self-Hostable</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Build better hardware, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">together.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamline your PCB design pipeline, track firmware tasks, and collaborate across engineering disciplines in one secure, unified workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 group">
                  Try HW Team Hub Free
                  <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                <Play size={18} className="mr-2 text-text-secondary" />
                Watch Demo
              </Button>
            </div>
            <p className="mt-4 text-xs text-text-secondary">No credit card required. Self-host for free forever.</p>
          </motion.div>
        </div>

        {/* Dashboard Mockup Video/Image */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20 relative max-w-6xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none rounded-2xl h-full" />
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-2xl overflow-hidden ring-1 ring-white/5">
            {/* Mock window header */}
            <div className="h-10 border-b border-white/10 bg-[#15151a] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            {/* Placeholder for the actual app screenshot */}
            <div className="aspect-video bg-gradient-to-br from-[#11111a] to-[#0a0a0f] flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
              {/* Abstract representation of the UI */}
              <div className="w-full h-full flex gap-6">
                <div className="w-64 h-full bg-white/5 rounded-xl border border-white/5 flex flex-col gap-4 p-4">
                  <div className="w-full h-8 bg-white/10 rounded-lg"></div>
                  <div className="w-3/4 h-4 bg-white/5 rounded mt-4"></div>
                  <div className="w-1/2 h-4 bg-white/5 rounded"></div>
                  <div className="w-2/3 h-4 bg-white/5 rounded"></div>
                </div>
                <div className="flex-1 flex flex-col gap-6">
                  <div className="w-full h-16 bg-white/5 rounded-xl border border-white/5"></div>
                  <div className="flex-1 flex gap-6">
                    <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                      <div className="w-1/3 h-4 bg-white/10 rounded mb-2"></div>
                      <div className="w-full h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"></div>
                      <div className="w-full h-24 bg-white/5 rounded-lg"></div>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                      <div className="w-1/3 h-4 bg-white/10 rounded mb-2"></div>
                      <div className="w-full h-24 bg-white/5 rounded-lg"></div>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                      <div className="w-1/3 h-4 bg-white/10 rounded mb-2"></div>
                      <div className="w-full h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
