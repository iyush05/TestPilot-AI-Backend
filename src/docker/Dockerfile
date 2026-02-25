FROM node:18-alpine

RUN apk add --no-cache git

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

USER appuser

CMD ["sh",
"-c",
"npm config set fund false && npm config set audit false && npm cache clean --force && npm install --ignore-scripts && npm test -- --coverage"]