import React from 'react';
import { Columns, Calendar, FileText, Lock } from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: "Hardware-Optimized Kanban",
      description: "Custom workflow states designed for hardware engineering. Track PCBs from schematic capture through layout, fabrication, and assembly without the friction of generic software tools.",
      icon: <Columns className="w-6 h-6 text-indigo-400" />,
      imageBg: "bg-indigo-500/10",
      imageBorder: "border-indigo-500/20"
    },
    {
      title: "Unified Team Calendar",
      description: "Visualize fab deadlines, firmware sprints, and component lead times in one unified view. Syncs perfectly with your task deadlines to keep the whole team aligned.",
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      imageBg: "bg-emerald-500/10",
      imageBorder: "border-emerald-500/20"
    },
    {
      title: "Engineering Notes & Specs",
      description: "Write markdown-powered engineering notebooks. Document pinouts, power budgets, and assembly instructions right next to the tasks that reference them.",
      icon: <FileText className="w-6 h-6 text-purple-400" />,
      imageBg: "bg-purple-500/10",
      imageBorder: "border-purple-500/20"
    },
    {
      title: "Total IP Control (Self-Hosted)",
      description: "Hardware IP is sensitive. Don't trust it on public clouds? Deploy HW Team Hub on your own infrastructure via Docker in 5 minutes. Total control, zero licensing fees.",
      icon: <Lock className="w-6 h-6 text-rose-400" />,
      imageBg: "bg-rose-500/10",
      imageBorder: "border-rose-500/20"
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for the physical world.</h2>
          <p className="text-lg text-text-secondary">
            Generic project managers don't understand hardware development cycles. We do. 
            HW Team Hub brings the tools you need to ship hardware faster, without the bloat.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
              {/* Text content */}
              <div className="flex-1 space-y-6">
                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{feature.title}</h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Visual representation */}
              <div className="flex-1 w-full max-w-xl">
                <div className={`aspect-video rounded-2xl border ${feature.imageBorder} ${feature.imageBg} p-6 relative overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  {/* Abstract mock UI for each feature */}
                  <div className="w-3/4 h-3/4 bg-[#11111a] rounded-xl border border-white/10 shadow-2xl flex flex-col p-4 relative z-10">
                    <div className="w-full h-4 bg-white/5 rounded-md mb-4"></div>
                    <div className="flex gap-2 flex-1">
                      <div className="flex-1 bg-white/5 rounded"></div>
                      <div className="flex-1 bg-white/5 rounded"></div>
                      <div className="flex-1 bg-white/5 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
