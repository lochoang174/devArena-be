FROM node:20 as development

WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (nếu có) trước khi cài đặt dependencies
COPY package*.json ./

# Cài đặt dependencies cho bcryptjs
RUN npm install --legacy-peer-deps

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng
RUN npm run build

FROM node:20 as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (nếu có) từ stage development
COPY package*.json ./

# Cài đặt dependencies chỉ cho môi trường production
RUN npm install --only=production

# Sao chép các tệp build từ stage development vào production
COPY --from=development /usr/src/app/dist ./dist

# Khởi chạy ứng dụng
CMD ["node", "dist/apps/main/main"]
