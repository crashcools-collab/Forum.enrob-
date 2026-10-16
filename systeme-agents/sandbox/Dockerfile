# Image du bac à sable : exécute le code et les tests produits par les agents.
# Construction : docker build -t agents-sandbox:latest sandbox/
FROM python:3.12-slim

RUN pip install --no-cache-dir pytest==8.3.5 \
    && useradd --create-home --uid 1000 sandbox

USER sandbox
WORKDIR /work
