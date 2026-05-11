import {
  BadGatewayException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UrlService } from './url.service';

describe('UrlService', () => {
  let service: UrlService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    fetchMock = jest.fn();
    global.fetch = fetchMock;

    service = new UrlService({
      get: jest.fn((key: string, defaultValue?: number) => {
        if (key === 'NAVER_API_TIMEOUT_MS') {
          return defaultValue;
        }

        return undefined;
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'CLIENT_ID') {
          return 'client-id';
        }

        if (key === 'CLIENT_SECRET') {
          return 'client-secret';
        }

        throw new Error(`${key} is not configured.`);
      }),
    } as unknown as ConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shortens a valid URL through Naver API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: jest
        .fn()
        .mockResolvedValue(
          JSON.stringify({ result: { url: 'https://me2.kr/a' } }),
        ),
    });

    await expect(
      service.shortenUrl(' https://example.com/a '),
    ).resolves.toEqual({
      shortURL: 'https://me2.kr/a',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://openapi.naver.com/v1/util/shorturl',
      expect.objectContaining({
        body: 'url=https%3A%2F%2Fexample.com%2Fa',
        method: 'POST',
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('rejects non-http URLs before calling Naver API', async () => {
    await expect(
      service.shortenUrl('ftp://example.com'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws a bad gateway error when Naver API cannot be reached', async () => {
    fetchMock.mockRejectedValue(new Error('network failed'));

    await expect(
      service.shortenUrl('https://example.com'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
