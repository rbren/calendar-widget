import React, { useEffect, useRef } from 'react';

const STATE_BADGES = {
  open: { bg: '#1c3a5f', fg: '#58a6ff', label: 'Open' },
  'in-progress': { bg: '#3d2e00', fg: '#d29922', label: 'In Progress' },
  review: { bg: '#2d1f3d', fg: '#d2a8ff', label: 'Review' },
  closed: { bg: '#1b4332', fg: '#7ee787', label: 'Closed' },
};

export default function IssueModal({ issue, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const badge = STATE_BADGES[issue.state] || STATE_BADGES.open;
  const sections = parseBody(issue.body);

  return (
    <div
      ref={overlayRef}
      style={styles.overlay}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitleRow}>
            <h2 style={styles.modalTitle}>{issue.title}</h2>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>
          <div style={styles.meta}>
            <code style={styles.issueId}>{issue.id}</code>
            <span style={{ ...styles.badge, background: badge.bg, color: badge.fg }}>
              {badge.label}
            </span>
            <span style={styles.tagLabel}>{issue.tag}</span>
          </div>
        </div>
        <div style={styles.modalBody}>
          {sections.map((sec, i) => (
            <div key={i} style={styles.section}>
              {sec.heading && <h3 style={styles.sectionHeading}>{sec.heading}</h3>}
              <div style={styles.sectionContent}>
                {sec.lines.map((line, j) => {
                  if (line.startsWith('```')) return null;
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <div key={j} style={styles.listItem}>• {line.slice(2)}</div>;
                  }
                  if (line.match(/^\d+\.\s/)) {
                    return <div key={j} style={styles.listItem}>{line}</div>;
                  }
                  if (line.trim() === '') return <div key={j} style={{ height: 8 }} />;
                  return <p key={j} style={styles.paragraph}>{line}</p>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function parseBody(body) {
  const lines = body.split('\n');
  const sections = [];
  let current = { heading: null, lines: [] };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current.heading || current.lines.length) sections.push(current);
      current = { heading: line.replace(/^#+\s*/, ''), lines: [] };
    } else if (!line.startsWith('# ')) {
      current.lines.push(line);
    }
  }
  if (current.heading || current.lines.length) sections.push(current);
  return sections;
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 60,
    zIndex: 100,
    overflowY: 'auto',
  },
  modal: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 12,
    width: '90%',
    maxWidth: 720,
    marginBottom: 60,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #21262d',
  },
  modalTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f0f6fc',
    lineHeight: 1.3,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#8b949e',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    flexShrink: 0,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  issueId: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#484f58',
  },
  badge: {
    fontSize: 12,
    padding: '2px 10px',
    borderRadius: 12,
    fontWeight: 600,
  },
  tagLabel: {
    fontSize: 12,
    color: '#8b949e',
    background: '#21262d',
    padding: '2px 10px',
    borderRadius: 12,
  },
  modalBody: {
    padding: '16px 24px 24px',
    maxHeight: 'calc(100vh - 240px)',
    overflowY: 'auto',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f0f6fc',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: '1px solid #21262d',
  },
  sectionContent: {},
  paragraph: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#c9d1d9',
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#c9d1d9',
    paddingLeft: 8,
  },
};
