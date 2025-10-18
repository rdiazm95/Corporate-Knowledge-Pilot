# backend/Dockerfile

# Usamos la imagen oficial de Python 3.12
FROM python:3.12-slim

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero el archivo de requisitos para optimizar la caché de Docker
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del backend
COPY . .

# El comando que se ejecutará para iniciar tu API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]