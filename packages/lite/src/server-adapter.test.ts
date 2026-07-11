import { describe, expect, mock, test } from 'bun:test';
import type { DataProvider, FieldDefinition, ResourceDefinition } from '@svadmin/core';
import { createCrudActions } from './server-adapter';

const fields: FieldDefinition[] = [
  {
    key: 'contacts',
    label: 'Contacts',
    type: 'array',
    subFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'active', label: 'Active', type: 'boolean' },
    ],
  },
];

const resource: ResourceDefinition = {
  name: 'accounts',
  label: 'Accounts',
  fields,
};

describe('createCrudActions array form parsing', () => {
  test('parses sparse bracketed rows, coerces sub-fields, and removes checked rows', async () => {
    const create = mock(async ({ variables }: { variables: Record<string, unknown> }) => ({
      data: { id: 1, ...variables },
    }));
    const provider = { create } as unknown as DataProvider;
    const formData = new FormData();
    formData.set('contacts[0][_present]', '1');
    formData.set('contacts[0][name]', 'Alice');
    formData.set('contacts[0][age]', '42');
    formData.set('contacts[0][active]', 'on');
    formData.set('contacts[2][_present]', '1');
    formData.set('contacts[2][name]', 'Bob');
    formData.set('contacts[4][_present]', '1');
    formData.set('contacts[4][name]', 'Removed');
    formData.set('contacts[4][_delete]', 'on');

    const request = new Request('http://localhost/accounts', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, resource).create({ request } as never);

    expect(result).toEqual({ success: true, id: 1 });
    expect(create).toHaveBeenCalledWith({
      resource: 'accounts',
      variables: {
        contacts: [
          { name: 'Alice', age: 42, active: true },
          { name: 'Bob', active: false },
        ],
      },
    });
  });

  test('parses empty draft and removed required rows as an empty array', async () => {
    const create = mock(async ({ variables }: { variables: Record<string, unknown> }) => ({
      data: { id: 1, ...variables },
    }));
    const provider = { create } as unknown as DataProvider;
    const formData = new FormData();
    formData.set('contacts[0][_present]', '1');
    formData.set('contacts[1][_present]', '1');
    formData.set('contacts[1][name]', '');
    formData.set('contacts[1][_delete]', '1');

    const request = new Request('http://localhost/accounts', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, resource).create({ request } as never);

    expect(result).toEqual({ success: true, id: 1 });
    expect(create).toHaveBeenCalledWith({
      resource: 'accounts',
      variables: { contacts: [] },
    });
  });

  test('does not call create when a required array draft is empty', async () => {
    const create = mock(async () => ({ data: { id: 1 } }));
    const provider = { create } as unknown as DataProvider;
    const contacts = fields[0];
    if (!contacts) throw new Error('contacts field fixture is missing');
    const requiredResource: ResourceDefinition = {
      ...resource,
      fields: [{ ...contacts, required: true }],
    };
    const formData = new FormData();
    formData.set('contacts[0][_present]', '1');

    const request = new Request('http://localhost/accounts', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, requiredResource).create({ request } as never);

    expect(result).toEqual({
      success: false,
      error: 'Validation failed',
      values: { contacts: [] },
      errors: { contacts: ['Contacts must contain at least one item'] },
    });
    expect(create).not.toHaveBeenCalled();
  });

  test('does not call update when a real array row omits a required child', async () => {
    const update = mock(async () => ({ data: { id: 1 } }));
    const provider = { update } as unknown as DataProvider;
    const formData = new FormData();
    formData.set('_id', 'account-1');
    formData.set('contacts[0][_present]', '1');
    formData.set('contacts[0][name]', '');
    formData.set('contacts[0][age]', '42');

    const request = new Request('http://localhost/accounts/account-1', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, resource).update({ request } as never);

    expect(result).toEqual({
      success: false,
      error: 'Validation failed',
      values: { contacts: [{ name: '', age: 42, active: false }] },
      errors: { contacts: ['Name is required'] },
    });
    expect(update).not.toHaveBeenCalled();
  });

  test('validates numbers and preserves all uploaded files before calling create', async () => {
    const create = mock(async ({ variables }: { variables: Record<string, unknown> }) => ({
      data: { id: 1, ...variables },
    }));
    const provider = { create } as unknown as DataProvider;
    const uploadResource: ResourceDefinition = {
      name: 'uploads',
      label: 'Uploads',
      fields: [
        { key: 'count', label: 'Count', type: 'number', required: true },
        { key: 'optionalCount', label: 'Optional count', type: 'number' },
        { key: 'attachment', label: 'Attachment', type: 'file', required: true },
        { key: 'avatar', label: 'Avatar', type: 'image', required: true },
        { key: 'gallery', label: 'Gallery', type: 'images', required: true },
      ],
    };
    const attachment = new File(['report'], 'report.txt', { type: 'text/plain' });
    const avatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const firstImage = new File(['first'], 'first.png', { type: 'image/png' });
    const secondImage = new File(['second'], 'second.png', { type: 'image/png' });
    const formData = new FormData();
    formData.set('count', '42.5');
    formData.set('optionalCount', '');
    formData.set('attachment', attachment);
    formData.set('avatar', avatar);
    formData.append('gallery', firstImage);
    formData.append('gallery', secondImage);

    const request = new Request('http://localhost/uploads', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, uploadResource).create({ request } as never);

    expect(result).toEqual({ success: true, id: 1 });
    expect(create).toHaveBeenCalledTimes(1);
    const variables = create.mock.calls[0]?.[0].variables;
    expect(variables?.count).toBe(42.5);
    expect(variables?.optionalCount).toBeUndefined();
    expect(variables?.attachment).toBeInstanceOf(File);
    expect(variables?.avatar).toBeInstanceOf(File);
    expect(variables?.gallery).toHaveLength(2);
    expect((variables?.gallery as File[]).map((file) => file.name)).toEqual(['first.png', 'second.png']);
  });

  test('keeps an existing required upload when edit submits no replacement file', async () => {
    const update = mock(async ({ variables }: { variables: Record<string, unknown> }) => ({
      data: { id: 'upload-1', ...variables },
    }));
    const provider = { update } as unknown as DataProvider;
    const uploadResource: ResourceDefinition = {
      name: 'uploads',
      label: 'Uploads',
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'attachment', label: 'Attachment', type: 'file', required: true },
      ],
    };
    const formData = new FormData();
    formData.set('_id', 'upload-1');
    formData.set('title', 'Existing upload');

    const request = new Request('http://localhost/uploads/upload-1', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, uploadResource).update({ request } as never);

    expect(result).toEqual({ success: true });
    expect(update).toHaveBeenCalledWith({
      resource: 'uploads',
      id: 'upload-1',
      variables: { title: 'Existing upload' },
    });
  });

  test('retains nested edit upload references and lets new Files replace retained references', async () => {
    const update = mock(async ({ variables }: { variables: Record<string, unknown> }) => ({
      data: { id: 'account-1', ...variables },
    }));
    const provider = { update } as unknown as DataProvider;
    const documentsResource: ResourceDefinition = {
      name: 'accounts',
      label: 'Accounts',
      fields: [{
        key: 'documents',
        label: 'Documents',
        type: 'array',
        required: true,
        subFields: [
          { key: 'attachment', label: 'Attachment', type: 'file', required: true },
          { key: 'gallery', label: 'Gallery', type: 'images', required: true },
        ],
      }],
    };
    const replacement = new File(['replacement'], 'replacement.pdf', { type: 'application/pdf' });
    const firstNewImage = new File(['new-one'], 'new-one.png', { type: 'image/png' });
    const secondNewImage = new File(['new-two'], 'new-two.png', { type: 'image/png' });
    const formData = new FormData();
    formData.set('_id', 'account-1');
    formData.set('documents[0][_present]', '1');
    formData.append('documents[0][attachment]', '/stored/report.pdf');
    formData.append('documents[0][gallery]', '/stored/first.png');
    formData.append('documents[0][gallery]', '/stored/second.png');
    formData.set('documents[1][_present]', '1');
    formData.append('documents[1][attachment]', '/stored/old.pdf');
    formData.append('documents[1][attachment]', replacement);
    formData.append('documents[1][gallery]', '/stored/old.png');
    formData.append('documents[1][gallery]', firstNewImage);
    formData.append('documents[1][gallery]', secondNewImage);

    const request = new Request('http://localhost/accounts/account-1', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, documentsResource).update({ request } as never);

    expect(result).toEqual({ success: true });
    expect(update).toHaveBeenCalledTimes(1);
    const documents = update.mock.calls[0]?.[0].variables.documents as Record<string, unknown>[];
    expect(documents[0]).toEqual({
      attachment: '/stored/report.pdf',
      gallery: ['/stored/first.png', '/stored/second.png'],
    });
    expect(documents[1]?.attachment).toBeInstanceOf(File);
    expect((documents[1]?.attachment as File).name).toBe('replacement.pdf');
    expect((documents[1]?.gallery as File[]).map((file) => file.name)).toEqual(['new-one.png', 'new-two.png']);
  });

  test('leaves delete action validation behavior unchanged', async () => {
    const deleteOne = mock(async () => ({ data: { id: 'account-1' } }));
    const provider = { deleteOne } as unknown as DataProvider;
    const formData = new FormData();
    formData.set('id', 'account-1');

    const request = new Request('http://localhost/accounts/account-1', {
      method: 'POST',
      body: formData,
    });
    const result = await createCrudActions(provider, resource).delete({ request } as never);

    expect(result).toEqual({ success: true });
    expect(deleteOne).toHaveBeenCalledWith({ resource: 'accounts', id: 'account-1' });
  });
});
