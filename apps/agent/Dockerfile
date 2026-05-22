FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for audio processing & compilation
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose API port
EXPOSE 8001

# Run the LiveKit Voice Agent by default
CMD ["python", "agent.py", "dev"]
