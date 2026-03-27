/**
 * @svadmin/lite — Schema Generator
 *
 * Auto-generates Zod schemas from @svadmin/core FieldDefinitions.
 * Used with sveltekit-superforms for server-side form validation.
 */
import { z } from 'zod';
import type { FieldDefinition, ResourceDefinition } from '@svadmin/core';

/**
 * Convert a single FieldDefinition to its corresponding Zod type.
 */
function fieldToZod(field: FieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'number':
      schema = z.coerce.number({ invalid_type_error: `${field.label} must be a number` });
      break;
    case 'boolean':
      schema = z.coerce.boolean();
      break;
    case 'email':
      schema = z.string().email(`${field.label} must be a valid email`);
      break;
    case 'url':
      schema = z.string().url(`${field.label} must be a valid URL`);
      break;
    case 'date':
      schema = z.string().refine(
        (v: string | undefined) => !v || !isNaN(Date.parse(v)),
        { message: `${field.label} must be a valid date` },
      );
      break;
    case 'select':
      if (field.options?.length) {
        schema = z.enum(
          field.options.map((o: { value: string | number }) => String(o.value)) as [string, ...string[]],
          { errorMap: () => ({ message: `${field.label} must be one of the options` }) },
        );
      } else {
        schema = z.string();
      }
      break;
    case 'multiselect':
    case 'tags':
      schema = z.string().transform((v: string) => v ? v.split(',').map((s: string) => s.trim()) : []);
      break;
    case 'textarea':
    case 'richtext':
      schema = z.string().max(50000, `${field.label} is too long`);
      break;
    case 'json':
      schema = z.string().refine(
        (v: string) => { try { JSON.parse(v); return true; } catch { return false; } },
        { message: `${field.label} must be valid JSON` },
      );
      break;
    case 'phone':
      schema = z.string().regex(/^[+\d\s()-]*$/, `${field.label} must be a valid phone number`);
      break;
    default:
      schema = z.string();
  }

  // Wrap with optional/required
  if (!field.required) {
    schema = schema.optional().or(z.literal(''));
  }

  return schema;
}

/**
 * Generate a Zod object schema from a ResourceDefinition's fields.
 * Only includes fields that are relevant for form rendering.
 *
 * @param mode - 'create' | 'edit' to filter fields by showInCreate / showInEdit
 */
export function fieldsToZodSchema(
  fields: FieldDefinition[],
  mode: 'create' | 'edit' = 'create',
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    // Skip fields not shown in forms
    if (field.showInForm === false) continue;
    if (mode === 'create' && field.showInCreate === false) continue;
    if (mode === 'edit' && field.showInEdit === false) continue;

    shape[field.key] = fieldToZod(field);
  }

  return z.object(shape);
}

/**
 * Generate a Zod schema from a ResourceDefinition.
 * Convenience wrapper around fieldsToZodSchema.
 */
export function resourceToZodSchema(
  resource: ResourceDefinition,
  mode: 'create' | 'edit' = 'create',
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  return fieldsToZodSchema(resource.fields, mode);
}

/**
 * Determine the appropriate HTML input type for an IE11-friendly `<input>`.
 * Falls back to 'text' for unsupported HTML5 types.
 */
export function fieldToInputType(field: FieldDefinition): string {
  switch (field.type) {
    case 'number': return 'text';      // IE11 <input type="number"> has bugs
    case 'email': return 'text';       // IE11 email validation is broken
    case 'url': return 'text';
    case 'phone': return 'tel';
    case 'boolean': return 'checkbox';
    case 'date': return 'text';        // IE11 doesn't support type="date"
    case 'textarea':
    case 'richtext': return 'textarea';
    case 'select':
    case 'multiselect': return 'select';
    case 'image':
    case 'images':
    case 'file': return 'file';
    default: return 'text';
  }
}

/**
 * Generate an input placeholder with format hint for IE11
 * (which cannot show native date pickers, etc.)
 */
export function fieldToPlaceholder(field: FieldDefinition): string {
  switch (field.type) {
    case 'date': return 'YYYY-MM-DD';
    case 'email': return 'user@example.com';
    case 'url': return 'https://example.com';
    case 'phone': return '+1 (555) 000-0000';
    case 'number': return '0';
    default: return '';
  }
}
