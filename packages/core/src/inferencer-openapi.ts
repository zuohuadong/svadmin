/**
 * OpenAPI Schema → ResourceDefinition converter
 *
 * Parses an OpenAPI 3.x JSON schema and generates ResourceDefinition[]
 * by analyzing the schema's paths and components.
 */
import type { FieldDefinition, ResourceDefinition } from './types';

// ─── OpenAPI Types (subset) ──────────────────────────────────

interface OpenAPISchema {
  openapi?: string;
  info?: { title?: string; version?: string };
  paths?: Record<string, OpenAPIPathItem>;
  components?: {
    schemas?: Record<string, OpenAPISchemaObject>;
  };
}

interface OpenAPIPathItem {
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  delete?: OpenAPIOperation;
}

interface OpenAPIOperation {
  operationId?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content?: Record<string, { schema?: OpenAPISchemaObject | OpenAPIRef }>;
  };
  responses?: Record<string, {
    content?: Record<string, { schema?: OpenAPISchemaObject | OpenAPIRef }>;
  }>;
}

interface OpenAPIParameter {
  name: string;
  in: string;
  required?: boolean;
  schema?: OpenAPISchemaObject;
}

interface OpenAPISchemaObject {
  type?: string;
  format?: string;
  properties?: Record<string, OpenAPISchemaObject | OpenAPIRef>;
  items?: OpenAPISchemaObject | OpenAPIRef;
  required?: string[];
  enum?: (string | number)[];
  $ref?: string;
  description?: string;
  nullable?: boolean;
}

interface OpenAPIRef {
  $ref: string;
}

function isRef(obj: unknown): obj is OpenAPIRef {
  return obj !== null && typeof obj === 'object' && '$ref' in obj && typeof (obj as OpenAPIRef).$ref === 'string';
}

// ─── Schema Resolution ───────────────────────────────────────

function resolveRef(ref: string, root: OpenAPISchema): OpenAPISchemaObject | null {
  // $ref format: "#/components/schemas/Post"
  const parts = ref.replace('#/', '').split('/');
  let current: unknown = root;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[part];
    if (!current) return null;
  }
  return current as OpenAPISchemaObject;
}

function resolveSchema(schemaOrRef: OpenAPISchemaObject | OpenAPIRef, root: OpenAPISchema): OpenAPISchemaObject | null {
  if (isRef(schemaOrRef)) {
    return resolveRef(schemaOrRef.$ref, root);
  }
  return schemaOrRef;
}

// ─── Type Mapping ────────────────────────────────────────────

function mapOpenAPITypeToFieldType(
  key: string,
  schema: OpenAPISchemaObject,
  root: OpenAPISchema
): FieldDefinition['type'] {
  const { type, format } = schema;

  // Enum → select
  if (schema.enum && schema.enum.length > 0) return 'select';

  // Array types
  if (type === 'array') {
    if (schema.items) {
      const itemSchema = resolveSchema(schema.items, root);
      if (itemSchema?.type === 'string') {
        const lk = key.toLowerCase();
        if (lk.includes('image') || lk.includes('photo')) return 'images';
        return 'tags';
      }
    }
    return 'tags';
  }

  // Object → json
  if (type === 'object') return 'json';

  // Boolean
  if (type === 'boolean') return 'boolean';

  // Number/Integer
  if (type === 'number' || type === 'integer') return 'number';

  // String with format
  if (type === 'string') {
    if (format === 'date' || format === 'date-time') return 'date';
    if (format === 'email') return 'email';
    if (format === 'uri' || format === 'url') return 'url';
    if (format === 'binary' || format === 'byte') return 'image';

    // Heuristic from key name
    const lk = key.toLowerCase();
    if (lk.includes('email')) return 'email';
    if (lk.includes('phone') || lk.includes('tel')) return 'phone';
    if (lk.includes('url') || lk.includes('link') || lk.includes('website')) return 'url';
    if (lk.includes('avatar') || lk.includes('image') || lk.includes('photo') || lk.includes('logo')) return 'image';
    if (lk.includes('color') || lk.includes('colour')) return 'color';
    if (lk.includes('description') || lk.includes('content') || lk.includes('body') || lk.includes('bio')) return 'textarea';
    if (lk === 'created_at' || lk === 'updated_at' || lk.endsWith('_at') || lk.endsWith('_date')) return 'date';

    return 'text';
  }

  return 'text';
}

// ─── Core: Parse OpenAPI Schema ──────────────────────────────

export interface InferFromOpenAPIOptions {
  /** Only infer resources matching these schema names */
  include?: string[];
  /** Exclude these schema names */
  exclude?: string[];
  /** Custom primary key (default: 'id') */
  primaryKey?: string;
}

/**
 * Parse an OpenAPI 3.x JSON schema and produce ResourceDefinition[].
 */
export function inferFromOpenAPI(
  spec: OpenAPISchema,
  options: InferFromOpenAPIOptions = {}
): ResourceDefinition[] {
  const { primaryKey = 'id', include, exclude } = options;
  const schemas = spec.components?.schemas ?? {};
  const resources: ResourceDefinition[] = [];

  // Detect which schemas have CRUD paths
  const resourcePaths = detectResourcePaths(spec);

  for (const [schemaName, schemaObj] of Object.entries(schemas)) {
    // Apply include/exclude filters
    if (include && !include.includes(schemaName)) continue;
    if (exclude && exclude.includes(schemaName)) continue;

    const resolved = resolveSchema(schemaObj as OpenAPISchemaObject | OpenAPIRef, spec);
    if (!resolved || resolved.type !== 'object' || !resolved.properties) continue;

    const fields: FieldDefinition[] = [];
    const requiredFields = new Set(resolved.required ?? []);

    for (const [propName, propSchemaOrRef] of Object.entries(resolved.properties)) {
      const propSchema = resolveSchema(propSchemaOrRef, spec);
      if (!propSchema) continue;

      const fieldType = mapOpenAPITypeToFieldType(propName, propSchema, spec);

      // Detect relation from $ref or _id suffix
      let relatedResource: string | null = null;
      if (isRef(propSchemaOrRef)) {
        const refName = propSchemaOrRef.$ref.split('/').pop() ?? '';
        relatedResource = refName.toLowerCase() + 's';
      } else if (propName.endsWith('_id') || propName.endsWith('Id')) {
        const base = propName.replace(/_id$|Id$/, '');
        relatedResource = base.endsWith('s') ? base : base + 's';
      }

      const field: FieldDefinition = {
        key: propName,
        label: humanize(propName),
        type: relatedResource ? 'relation' : fieldType,
        required: requiredFields.has(propName),
        sortable: ['text', 'number', 'date'].includes(fieldType),
        searchable: ['text', 'email'].includes(fieldType),
        showInList: propName !== primaryKey && fieldType !== 'textarea' && fieldType !== 'json',
        showInForm: propName !== primaryKey,
      };

      if (relatedResource) {
        field.resource = relatedResource;
        field.optionLabel = 'name';
        field.optionValue = 'id';
      }

      if (propSchema.enum) {
        field.options = propSchema.enum.map(v => ({
          label: String(v).charAt(0).toUpperCase() + String(v).slice(1),
          value: v as string | number,
        }));
      }

      fields.push(field);
    }

    // Sort: primaryKey first
    fields.sort((a, b) => {
      if (a.key === primaryKey) return -1;
      if (b.key === primaryKey) return 1;
      return 0;
    });

    // Check path-based CRUD capabilities
    const pathInfo = resourcePaths.get(schemaName.toLowerCase()) ??
                     resourcePaths.get(schemaName.toLowerCase() + 's');

    resources.push({
      name: schemaName.toLowerCase() + 's',
      label: schemaName,
      primaryKey,
      fields,
      canCreate: pathInfo?.hasPost ?? true,
      canEdit: pathInfo?.hasPut ?? true,
      canDelete: pathInfo?.hasDelete ?? true,
      canShow: pathInfo?.hasGet ?? true,
    });
  }

  return resources;
}

// ─── Path Detection ──────────────────────────────────────────

interface PathInfo {
  hasGet: boolean;
  hasPost: boolean;
  hasPut: boolean;
  hasDelete: boolean;
}

function detectResourcePaths(spec: OpenAPISchema): Map<string, PathInfo> {
  const result = new Map<string, PathInfo>();
  if (!spec.paths) return result;

  for (const [path, methods] of Object.entries(spec.paths)) {
    // Extract resource name from path like /api/posts or /posts/{id}
    const segments = path.split('/').filter(Boolean);
    const resourceSegment = segments.find(s => !s.startsWith('{') && s !== 'api' && s !== 'v1' && s !== 'v2');
    if (!resourceSegment) continue;

    const name = resourceSegment.toLowerCase();
    const existing = result.get(name) ?? { hasGet: false, hasPost: false, hasPut: false, hasDelete: false };

    if (methods.get) existing.hasGet = true;
    if (methods.post) existing.hasPost = true;
    if (methods.put || methods.patch) existing.hasPut = true;
    if (methods.delete) existing.hasDelete = true;

    result.set(name, existing);
  }

  return result;
}

// ─── Utilities ───────────────────────────────────────────────

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}
