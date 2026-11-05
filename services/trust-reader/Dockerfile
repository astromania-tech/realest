FROM python:3.12-slim-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends tesseract-ocr poppler-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src ./src

ENV PYTHONPATH=/srv/src \
    TRUST_READER_HOST=0.0.0.0 \
    TRUST_READER_PORT=4078 \
    TRUST_READER_REQUIRE_OCR=1

EXPOSE 4078
CMD ["python", "-m", "trust_reader"]
