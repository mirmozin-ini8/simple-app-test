# simple-app-test

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

---

## Implemented Pipelines

### deploy.yml

Trigger - push to main.

Builds Docker images for backend and frontend, pushes both to GitHub Container Registry, applies Kubernetes manifests to the cluster, and waits for rollout to complete. This is the base pipeline that all post-deploy testing depends on.

### post-deploy-test.yml

Trigger - automatically after deploy.yml succeeds.

Runs the full Playwright test suite against the live cluster URL. Only triggers if the deployment succeeded, so there is no point running tests against a failed deploy. Test reports are uploaded as artifacts and retained for 7 days. This acts as a smoke test confirming the deployed version works in the real environment.

### pre-deploy-test.yml

Trigger - scheduled every 6 hours, or manually via workflow dispatch.

Runs the full Playwright test suite against the existing live URL with no deployment involved. Catches regressions caused by external factors such as infrastructure issues, dependency changes, or environment drift rather than code changes. Useful to run manually before pushing new changes to verify the baseline is healthy.

### compose-test.yml

Trigger - pull request to main, or manually via workflow dispatch.

Builds fresh images from the branch code, spins up the full application using Docker Compose inside the CI runner, waits for both backend and frontend to be healthy, runs Playwright tests against localhost, then tears everything down. This is the earliest quality gate - it runs before any deployment happens and catches issues at the code level. Containers are torn down even if tests fail.

---

### Blue-Green Testing

Two identical environments run side by side on the cluster - blue and green. One serves live traffic at all times while the other receives the new deployment. Tests run against the idle environment before any traffic is switched. If tests pass, the ingress selector is patched to point to the new environment. If tests fail, the new deployment is deleted and the live environment is never interrupted.

This pattern eliminates the window where a bad deployment is live while tests are still running. The switch is instant in Kubernetes by changing the service selector label between blue and green. The tradeoff is that two full deployments run simultaneously during the switch window, doubling resource usage briefly.

Implementation in Kubernetes requires two deployments with a slot label (blue or green), one service whose selector targets the active slot, and a pipeline step that patches the selector after tests pass.