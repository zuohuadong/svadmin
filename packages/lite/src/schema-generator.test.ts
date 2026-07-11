import { describe, expect, test } from 'bun:test';
import type { FieldDefinition } from '@svadmin/core';
import { fieldsToZodSchema } from './schema-generator';

const fields: FieldDefinition[] = [
  {
    key: 'contacts',
    label: 'Contacts',
    type: 'array',
    required: true,
    subFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'active', label: 'Active', type: 'boolean' },
    ],
  },
];

describe('fieldsToZodSchema array fields', () => {
  test('validates nested rows using each sub-field definition', () => {
    const schema = fieldsToZodSchema(fields);
    const result = schema.safeParse({
      contacts: [{ name: 'Alice', age: 42, active: true }],
    });

    expect(result.success).toBe(true);
  });

  test('rejects invalid nested values and missing required arrays', () => {
    const schema = fieldsToZodSchema(fields);

    expect(schema.safeParse({ contacts: [{ name: 'Alice', age: 'not-a-number' }] }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });

  test('accepts a zero-item optional array but rejects a real row with an empty required child', () => {
    const contacts = fields[0];
    if (!contacts) throw new Error('contacts field fixture is missing');
    const optionalFields: FieldDefinition[] = [{ ...contacts, required: false }];
    const schema = fieldsToZodSchema(optionalFields);

    expect(schema.safeParse({ contacts: [] }).success).toBe(true);
    expect(schema.safeParse({ contacts: [{ name: '' }] }).success).toBe(false);
  });
});

describe('fieldsToZodSchema numeric fields', () => {
  const requiredNumber: FieldDefinition = {
    key: 'count',
    label: 'Count',
    type: 'number',
    required: true,
  };

  test('rejects a required blank number and coerces valid strings or numbers', () => {
    const schema = fieldsToZodSchema([requiredNumber]);

    expect(schema.safeParse({ count: '' }).success).toBe(false);
    expect(schema.parse({ count: '42.5' })).toEqual({ count: 42.5 });
    expect(schema.parse({ count: 7 })).toEqual({ count: 7 });
  });

  test('normalizes an optional blank number without coercing it to zero', () => {
    const schema = fieldsToZodSchema([{ ...requiredNumber, required: false }]);
    const result = schema.parse({ count: '' });

    expect(result.count).toBeUndefined();
    expect(result.count).not.toBe(0);
  });
});

describe('fieldsToZodSchema file fields', () => {
  const requiredFileFields: FieldDefinition[] = [
    { key: 'attachment', label: 'Attachment', type: 'file', required: true },
    { key: 'avatar', label: 'Avatar', type: 'image', required: true },
    { key: 'gallery', label: 'Gallery', type: 'images', required: true },
  ];

  test('accepts non-empty File values and required File arrays', () => {
    const attachment = new File(['report'], 'report.txt', { type: 'text/plain' });
    const avatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const firstImage = new File(['first'], 'first.png', { type: 'image/png' });
    const secondImage = new File(['second'], 'second.png', { type: 'image/png' });
    const schema = fieldsToZodSchema(requiredFileFields);

    const result = schema.parse({
      attachment,
      avatar,
      gallery: [firstImage, secondImage],
    });

    expect(result).toEqual({ attachment, avatar, gallery: [firstImage, secondImage] });
  });

  test('rejects required empty native files and normalizes optional empty uploads', () => {
    const emptyFile = new File([], '');
    const requiredSchema = fieldsToZodSchema(requiredFileFields);
    const optionalSchema = fieldsToZodSchema(
      requiredFileFields.map((field) => ({ ...field, required: false })),
    );

    expect(requiredSchema.safeParse({
      attachment: emptyFile,
      avatar: emptyFile,
      gallery: [emptyFile],
    }).success).toBe(false);

    const optionalResult = optionalSchema.parse({
      attachment: emptyFile,
      avatar: emptyFile,
      gallery: [emptyFile],
    });
    expect(optionalResult.attachment).toBeUndefined();
    expect(optionalResult.avatar).toBeUndefined();
    expect(optionalResult.gallery).toBeUndefined();
  });

  test('does not reference the File constructor unsafely during SSR', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'File');
    Object.defineProperty(globalThis, 'File', { configurable: true, value: undefined });

    try {
      const optionalSchema = fieldsToZodSchema([
        { key: 'attachment', label: 'Attachment', type: 'file' },
      ]);
      const requiredSchema = fieldsToZodSchema([
        { key: 'attachment', label: 'Attachment', type: 'file', required: true },
      ]);

      expect(optionalSchema.safeParse({}).success).toBe(true);
      expect(requiredSchema.safeParse({ attachment: {} }).success).toBe(false);
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'File', descriptor);
    }
  });

  test('does not require re-uploading stored files during edit but still rejects invalid replacements', () => {
    const editSchema = fieldsToZodSchema(requiredFileFields, 'edit');

    expect(editSchema.parse({})).toEqual({});
    expect(editSchema.safeParse({ attachment: 'not-a-file' }).success).toBe(false);
  });

  test('accepts retained upload references for edit array rows but not for create', () => {
    const documentArray: FieldDefinition = {
      key: 'documents',
      label: 'Documents',
      type: 'array',
      required: true,
      subFields: [
        { key: 'attachment', label: 'Attachment', type: 'file', required: true },
        { key: 'gallery', label: 'Gallery', type: 'images', required: true },
      ],
    };
    const retained = {
      documents: [{
        attachment: '/stored/report.pdf',
        gallery: ['/stored/first.png', '/stored/second.png'],
      }],
    };

    expect(fieldsToZodSchema([documentArray], 'edit').parse(retained)).toEqual(retained);
    expect(fieldsToZodSchema([documentArray], 'create').safeParse(retained).success).toBe(false);
    expect(fieldsToZodSchema([documentArray], 'edit').safeParse({
      documents: [{ gallery: ['/stored/first.png'] }],
    }).success).toBe(false);
  });
});
