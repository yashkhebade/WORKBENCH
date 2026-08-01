import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Check } from 'lucide-react';
import api from '../../services/api';

const DEFAULT_WORKFLOW_STEPS = ['Ideation', 'Design (KiCad)', 'Prototyping (Code)', 'Testing', 'Done'];

export default function WorkflowStepper({ activeProject, onStateChanged }) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getSteps = (proj) => {
    if (!proj) return DEFAULT_WORKFLOW_STEPS;
    try {
      const parsed = proj.workflow_steps ? JSON.parse(proj.workflow_steps) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WORKFLOW_STEPS;
    } catch { return DEFAULT_WORKFLOW_STEPS; }
  };

  const [editSteps, setEditSteps] = useState(() => getSteps(activeProject));

  useEffect(() => {
    setEditSteps(getSteps(activeProject));
    setIsEditing(false);
  }, [activeProject?.id]);

  if (!activeProject) return null;

  const steps = getSteps(activeProject);
  const currentState = activeProject.workflow_state || steps[0];
  const currentIndex = steps.indexOf(currentState);

  const handleStateClick = async (newState) => {
    if (isEditing) return;
    if (newState === currentState) {
      navigate(`/board?stage=${encodeURIComponent(newState)}`);
      return;
    }
    setIsUpdating(true);
    try {
      const response = await api.put(`/projects/${activeProject.id}/state`, { workflow_state: newState });
      onStateChanged(activeProject.id, response.data.workflow_state);
    } catch (error) {
      console.error('Failed to update state', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const addStep = () => setEditSteps(s => [...s, `Step ${s.length + 1}`]);

  const removeStep = (i) => {
    if (editSteps.length <= 2) return;
    setEditSteps(s => s.filter((_, idx) => idx !== i));
  };

  const renameStep = (i, val) =>
    setEditSteps(s => s.map((step, idx) => idx === i ? val : step));

  const moveStep = (i, dir) => {
    const next = i + dir;
    if (next < 0 || next >= editSteps.length) return;
    setEditSteps(s => {
      const arr = [...s];
      [arr[i], arr[next]] = [arr[next], arr[i]];
      return arr;
    });
  };

  const saveSteps = async () => {
    const cleaned = editSteps.map(s => s.trim()).filter(Boolean);
    if (cleaned.length < 2) return;
    setIsSaving(true);
    try {
      await api.put(`/projects/${activeProject.id}/workflow-steps`, { steps: cleaned });
      if (!cleaned.includes(currentState)) {
        await api.put(`/projects/${activeProject.id}/state`, { workflow_state: cleaned[0] });
        onStateChanged(activeProject.id, cleaned[0], cleaned);
      } else {
        onStateChanged(activeProject.id, currentState, cleaned);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save workflow steps', err);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditSteps(steps);
    setIsEditing(false);
  };

  return (
    <div className="glass-panel mb-6 p-6 bg-[#18181b] border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity size={18} strokeWidth={2.25} />
          </div>
          {isEditing ? 'Editing Workflow:' : 'Active Project Workflow:'}{' '}
          <span className="text-primary font-bold">{activeProject.name}</span>
        </h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => { setEditSteps(steps); setIsEditing(true); }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Steps
            </button>
          ) : (
            <>
              <button onClick={cancelEdit} className="text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                onClick={saveSteps}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {isSaving ? 'Saving…' : '✓ Save Workflow'}
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400 mb-1">Click step titles to rename • Drag arrows to reorder</p>
          {editSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 group">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors text-xs">▲</button>
                <button onClick={() => moveStep(i, 1)} disabled={i === editSteps.length - 1} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors text-xs">▼</button>
              </div>

              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-primary">
                {i + 1}
              </div>

              <input
                value={step}
                onChange={e => renameStep(i, e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Step ${i + 1} name…`}
              />

              <button
                onClick={() => removeStep(i)}
                disabled={editSteps.length <= 2}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addStep}
            className="mt-1 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-dashed border-white/20 text-primary hover:bg-primary/10 transition-all cursor-pointer"
          >
            <span className="text-base font-bold">+</span> Add Step
          </button>
        </div>
      ) : (
        <div className="flex items-center overflow-x-auto min-w-0 pb-1 pt-2 px-2">
          {steps.map((state, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            return (
              <React.Fragment key={state}>
                <div
                  onClick={() => handleStateClick(state)}
                  title="Click to activate stage or view board"
                  className={`flex flex-col items-center cursor-pointer transition-all shrink-0 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300
                      ${isActive ? 'bg-primary border-primary text-white scale-110 ring-4 ring-primary/20 shadow-lg'
                      : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary hover:scale-105'
                    }`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                  </div>
                  <span className={`mt-3 text-xs font-medium whitespace-nowrap transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {state}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-1 mx-2 rounded-full bg-white/10 overflow-hidden shrink-0 -translate-y-3 relative">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-in-out"
                      style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
