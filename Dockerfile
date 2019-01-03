FROM nginx

RUN \
apt-get update && \
apt-get install -y curl gnupg && \
curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
apt-get install -y nodejs build-essential && \
npm install -g create-react-app

COPY package.json package-lock.json /app/
RUN npm --prefix /app install

COPY . /app/
RUN \
npm --prefix /app run build

COPY nginx.conf /etc/nginx/conf.d/default.conf