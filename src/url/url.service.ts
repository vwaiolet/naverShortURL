import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UrlService {
  private readonly apiUrl = 'https://openapi.naver.com/v1/util/shorturl';

  constructor(private readonly configService: ConfigService) {}

  async shortenUrl(url: string) {
    const encodedUrl = encodeURI(url);

    try {
      const response = await axios.post(
        this.apiUrl,
        `url=${encodedUrl}`,
        {
          headers: {
            'X-Naver-Client-Id': this.configService.get<string>('CLIENT_ID'),
            'X-Naver-Client-Secret': this.configService.get<string>('CLIENT_SECRET'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return { shortURL: response.data.result.url };
    } catch (error) {
      const status = error.response?.status ?? 500;
      throw new HttpException(error.message, status);
    }
  }
}
