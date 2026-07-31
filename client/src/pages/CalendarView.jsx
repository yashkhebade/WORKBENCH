import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const calendarRef = useRef(null);

  // Custom Toolbar state
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [calendarTitle, setCalendarTitle] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('meeting');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    fetchEvents(activeProjectId || 'all');
  }, [activeProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getEventColor = (type) => {
    if (type === 'deadline') return '#ef4444'; // Red
    if (type === 'milestone') return '#f59e0b'; // Amber
    return '#6366f1'; // Indigo (Meeting)
  };

  const fetchEvents = async (projectId) => {
    try {
      const res = await api.get(`/calendar/project/${projectId || 'all'}`);
      const parsedEvents = res.data.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        backgroundColor: getEventColor(e.type),
        borderColor: getEventColor(e.type),
        extendedProps: { type: e.type, is_recurring: e.is_recurring, raw: e.raw }
      }));
      setEvents(parsedEvents);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSlot = (info) => {
    setSelectedDates(info);
    setTitle('');
    setDescription('');
    setEventType('meeting');
    setIsRecurring(false);
    setModalOpen(true);
  };

  const handleEventDrop = async (info) => {
    const { event } = info;
    try {
      await api.put(`/calendar/${event.id}`, {
        title: event.title,
        description: event.extendedProps.raw.description || '',
        start_time: event.start.toISOString(),
        end_time: event.end ? event.end.toISOString() : event.start.toISOString()
      });
    } catch (err) {
      info.revert();
      console.error(err);
      alert('Failed to update event');
    }
  };

  const handleEventResize = async (info) => {
    const { event } = info;
    try {
      await api.put(`/calendar/${event.id}`, {
        title: event.title,
        description: event.extendedProps.raw.description || '',
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString()
      });
    } catch (err) {
      info.revert();
      console.error(err);
      alert('Failed to update event');
    }
  };

  const handleEventClick = async (info) => {
    const { event } = info;
    if (window.confirm(`Delete event "${event.title}"?`)) {
      try {
        await api.delete(`/calendar/${event.id}`);
        fetchEvents(activeProjectId);
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await api.post('/calendar', {
        project_id: activeProjectId || null,
        title,
        description,
        event_type: eventType,
        is_recurring: isRecurring,
        start_time: selectedDates.startStr,
        end_time: selectedDates.endStr || selectedDates.startStr
      });
      setModalOpen(false);
      fetchEvents(activeProjectId);
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleMiniCalendarChange = (date) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(date);
    }
  };

  const handleDatesSet = (info) => {
    setCalendarTitle(info.view.title);
  };

  const changeView = (viewName) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(viewName);
      setCurrentView(viewName);
    }
  };

  const navigateCalendar = (action) => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (action === 'prev') api.prev();
      if (action === 'next') api.next();
      if (action === 'today') api.today();
    }
  };

  // Agenda logic
  const upcomingEvents = events
    .filter(e => new Date(e.start) >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="flex gap-6 h-[calc(100vh-64px-2rem)] overflow-hidden">
      
      {/* Sidebar: Mini Calendar & Agenda */}
      <div className="w-[320px] flex flex-col gap-4 desktop-only flex-shrink-0">
        
        {/* Top bar in sidebar for project selection and create event */}
        <div className="flex gap-2">
          <select 
            value={activeProjectId} 
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button 
            className="btn btn-primary px-3 shadow-sm hover:scale-105 transition-transform" 
            onClick={() => {
              setSelectedDates({ startStr: new Date().toISOString(), endStr: new Date().toISOString() });
              setModalOpen(true);
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Mini Calendar Container */}
        <div className="card !p-4 shadow-sm border border-[var(--border-color)]">
          <ReactCalendar 
            onChange={handleMiniCalendarChange} 
            className="custom-react-calendar" 
          />
        </div>

        {/* Agenda View */}
        <div className="card !p-0 shadow-sm border border-[var(--border-color)] flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] sticky top-0 font-semibold text-sm">
            Upcoming Schedule
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {upcomingEvents.length === 0 ? (
              <div className="text-center p-6 text-sm text-[var(--text-secondary)]">No upcoming events</div>
            ) : (
              upcomingEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer" onClick={() => handleMiniCalendarChange(new Date(evt.start))}>
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: evt.backgroundColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{evt.title}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      {new Date(evt.start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(evt.start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="card shadow-sm border border-[var(--border-color)] flex-1 flex flex-col p-0 overflow-hidden bg-[var(--bg-primary)]">
        <style>{`
          .fc-theme-standard td, .fc-theme-standard th { border-color: var(--border-color); }
          .fc-col-header-cell { padding: 8px 0; background-color: var(--bg-tertiary); color: var(--text-secondary); font-weight: 500; font-size: 0.85rem; border-bottom: 1px solid var(--border-color) !important; }
          .fc-day-today { background-color: rgba(37, 99, 235, 0.03) !important; }
          .fc-event { cursor: pointer; border-radius: 6px; padding: 3px 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1) !important; font-weight: 500; font-size: 0.75rem; transition: transform 0.2s, box-shadow 0.2s; }
          .fc-event:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .fc .fc-toolbar-title { font-weight: 600; color: var(--text-primary); }
          
          /* React Calendar Overrides for Sleek Look */
          .custom-react-calendar { border: none !important; font-family: inherit; width: 100%; background: transparent; }
          .react-calendar__navigation { margin-bottom: 0.5rem; }
          .react-calendar__navigation button { color: var(--text-primary); font-weight: 600; border-radius: 4px; padding: 4px; }
          .react-calendar__navigation button:hover { background-color: var(--bg-tertiary) !important; }
          .react-calendar__month-view__weekdays { font-size: 0.75rem; text-transform: uppercase; font-weight: 600; color: var(--text-secondary); abbr { text-decoration: none; } }
          .react-calendar__tile { padding: 0.5rem; font-size: 0.85rem; border-radius: 6px; color: var(--text-primary); }
          .react-calendar__tile:hover { background-color: var(--bg-tertiary) !important; }
          .react-calendar__tile--active { background: var(--color-primary) !important; color: white !important; font-weight: 600; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3); }
          .react-calendar__tile--now:not(.react-calendar__tile--active) { background: rgba(37, 99, 235, 0.1); color: var(--color-primary); font-weight: 700; }
        `}</style>

        {/* Custom Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
          
          {/* Left: Navigation & Today */}
          <div className="flex items-center gap-3">
            <button className="btn btn-outline px-4 shadow-sm text-sm" onClick={() => navigateCalendar('today')}>
              Today
            </button>
            <div className="flex items-center bg-[var(--bg-tertiary)] rounded-md border border-[var(--border-color)] overflow-hidden shadow-sm">
              <button className="px-3 py-1.5 hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)]" onClick={() => navigateCalendar('prev')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div className="w-[1px] h-4 bg-[var(--border-color)]" />
              <button className="px-3 py-1.5 hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)]" onClick={() => navigateCalendar('next')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          {/* Center: Title */}
          <h2 className="text-xl font-bold tracking-tight">{calendarTitle}</h2>

          {/* Right: View Toggles */}
          <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-lg border border-[var(--border-color)] shadow-sm">
            {['dayGridMonth', 'timeGridWeek', 'timeGridDay'].map(view => (
              <button 
                key={view}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${currentView === view ? 'bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                onClick={() => changeView(view)}
              >
                {view === 'dayGridMonth' ? 'Month' : view === 'timeGridWeek' ? 'Week' : 'Day'}
              </button>
            ))}
          </div>
        </div>

        {/* FullCalendar Grid */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 [&_.fc]:h-full [&_.fc-scroller-harness]:h-full">
            <FullCalendar
              ref={calendarRef}
              plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
              initialView="dayGridMonth"
              headerToolbar={false} /* Disabled default toolbar */
              datesSet={handleDatesSet}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleSelectSlot}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="font-semibold text-lg text-white">Create Schedule Event</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">Event Title *</label>
                <input 
                  type="text" 
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Firmware Sprint Review"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-300">Event Type</label>
                  <select 
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-[#27272a] text-white text-xs outline-none"
                  >
                    <option value="meeting">Meeting (Indigo)</option>
                    <option value="deadline">Deadline (Red)</option>
                    <option value="milestone">Milestone (Amber)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-300 cursor-pointer p-2.5 rounded-xl border border-white/10 bg-white/5">
                    <input 
                      type="checkbox"
                      checked={isRecurring}
                      onChange={e => setIsRecurring(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span>Weekly Sync</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-xs outline-none resize-none"
                  placeholder="Optional details, meeting link..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/5">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 shadow-sm">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
