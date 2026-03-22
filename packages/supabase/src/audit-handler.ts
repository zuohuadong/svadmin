// Supabase AuditHandler — writes audit entries to a Supabase table
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditHandler, AuditEntry } from '@svadmin/core';

export function createSupabaseAuditHandler(client: SupabaseClient): AuditHandler {
  return async (entry: AuditEntry) => {
    await client.from('audit_log').insert({
      action: entry.action,
      resource: entry.resource,
      record_id: entry.recordId ? String(entry.recordId) : null,
      user_id: entry.userId,
      details: entry.details,
      created_at: entry.timestamp,
    });
  };
}
