import './src/__tests__/jest-polyfills';
import 'whatwg-fetch';
import '@testing-library/jest-dom';
import { server } from './src/__tests__/msw-server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
