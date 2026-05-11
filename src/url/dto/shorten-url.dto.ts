import { IsNotEmpty, IsUrl } from 'class-validator';

export class ShortenUrlDto {
  @IsNotEmpty()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url!: string;
}
