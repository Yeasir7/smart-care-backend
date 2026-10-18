FROM node:20-alpine

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy package definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema & configuration
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client
RUN pnpm run generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

EXPOSE 10000

CMD ["pnpm", "start"]
