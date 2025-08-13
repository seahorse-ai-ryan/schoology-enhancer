FROM mcr.microsoft.com/devcontainers/javascript-node:20-bookworm

# Firebase emulators require Java; install OpenJDK and firebase-tools
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/* \
    && npm i -g firebase-tools@latest

WORKDIR /workspaces/schoology-enhancer
