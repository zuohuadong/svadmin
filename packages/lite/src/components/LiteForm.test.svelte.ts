import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import type { FieldDefinition } from '@svadmin/core';
import LiteForm from './LiteForm.svelte';

vi.mock('@svadmin/core/i18n', () => ({
  t: (key: string) => key,
}));

const contactsField: FieldDefinition = {
  key: 'contacts',
  label: 'Contacts',
  type: 'array',
  required: true,
  subFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'active', label: 'Active', type: 'boolean' },
  ],
};

const optionalContactsField: FieldDefinition = {
  ...contactsField,
  required: false,
};

const uploadFields: FieldDefinition[] = [
  { key: 'attachment', label: 'Attachment', type: 'file', required: true },
  { key: 'avatar', label: 'Avatar', type: 'image', required: true },
  { key: 'gallery', label: 'Gallery', type: 'images', required: true },
];

const documentArrayField: FieldDefinition = {
  key: 'documents',
  label: 'Documents',
  type: 'array',
  subFields: [
    { key: 'attachment', label: 'Attachment', type: 'file', required: true },
    { key: 'gallery', label: 'Gallery', type: 'images', required: true },
  ],
};

describe('LiteForm array fields', () => {
  it('renders existing array values with unique bracketed names', () => {
    const { container } = render(LiteForm, {
      fields: [contactsField],
      values: {
        contacts: [
          { name: 'Alice', age: 42, active: true },
          { name: 'Bob', age: 35, active: false },
        ],
      },
    });

    expect((container.querySelector('[name="contacts[0][name]"]') as HTMLInputElement | null)?.value).toBe('Alice');
    expect((container.querySelector('[name="contacts[1][name]"]') as HTMLInputElement | null)?.value).toBe('Bob');
    expect(container.querySelectorAll('[data-lite-array-item]')).toHaveLength(2);
  });

  it('allows an optional empty array to submit zero rows while retaining a no-JS draft row', () => {
    const { container } = render(LiteForm, {
      fields: [optionalContactsField],
      values: {},
    });

    const form = container.querySelector('form');
    const draftName = container.querySelector<HTMLInputElement>('[name="contacts[0][name]"]');
    expect(container.querySelectorAll('[data-lite-array-item]')).toHaveLength(1);
    expect(container.querySelector('[data-lite-array-draft]')).toBeTruthy();
    expect((container.querySelector('[name="contacts[0][_present]"]') as HTMLInputElement | null)?.value).toBe('1');
    expect(draftName?.required).toBe(false);
    expect(form?.checkValidity()).toBe(true);
    expect(container.querySelector('template[data-lite-array-template]')).toBeTruthy();
    expect(
      container.querySelector<HTMLTemplateElement>('template[data-lite-array-template]')
        ?.content.querySelector<HTMLInputElement>('[name="contacts[__INDEX__][name]"]')
        ?.required,
    ).toBe(true);
  });

  it('keeps required child constraints for real rows and bypasses them for no-JS removal', () => {
    const { container } = render(LiteForm, {
      fields: [optionalContactsField],
      values: { contacts: [{ name: '' }] },
    });

    const form = container.querySelector<HTMLFormElement>('form');
    const nameInput = container.querySelector<HTMLInputElement>('[name="contacts[0][name]"]');
    const removeSubmitter = container.querySelector<HTMLButtonElement>('[name="contacts[0][_delete]"]');

    expect(container.querySelector('[data-lite-array-draft]')).toBeNull();
    expect(nameInput?.required).toBe(true);
    expect(form?.checkValidity()).toBe(false);
    expect(removeSubmitter?.type).toBe('submit');
    expect(removeSubmitter?.formNoValidate).toBe(true);
    expect(removeSubmitter?.textContent?.trim()).toBe('Remove item');
    expect(removeSubmitter && form ? new FormData(form, removeSubmitter).get('contacts[0][_delete]') : null).toBe('1');
  });

  it('never writes file input values and only requires a replacement when create or edit has no stored upload', () => {
    const createView = render(LiteForm, {
      fields: uploadFields,
      mode: 'create',
      values: {
        attachment: '/stored/report.pdf',
        avatar: '/stored/avatar.png',
        gallery: ['/stored/first.png'],
      },
    });
    const createInputs = createView.container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(createInputs).toHaveLength(3);
    expect(Array.from(createInputs).every((input) => input.required)).toBe(true);
    expect(Array.from(createInputs).every((input) => !input.hasAttribute('value'))).toBe(true);
    expect(createInputs[2]?.multiple).toBe(true);
    createView.unmount();

    const editView = render(LiteForm, {
      fields: uploadFields,
      mode: 'edit',
      values: {
        attachment: '/stored/report.pdf',
        avatar: '/stored/avatar.png',
        gallery: ['/stored/first.png'],
      },
    });
    const editInputs = editView.container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(Array.from(editInputs).every((input) => input.required === false)).toBe(true);
    expect(Array.from(editInputs).every((input) => !input.hasAttribute('value'))).toBe(true);
    editView.unmount();

    const missingEditView = render(LiteForm, {
      fields: uploadFields,
      mode: 'edit',
      values: {},
    });
    expect(
      Array.from(missingEditView.container.querySelectorAll<HTMLInputElement>('input[type="file"]'))
        .every((input) => input.required),
    ).toBe(true);
  });

  it('does not require stored array uploads again during edit but requires new rows and create mode', () => {
    const editView = render(LiteForm, {
      fields: [documentArrayField],
      mode: 'edit',
      values: {
        documents: [{
          attachment: '/stored/report.pdf',
          gallery: ['/stored/first.png'],
        }],
      },
    });
    const storedEditInputs = editView.container.querySelectorAll<HTMLInputElement>('[data-lite-array-item] input[type="file"]');
    expect(Array.from(storedEditInputs).every((input) => input.required === false)).toBe(true);
    expect(
      editView.container.querySelector<HTMLInputElement>('[type="hidden"][name="documents[0][attachment]"]')?.value,
    ).toBe('/stored/report.pdf');
    expect(
      Array.from(editView.container.querySelectorAll<HTMLInputElement>('[type="hidden"][name="documents[0][gallery]"]'))
        .map((input) => input.value),
    ).toEqual(['/stored/first.png']);
    const editTemplateInputs = editView.container
      .querySelector<HTMLTemplateElement>('template[data-lite-array-template]')
      ?.content.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(Array.from(editTemplateInputs ?? []).every((input) => input.required)).toBe(true);
    editView.unmount();

    const createView = render(LiteForm, {
      fields: [documentArrayField],
      mode: 'create',
      values: {
        documents: [{
          attachment: '/stored/report.pdf',
          gallery: ['/stored/first.png'],
        }],
      },
    });
    expect(
      Array.from(createView.container.querySelectorAll<HTMLInputElement>('[data-lite-array-item] input[type="file"]'))
        .every((input) => input.required),
    ).toBe(true);
  });
});
