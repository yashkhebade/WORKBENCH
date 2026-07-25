import React, { useState } from 'react';
import { FileContainerTabs } from './ReactPhase2'; // Assuming from Phase 2

// --- 1. WORKFLOW STEPPER COMPONENT ---

const WORKFLOW_STATES = [
  'Ideation',
  'Design (KiCad)',
  'Prototyping (Code)',
  'Testing',
  'Done'
];

export function WorkflowStepper({ projectId, currentState, onStateChanged }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStateClick = async (newState) => {
    if (newState === currentState) return;
    setIsUpdating(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('workflow_state', newState);

      const response = await fetch(`/projects/${projectId}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (response.ok) {
        const updatedProject = await response.json();
        onStateChanged(updatedProject.workflow_state);
      }
    } catch (error) {
      console.error("Failed to update state", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentIndex = WORKFLOW_STATES.indexOf(currentState);

  return (
    <div className="workflow-stepper card mb-6 p-6 overflow-x-auto">
      <h3 className="font-bold mb-4">Project Workflow</h3>
      <div className="flex items-center min-w-max">
        {WORKFLOW_STATES.map((state, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <React.Fragment key={state}>
              {/* Step Circle */}
              <div 
                onClick={() => handleStateClick(state)}
                className={`flex flex-col items-center cursor-pointer transition-all ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                    ${isActive ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg scale-110' 
                    : isCompleted ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`mt-2 text-xs font-medium whitespace-nowrap ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                  {state}
                </span>
              </div>

              {/* Connecting Line (except for last item) */}
              {index < WORKFLOW_STATES.length - 1 && (
                <div className="w-16 h-1 mx-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-success)] transition-all duration-500" 
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// --- 2. DYNAMIC WORKFLOW CONTAINER ---

export function DynamicWorkflowContainer({ project, files }) {
  // Automatically determine the active file tab based on workflow state
  const getActiveTabByState = (state) => {
    switch (state) {
      case 'Design (KiCad)': return 'kicad';
      case 'Prototyping (Code)': return 'code';
      case 'Testing': return 'docs'; // Or whatever logical mapping makes sense
      default: return 'all';
    }
  };

  const defaultCategory = getActiveTabByState(project.workflow_state);

  return (
    <div className="dynamic-workflow-container">
      {/* 
        We pass a `defaultCategory` prop down to FileContainerTabs.
        You'll need to update `FileContainerTabs` from Phase 2 slightly 
        to accept an `initialCategory` prop if you want it to strictly 
        default to this value on mount/change.
      */}
      <FileContainerTabs files={files} initialCategory={defaultCategory} />
    </div>
  );
}
