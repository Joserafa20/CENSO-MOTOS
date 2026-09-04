# Init Scripts

PostgreSQL bootstrap scripts for Docker development environment.

## Purpose

This directory contains SQL scripts that are automatically executed when the PostgreSQL container is first initialized via `docker-compose up`. Scripts are mounted to `/docker-entrypoint-initdb.d` inside the container.

## How It Works

PostgreSQL's official Docker image executes `.sql`, `.sql.gz`, and `.sh` files in `/docker-entrypoint-initdb.d` in alphabetical order on first startup.

## Adding Scripts

Place initialization scripts in this directory:

- `01-extensions.sql` — Enable required PostgreSQL extensions
- `02-schemas.sql` — Create initial schema structure
- `03-seed-data.sql` — Insert default/seed data

**Important**: Scripts only run on the FIRST startup when the volume is empty. To re-run, you must remove the `postgres_data` volume:

```bash
docker-compose down -v
docker-compose up -d
```

## Current Scripts

| File | Purpose |
|------|---------|
| _(none yet)_ | Add scripts as the project evolves |
