# Sử dụng Node.js làm base image
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép các file cần thiết
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose port cho ứng dụng
EXPOSE 3000

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]

