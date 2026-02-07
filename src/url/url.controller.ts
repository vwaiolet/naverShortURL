import { Body, Controller, Post } from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Controller('api')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('url')
  async shortenUrl(@Body() dto: ShortenUrlDto) {
    return this.urlService.shortenUrl(dto.url);
  }
}
