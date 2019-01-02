FROM nginx

RUN \
apt-get update && \
apt-get install -y curl gnupg && \
curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
apt-get install -y nodejs build-essential && \
npm install -g create-react-app && \
npm --prefix /app install && \
npm --prefix /app run build && \
cp -r /app/build/* /usr/share/nginx/html