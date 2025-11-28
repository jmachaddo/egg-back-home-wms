import { LogEntry } from '../types';

// Mock database for logs
let logs: LogEntry[] = [
  {
    id: 'log-1',
    action: 'System Start',
    module: 'System',
    details: 'Application initialized',
    user: 'System',
    timestamp: new Date().toISOString()
  }
];

export const logService = {
  /**
   * Add a new log entry
   */
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    // Prepend to array so newest is first
    logs = [newLog, ...logs];
    return newLog;
  },

  /**
   * Get logs, optionally filtered by module
   */
  getLogs: (moduleFilter?: string) => {
    if (!moduleFilter) return logs;
    // Simple mapping: if filter is 'Settings', show logs for 'Settings' or 'Users'
    if (moduleFilter === 'Settings') {
        return logs.filter(l => l.module === 'Settings' || l.module === 'Users' || l.module === 'Integrations');
    }
    return logs.filter(l => l.module === moduleFilter);
  },

  /**
   * Get all logs (for debugging)
   */
  getAllLogs: () => logs
};