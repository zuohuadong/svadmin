// Audit logging — record admin operations

export interface AuditEntry {
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  resource?: string;
  recordId?: string | number;
  userId?: string;
  details?: Record<string, unknown>;
}

export type AuditHandler = (entry: AuditEntry) => void | Promise<void>;

let handler: AuditHandler = (entry) => {
  console.info('[audit]', entry.action, entry.resource, entry.recordId);
};

export function setAuditHandler(fn: AuditHandler): void {
  handler = fn;
}

export function audit(entry: Omit<AuditEntry, 'timestamp'>): void {
  const fullEntry: AuditEntry = { ...entry, timestamp: new Date().toISOString() };
  try {
    handler(fullEntry);
  } catch (e) {
    console.error('[audit] handler error:', e);
  }
}
