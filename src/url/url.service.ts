import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface NaverShortUrlApiResponse {
  errorMessage?: string;
  message?: string;
  result?: {
    url?: string;
  };
}

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);
  private readonly apiUrl = 'https://openapi.naver.com/v1/util/shorturl';

  constructor(private readonly configService: ConfigService) {}

  async shortenUrl(rawUrl: string) {
    const url = this.normalizeUrl(rawUrl);
    const clientId = this.configService.getOrThrow<string>('CLIENT_ID').trim();
    const clientSecret = this.configService
      .getOrThrow<string>('CLIENT_SECRET')
      .trim();
    const timeoutMs = this.getApiTimeoutMs();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ url }).toString(),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const payload = await this.parseApiResponse(response);

      if (!response.ok) {
        throw new HttpException(
          this.getApiErrorMessage(payload) ??
            'Failed to shorten URL via Naver Short URL API.',
          response.status,
        );
      }

      const shortUrl = payload.result?.url;
      if (typeof shortUrl !== 'string' || shortUrl.trim().length === 0) {
        throw new BadGatewayException(
          'Naver Short URL API returned an invalid response.',
        );
      }

      return { shortURL: shortUrl };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to call Naver Short URL API.', error);
      throw new BadGatewayException('Failed to reach Naver Short URL API.');
    }
  }

  private normalizeUrl(rawUrl: string): string {
    if (typeof rawUrl !== 'string') {
      throw new BadRequestException('A valid URL is required.');
    }

    const trimmedUrl = rawUrl.trim();
    if (!trimmedUrl) {
      throw new BadRequestException('A valid URL is required.');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      throw new BadRequestException('A valid URL is required.');
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Only HTTP and HTTPS URLs are supported.');
    }

    return parsedUrl.href;
  }

  private async parseApiResponse(
    response: Response,
  ): Promise<NaverShortUrlApiResponse> {
    const bodyText = await response.text();

    if (!bodyText) {
      return {};
    }

    try {
      return JSON.parse(bodyText) as NaverShortUrlApiResponse;
    } catch {
      return { message: bodyText };
    }
  }

  private getApiErrorMessage(payload: NaverShortUrlApiResponse): string | null {
    const message = payload.message ?? payload.errorMessage;

    if (typeof message !== 'string' || message.trim().length === 0) {
      return null;
    }

    return message;
  }

  private getApiTimeoutMs(): number {
    return Number(
      this.configService.get<number | string>('NAVER_API_TIMEOUT_MS', 5000),
    );
  }
}
