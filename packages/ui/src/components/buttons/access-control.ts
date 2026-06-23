export interface ButtonAccessControl {
  enabled?: boolean;
  hideIfUnauthorized?: boolean;
  params?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export function withRecordId(params: Record<string, unknown> | undefined, recordItemId: string | number | undefined) {
  return recordItemId === undefined
    ? params
    : { id: recordItemId, ...params };
}
