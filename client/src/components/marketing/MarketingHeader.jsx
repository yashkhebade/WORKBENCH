import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { Menu, X, Cpu } from "lucide-react";
import { Button } from "../ui/button";

export default function MarketingHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Cpu size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">HW Team Hub</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <Link to="/#features" className="hover:text-white transition-colors">Product</Link>
          <Link to="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <Button variant="default" size="sm">Go to Workspace</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white transition-colors hidden sm:block">
                Login
              </Link>
              <Link to="/signup">
                <Button variant="default" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
