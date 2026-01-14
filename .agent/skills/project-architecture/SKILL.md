---
name: project-architecture
description: Provides an overview of the Flare Stack Blog architecture. Use when needing to understand the project structure, tech stack, routing layers (Hono/TanStack), dependency injection, or directory organization.
---

# Project Architecture Overview

This project is a modern full-stack TypeScript blog built on the Cloudflare ecosystem, integrating TanStack Start with Hono for high performance and type safety.

## Tech Stack & Infrastructure

The project deeply integrates multiple Cloudflare services:

| Service             | Binding        | Purpose                                          |
| :------------------ | :------------- | :----------------------------------------------- |
| **Runtime**         | -              | Bun                                              |
| **Compute/Hosting** | -              | Cloudflare Workers                               |
| **Database**        | `DB`           | Cloudflare D1 (SQLite) with Drizzle ORM          |
| **Object Storage**  | `R2`           | Media assets storage                             |
| **KV Storage**      | `KV`           | Persistent caching layer                         |
| **Durable Objects** | `RATE_LIMITER` | Distributed rate limiting                        |
| **Workflows**       | Various        | Async tasks (email, post-processing, moderation) |
| **AI**              | `AI`           | Cloudflare Workers AI                            |
| **Authentication**  | -              | Better Auth (D1 integrated)                      |

### Editor & Rendering

- **TipTap**: Rich text editing with multiple extensions
- **Shiki**: High-performance syntax highlighting for code blocks

## Core Architecture

### Dual-Layer Routing

The project uses a two-tier routing architecture with clear responsibilities:

#### Hono (Base/Gateway Layer)

- Handles Better Auth routes (`/api/auth/*`)
- Serves media resources (`/images/*`)
- Global cache strategy control and 404/500 error handling
- Proxies all other requests to TanStack Start

#### TanStack Start (Business Layer)

- Handles most business logic routes
- File-based routing via `src/routes/`
- Page rendering and data loaders

### Dependency Injection & Context Types

The project uses a layered dependency injection pattern:

1. **Entry Point Injection** (`src/server.ts`): Only `env` and `executionCtx` are injected via `Register['server']['requestContext']`
2. **Middleware Injection** (`lib/middlewares.ts`): `db`, `auth`, and `session` are injected progressively through TanStack middlewares

#### Global Context Types (`global.d.ts`)

| Type             | Contents                                  | Usage                                   |
| :--------------- | :---------------------------------------- | :-------------------------------------- |
| `BaseContext`    | `env`                                     | Minimal context for env-only operations |
| `DbContext`      | `env`, `db`                               | Database operations                     |
| `SessionContext` | `env`, `db`, `auth`, `session` (nullable) | Session-aware but not requiring auth    |
| `AuthContext`    | `env`, `db`, `auth`, `session` (required) | Authenticated operations                |

### Middleware System

| Layer    | Location                  | Purpose                                         |
| :------- | :------------------------ | :---------------------------------------------- |
| Hono     | `lib/hono/middlewares.ts` | Global control: rate limiting, cache headers    |
| TanStack | `lib/middlewares.ts`      | DI + Business-level: db, auth, session, caching |

## Directory Structure (`src/`)

| Directory         | Responsibility                                                                           |
| :---------------- | :--------------------------------------------------------------------------------------- |
| `src/features/`   | Feature modules. Each contains `api/`, `services/`, `data/`, and `schemas.ts` (validation + cache key factories) |
| `src/routes/`     | TanStack file routes with page components and loaders                                    |
| `src/lib/`        | Infrastructure: database (`db/`), env (`env/`), middlewares                              |
| `src/components/` | Shared UI components: `ui/` (atomic), `common/`, `layout/`                               |

## Request Flow

1. **Entry**: All requests first hit the Hono container in `src/server.ts`
2. **Gateway Routing**: Hono handles specific API/resource paths; others go to TanStack
3. **Context Injection**: Before entering TanStack Start, context is constructed with `db`, `auth`, and `env`
4. **Business Routing**: TanStack Router matches paths to components and invokes loaders
5. **Logic Execution**: Loaders/Server Functions pass through middleware, then call Feature services
6. **Rendering**: SSR renders the result with CDN-optimized cache headers
