import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import DatePicker from 'react-datepicker';
import { parse, isValid, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './DateInput.css';

type View = 'day' | 'month' | 'year';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function DateInput({ label, value, onChange }: Props) {
  const [text, setText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('day');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setText(value); }, [value]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setView('day');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toDate = (s: string): Date | null => {
    if (s.length !== 8) return null;
    const d = parse(s, 'yyyyMMdd', new Date());
    return isValid(d) ? d : null;
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    setText(raw);
    if (raw.length === 8) {
      const d = toDate(raw);
      if (d) onChange(raw);
    }
  };

  const handlePickerChange = (date: Date | null) => {
    if (!date) return;
    // 연도 선택 → 월 뷰로
    if (view === 'year') { setView('month'); return; }
    // 월 선택 → 일 뷰로
    if (view === 'month') { setView('day'); return; }
    // 일 선택 → 완료
    const formatted = format(date, 'yyyyMMdd');
    setText(formatted);
    onChange(formatted);
    setIsOpen(false);
    setView('day');
  };

  return (
    <div className="date-input-wrap" ref={wrapRef}>
      <label className="date-input-label">{label}</label>
      <div className="date-input-row">
        <input
          className="date-text-input"
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="YYYYMMDD"
          maxLength={8}
        />
        <button
          type="button"
          className="calendar-icon-btn"
          onClick={() => { setIsOpen(v => !v); setView('day'); }}
          title="날짜 선택"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="dp-popup">
          <DatePicker
            inline
            locale={ko}
            selected={toDate(text)}
            onChange={handlePickerChange}
            showMonthYearPicker={view === 'month'}
            showYearPicker={view === 'year'}
            renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
              <div className="dp-header">
                <button
                  className="dp-nav"
                  onClick={view === 'day' ? decreaseMonth : decreaseYear}
                >‹</button>

                {view === 'day' && (
                  <button className="dp-title" onClick={() => setView('month')}>
                    {format(date, 'yyyy년 M월')}
                  </button>
                )}
                {view === 'month' && (
                  <button className="dp-title" onClick={() => setView('year')}>
                    {format(date, 'yyyy년')}
                  </button>
                )}
                {view === 'year' && (
                  <span className="dp-title dp-title--static">연도 선택</span>
                )}

                <button
                  className="dp-nav"
                  onClick={view === 'day' ? increaseMonth : increaseYear}
                >›</button>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
