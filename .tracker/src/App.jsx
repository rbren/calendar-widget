import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from './KanbanBoard.jsx';
import AgentPanel from './AgentPanel.jsx';
import IssueModal from './IssueModal.jsx';

const POLL_INTERVAL = 3000;

export default function App() {
  const [issues, setIssues] = useState([]);
  const [agents, setAgents] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchData = useCallback(async () => {
    const [issueRes, stateRes] = await Promise.all([
      fetch('/api/issues'),
      fetch('/api/state'),
    ]);
    setIssues(await issueRes.json());
    setAgents(await stateRes.json());
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  const filtered = filter === 'all'
    ? issues
    : issues.filter(i => i.tag === filter);

  const tags = [...new Set(issues.map(i => i.tag))];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>📋 Project Tracker</h1>
          <span style={styles.subtitle}>calendar-widget</span>
        </div>
        <div style={styles.filters}>
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({issues.length})
          </FilterButton>
          {tags.map(tag => (
            <FilterButton key={tag} active={filter === tag} onClick={() => setFilter(tag)}>
              {tag} ({issues.filter(i => i.tag === tag).length})
            </FilterButton>
          ))}
        </div>
      </header>

      <AgentPanel agents={agents} />

      <KanbanBoard
        issues={filtered}
        onSelectIssue={setSelectedIssue}
      />

      {selectedIssue && (
        <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.filterBtn,
        ...(active ? styles.filterBtnActive : {}),
      }}
    >
      {children}
    </button>
  );
}

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '20px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#f0f6fc',
  },
  subtitle: {
    fontSize: 14,
    color: '#8b949e',
    fontFamily: 'monospace',
  },
  filters: {
    display: 'flex',
    gap: 8,
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1px solid #30363d',
    background: 'transparent',
    color: '#8b949e',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: '#1f6feb',
    color: '#fff',
    borderColor: '#1f6feb',
  },
};
