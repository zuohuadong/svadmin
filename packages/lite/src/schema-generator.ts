/**
 * @svadmin/lite — Schema Generator
 *
 * Auto-generates Zod schemas from @svadmin/core FieldDefinitions.
 * Used with sveltekit-superforms for server-side form validation.
 */
import { z } from 'zod';
import type { FieldDefinition, ResourceDefinition } from '@svadmin/core';

function isNativeFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function isNonEmptyNativeFile(value: unknown): value is File {
  return isNativeFile(value) && value.size > 0 && value.name !== '';
}

function hasRequiredValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (isNativeFile(value)) return isNonEmptyNativeFile(value);
  return true;
}

function numberFieldToZod(field: FieldDefinition): z.ZodTypeAny {
  const numberSchema = z.coerce.number({ message: `${field.label} must be a number` });
  const targetSchema = field.required ? numberSchema : numberSchema.optional();

  return z.preprocess((value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  }, targetSchema);
}

function singleFileFieldToZod(
  field: FieldDefinition,
  options: { required: boolean; allowReference: boolean },
): z.ZodTypeAny {
  const fileSchema = z.custom<File>(isNonEmptyNativeFile, {
    message: `${field.label} must be a non-empty file`,
  });
  const referenceSchema = z.string().trim().min(1, `${field.label} must reference an existing file`);
  const uploadSchema = options.allowReference ? z.union([fileSchema, referenceSchema]) : fileSchema;
  const targetSchema = options.required ? uploadSchema : uploadSchema.optional();

  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (isNativeFile(value) && !isNonEmptyNativeFile(value)) return undefined;
    return value;
  }, targetSchema);
}

function multipleFilesFieldToZod(
  field: FieldDefinition,
  options: { required: boolean; allowReference: boolean },
): z.ZodTypeAny {
  const fileSchema = z.custom<File>(isNonEmptyNativeFile, {
    message: `${field.label} contains an empty or invalid file`,
  });
  const filesSchema = z.array(fileSchema).min(1, `${field.label} must contain at least one file`);
  const referencesSchema = z.array(
    z.string().trim().min(1, `${field.label} contains an empty file reference`),
  ).min(1, `${field.label} must contain at least one file`);
  const uploadSchema = options.allowReference ? z.union([filesSchema, referencesSchema]) : filesSchema;
  const targetSchema = options.required ? uploadSchema : uploadSchema.optional();

  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (!Array.isArray(value)) return value;

    const invalidEntries = value.filter(
      (entry) => !isNativeFile(entry) && typeof entry !== 'string',
    );
    if (invalidEntries.length > 0) return value;

    const uploadedFiles = value.filter(isNonEmptyNativeFile);
    if (uploadedFiles.length > 0) return uploadedFiles;

    const references = value.filter(
      (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
    );
    return references.length > 0 ? references : undefined;
  }, targetSchema);
}

/**
 * Convert a single FieldDefinition to its corresponding Zod type.
 */
function fieldToZod(
  field: FieldDefinition,
  mode: 'create' | 'edit',
  withinArray = false,
): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'number':
      return numberFieldToZod(field);
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
          { message: `${field.label} must be one of the options` },
        );
      } else {
        schema = z.string();
      }
      break;
    case 'multiselect':
      schema = z.array(z.string()).default([]);
      break;
    case 'array': {
      const shape: Record<string, z.ZodTypeAny> = {};
      for (const subField of field.subFields ?? []) {
        shape[subField.key] = fieldToZod(subField, mode, true);
      }
      const arraySchema = z.array(z.object(shape));
      return field.required
        ? arraySchema.min(1, `${field.label} must contain at least one item`)
        : arraySchema.optional().or(z.literal(''));
    }
    case 'tags':
      schema = z.union([
        z.array(z.string()),
        z.string().transform((value: string) => value ? value.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
      ]);
      break;
    case 'textarea':
    case 'richtext':
      schema = z.string().max(50000, `${field.label} is too long`);
      break;
    case 'json':
      schema = z.unknown().transform((value, context) => {
        if (typeof value !== 'string') return value;
        try {
          return JSON.parse(value) as unknown;
        } catch {
          context.addIssue({ code: 'custom', message: `${field.label} must be valid JSON` });
          return z.NEVER;
        }
      });
      break;
    case 'phone':
      schema = z.string().regex(/^[+\d\s()-]*$/, `${field.label} must be a valid phone number`);
      break;
    case 'file':
    case 'image':
      return singleFileFieldToZod(field, {
        required: field.required === true && (mode === 'create' || withinArray),
        allowReference: mode === 'edit' && withinArray,
      });
    case 'images':
      return multipleFilesFieldToZod(field, {
        required: field.required === true && (mode === 'create' || withinArray),
        allowReference: mode === 'edit' && withinArray,
      });
    default:
      schema = z.string();
  }

  // Enforce meaningful values for required fields, including nested array rows.
  if (field.required) {
    schema = schema.refine(hasRequiredValue, { message: `${field.label} is required` });
  } else {
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

    shape[field.key] = fieldToZod(field, mode);
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
 * Determine a conservative HTML input type for server-rendered forms.
 * Text fallbacks avoid inconsistent native validation and date widgets.
 */
export function fieldToInputType(field: FieldDefinition): string {
  switch (field.type) {
    case 'number': return 'text';
    case 'email': return 'text';
    case 'url': return 'text';
    case 'phone': return 'tel';
    case 'boolean': return 'checkbox';
    case 'date': return 'text';
    case 'textarea':
    case 'richtext': return 'textarea';
    case 'select':
    case 'multiselect': return 'select';
    case 'array': return 'text';
    case 'image':
    case 'images':
    case 'file': return 'file';
    default: return 'text';
  }
}

/**
 * Generate an input placeholder with a portable format hint.
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
