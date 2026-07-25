import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#050508] border-t border-white/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing.</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Hardware is hard enough. Software pricing shouldn't be. Choose the plan that fits your team's security requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Self-Hosted Tier */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 relative flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Self-Hosted</h3>
              <p className="text-text-secondary h-12">Deploy on your own infrastructure. Total IP ownership.</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-text-secondary font-medium">/ forever</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited users', 'Unlimited projects & tasks', 'Docker Compose ready', 'Community support', 'Open-source codebase'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-text-secondary">
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <a href="https://github.com/yashkhebade/WORKBENCH" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full h-12 text-base">View on GitHub</Button>
            </a>
          </div>

          {/* Cloud Tier */}
          <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 bg-indigo-500/[0.02] relative flex flex-col shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Cloud Hosted</h3>
              <p className="text-text-secondary h-12">We manage the servers. You build the hardware.</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$12</span>
                <span className="text-text-secondary font-medium">/ user / month</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Everything in Self-Hosted', 'Zero maintenance or setup', 'Automated daily backups', '99.9% uptime SLA', 'Priority email support', 'SSO & Advanced Security'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white">
                  <Check size={18} className="text-indigo-400 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link to="/signup">
              <Button variant="default" className="w-full h-12 text-base shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
