# Usa la imagen de Node.js oficial como imagen base
FROM node:16

# Establece el directorio de trabajo
WORKDIR /app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación
RUN npm run build

# Expone el puerto que usará la aplicación
EXPOSE 3000

# Comando para correr la aplicación
CMD ["node", "dist/main"]

