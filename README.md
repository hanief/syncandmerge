# Integration Sync Panel

A frontend interface for managing bidirectional data synchronization across external services. Supports conflict detection and resolution, sync history, and per-field review of incoming changes.

---

## Quick Start

### Docker (Recommended)

**Production:**
```bash
docker build -t sync-and-merge .
docker run -p 8080:80 sync-and-merge
```
Visit `http://localhost:8080`

**Development (with hot reload):**
```bash
docker build -f Dockerfile.dev -t sync-and-merge-dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules sync-and-merge-dev
```
Visit `http://localhost:5173`

**Docker Compose:**
```bash
docker-compose up dev    # development
docker-compose up prod   # production
```

### Local

```bash
npm install
npm run dev
```
Visit `http://localhost:5173`

---

## Environment

Copy `.env.example` to `.env` to configure the API base URL:

```bash
cp .env.example .env
```

Docker builds do this automatically when no `.env` is present.

---

## License

[MIT](LICENSE)
