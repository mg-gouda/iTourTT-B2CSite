# iTourTT B2C Website (Transferra)

Standalone public booking website, extracted from the iTour Transport & Traffic
dashboard monorepo. Deployed independently on its own VPS (`transferra.ae`) and
talks to the existing backend API.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui
- **API:** calls `${NEXT_PUBLIC_API_URL}/api/public/*` and `/api/w-api/*`
- **Payments:** PAY_ON_ARRIVAL only (online card payment deferred — see the
  separation plan in the main repo).

## Develop
```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Build
```bash
npm run build && npm start
```

## Deploy
Standalone Docker build on the B2C VPS behind an nginx reverse proxy. See the
deployment notes / separation plan for details.
