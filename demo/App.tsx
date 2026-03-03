import React, { useState } from 'react';
import { CalendarWidget } from '../src';

const today = new Date();
const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

const disabledDates = [
  new Date(today.getFullYear(), today.getMonth(), 10),
  new Date(today.getFullYear(), today.getMonth(), 20),
  new Date(today.getFullYear(), today.getMonth(), 25),
];

const sectionStyle: React.CSSProperties = {
  marginBottom: '2rem',
};

const headingStyle: React.CSSProperties = {
  margin: '0 0 0.5rem',
  fontSize: '1rem',
  fontWeight: 600,
};

const descriptionStyle: React.CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '0.875rem',
  color: '#6b7280',
};

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '900px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Calendar Widget — Dev Demo</h1>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Default</h2>
        <p style={descriptionStyle}>Default configuration, no props.</p>
        <CalendarWidget />
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Controlled selection</h2>
        <p style={descriptionStyle}>
          Selected: {selectedDate ? selectedDate.toLocaleDateString() : 'none'}
        </p>
        <CalendarWidget value={selectedDate} onChange={setSelectedDate} />
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Min / Max date</h2>
        <p style={descriptionStyle}>
          Range: {minDate.toLocaleDateString()} &ndash; {maxDate.toLocaleDateString()}
        </p>
        <CalendarWidget minDate={minDate} maxDate={maxDate} />
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Disabled dates</h2>
        <p style={descriptionStyle}>
          Disabled: 10th, 20th, and 25th of this month.
        </p>
        <CalendarWidget disabledDates={disabledDates} />
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Week starts on Monday</h2>
        <p style={descriptionStyle}>weekStartsOn=1</p>
        <CalendarWidget weekStartsOn={1} />
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Custom theme</h2>
        <p style={descriptionStyle}>Overridden CSS custom properties (purple accent, dark bg).</p>
        <div
          style={
            {
              '--cw-color-primary': '#7c3aed',
              '--cw-color-bg': '#1e1b2e',
              '--cw-color-text': '#e2e0f0',
              '--cw-color-text-muted': '#8b85a6',
              '--cw-color-hover': '#2d2844',
              '--cw-color-selected': '#7c3aed',
              '--cw-color-selected-text': '#ffffff',
              '--cw-color-today-ring': '#a78bfa',
              '--cw-color-disabled': '#3b3558',
              '--cw-border-radius': '8px',
            } as React.CSSProperties
          }
        >
          <CalendarWidget />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>German locale</h2>
        <p style={descriptionStyle}>locale=&quot;de-DE&quot;</p>
        <CalendarWidget locale="de-DE" />
      </section>
    </div>
  );
}
