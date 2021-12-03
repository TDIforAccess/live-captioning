class ErrorWithResponse extends Error {
  constructor(message: string, public response: any) {
    super(message);
  }
}

/**
 * Expected usage is always Request.function
 * Provides general interface for Post Requests
 */
export const Request = {
  post: async <T>(url: string, body: T) => {
    const requestInit: RequestInit = {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    };

    return fetch(url, requestInit);
  },
  get: async (url: string) => {
    const requestInit: RequestInit = {
      method: "GET",
      credentials: "include"
    };

    return fetch(url, requestInit);
  },
  put: async <T>(url: string, body: T) => {
    const requestInit: RequestInit = {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(body)
    };

    return fetch(url, requestInit);
  },
  delete: async (url: string) => {
    const requestInit: RequestInit = {
      method: "DELETE",
      credentials: "include"
    };

    return fetch(url, requestInit);
  }
};

/**
 * Expected usage is always Response.function
 * Provides general interface for Post Requests
 */
export const Response = {
  checkStatus: (response: Response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    throw new ErrorWithResponse(response.statusText, response);
  },
  parseJSON: async <T>(response: Response): Promise<T> => {
    return response.json();
  },
  getBlob: async (response: Response) => {
    return response.blob();
  }
};
