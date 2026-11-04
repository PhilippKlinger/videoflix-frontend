# Static frontend image: Angular build stage, then unprivileged nginx (VFX-10).
# Base images pinned by digest, same Node major as the CI.
FROM node:24.22.2-alpine3.24@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS build
WORKDIR /app
# Dependencies before the source: the install layer stays cached while only code changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build -- --configuration production

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03
LABEL org.opencontainers.image.title="videoflix-frontend"
LABEL org.opencontainers.image.source="https://github.com/PhilippKlinger/videoflix-frontend"
# Alpine security fixes often land before the base image is rebuilt (Trivy gate in CI).
USER root
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/videoflix/browser/ /usr/share/nginx/html/
# nginx-unprivileged runs as uid 101 and listens on 8080; stated explicitly so a base-image change cannot fall back to root.
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
