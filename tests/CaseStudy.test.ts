import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import Router from '../src/router/Router';

class Server extends Router<unknown, unknown, Server> {
  public increment(i: number) {
    return i + 1;
  }
}

describe('Case Study Tests', () => {
  it('Router should use child context', async () => {
    const server = new Server();
    server.route('get', '/increment/:i', (req, res, server) => {
      const i = Number(req.data('i'));
      res.setResults({ i: server.increment(i) });
    });
    const response = await server.resolve<{ i: number }>('GET /increment/1');
    expect(response.results?.i).to.equal(2);
  });
});
