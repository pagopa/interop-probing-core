# Interoperability Probing Monorepo

## How to start

To get started, you will need:

- Node.js (https://nodejs.org/en/download/package-manager)
- pnpm (https://pnpm.io/installation)
- Docker (for local development, https://www.docker.com/get-started/)

Install the required dependencies with:

```
pnpm install
```

Build the project:

```
pnpm build
```

## Working with the REST API

All array query parameters for REST API must be passed with brackets for proper functionality, following the format: `?parameterName[]=value1&parameterName[]=value2` .
