import { useState, useCallback, useEffect } from 'react';
import './App.css';
import Confetti from './Confetti';

const HOURS = [6, 7, 8];
const CALENDAR_START_HOUR = 6;
const CALENDAR_END_HOUR = 9;
const CALENDAR_TOTAL_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60;


interface CalendarEvent {
  id: string;
  startMinute: number;
  durationMinutes: number;
  label: string;
  color: string;
}

const EVENTS_BY_HOUR: Record<number, CalendarEvent[]> = {
  6: [
    { id: '6-0',  startMinute: 0,  durationMinutes: 30, label: '🥱☀️ Wake up',          color: '#ffe0b2' },
    { id: '6-30', startMinute: 30, durationMinutes: 30, label: '📺🥣 TV and breakfast',  color: '#fff9c4' },
  ],
  7: [
    { id: '7-0',  startMinute: 0,  durationMinutes: 15, label: '📺 Breakfast (no TV)',   color: '#fff9c4' },
    { id: '7-15', startMinute: 15, durationMinutes: 45, label: '🦄🌈 Play!',             color: '#e1f5fe' },
  ],
  8: [
    { id: '8-0',  startMinute: 0,  durationMinutes: 15, label: '👗 Get dressed',         color: '#ffcccc' },
    { id: '8-15', startMinute: 15, durationMinutes: 5,  label: '🪮💆‍♀️ Hair done',         color: '#f0e0cc' },
    { id: '8-20', startMinute: 20, durationMinutes: 5,  label: '🥪🎒 Pack bag',          color: '#e8ccff' },
    { id: '8-25', startMinute: 25, durationMinutes: 5,  label: '👟🩴 Shoes on',          color: '#fffacc' },
    { id: '8-30', startMinute: 30, durationMinutes: 10, label: '🏃‍♀️🏃‍♂️ Go to school',    color: '#b2dfdb' },
    { id: '8-40', startMinute: 40, durationMinutes: 20, label: '🚪📚 Classrooms open',   color: '#cce8ff' },
  ],
};

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const suffix = hour < 12 ? 'am' : 'pm';
  return minute === 0 ? `${h}:00${suffix}` : `${h}:${String(minute).padStart(2, '0')}${suffix}`;
}

const DONE_COLOR = '#c8e6c9';

function HourContent({ hour, done, onToggle }: {
  hour: number;
  done: Set<string>;
  onToggle: (id: string) => void;
}) {
  const events = EVENTS_BY_HOUR[hour];

  if (!events) {
    return <div className="hour-content" />;
  }

  return (
    <div className="hour-content hour-content--with-events">
      {events.map((event) => {
        const isDone = done.has(event.id);
        return (
          <div
            key={event.startMinute}
            className={`event${isDone ? ' event--done' : ''}`}
            style={{
              top: `${(event.startMinute / 60) * 100}%`,
              height: `${(event.durationMinutes / 60) * 100}%`,
              backgroundColor: isDone ? DONE_COLOR : event.color,
              fontSize: event.durationMinutes > 5 ? '1.8rem' : undefined,
            }}
          >
            <input
              type="checkbox"
              className={`event-checkbox${event.durationMinutes > 5 ? ' event-checkbox--large' : ''}`}
              checked={isDone}
              onChange={() => onToggle(event.id)}
            />
            <span className="event-time">{formatTime(hour, event.startMinute)}</span>
            <span className="event-label">{event.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CurrentTimeIndicator() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const minutesFromStart =
    (now.getHours() - CALENDAR_START_HOUR) * 60 + now.getMinutes();
  const topPercent = (minutesFromStart / CALENDAR_TOTAL_MINUTES) * 100;
  const label = formatTime(now.getHours(), now.getMinutes());

  return (
    <div className="current-time" style={{ top: `${topPercent}%` }}>
      <span className="current-time-label">{label}</span>
    </div>
  );
}

const ALL_EVENTS = Object.values(EVENTS_BY_HOUR).flat();

export default function App() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [confettiEmojis, setConfettiEmojis] = useState<string[] | null>(null);

  function toggleDone(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        const event = ALL_EVENTS.find((e) => e.id === id);
        if (event) setConfettiEmojis([event.label]);
      }
      return next;
    });
  }

  const clearConfetti = useCallback(() => setConfettiEmojis(null), []);

  return (
    <div className="calendar">
      <div className="calendar-inner">
        {HOURS.map((hour) => (
          <div key={hour} className="hour-row">
            <div className="hour-label">
              {hour < 12 ? `${hour}am` : `${hour === 12 ? 12 : hour - 12}pm`}
            </div>
            <HourContent hour={hour} done={done} onToggle={toggleDone} />
          </div>
        ))}
        <CurrentTimeIndicator />
      </div>
      {confettiEmojis && <Confetti emojis={confettiEmojis} onDone={clearConfetti} />}
    </div>
  );
}
