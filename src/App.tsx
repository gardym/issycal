import './App.css';

const HOURS = [6, 7, 8];
const CALENDAR_START_HOUR = 6;
const CALENDAR_END_HOUR = 9;
const CALENDAR_TOTAL_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60;

// Hardcoded for testing — replace with real time later
const CURRENT_TIME = { hour: 8, minute: 22 };

interface CalendarEvent {
  startMinute: number; // minutes from the start of the hour
  durationMinutes: number;
  label: string;
  color: string;
}

const EVENTS_BY_HOUR: Record<number, CalendarEvent[]> = {
  6: [
    { startMinute: 0,  durationMinutes: 15, label: '🥱☀️ Wake up',          color: '#ffe0b2' },
    { startMinute: 15, durationMinutes: 45, label: '📺🥣 TV and breakfast',  color: '#fff9c4' },
  ],
  7: [
    { startMinute: 0,  durationMinutes: 15, label: '📺 Breakfast (no TV)',   color: '#fff9c4' },
    { startMinute: 15, durationMinutes: 45, label: '🦄🌈 Play!',             color: '#e1f5fe' },
  ],
  8: [
    { startMinute: 0,  durationMinutes: 15, label: '👗 Get dressed',         color: '#ffcccc' },
    { startMinute: 15, durationMinutes: 5,  label: '🪮💆‍♀️ Hair done',         color: '#f0e0cc' },
    { startMinute: 20, durationMinutes: 5,  label: '🥪🎒 Pack bag',          color: '#e8ccff' },
    { startMinute: 25, durationMinutes: 5,  label: '👟🩴 Shoes on',          color: '#fffacc' },
    { startMinute: 30, durationMinutes: 10, label: '🏃‍♀️🏃‍♂️ Go to school',    color: '#ccf0d8' },
    { startMinute: 40, durationMinutes: 20, label: '🚪📚 Classrooms open',   color: '#cce8ff' },
  ],
};

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const suffix = hour < 12 ? 'am' : 'pm';
  return minute === 0 ? `${h}:00${suffix}` : `${h}:${String(minute).padStart(2, '0')}${suffix}`;
}

function HourContent({ hour }: { hour: number }) {
  const events = EVENTS_BY_HOUR[hour];

  if (!events) {
    return <div className="hour-content" />;
  }

  return (
    <div className="hour-content hour-content--with-events">
      {events.map((event) => (
        <div
          key={event.startMinute}
          className="event"
          style={{
            top: `${(event.startMinute / 60) * 100}%`,
            height: `${(event.durationMinutes / 60) * 100}%`,
            backgroundColor: event.color,
            fontSize: event.durationMinutes > 5 ? '1.8rem' : undefined,
          }}
        >
          <span className="event-time">{formatTime(hour, event.startMinute)}</span>
          <span className="event-label">{event.label}</span>
        </div>
      ))}
    </div>
  );
}

function CurrentTimeIndicator() {
  const minutesFromStart =
    (CURRENT_TIME.hour - CALENDAR_START_HOUR) * 60 + CURRENT_TIME.minute;
  const topPercent = (minutesFromStart / CALENDAR_TOTAL_MINUTES) * 100;
  const label = formatTime(CURRENT_TIME.hour, CURRENT_TIME.minute);

  return (
    <div className="current-time" style={{ top: `${topPercent}%` }}>
      <span className="current-time-label">{label}</span>
    </div>
  );
}

export default function App() {
  return (
    <div className="calendar">
      <div className="calendar-inner">
        {HOURS.map((hour) => (
          <div key={hour} className="hour-row">
            <div className="hour-label">
              {hour < 12 ? `${hour}am` : `${hour === 12 ? 12 : hour - 12}pm`}
            </div>
            <HourContent hour={hour} />
          </div>
        ))}
        <CurrentTimeIndicator />
      </div>
    </div>
  );
}
