import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Globe, MessageCircle, Briefcase } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-[#050508] border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Cpu size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">HW Team Hub</span>
            </Link>
            <p className="text-sm text-text-secondary mb-6 max-w-xs">
              The ultimate workspace designed specifically for hardware engineering teams to build better, together.
            </p>
            <div className="flex items-center gap-4 text-text-secondary">
              <a href="#" className="hover:text-white transition-colors"><Globe size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Briefcase size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link to="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              <li><Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><a href="https://github.com/yashkhebade/WORKBENCH" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Self-Hosting</a></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} HW Team Hub. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
