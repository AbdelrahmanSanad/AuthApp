import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api';

function axiosErrorWith(data: unknown, status = 401): AxiosError {
  const response = { data, status, statusText: '', headers: {}, config: {} } as AxiosResponse;
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, {}, response);
}

describe('getApiErrorMessage', () => {
  it('returns the backend message for a credential error', () => {
    expect(getApiErrorMessage(axiosErrorWith({ message: 'Invalid email or password' }))).toBe(
      'Invalid email or password',
    );
  });

  it('returns the first message when the backend sends an array (validation)', () => {
    expect(
      getApiErrorMessage(axiosErrorWith({ message: ['Name is too short', 'Bad email'] })),
    ).toBe('Name is too short');
  });

  it('falls back when the body is the literal string "null" (never a parser error)', () => {
    expect(getApiErrorMessage(axiosErrorWith('null'))).toBe('Something went wrong');
  });

  it('falls back on an empty body', () => {
    expect(getApiErrorMessage(axiosErrorWith(''))).toBe('Something went wrong');
    expect(getApiErrorMessage(axiosErrorWith({ message: '' }))).toBe('Something went wrong');
  });

  it('falls back on a non-JSON HTML body', () => {
    expect(getApiErrorMessage(axiosErrorWith('<!DOCTYPE html><title>404</title>'))).toBe(
      'Something went wrong',
    );
  });

  it('gives a friendly message when there is no response (network/CORS/timeout)', () => {
    const networkError = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(getApiErrorMessage(networkError)).toMatch(/unable to reach the server/i);
  });

  it('falls back for a non-Axios error', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('Something went wrong');
    expect(getApiErrorMessage('not an error')).toBe('Something went wrong');
  });

  it('respects a custom fallback', () => {
    expect(getApiErrorMessage(axiosErrorWith({}), 'Could not sign in')).toBe('Could not sign in');
  });
});
