import type {
  BaseRecord,
  CreateManyParams,
  CreateManyResult,
  CreateParams,
  CreateResult,
  DataProvider,
  DeleteManyParams,
  DeleteManyResult,
  DeleteParams,
  DeleteResult,
  FieldFilter,
  Filter,
  GetListParams,
  GetListResult,
  GetManyParams,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  LogicalFilter,
  Pagination,
  Sort,
  UpdateManyParams,
  UpdateManyResult,
  UpdateParams,
  UpdateResult,
} from '@svadmin/core';

const STORAGE_KEY = 'svadmin_inventory_demo_db_v2';

type ResourceName =
  | 'products'
  | 'skus'
  | 'categories'
  | 'suppliers'
  | 'warehouses'
  | 'stock_movements'
  | 'purchase_orders'
  | 'sales_orders'
  | 'todos'
  | 'users'
  | 'roles'
  | 'calendar_events'
  | 'ai_conversations'
  | 'notifications';

type DbState = Record<ResourceName, BaseRecord[]>;

const initialDbState: DbState = {
  categories: [
    { id: 1, name: 'Electronics', code: 'ELEC', description: 'Devices and accessories' },
    { id: 2, name: 'Furniture', code: 'FURN', description: 'Workspace furniture' },
    { id: 3, name: 'Office Supplies', code: 'OFFC', description: 'Consumables and stationery' },
  ],
  suppliers: [
    {
      id: 1,
      name: 'Northstar Components',
      contactName: 'Avery Chen',
      email: 'avery@northstar.example',
      phone: '+1 212 555 0142',
      address: '214 Harbor Ave, New York',
    },
    {
      id: 2,
      name: 'Workspace Goods Co.',
      contactName: 'Maya Ortiz',
      email: 'maya@workspace.example',
      phone: '+1 415 555 0188',
      address: '87 Market St, San Francisco',
    },
    {
      id: 3,
      name: 'Pacific Packing',
      contactName: 'Noah Patel',
      email: 'noah@pacificpacking.example',
      phone: '+1 206 555 0119',
      address: '510 Pier Road, Seattle',
    },
  ],
  warehouses: [
    { id: 1, name: 'Main Warehouse', code: 'WH-MAIN', location: 'New York', capacity: 2400, utilization: 68 },
    { id: 2, name: 'West Hub', code: 'WH-WEST', location: 'Los Angeles', capacity: 1600, utilization: 52 },
    { id: 3, name: 'Returns Bay', code: 'WH-RET', location: 'Chicago', capacity: 600, utilization: 31 },
  ],
  products: [
    {
      id: 1,
      name: 'Laptop Pro 15',
      sku: 'LAP-PRO-15',
      categoryId: 1,
      supplierId: 1,
      price: 1299,
      stock: 45,
      minStock: 10,
      description: 'High-performance laptop for field teams',
    },
    {
      id: 2,
      name: 'Ergonomic Chair',
      sku: 'CHR-ERG-01',
      categoryId: 2,
      supplierId: 2,
      price: 249,
      stock: 4,
      minStock: 6,
      description: 'Adjustable chair for office workstations',
    },
    {
      id: 3,
      name: 'Wireless Mouse',
      sku: 'MOU-WRL-02',
      categoryId: 1,
      supplierId: 1,
      price: 49,
      stock: 150,
      minStock: 20,
      description: 'Compact wireless mouse',
    },
    {
      id: 4,
      name: 'Packing Tape',
      sku: 'SUP-TAPE-01',
      categoryId: 3,
      supplierId: 3,
      price: 8,
      stock: 18,
      minStock: 24,
      description: 'Heavy-duty carton sealing tape',
    },
  ],
  skus: [
    { id: 1, sku: 'LAP-PRO-15', productId: 1, barcode: '810000000151', variant: '15 inch / Space Gray', status: 'active' },
    { id: 2, sku: 'CHR-ERG-01', productId: 2, barcode: '810000000182', variant: 'Black mesh', status: 'active' },
    { id: 3, sku: 'MOU-WRL-02', productId: 3, barcode: '810000000205', variant: 'Graphite', status: 'active' },
    { id: 4, sku: 'SUP-TAPE-01', productId: 4, barcode: '810000000229', variant: '48 mm roll', status: 'active' },
  ],
  stock_movements: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 50, type: 'in', note: 'Initial receiving', date: '2026-06-01' },
    { id: 2, productId: 1, warehouseId: 1, quantity: -5, type: 'out', note: 'Sales order shipment', date: '2026-06-05' },
    { id: 3, productId: 2, warehouseId: 2, quantity: 4, type: 'in', note: 'Supplier delivery', date: '2026-06-08' },
    { id: 4, productId: 4, warehouseId: 3, quantity: -12, type: 'out', note: 'Packing line consumption', date: '2026-06-09' },
  ],
  purchase_orders: [
    {
      id: 1,
      orderNumber: 'PO-2026-001',
      supplierId: 1,
      status: 'received',
      totalAmount: 58500,
      orderDate: '2026-06-01',
      deliveryDate: '2026-06-05',
    },
    {
      id: 2,
      orderNumber: 'PO-2026-002',
      supplierId: 2,
      status: 'ordered',
      totalAmount: 3000,
      orderDate: '2026-06-10',
      deliveryDate: '2026-06-18',
    },
    {
      id: 3,
      orderNumber: 'PO-2026-003',
      supplierId: 3,
      status: 'draft',
      totalAmount: 960,
      orderDate: '2026-06-11',
      deliveryDate: '2026-06-20',
    },
  ],
  sales_orders: [
    {
      id: 1,
      orderNumber: 'SO-2026-001',
      customerName: 'Acme Corp',
      status: 'shipped',
      totalAmount: 6495,
      orderDate: '2026-06-04',
      shippingDate: '2026-06-06',
    },
    {
      id: 2,
      orderNumber: 'SO-2026-002',
      customerName: 'Wayne Enterprises',
      status: 'pending',
      totalAmount: 499,
      orderDate: '2026-06-10',
      shippingDate: '2026-06-12',
    },
  ],
  todos: [
    {
      id: 1,
      title: 'Check low stock alerts',
      assigneeId: 2,
      dueDate: '2026-06-11',
      priority: 'high',
      status: 'in_progress',
      completed: false,
      notes: 'Review products below minimum stock and prepare replenishment orders.',
    },
    {
      id: 2,
      title: 'Verify Workspace Goods delivery',
      assigneeId: 3,
      dueDate: '2026-06-13',
      priority: 'medium',
      status: 'done',
      completed: true,
      notes: 'Match incoming quantities against PO-2026-002.',
    },
    {
      id: 3,
      title: 'Cycle count for WH-MAIN',
      assigneeId: 2,
      dueDate: '2026-06-15',
      priority: 'medium',
      status: 'open',
      completed: false,
      notes: 'Focus on fast-moving electronics SKUs.',
    },
  ],
  roles: [
    { id: 1, name: 'Inventory Admin', scope: 'All warehouses and user management', level: 'owner', description: 'Can configure platform settings and manage access.' },
    { id: 2, name: 'Warehouse Manager', scope: 'Warehouse operations', level: 'manager', description: 'Can manage stock, movements, orders, and cycle counts.' },
    { id: 3, name: 'Operations Analyst', scope: 'Planning and reporting', level: 'operator', description: 'Can review dashboards, tasks, calendar events, and AI recommendations.' },
    { id: 4, name: 'Read Only Auditor', scope: 'Audit review', level: 'viewer', description: 'Can inspect records without changing operational data.' },
  ],
  users: [
    {
      id: 1,
      name: 'Jordan Lee',
      email: 'jordan.lee@example.com',
      roleId: 1,
      status: 'active',
      department: 'Platform Operations',
      lastActiveAt: '2026-06-11',
    },
    {
      id: 2,
      name: 'Priya Raman',
      email: 'priya.raman@example.com',
      roleId: 2,
      status: 'active',
      department: 'Warehouse',
      lastActiveAt: '2026-06-10',
    },
    {
      id: 3,
      name: 'Mateo Silva',
      email: 'mateo.silva@example.com',
      roleId: 3,
      status: 'invited',
      department: 'Planning',
      lastActiveAt: '2026-06-09',
    },
    {
      id: 4,
      name: 'Evelyn Brooks',
      email: 'evelyn.brooks@example.com',
      roleId: 4,
      status: 'active',
      department: 'Finance',
      lastActiveAt: '2026-06-07',
    },
  ],
  calendar_events: [
    {
      id: 1,
      title: 'WH-MAIN cycle count',
      type: 'cycle_count',
      startDate: '2026-06-15',
      endDate: '2026-06-15',
      ownerId: 2,
      warehouseId: 1,
      status: 'scheduled',
      notes: 'Count electronics bins before reorder review.',
    },
    {
      id: 2,
      title: 'Workspace Goods receiving',
      type: 'receiving',
      startDate: '2026-06-18',
      endDate: '2026-06-18',
      ownerId: 3,
      warehouseId: 2,
      status: 'scheduled',
      notes: 'Prepare dock slot for PO-2026-002.',
    },
    {
      id: 3,
      title: 'Packing supply reorder review',
      type: 'purchase',
      startDate: '2026-06-20',
      endDate: '2026-06-20',
      ownerId: 1,
      warehouseId: 3,
      status: 'scheduled',
      notes: 'Review tape consumption trend and supplier lead time.',
    },
  ],
  ai_conversations: [
    {
      id: 1,
      title: 'Low stock replenishment plan',
      intent: 'replenishment',
      ownerId: 2,
      status: 'open',
      lastMessage: 'Suggested reorder quantities for Ergonomic Chair and Packing Tape using current minimum thresholds.',
      updatedAt: '2026-06-11',
    },
    {
      id: 2,
      title: 'June demand forecast',
      intent: 'forecast',
      ownerId: 3,
      status: 'waiting',
      lastMessage: 'Waiting for sales order import before revising forecast confidence.',
      updatedAt: '2026-06-10',
    },
    {
      id: 3,
      title: 'Receiving exception triage',
      intent: 'exception_review',
      ownerId: 1,
      status: 'resolved',
      lastMessage: 'Matched variance to partial delivery; no inventory adjustment required.',
      updatedAt: '2026-06-08',
    },
  ],
  notifications: [
    {
      id: 1,
      title: 'Two products below minimum stock',
      channel: 'inventory',
      severity: 'critical',
      recipientId: 2,
      read: false,
      createdAt: '2026-06-11',
      body: 'Ergonomic Chair and Packing Tape need replenishment review.',
    },
    {
      id: 2,
      title: 'PO-2026-002 delivery scheduled',
      channel: 'order',
      severity: 'info',
      recipientId: 3,
      read: false,
      createdAt: '2026-06-10',
      body: 'Workspace Goods delivery is planned for June 18.',
    },
    {
      id: 3,
      title: 'New analyst invitation pending',
      channel: 'security',
      severity: 'warning',
      recipientId: 1,
      read: true,
      createdAt: '2026-06-09',
      body: 'Mateo Silva has not completed the invite flow yet.',
    },
  ],
};

let memoryDb = cloneDb(initialDbState);

function cloneDb(db: DbState): DbState {
  return JSON.parse(JSON.stringify(db)) as DbState;
}

function getStorage(): Storage | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage;
}

function normalizeDb(value: unknown): DbState {
  const db = cloneDb(initialDbState);
  if (!value || typeof value !== 'object') return db;

  for (const resource of Object.keys(initialDbState) as ResourceName[]) {
    const records = (value as Partial<DbState>)[resource];
    if (Array.isArray(records)) db[resource] = records;
  }

  return db;
}

function getDb(): DbState {
  const storage = getStorage();
  if (!storage) return memoryDb;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneDb(initialDbState);
      storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return normalizeDb(JSON.parse(raw) as unknown);
  } catch {
    return cloneDb(initialDbState);
  }
}

function saveDb(db: DbState): void {
  const storage = getStorage();
  if (!storage) {
    memoryDb = db;
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // The demo remains usable in memory if browser storage is unavailable.
  }
}

function isResourceName(resource: string): resource is ResourceName {
  return resource in initialDbState;
}

function getResource(db: DbState, resource: string): BaseRecord[] {
  if (!isResourceName(resource)) {
    throw new Error(`Resource ${resource} not found`);
  }
  return db[resource];
}

function isLogicalFilter(filter: Filter): filter is LogicalFilter {
  return (filter.operator === 'or' || filter.operator === 'and') && Array.isArray(filter.value);
}

function compareNullable(value: unknown, target: unknown, compare: (left: number, right: number) => boolean): boolean {
  if (value === null || value === undefined || target === null || target === undefined) return false;
  return compare(Number(value), Number(target));
}

function matchesBetween(value: unknown, target: unknown, negate: boolean): boolean {
  if (!Array.isArray(target) || target.length < 2) return negate;
  const numberValue = Number(value);
  const lower = Number(target[0]);
  const upper = Number(target[1]);
  const inRange = numberValue >= lower && numberValue <= upper;
  return negate ? !inRange : inRange;
}

function matchesFieldFilter(item: BaseRecord, filter: FieldFilter): boolean {
  const value = item[filter.field];
  const target = filter.value;

  switch (filter.operator) {
    case 'eq':
      return String(value) === String(target);
    case 'ne':
      return String(value) !== String(target);
    case 'lt':
      return compareNullable(value, target, (left, right) => left < right);
    case 'gt':
      return compareNullable(value, target, (left, right) => left > right);
    case 'lte':
      return compareNullable(value, target, (left, right) => left <= right);
    case 'gte':
      return compareNullable(value, target, (left, right) => left >= right);
    case 'contains':
      return String(value ?? '').toLowerCase().includes(String(target ?? '').toLowerCase());
    case 'ncontains':
      return !String(value ?? '').toLowerCase().includes(String(target ?? '').toLowerCase());
    case 'startswith':
      return String(value ?? '').toLowerCase().startsWith(String(target ?? '').toLowerCase());
    case 'endswith':
      return String(value ?? '').toLowerCase().endsWith(String(target ?? '').toLowerCase());
    case 'in':
      return Array.isArray(target) && target.map(String).includes(String(value));
    case 'nin':
      return Array.isArray(target) && !target.map(String).includes(String(value));
    case 'null':
      return value === null || value === undefined;
    case 'nnull':
      return value !== null && value !== undefined;
    case 'between':
      return matchesBetween(value, target, false);
    case 'nbetween':
      return matchesBetween(value, target, true);
  }
}

function matchesFilter(item: BaseRecord, filter: Filter): boolean {
  if (isLogicalFilter(filter)) {
    return filter.operator === 'and'
      ? filter.value.every((child) => matchesFilter(item, child))
      : filter.value.some((child) => matchesFilter(item, child));
  }

  return matchesFieldFilter(item, filter);
}

function applyFilters(items: BaseRecord[], filters?: Filter[]): BaseRecord[] {
  if (!filters?.length) return items;
  return items.filter((item) => filters.every((filter) => matchesFilter(item, filter)));
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (left === undefined || left === null) return 1;
  if (right === undefined || right === null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left).localeCompare(String(right));
}

function applySorters(items: BaseRecord[], sorters?: Sort[]): BaseRecord[] {
  if (!sorters?.length) return items;

  return [...items].sort((a, b) => {
    for (const sorter of sorters) {
      const comparison = compareValues(a[sorter.field], b[sorter.field]);
      if (comparison !== 0) return sorter.order === 'desc' ? -comparison : comparison;
    }
    return 0;
  });
}

function applyPagination(items: BaseRecord[], pagination?: Pagination): { data: BaseRecord[]; total: number } {
  if (!pagination || pagination.mode === 'off') {
    return { data: items, total: items.length };
  }

  const current = pagination.current ?? 1;
  const pageSize = pagination.pageSize ?? 10;
  const start = (current - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total: items.length,
  };
}

function toVariablesRecord<TVariables>(variables: TVariables): Record<string, unknown> {
  if (!variables || typeof variables !== 'object' || Array.isArray(variables)) return {};
  return variables as Record<string, unknown>;
}

function getNextId(records: BaseRecord[]): number {
  return records.reduce((max, record) => Math.max(max, Number(record.id) || 0), 0) + 1;
}

function updateOneRecord<TVariables>(db: DbState, resourceName: string, id: string | number, variables: TVariables): BaseRecord {
  const resource = getResource(db, resourceName);
  const index = resource.findIndex((record) => String(record.id) === String(id));
  if (index === -1) {
    throw new Error(`Item ${id} not found in ${resourceName}`);
  }

  const updated: BaseRecord = {
    ...resource[index],
    ...toVariablesRecord(variables),
    id: resource[index].id,
  };

  resource[index] = updated;
  return updated;
}

function deleteOneRecord(db: DbState, resourceName: string, id: string | number): BaseRecord {
  const resource = getResource(db, resourceName);
  const index = resource.findIndex((record) => String(record.id) === String(id));
  if (index === -1) {
    throw new Error(`Item ${id} not found in ${resourceName}`);
  }

  const [deleted] = resource.splice(index, 1);
  return deleted;
}

export const inMemoryDataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>(params: GetListParams): Promise<GetListResult<TData>> => {
    const db = getDb();
    const resource = getResource(db, params.resource);
    const filtered = applyFilters([...resource], params.filters);
    const sorted = applySorters(filtered, params.sorters);
    const { data, total } = applyPagination(sorted, params.pagination);

    return { data: data as TData[], total };
  },

  getOne: async <TData extends BaseRecord = BaseRecord>(params: GetOneParams): Promise<GetOneResult<TData>> => {
    const item = getResource(getDb(), params.resource).find((record) => String(record.id) === String(params.id));
    if (!item) {
      throw new Error(`Item ${params.id} not found in ${params.resource}`);
    }
    return { data: item as TData };
  },

  getMany: async <TData extends BaseRecord = BaseRecord>(params: GetManyParams): Promise<GetManyResult<TData>> => {
    const ids = params.ids.map(String);
    const data = getResource(getDb(), params.resource).filter((record) => ids.includes(String(record.id)));
    return { data: data as TData[] };
  },

  create: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
    params: CreateParams<TVariables>,
  ): Promise<CreateResult<TData>> => {
    const db = getDb();
    const resource = getResource(db, params.resource);
    const created: BaseRecord = {
      ...toVariablesRecord(params.variables),
      id: getNextId(resource),
    };

    resource.push(created);
    saveDb(db);
    return { data: created as TData };
  },

  createMany: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
    params: CreateManyParams<TVariables>,
  ): Promise<CreateManyResult<TData>> => {
    const db = getDb();
    const resource = getResource(db, params.resource);
    const created = params.variables.map((variables) => {
      const record: BaseRecord = {
        ...toVariablesRecord(variables),
        id: getNextId(resource),
      };
      resource.push(record);
      return record;
    });

    saveDb(db);
    return { data: created as TData[] };
  },

  update: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
    params: UpdateParams<TVariables>,
  ): Promise<UpdateResult<TData>> => {
    const db = getDb();
    const updated = updateOneRecord(db, params.resource, params.id, params.variables);
    saveDb(db);
    return { data: updated as TData };
  },

  updateMany: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
    params: UpdateManyParams<TVariables>,
  ): Promise<UpdateManyResult<TData>> => {
    const db = getDb();
    const updated = params.ids.map((id) => updateOneRecord(db, params.resource, id, params.variables));
    saveDb(db);
    return { data: updated as TData[] };
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
    params: DeleteParams<TVariables>,
  ): Promise<DeleteResult<TData>> => {
    const db = getDb();
    const deleted = deleteOneRecord(db, params.resource, params.id);
    saveDb(db);
    return { data: deleted as TData };
  },

  deleteMany: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
    params: DeleteManyParams<TVariables>,
  ): Promise<DeleteManyResult<TData>> => {
    const db = getDb();
    const deleted = params.ids.map((id) => deleteOneRecord(db, params.resource, id));
    saveDb(db);
    return { data: deleted as TData[] };
  },

  getApiUrl: () => 'in-memory://inventory-demo',
};
