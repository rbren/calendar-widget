import React from 'react';

const COLUMNS = [
  { key: 'open', label: 'Open', icon: '📬', color: '#58a6ff' },
  { key: 'in-progress', label: 'In Progress', icon: '🔧', color: '#d29922' },
  { key: 'review', label: 'Review', icon: '👀', color: '#d2a8ff' },
  { key: 'closed', label: 'Closed', icon: '✅', color: '#7ee787' },
];

const TAG_COLORS = {
  architecture: { bg: '#1c2d41', fg: '#58a6ff' },
  pm: { bg: '#2d1f3d', fg: '#d2a8ff' },
  unknown: { bg: '#272c33', fg: '#8b949e' },
};

export default function KanbanBoard({ issues, onSelectIssue }) {
  const grouped = {};
  for (const col of COLUMNS) grouped[col.key] = [];
  for (const issue of issues) {
    const key = grouped[issue.state] ? issue.state : 'open';
    grouped[key].push(issue);
  }

  return (
    <div style={styles.board}>
      {COLUMNS.map(col => (
        <div key={col.key} style={styles.column}>
          <div style={styles.colHeader}>
            <span>{col.icon}</span>
            <span style={{ color: col.color, fontWeight: 700 }}>{col.label}</span>
            <span style={styles.count}>{grouped[col.key].length}</span>
          </div>
          <div style={styles.colBody}>
            {grouped[col.key].map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => onSelectIssue(issue)}
              />
            ))}
            {grouped[col.key].length === 0 && (
              <div style={styles.empty}>No issues</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function IssueCard({ issue, onClick }) {
  const idNum = issue.id.replace(/\D/g, '').replace(/^0+/, '') || '?';
  const tagStyle = TAG_COLORS[issue.tag] || TAG_COLORS.unknown;

  return (
    <div style={styles.card} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div style={styles.cardTop}>
        <span style={styles.cardId}>#{idNum}</span>
        <span style={{
          ...styles.tag,
          background: tagStyle.bg,
          color: tagStyle.fg,
        }}>
          {issue.tag}
        </span>
      </div>
      <div style={styles.cardTitle}>{issue.title}</div>
    </div>
  );
}

const styles = {
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    alignItems: 'start',
    minHeight: 400,
  },
  column: {
    background: '#161b22',
    borderRadius: 10,
    overflow: 'hidden',
  },
  colHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 16px 10px',
    fontSize: 15,
    borderBottom: '1px solid #21262d',
  },
  count: {
    marginLeft: 'auto',
    background: '#30363d',
    color: '#8b949e',
    borderRadius: 10,
    padding: '1px 8px',
    fontSize: 12,
    fontWeight: 600,
  },
  colBody: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 'calc(100vh - 320px)',
    overflowY: 'auto',
  },
  card: {
    background: '#0d1117',
    border: '1px solid #21262d',
    borderRadius: 8,
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, transform 0.1s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardId: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#484f58',
  },
  tag: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#f0f6fc',
    lineHeight: 1.4,
  },
  empty: {
    textAlign: 'center',
    color: '#484f58',
    fontSize: 13,
    padding: '20px 0',
  },
};
