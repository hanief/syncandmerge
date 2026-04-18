# Integration Sync Panel

A frontend interface for managing bidirectional data synchronization across external services. Supports conflict detection and resolution, sync history, and per-field review of incoming changes.

---

## Quick Start

### Docker Compose (Recommended)

```bash
docker-compose up dev --build    # development with hot reload
docker-compose up prod --build   # production
```

- Development: `http://localhost:5173`
- Production: `http://localhost:8080`

> **Note:** On first run or after dependency changes, use `--build`. If you see missing module errors, clear stale volumes first:
> ```bash
> docker-compose down -v
> docker-compose up dev --build
> ```

### Docker (manual)

**Development:**
```bash
docker build -f Dockerfile.dev -t sync-and-merge-dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules sync-and-merge-dev
```

**Production:**
```bash
docker build -t sync-and-merge .
docker run -p 8080:80 sync-and-merge
```

### Local
If you have node/npm installed locally:
```bash
npm install
npm run dev
```
Visit `http://localhost:5173`

---

## Environment

`.env` is created automatically from `.env.example` during Docker builds when not present. For local development:

```bash
cp .env.example .env
```

---

## License

[MIT](LICENSE)
