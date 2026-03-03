import React, { useState } from 'react';
import { CalendarWidget } from '@calendar-widget/core';
import type { DateRange } from '@calendar-widget/core';
import '@calendar-widget/core/style.css';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

function BasicDemo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="demo-card">
      <h2>Basic</h2>
      <p className="description">Single date selection with defaults.</p>
      <CalendarWidget value={date} onChange={setDate} />
      <p className="selection">
        {date ? `Selected: ${date.toLocaleDateString()}` : 'No date selected'}
      </p>
    </div>
  );
}

function MinMaxDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const minDate = new Date(year, month, 5);
  const maxDate = new Date(year, month + 1, 15);

  return (
    <div className="demo-card">
      <h2>Min / Max Range</h2>
      <p className="description">
        Only dates between the 5th of this month and the 15th of next month are
        selectable.
      </p>
      <CalendarWidget
        value={date}
        onChange={setDate}
        minDate={minDate}
        maxDate={maxDate}
      />
      <p className="selection">
        {date ? `Selected: ${date.toLocaleDateString()}` : 'No date selected'}
      </p>
    </div>
  );
}

function DisabledDatesDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const disabled = [
    new Date(year, month, 10),
    new Date(year, month, 11),
    new Date(year, month, 12),
    new Date(year, month, 20),
  ];

  return (
    <div className="demo-card">
      <h2>Disabled Dates</h2>
      <p className="description">
        The 10th, 11th, 12th, and 20th of this month are disabled.
      </p>
      <CalendarWidget
        value={date}
        onChange={setDate}
        disabledDates={disabled}
      />
      <p className="selection">
        {date ? `Selected: ${date.toLocaleDateString()}` : 'No date selected'}
      </p>
    </div>
  );
}

function LocaleDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const [locale, setLocale] = useState('en-US');
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(0);

  return (
    <div className="demo-card">
      <h2>Localization</h2>
      <p className="description">
        Change locale and week start day.
      </p>
      <div className="controls">
        <label>
          Locale:
          <select value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="en-US">English (US)</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="ja-JP">Japanese</option>
            <option value="ar-EG">Arabic (Egypt)</option>
            <option value="zh-CN">Chinese (Simplified)</option>
          </select>
        </label>
        <label>
          Week starts:
          <select
            value={weekStartsOn}
            onChange={(e) => setWeekStartsOn(Number(e.target.value) as 0 | 1)}
          >
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
          </select>
        </label>
      </div>
      <CalendarWidget
        value={date}
        onChange={setDate}
        locale={locale}
        weekStartsOn={weekStartsOn}
      />
      <p className="selection">
        {date
          ? `Selected: ${date.toLocaleDateString(locale)}`
          : 'No date selected'}
      </p>
    </div>
  );
}

function RangeDemo() {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <div className="demo-card">
      <h2>Range Selection</h2>
      <p className="description">
        Click a start date, then click an end date to select a range. Hover to
        preview.
      </p>
      <CalendarWidget mode="range" value={range} onChange={setRange} />
      <p className="selection">
        {range
          ? `${range.start.toLocaleDateString()} – ${range.end.toLocaleDateString()}`
          : 'No range selected'}
      </p>
    </div>
  );
}

function RangeConstrainedDemo() {
  const [range, setRange] = useState<DateRange | null>(null);
  const minDate = new Date(year, month, 1);
  const maxDate = new Date(year, month + 2, 0);

  return (
    <div className="demo-card">
      <h2>Constrained Range</h2>
      <p className="description">
        Range selection with min/max bounds (this month through next month).
      </p>
      <CalendarWidget
        mode="range"
        value={range}
        onChange={setRange}
        minDate={minDate}
        maxDate={maxDate}
      />
      <p className="selection">
        {range
          ? `${range.start.toLocaleDateString()} – ${range.end.toLocaleDateString()}`
          : 'No range selected'}
      </p>
    </div>
  );
}

function MultiSelectDemo() {
  const [dates, setDates] = useState<Date[]>([]);

  function handleChange(date: Date) {
    setDates((prev) => {
      const exists = prev.some(
        (d) => d.toDateString() === date.toDateString(),
      );
      return exists
        ? prev.filter((d) => d.toDateString() !== date.toDateString())
        : [...prev, date];
    });
  }

  return (
    <div className="demo-card">
      <h2>Multi-Select</h2>
      <p className="description">
        Click dates to toggle selection. Multiple dates can be active.
      </p>
      <CalendarWidget value={dates} onChange={handleChange} />
      <p className="selection">
        {dates.length > 0
          ? `Selected: ${dates.map((d) => d.toLocaleDateString()).join(', ')}`
          : 'No dates selected'}
      </p>
    </div>
  );
}

function DarkThemeDemo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="demo-card dark">
      <h2>Dark Theme</h2>
      <p className="description">
        Themed via CSS custom properties on a class.
      </p>
      <CalendarWidget
        className="dark-calendar"
        value={date}
        onChange={setDate}
      />
      <p className="selection">
        {date ? `Selected: ${date.toLocaleDateString()}` : 'No date selected'}
      </p>
    </div>
  );
}

function RoundThemeDemo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="demo-card">
      <h2>Round Cells</h2>
      <p className="description">
        Circular cells with a purple accent.
      </p>
      <CalendarWidget
        className="round-calendar"
        value={date}
        onChange={setDate}
      />
      <p className="selection">
        {date ? `Selected: ${date.toLocaleDateString()}` : 'No date selected'}
      </p>
    </div>
  );
}

function CompactDemo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="demo-card">
      <h2>Compact</h2>
      <p className="description">
        Smaller font and cell size for tight layouts.
      </p>
      <CalendarWidget
        className="compact-calendar"
        value={date}
        onChange={setDate}
      />
      <p className="selection">
        {date ? `Selected: ${date.toLocaleDateString()}` : 'No date selected'}
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <h1>@calendar-widget/core Demos</h1>
      <p>Interactive examples of every CalendarWidget feature.</p>
      <div className="demos">
        <BasicDemo />
        <RangeDemo />
        <MinMaxDemo />
        <RangeConstrainedDemo />
        <DisabledDatesDemo />
        <LocaleDemo />
        <MultiSelectDemo />
        <DarkThemeDemo />
        <RoundThemeDemo />
        <CompactDemo />
      </div>
    </div>
  );
}
