# Distributed Media Processing Platform

A production-grade event-driven media processing platform built to demonstrate:

- asynchronous task orchestration
- distributed event streaming
- fault tolerance
- retries
- dead-letter queues
- idempotent consumers
- audit and analytics pipelines

Inspired by real-world systems such as:

- YouTube
- Instagram
- Netflix
- Dropbox

This platform combines:

- RabbitMQ for command orchestration
- Kafka for immutable event streaming
- Node.js workers for distributed processing

---

# Business Problem

When users upload large media assets:

- videos
- images
- documents

the platform must perform multiple independent tasks:

- validation
- thumbnail generation
- compression
- virus scanning

At the same time, business systems need:

- audit logs
- analytics
- monitoring
- replayability

Running everything synchronously creates:

- high latency
- blocked request threads
- poor scalability
- tightly coupled systems

This platform solves that problem using asynchronous distributed messaging.

---

# Architecture

```text
                           CLIENT

                             │
                             │ Upload
                             ▼

                     Upload API (Node.js)

                             │
                             ▼

                         RabbitMQ

                  fanout exchange routing


        ┌──────────────┬──────────────┬──────────────┬──────────────┐

        ▼              ▼              ▼              ▼

   Validator      Thumbnail      Compression      Virus Scan

     Worker          Worker          Worker          Worker


        │              │              │              │

        └──────────────┴──────────────┴──────────────┘

                             │

                      success / failure

                             │

                             ▼


                           Kafka

                    media.events topic


        ┌──────────────┬──────────────┬──────────────┐

        ▼              ▼              ▼

    Analytics         Audit           Retry

     Consumer        Consumer        Consumer


                             │

                             ▼

                        DLQ Consumers
```

---

# Tech Stack

## Runtime

- Node.js

## Messaging

- RabbitMQ
- Kafka

## Logging

- Winston

## Containers

- Docker

---

# Folder Structure

```text
distributed-media-processing-platform/

├── services/
│
├── upload-api/
│
├── rabbitmq-workers/
│   ├── validator-worker/
│   ├── thumbnail-worker/
│   ├── compression-worker/
│   ├── virus-worker/
│   ├── retry-worker/
│   └── dlq-worker/
│
├── kafka-consumers/
│   ├── analytics/
│   ├── audit/
│   ├── retry/
│   └── dlq/
│
├── shared/
│   ├── events/
│   ├── kafka/
│   └── logger/
│
├── uploads/
│
├── docker-compose.yml
└── package.json
```

---

# End-to-End Request Flow

# Step 1 — Upload

Client uploads media:

```http
POST /upload
```

Upload API:

- streams file to disk
- avoids memory spikes

---

# Step 2 — RabbitMQ Fanout

After upload:

API publishes:

```json
media.uploaded
```

to RabbitMQ fanout exchange.

RabbitMQ routes to:

- validator
- thumbnail
- compression
- virus

All workers run independently.

---

# Step 3 — Processing

Each worker:

- receives event
- processes media
- retries on transient failure
- dead-letters on permanent failure

---

# Step 4 — Kafka Event Streaming

Successful workers publish:

```json
video.validated
thumbnail.created
compression.completed
virus.scan.completed
```

to Kafka.

---

# Step 5 — Business Consumers

Kafka consumers process:

## Analytics

Tracks:

- throughput
- media counts

## Audit

Stores immutable event history.

## Retry

Reprocesses failed events.

## DLQ

Captures poison messages.

---

# Reliability Patterns

## RabbitMQ Retries

Implemented using:

- TTL queues
- delayed requeue

---

## Dead Letter Queues

Permanent failures routed to DLQ.

---

## Idempotent Consumers

Duplicate messages never corrupt state.

---

## Manual ACK

Workers only ACK after successful processing.

---

## QoS

Prefetch limits prevent worker overload.

---

# Tradeoffs

# Why RabbitMQ?

RabbitMQ is ideal for:

- task orchestration
- routing
- command delivery

Tradeoff:

- message replay is limited

---

# Why Kafka?

Kafka is ideal for:

- immutable logs
- analytics
- replay

Tradeoff:

- operational complexity

---

# Why both?

Because command workflows and event streams solve different problems.

---

# Scaling Considerations

Current deployment:

Single broker.

Can scale by:

## RabbitMQ

- mirrored queues
- quorum queues

## Kafka

- multiple brokers
- topic partitioning

## Workers

- horizontal scaling

## Storage

Move uploads to S3.

---

# Interview Talking Points

This project demonstrates:

## Messaging

- exchanges
- routing keys
- fanout
- topic routing

## Reliability

- retries
- DLQ
- idempotency
- manual ACK

## Kafka

- partitions
- ordering
- consumer groups
- replay

## Distributed Systems

- eventual consistency
- decoupled processing
- asynchronous orchestration

Interview one-liner:

> I built a distributed media platform where RabbitMQ orchestrates independent processing workers and Kafka streams immutable business events for analytics, audit, retries, and dead-letter handling.

---

# API Examples

# Upload

```http
POST /upload
```

Response:

```json
uploaded
```

---

# Kafka Topic Monitoring

```bash
docker exec -it kafka1 bash
```

```bash
/opt/kafka/bin/kafka-console-consumer.sh \
--topic media.events \
--bootstrap-server localhost:9092 \
--from-beginning
```

---

# RabbitMQ Dashboard

```text
http://localhost:15672
```

---

# Local Setup

# Install

```bash
npm install
```

---

# Start Infrastructure

```bash
docker compose up -d
```

Starts:

- RabbitMQ
- Kafka

---

# Start API

```bash
npm run upload-api
```

---

# Start RabbitMQ Workers

```bash
npm run validator
npm run thumbnail
npm run compression
npm run virus
npm run dlq
```

---

# Start Kafka Consumers

```bash
npm run analytics
npm run audit
npm run retry-consumer
npm run dlq-consumer
```

---

# Test Upload

```bash
curl.exe --data-binary "@sample.mp4" http://localhost:3000/upload
```

---

# Monitoring

## RabbitMQ

```text
http://localhost:15672
```

---

## Kafka

Topic CLI.

---

# Screenshots

## RabbitMQ Exchanges

(Add screenshot)

---

## Kafka Topic Events

(Add screenshot)

---

## DLQ Monitoring

(Add screenshot)

---

# Future Improvements

## Storage

Move uploads to S3.

## Schema

Use Avro.

## Event Registry

Use Schema Registry.

## Monitoring

Prometheus + Grafana.

## Security

TLS + SASL.

## Deployment

Kubernetes.

## Tracing

OpenTelemetry.

---

# Author

Built for backend engineering interviews, messaging systems, and event-driven architecture practice.
