FROM node:20-alpine

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy package definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and config
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY src ./src
COPY tsconfig.json ./

# Generate Prisma Client
RUN pnpm run generate

EXPOSE 10000

CMD ["pnpm", "start"]
