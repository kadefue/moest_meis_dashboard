import React, { useState, useEffect } from 'react';
import { getTable } from '../MockData';
import SearchableSelect from './SearchableSelect';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    setLogs(getTable('audit_logs'));
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      log.username.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term)
    );
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    
    if (sortBy === 'timestamp') {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE': return <span className="badge badge-success">Create</span>;
      case 'UPDATE': return <span className="badge badge-warning">Update</span>;
      case 'APPROVE': return <span className="badge badge-success">Approve</span>;
      case 'SUBMIT': return <span className="badge badge-info">Submit</span>;
      default: return <span className="badge badge-info">{action}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search logs by user, action, entity or detail..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{ maxWidth: '360px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>Items per page:</span>
          <SearchableSelect
            options={[
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 50, label: "50" }
            ]}
            value={itemsPerPage}
            onChange={val => { setItemsPerPage(Number(val)); setCurrentPage(1); }}
            style={{ width: '80px' }}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('timestamp')}>
                Timestamp {sortBy === 'timestamp' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('username')}>
                User {sortBy === 'username' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('action')}>
                Action {sortBy === 'action' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('entity')}>
                Entity {sortBy === 'entity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map(log => (
                <tr key={log.log_id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{log.username}</td>
                  <td>{getActionBadge(log.action)}</td>
                  <td><span className="badge badge-info" style={{ borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.65rem' }}>{log.entity}</span></td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedLog(log)}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--neutral-600)' }}>
                  📭 No audit log entries found matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedLogs.length)} of {sortedLogs.length} logs
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              ◀ Previous
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              Next ▶
            </button>
          </div>
        </div>
      )}

      {/* Log Inspector Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Audit Log Inspector</h3>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div><strong>Log ID:</strong> #{selectedLog.log_id}</div>
                <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toUTCString()}</div>
                <div><strong>Actor Username:</strong> {selectedLog.username}</div>
                <div><strong>Action Code:</strong> {selectedLog.action}</div>
                <div><strong>Target Entity:</strong> {selectedLog.entity}</div>
                <div><strong>Details:</strong></div>
                <div style={{
                  background: 'var(--neutral-100)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  border: '1px solid var(--neutral-200)'
                }}>
                  {selectedLog.details}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
