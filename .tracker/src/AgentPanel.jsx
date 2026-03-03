import React from 'react';

const AGENT_ICONS = {
  architect: '🏗️',
  engineer: '⚙️',
  pm: '📊',
};

const AGENT_COLORS = {
  architect: '#f78166',
  engineer: '#7ee787',
  pm: '#d2a8ff',
};

export default function AgentPanel({ agents }) {
  const entries = Object.entries(agents);
  if (!entries.length) return null;

  return (
    <div style={styles.panel}>
      <h3 style={styles.heading}>Agent Status</h3>
      <div style={styles.grid}>
        {entries.map(([name, data]) => (
          <AgentCard key={name} name={name} data={data} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ name, data }) {
  const icon = AGENT_ICONS[name] || '🤖';
  const color = AGENT_COLORS[name] || '#58a6ff';
  const shortCommit = data.commit ? data.commit.slice(0, 7) : '—';
  const time = data.time ? new Date(data.time).toLocaleString() : '—';

  return (
    <div style={{ ...styles.card, borderTopColor: color }}>
      <div style={styles.cardHeader}>
        <span style={styles.icon}>{icon}</span>
        <span style={{ ...styles.name, color }}>{name}</span>
        <span style={{
          ...styles.status,
          background: data.clean ? '#1b4332' : '#4a1d1d',
          color: data.clean ? '#7ee787' : '#f85149',
        }}>
          {data.clean ? '✓ clean' : '⟳ working'}
        </span>
      </div>
      <div style={styles.details}>
        <div style={styles.detail}>
          <span style={styles.label}>commit</span>
          <code style={styles.code}>{shortCommit}</code>
        </div>
        <div style={styles.detail}>
          <span style={styles.label}>updated</span>
          <span style={styles.value}>{time}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 13,
    fontWeight: 600,
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12,
  },
  card: {
    background: '#161b22',
    borderRadius: 8,
    padding: '14px 16px',
    borderTop: '3px solid',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  icon: {
    fontSize: 18,
  },
  name: {
    fontWeight: 700,
    fontSize: 15,
    textTransform: 'capitalize',
  },
  status: {
    marginLeft: 'auto',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  details: {
    display: 'flex',
    gap: 20,
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  label: {
    fontSize: 11,
    color: '#484f58',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#58a6ff',
  },
  value: {
    fontSize: 13,
    color: '#c9d1d9',
  },
};
