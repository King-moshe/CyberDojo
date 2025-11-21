import axios from 'axios';

export class HttpExecutor {
  constructor() {}

  public async execute(request: { method: string; url: string; body?: any }) {
    try {
      const res = await axios.request({
        method: request.method as any,
        url: request.url,
        data: request.body,
        timeout: 10000,
      });
      return { status: res.status, body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data) };
    } catch (err: any) {
      if (err.response) {
        return { status: err.response.status, body: String(err.response.data) };
      }
      return { status: 0, body: String(err.message || err) };
    }
  }
}

export default HttpExecutor;
