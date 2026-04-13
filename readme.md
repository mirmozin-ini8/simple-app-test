# dummy-app

A minimal React + Go application used to demonstrate and test CI/CD pipeline patterns with Playwright and GitHub Actions.

---

## Stack

- Frontend - React + Vite + TypeScript
- Backend - Go (standard library, no framework)
- Container - Docker + Docker Compose
- Orchestration - Kubernetes (nginx ingress)
- CI/CD - GitHub Actions
- Testing - Playwright

---

## Credentials

For local and test use only.

- Username - `admin`
- Password - `password123`

---

## Local Development

**Run without Docker**

```bash
# Backend
cd backend
go run main.go

# Frontend (separate terminal)
cd frontend
npm install
VITE_API_URL=http://localhost:8080 npm run dev
```

Open `http://localhost:5173`.

**Run with Docker Compose**

```bash
docker compose up --build
```

Open `http://localhost:80`.

---

## Running Tests

```bash
cd tests/playwright
npm install
npx playwright install chromium
TEST_URL=http://localhost:80 npx playwright test
```

---

## Project Structure

```
dummy-app/
- backend/            Go backend source and Dockerfile
- frontend/           React frontend source and Dockerfile
- tests/playwright/   Playwright test specs and config
- k8s/                Kubernetes manifests
- docker-compose.yml
- .github/workflows/  CI/CD pipeline files
```

---

## Pipelines

| File | Trigger | Purpose |
| --- | --- | --- |
| `deploy.yml` | Push to main | Builds images, pushes to ghcr.io, deploys to cluster |
| `post-deploy-test.yml` | After deploy succeeds | Runs Playwright tests against the live cluster |
| `pre-deploy-test.yml` | Scheduled or manual | Runs tests against existing live URL, no deployment |
| `compose-test.yml` | Pull request | Spins up app via Docker Compose, runs tests, tears down |

---

## GitHub Secrets Required

| Secret | Description |
| --- | --- |
| `KUBECONFIG` | Kubeconfig file contents for cluster access |
| `GHCR_TOKEN` | GitHub token with write:packages scope |
| `K3S_URL` | Base URL of the deployed application |

---

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/api/login` | Returns a token on valid credentials |
| GET | `/api/protected` | Returns a message, requires Bearer token |