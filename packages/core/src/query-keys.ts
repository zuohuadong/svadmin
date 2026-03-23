export const keys = () => {
  let _data = 'default';
  let _resource = '';
  let _action = '';
  let _params: unknown = undefined;

  const builder = {
    data: (name: string) => { _data = name; return builder; },
    resource: (name: string) => { _resource = name; return builder; },
    action: (name: string) => { _action = name; return builder; },
    params: (params: unknown) => { _params = params; return builder; },
    get: (): unknown[] => {
      const parts: unknown[] = ['data', _data];
      if (_resource) parts.push(_resource);
      if (_action) parts.push(_action);
      if (_params !== undefined) parts.push(_params);
      return parts;
    }
  };

  return builder;
};
