FROM nginx

ARG API_URL
ARG DEVELOPER

RUN \
apt-get update && \
apt-get install -y curl gnupg && \
curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
apt-get install -y nodejs=6.* build-essential

COPY package.json package-lock.json /app/
RUN npm --prefix /app install

ENV REACT_APP_API_URL=$API_URL
ENV REACT_APP_DEVELOPER=$DEVELOPER

COPY . /app/
RUN \
npm --prefix /app run build

COPY nginx.conf /etc/nginx/conf.d/default.conf
