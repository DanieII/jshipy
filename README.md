# jshipy

A production-ready project template for full-stack web applications built with **React** and **Django**, fully containerized with **Docker** and served through **Caddy**.

## Tech Stack

### Frontend (`client/`)

- **React** with **TypeScript**
- **TanStack Router** — file-based routing
- **TanStack Query** — data fetching & caching
- **TanStack Form** — form management
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible UI components
- **Vite** — lightning-fast dev server & build tool
- **Vitest** — unit testing
- **ESLint** + **Prettier** — linting & formatting

### Backend (`server/`)

- **Django** with **Django REST Framework**
- **django-allauth** — authentication (Google, Facebook OAuth)
- **drf-spectacular** — OpenAPI / Swagger schema generation
- **drf-standardized-errors** — consistent API error responses
- **django-filter** — queryset filtering
- **django-storages** — AWS S3 file storage
- **Stripe** — payment processing
- **Resend** — transactional emails
- **PostgreSQL** — database
- **Gunicorn** — production WSGI server

### Infrastructure

- **Docker** & **Docker Compose** — local development
- **Docker Swarm** (`docker-stack.yml`) — production deployment
- **Caddy** — reverse proxy with automatic HTTPS
- **GitHub Actions** — CI/CD pipeline
- **GitHub Container Registry (GHCR)** — Docker image hosting

## Project Structure

```
jshipy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── routes/         # File-based routes (TanStack Router)
│   │   ├── components/     # Reusable components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── lib/            # Utility functions
│   │   └── hooks/          # Custom React hooks
│   ├── Dockerfile          # Dev Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                 # Django backend
│   ├── server/             # Django project settings
│   ├── accounts/           # User accounts app
│   ├── subscriptions/      # Subscriptions app
│   ├── Dockerfile          # Dev Dockerfile
│   ├── Dockerfile.prod     # Production Dockerfile (Gunicorn)
│   ├── requirements.txt
│   └── manage.py
├── caddy/                  # Caddy reverse proxy
│   ├── Caddyfile           # Dev config
│   ├── Caddyfile.prod      # Production config
│   └── Dockerfile.prod     # Production Dockerfile (builds client + serves)
├── .github/
│   └── workflows/
│       └── main.yml        # CI/CD pipeline
├── docker-compose.yml      # Local development
├── docker-stack.yml        # Production deployment (Docker Swarm)
├── .env.example            # Environment variable template
└── LICENSE                 # MIT License
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the Repository

```bash
git clone https://github.com/DanieII/jshipy.git
cd jshipy
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

| Variable                   | Description                        |
| -------------------------- | ---------------------------------- |
| `BASE_URL`                 | Base URL of your application       |
| `DEBUG`                    | Django debug mode (`True`/`False`) |
| `SECRET_KEY`               | Django secret key                  |
| `ALLOWED_HOSTS`            | Comma-separated allowed hosts      |
| `CSRF_TRUSTED_ORIGINS`     | Trusted origins for CSRF           |
| `DATABASE_URL`             | PostgreSQL connection string       |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID             |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret         |
| `FACEBOOK_CLIENT_ID`       | Facebook OAuth client ID           |
| `FACEBOOK_CLIENT_SECRET`   | Facebook OAuth client secret       |
| `STRIPE_PUBLISHABLE_KEY`   | Stripe publishable key             |
| `STRIPE_SECRET_KEY`        | Stripe secret key                  |
| `STRIPE_WEBHOOK_SECRET`    | Stripe webhook signing secret      |
| `AWS_ACCESS_KEY_ID`        | AWS access key                     |
| `AWS_SECRET_ACCESS_KEY`    | AWS secret access key              |
| `AWS_STORAGE_BUCKET_NAME`  | S3 bucket name                     |
| `AWS_S3_REGION_NAME`       | S3 region                          |
| `RESEND_API_KEY`           | Resend API key for emails          |
| `DEFAULT_FROM_EMAIL`       | Default sender email address       |

### 3. Start the Application

```bash
docker compose up --build
```

### 4. Access the Application

> **Important:** Always access the app through **Caddy** at [http://localhost](http://localhost) (port 80), not through the individual service ports. Caddy acts as the single entry point and routes all traffic, which is required for cookies and cross-site protections to work correctly.

Caddy routes requests as follows:

| Path            | Destination           |
| --------------- | --------------------- |
| `/api/*`        | Django backend (:8000)|
| `/admin/*`      | Django admin (:8000)  |
| `/static/*`     | Django static files   |
| `/sitemap.xml`  | Django backend (:8000)|
| `/*`            | React frontend (:3000)|

## Development

The client runs with Vite's dev server with hot module replacement and the server runs Django's development server with auto-reload. Source files are mounted as volumes for both, so changes are reflected instantly.

```bash
# Run migrations
docker compose exec server python3 manage.py migrate

# Create a superuser
docker compose exec server python3 manage.py createsuperuser
```

### Static Files

Django static files (admin CSS/JS, DRF browsable API assets, etc.) are collected into a `staticfiles` directory and served by Caddy at `/static/*`. The `staticfiles` volume is shared between the `server` and `caddy` containers.

To collect static files:

```bash
docker compose exec server python3 manage.py collectstatic --noinput
```

## Production Deployment

The project is designed to be deployed on a **single server** using **Docker Swarm** with a fully automated CI/CD pipeline via **GitHub Actions**.

### Architecture Overview

In production, the setup differs from development in two key ways:

1. **Server** runs with **Gunicorn** (production WSGI server) instead of Django's dev server
2. **Caddy** uses a multi-stage Docker build that compiles the React app at build time and serves the static bundle directly — there is no separate client container in production

The Caddy production image:
- **Stage 1**: Installs dependencies and runs `npm run build` to produce the React production bundle
- **Stage 2**: Copies the built files into a Caddy image and serves them at `/*`, while proxying `/api/*` and `/admin/*` to the Django server

### Prerequisites

- A server (VPS) with Docker installed and **Docker Swarm initialized** (`docker swarm init`)
- A domain name pointed to your server's IP
- A deploy user on the server with SSH access and Docker permissions
- A GitHub account with access to GitHub Container Registry (GHCR)

### 1. Set Up Docker Swarm on Your Server

SSH into your server and initialize Docker Swarm:

```bash
docker swarm init
```

Create the database password secret:

```bash
echo "your-secure-db-password" | docker secret create db-password -
```

### 2. Configure the Caddyfile

Edit `caddy/Caddyfile.prod` and replace the domain with your own.

Place the Caddyfile on your server at `/root/Caddyfile` (or update the volume mount path in `docker-stack.yml`). Caddy will automatically provision and renew TLS certificates via Let's Encrypt.

### 3. Configure GitHub Actions Secrets and Variables

In your GitHub repository, go to **Settings → Secrets and variables → Actions**.

Add the following **secrets** (sensitive values that should remain hidden):

| Secret                     | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `SECRET_KEY`               | Django secret key                                |
| `DATABASE_URL`             | PostgreSQL connection string                     |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID                           |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret                       |
| `FACEBOOK_CLIENT_ID`       | Facebook OAuth client ID                         |
| `FACEBOOK_CLIENT_SECRET`   | Facebook OAuth client secret                     |
| `STRIPE_PUBLISHABLE_KEY`   | Stripe publishable key                           |
| `STRIPE_SECRET_KEY`        | Stripe secret key                                |
| `STRIPE_WEBHOOK_SECRET`    | Stripe webhook signing secret                    |
| `AWS_ACCESS_KEY_ID`        | AWS access key                                   |
| `AWS_SECRET_ACCESS_KEY`    | AWS secret access key                            |
| `RESEND_API_KEY`           | Resend API key for emails                        |
| `DEPLOY_SSH_PRIVATE_KEY`   | SSH private key for your deploy user             |
| `GHCR_PASS`               | GitHub Personal Access Token with `read:packages` scope |

Add the following **variables** (non-sensitive configuration values):

| Variable                   | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `BASE_URL`                 | Your production base URL (e.g. `https://yourdomain.com`) |
| `ALLOWED_HOSTS`            | Comma-separated allowed hosts                            |
| `CSRF_TRUSTED_ORIGINS`     | Trusted origins for CSRF                                 |
| `AWS_STORAGE_BUCKET_NAME`  | S3 bucket name                                           |
| `AWS_S3_REGION_NAME`       | S3 region                                                |
| `DEFAULT_FROM_EMAIL`       | Default sender email address                             |
| `GHCR_USER`               | GitHub username for pulling GHCR images                  |

### 4. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/main.yml`) runs three jobs:

1. **`build-server`** — Builds the Django production image using `server/Dockerfile.prod` and pushes it to GHCR (`ghcr.io/<user>/jshipy-server`)
2. **`build-caddy`** — Builds the Caddy production image using `caddy/Dockerfile.prod` (which compiles the React app in a multi-stage build) and pushes it to GHCR (`ghcr.io/<user>/jshipy-caddy`)
3. **`deploy`** — Creates a `.env` file from GitHub Secrets and Variables, then deploys the stack to your server via SSH using `docker stack deploy`

By default, the workflow is triggered manually via `workflow_dispatch`. To enable automatic deployments on push to `main`, uncomment the relevant lines in the workflow file:

```yaml
on:
  workflow_dispatch:
  push:
    branches:
      - "main"
```

### 5. Deploy

Trigger the workflow manually from the **Actions** tab in your GitHub repository, or push to `main` if you've enabled automatic deployments.

The pipeline will build both images, push them to GHCR, SSH into your server, and run `docker stack deploy` — resulting in a **zero-downtime deployment** thanks to Docker Swarm's `start-first` update strategy.

### Static Resources in Production

There are two types of static resources:

- **Django static files** (`/static/*`) — Admin CSS/JS, DRF assets, and any app static files. These are collected via `collectstatic` and served by Caddy from the shared `staticfiles` volume between the server and Caddy containers.
- **React build output** (`/*`) — The compiled React SPA bundle. This is built inside the Caddy production Docker image during the multi-stage build and served directly by Caddy from `/var/www/dist`. Caddy uses `try_files` to serve the `index.html` for all client-side routes, enabling SPA navigation.

## License

This project is licensed under the [MIT License](LICENSE).
