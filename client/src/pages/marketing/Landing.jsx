import React from 'react';
import { Helmet } from 'react-helmet-async';
import MarketingHeader from '../../components/marketing/MarketingHeader';
import MarketingFooter from '../../components/marketing/MarketingFooter';
import Hero from '../../components/marketing/Hero';
import SocialProof from '../../components/marketing/SocialProof';
import Features from '../../components/marketing/Features';
import Comparison from '../../components/marketing/Comparison';
import Pricing from '../../components/marketing/Pricing';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Helmet>
        <title>HW Team Hub | The Ultimate Hardware Engineering Workspace</title>
        <meta name="description" content="Streamline your PCB design pipeline, track firmware tasks, and collaborate with your engineering team — all in one workspace." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HW Team Hub",
              "operatingSystem": "Any",
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "12.00",
                "priceCurrency": "USD"
              }
            }
          `}
        </script>
      </Helmet>

      <MarketingHeader />

      <main className="flex-1 flex flex-col w-full overflow-hidden">
        <Hero />
        <SocialProof />
        <Features />
        <Comparison />
        <Pricing />
        
        {/* Bottom CTA & FAQ */}
        <section className="py-24 bg-gradient-to-b from-[#050508] to-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-indigo-500 blur-[100px] rounded-full mix-blend-screen" />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to ship better hardware?</h2>
            <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
              Join the hundreds of hardware teams who have already ditched generic software tools for a workspace built specifically for them.
            </p>
            <Link to="/signup">
              <Button size="lg" className="h-14 px-10 text-lg shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]">
                Start your free trial
              </Button>
            </Link>
            <p className="mt-6 text-sm text-text-secondary">Or <a href="https://github.com/yashkhebade/WORKBENCH" className="text-primary hover:underline">self-host</a> for free forever.</p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
