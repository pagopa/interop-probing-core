FROM node:20.11.1-slim as build

RUN corepack enable

WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY pnpm-workspace.yaml /app/

COPY ./packages/probing-telemetry-writer/package.json /app/packages/probing-telemetry-writer/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/models/package.json /app/packages/models/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/probing-telemetry-writer /app/packages/probing-telemetry-writer
COPY ./packages/commons /app/packages/commons
COPY ./packages/models /app/packages/models

RUN pnpm build

WORKDIR /app/packages/probing-telemetry-writer
EXPOSE 3000

CMD [ "node", "." ]