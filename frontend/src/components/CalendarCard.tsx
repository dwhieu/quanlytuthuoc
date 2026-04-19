import React from 'react';
import './CalendarCard.css';

type EventMap = Record<string, number>;

const weekDays = ['T2','T3','T4','T5','T6','T7','CN'];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function getMonthMatrix(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const totalCells = 42; // 6 weeks
  const matrix: Array<{ date: Date; inMonth: boolean }>[] = [];
  const startDate = new Date(year, month, 1 - firstWeekday);

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const inMonth = d.getMonth() === month;
    const row = Math.floor(i / 7);
    if (!matrix[row]) matrix[row] = [] as any;
    matrix[row].push({ date: d, inMonth });
  }
  return matrix;
}

const defaultEvents: EventMap = {
  // demo markers for current month
};

const CalendarCard: React.FC<{ events?: EventMap }>=({ events = defaultEvents })=>{
  const [cursor, setCursor] = React.useState<Date>(new Date());
  const today = new Date();

  const matrix = React.useMemo(()=>getMonthMatrix(cursor),[cursor]);
  const ymTitle = `Thang ${pad(cursor.getMonth()+1)}/${cursor.getFullYear()}`;

  const prevMonth = () => setCursor(d => new Date(d.getFullYear(), d.getMonth()-1, 1));
  const nextMonth = () => setCursor(d => new Date(d.getFullYear(), d.getMonth()+1, 1));

  const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  return (
    <div className="calendar-card shadow-sm bg-white rounded-3 p-3">
      <div className="calendar-header d-flex justify-content-between align-items-center mb-2">
        <div className="calendar-title">Lich</div>
      </div>
      <div className="calendar-nav d-flex align-items-center justify-content-between mb-2">
        <button className="cal-nav-btn" onClick={prevMonth} aria-label="Thang truoc">&lt;</button>
        <div className="cal-month">{ymTitle}</div>
        <button className="cal-nav-btn" onClick={nextMonth} aria-label="Thang sau">&gt;</button>
      </div>
      <div className="cal-grid">
        {weekDays.map(w => (<div key={w} className="cal-weekday">{w}</div>))}
        {matrix.flat().map((cell, idx) => {
          const k = keyOf(cell.date);
          const count = events[k] || 0;
          const isToday = cell.date.toDateString() === today.toDateString();
          return (
            <div key={idx} className={`cal-cell ${cell.inMonth ? '' : 'dim'}`}>
              <div className={`cal-date ${isToday ? 'today' : ''}`}>{pad(cell.date.getDate())}</div>
              <div className="cal-dots">
                {Array.from({length: Math.min(count, 4)}).map((_,i)=> (
                  <span key={i} className="dot" />
                ))}
                {count>4 && <span className="more">+{count-4}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarCard;

