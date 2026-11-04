# مرحله اول: بیلد کردن اپلیکیشن (Build Stage)
FROM node:20-alpine AS builder

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی کردن فایل‌های وابستگی‌ها
COPY package*.json ./

# نصب پکیج‌ها
RUN npm install

# کپی کردن کل سورس کد پروژه
COPY . .

# بیلد کردن پروژه برای پروداکشن (خروجی در پوشه dist قرار می‌گیرد)
RUN npm run build


# مرحله دوم: سرو کردن با Nginx (Production Stage)
FROM nginx:alpine

# کپی کردن فایل‌های بیلد شده از مرحله قبل به پوشه سرور Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# کپی کردن تنظیمات سفارشی Nginx (اختیاری - در صورت نیاز به روت‌رور)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# پورت پیش‌فرض Nginx
EXPOSE 80

# اجرای Nginx
CMD ["nginx", "-g", "daemon off;"]
