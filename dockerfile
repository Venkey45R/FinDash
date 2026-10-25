FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

# Pass secrets at runtime: docker run --env-file .env ...
# ENV VITE_GEMINI_API_KEY=<set at runtime>
# ENV VITE_GOOGLE_CLIENT_ID=<set at runtime>
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]