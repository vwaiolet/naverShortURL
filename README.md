# naverShortURL

NestJS wrapper for the Naver Short URL API.

## Requirements

- Node.js 18 or newer
- Naver API credentials for Short URL

## Environment Variables

Create a `.env` file in the project root.

```env
CLIENT_ID=your-naver-client-id
CLIENT_SECRET=your-naver-client-secret
NODE_PORT=3000
NAVER_API_TIMEOUT_MS=5000
```

`CLIENT_ID` and `CLIENT_SECRET` are required. The app validates required
configuration at startup.

## Install

```bash
npm install
```

## Run

```bash
npm run start:dev
```

The server listens on `NODE_PORT`, or `3000` when `NODE_PORT` is omitted.

## API

### POST `/api/url`

Request body:

```json
{
  "url": "https://example.com"
}
```

Response body:

```json
{
  "shortURL": "https://me2.kr/example"
}
```

Only absolute `http` and `https` URLs are accepted.

## Quality Checks

```bash
npm run format
npm run lint
npm test
```
