import React from 'react';

export default function PriorityLegend() {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">
      <span className="font-semibold text-gray-300">Priority Legend:</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-gray-300 font-medium">High</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-gray-300 font-medium">Medium</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-sky-400" />
        <span className="text-gray-300 font-medium">Low</span>
      </div>
    </div>
  );
}
