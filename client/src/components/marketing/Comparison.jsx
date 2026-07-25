import React from 'react';
import { Check, X, Minus } from 'lucide-react';

export default function Comparison() {
  const comparisonData = [
    { feature: "Hardware-specific workflows", hw: true, jira: false, trello: false, linear: false },
    { feature: "Self-hostable (100% IP ownership)", hw: true, jira: false, trello: false, linear: false },
    { feature: "Open-source codebase", hw: true, jira: false, trello: false, linear: false },
    { feature: "Real-time task synchronization", hw: true, jira: true, trello: true, linear: true },
    { feature: "Unified Calendar & Deadlines", hw: true, jira: "Partial", trello: "Paid", linear: false },
    { feature: "Integrated Engineering Notes", hw: true, jira: "Confluence", trello: false, linear: false },
    { feature: "No per-user licensing fees", hw: true, jira: false, trello: false, linear: false },
  ];

  const renderIcon = (value) => {
    if (value === true) return <Check size={20} className="text-emerald-500 mx-auto" />;
    if (value === false) return <X size={20} className="text-red-500/50 mx-auto" />;
    return <span className="text-sm font-medium text-text-secondary">{value}</span>;
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why switch to HW Team Hub?</h2>
          <p className="text-lg text-text-secondary">Stop bending software teams' tools to fit hardware development.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-white/10 text-white font-semibold">Features</th>
                <th className="p-4 border-b border-white/10 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">HW Team Hub</th>
                <th className="p-4 border-b border-white/10 text-center text-text-secondary font-medium">Jira</th>
                <th className="p-4 border-b border-white/10 text-center text-text-secondary font-medium">Trello</th>
                <th className="p-4 border-b border-white/10 text-center text-text-secondary font-medium">Linear</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-text-secondary font-medium">{row.feature}</td>
                  <td className="p-4 text-center bg-indigo-500/[0.02] border-x border-indigo-500/10">
                    {renderIcon(row.hw)}
                  </td>
                  <td className="p-4 text-center">{renderIcon(row.jira)}</td>
                  <td className="p-4 text-center">{renderIcon(row.trello)}</td>
                  <td className="p-4 text-center">{renderIcon(row.linear)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
