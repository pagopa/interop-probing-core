FROM node:20.11.1-slim@sha256:357deca6eb61149534d32faaf5e4b2e4fa3549c2be610ee1019bf340ea8c51ec as build

RUN corepack enable

WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY pnpm-workspace.yaml /app/

COPY ./packages/probing-eservice-operations/package.json /app/packages/probing-eservice-operations/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/models/package.json /app/packages/models/package.json
COPY ./packages/clients/eservice-operations/package.json /app/packages/clients/eservice-operations/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/probing-eservice-operations /app/packages/probing-eservice-operations
COPY ./packages/commons /app/packages/commons
COPY ./packages/models /app/packages/models
COPY ./packages/clients/eservice-operations /app/packages/clients/eservice-operations

RUN pnpm build
RUN rm -rf /app/packages/probing-eservice-operations/dist/test

WORKDIR /app/packages/probing-eservice-operations

CMD [ "node", "." ]