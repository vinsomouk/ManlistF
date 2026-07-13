FROM jenkins/inbound-agent:latest-jdk21

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gnupg \
    build-essential \
    docker.io && \
    rm -rf /var/lib/apt/lists/*

# Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# pnpm
RUN corepack enable && \
    corepack prepare pnpm@9 --activate

RUN usermod -aG docker jenkins

USER jenkins

WORKDIR /home/jenkins/agent

ENV CI=true