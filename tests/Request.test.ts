import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import Request, { withUnknownHost } from '../src/router/Request';

describe('Request Tests', () => {
  it('Should be empty', () => {
    const request = new Request();
    expect(request.loaded).to.be.false;

    expect(request.method).to.equal('GET');
    expect(request.url.href).to.equal('http://unknownhost/');
    
    expect(request.mimetype).to.equal('text/plain');
    expect(request.type).to.equal('null');
    expect(request.body).to.be.null;

    expect(request.headers.size).to.equal(0);
    expect(request.session.size).to.equal(0);

    expect(request.data.size).to.equal(0);
    expect(request.query.size).to.equal(0);
    expect(request.post.size).to.equal(0);

    expect(request.resource).to.be.undefined;
  });

  it('Should initialize', () => {
    const request = new Request({
      method: 'POST',
      url: 'http://localhost/foo/bar?bar=zoo',
      mimetype: 'application/json',
      body: { foo: 'bar' },
      headers: { 'Content-Type': 'application/json' },
      session: { foo: 'bar' },
      data: { foo: 'bar' },
      post: { foo: 'bar' },
    });
    expect(request.loaded).to.be.false;

    expect(request.method).to.equal('POST');
    expect(request.url.href).to.equal('http://localhost/foo/bar?bar=zoo');
    
    expect(request.mimetype).to.equal('application/json');
    expect(request.type).to.equal('object');
    expect((request.body as Record<string, any>)?.foo).to.contain('bar');

    expect(request.headers.size).to.equal(1);
    expect(request.session.size).to.equal(1);

    expect(request.data.size).to.equal(2);
    expect(request.query.size).to.equal(1);
    expect(request.post.size).to.equal(1);

    expect(request.resource).to.be.undefined;

    expect(request.data('foo')).to.equal('bar');
    expect(request.data.get('foo')).to.equal('bar');
    expect(request.query('bar')).to.equal('zoo');
    expect(request.query.get('bar')).to.equal('zoo');
    expect(request.post('foo')).to.equal('bar');
    expect(request.post.get('foo')).to.equal('bar');
  });

  it('Should handle Map inputs', () => {
    const headers = new Map([['Content-Type', 'application/json']]);
    const session = new Map([['user', 'john']]);
    const query = new Map([['page', '1']]);
    const post = new Map([['title', 'Hello']]);
    const data = new Map([['key', 'value']]);

    const request = new Request({
      headers,
      session,
      query,
      post,
      data
    });

    expect(request.headers.get('Content-Type')).to.equal('application/json');
    expect(request.session('user')).to.equal('john');
    expect(request.query('page')).to.equal('1');
    expect(request.post('title')).to.equal('Hello');
    expect(request.data('key')).to.equal('value');
  });

  it('Should handle cookie-based sessions', () => {
    const request = new Request({
      headers: {
        cookie: 'sessionId=abc123; user=john'
      }
    });

    expect(request.session('sessionId')).to.equal('abc123');
    expect(request.session('user')).to.equal('john');
  });

  it('Should handle URL query parameters', () => {
    const request = new Request({
      query: {
        foo: 'bar',
        num: '123',
        flag: ''
      }
    });

    expect(request.query('foo')).to.equal('bar');
    expect(request.query('num')).to.equal('123');
    expect(request.query('flag')).to.equal('');
    expect(request.data('foo')).to.equal('bar');
  });

  it('Should handle different body types', () => {
    const stringBody = new Request({ body: 'text content' });
    expect(stringBody.type).to.equal('string');
    
    const bufferBody = new Request({ body: Buffer.from('buffer content') });
    expect(bufferBody.type).to.equal('buffer');
    
    const uint8Body = new Request({ body: new Uint8Array([1, 2, 3]) });
    expect(uint8Body.type).to.equal('uint8array');
    
    const arrayBody = new Request({ body: ['item1', 'item2'] });
    expect(arrayBody.type).to.equal('array');
  });

  it('Should handle body loading', async () => {
    const request = new Request();
    request.loader = async (req) => ({
      body: { message: 'loaded' },
      post: { status: 'success' }
    });

    expect(request.loaded).to.be.false;
    await request.load();
    expect(request.loaded).to.be.true;
    expect(request.body).to.deep.equal({ message: 'loaded' });
    expect(request.post('status')).to.equal('success');
    expect(request.data('status')).to.equal('success');

    // Second load should not change anything
    await request.load();
    expect(request.body).to.deep.equal({ message: 'loaded' });
  });

  it('Should merge data from multiple sources', () => {
    const request = new Request({
      url: 'http://example.com/path?q=search',
      post: { sort: 'desc' },
      data: { filter: 'active' }
    });

    expect(request.data('q')).to.equal('search');
    expect(request.data('sort')).to.equal('desc');
    expect(request.data('filter')).to.equal('active');
  });
});


/**
 * Tests for withUnknownHost function
 * Ensures proper handling of URLs with missing or invalid hosts
 */
describe('withUnknownHost', () => {
  it('should add unknown host to URL without protocol', () => {
    const result = withUnknownHost('example.com/path');
    expect(result).to.equal('http://unknownhost/example.com/path');
  });

  it('should add unknown host to URL with protocol', () => {
    const result = withUnknownHost('https://example.com/path');
    expect(result).to.equal
    ('http://unknownhost/https://example.com/path');
  });
});