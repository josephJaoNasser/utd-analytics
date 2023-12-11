type FetchFunction = (route: string, body?: object, config?: object) => Promise<{ data: any }>;

type ApiMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiData<T = any> = {
  data: T;
};

export type ApiFetch = {
  get: FetchFunction;
  post: FetchFunction;
  put: FetchFunction;
  patch: FetchFunction;
  delete: FetchFunction;
};

function api(baseUrl?: string, defaultConfig?: object) {
  const fetchRequest = (
    method: ApiMethods,
    route: string,
    body: object,
    config: object = {},
  ): Promise<ApiData> => {
    if (baseUrl) {
      baseUrl = !baseUrl.endsWith('/') ? baseUrl : baseUrl.slice(0, -1);
      route = baseUrl + route;
    }

    const payload = {
      method,
      body: JSON.stringify(body),
      ...defaultConfig,
      ...config,
    };

    return fetch(route, payload)
      .then(res => {
        if (res.ok) return res.json().then(data => ({ data }));
        return { data: null };
      })
      .catch(err => {
        throw err;
      });
  };

  return {
    get: (route: string, body: object, config: object) => fetchRequest('GET', route, body, config),
    post: (route: string, body: object, config: object) =>
      fetchRequest('POST', route, body, config),
    patch: (route: string, body: object, config: object) =>
      fetchRequest('PATCH', route, body, config),
    put: (route: string, body: object, config: object) => fetchRequest('PUT', route, body, config),
    delete: (route: string, body: object, config: object) =>
      fetchRequest('DELETE', route, body, config),
  };
}

export default api;
