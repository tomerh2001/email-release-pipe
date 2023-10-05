FROM oven/bun:alpine

ARG GH_REPO
ARG RELEASE_NOTES

LABEL org.opencontainers.image.source $GH_REPO
WORKDIR /repo

COPY package.json bun.lockb index.ts /repo/
RUN bun i
CMD ["bun", "run", "/repo/index.ts"]