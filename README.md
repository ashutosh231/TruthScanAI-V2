<div align="center">

# 🛡️ TRUTHSCAN AI
### Advanced Optical Misinformation Intelligence & Forensic Fact-Checking Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-DeepSeek_V3.2-FF9900?style=for-the-badge&logo=amazonaws)](https://aws.amazon.com/bedrock/)
[![Amazon Textract](https://img.shields.io/badge/Amazon_Textract-OCR_Engine-FF9900?style=for-the-badge&logo=amazonaws)](https://aws.amazon.com/textract/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_v9-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis_Cache-00E599?style=for-the-badge&logo=redis)](https://upstash.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Paise_Billing-02042B?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

<p align="center">
  A high-contrast Neo-Brutalist misinformation detection suite featuring optical character recognition (OCR), real-time news wire surveillance, and deep neural forensics powered by <b>AWS Bedrock DeepSeek V3.2</b> and <b>Amazon Textract</b>.
</p>

[Architecture](#-system-architecture) •
[Features](#-core-features) •
[Data Flow](#-pipeline-and-data-flows) •
[Quickstart](#-local-development-setup) •
[Production Deployment](#-production-deployment-architecture) •
[API Reference](#-api-endpoints-reference)

</div>

---

## 🏛️ System Architecture

TruthScan AI is engineered as an enterprise-grade, decoupled monorepo comprising a Next.js 16 client, an Express.js REST API server, an asynchronous BullMQ background worker, and cloud infrastructure:

```mermaid
flowchart TD
    subgraph CLIENT["USER TOUCHPOINT (Vercel)"]
        Browser["Desktop & Mobile Web Browsers"]
        NextApp["Next.js 16 App Router<br/>(Neo-Brutalist UI)"]
        Browser <--> NextApp
    end

    subgraph API_GATEWAY["API SERVER #1 (Render Web Service)"]
        Express["Express.js Server (Port 5000)<br/>CORS + Cookie-Parser + Multer"]
        AuthCtrl["Auth Controller<br/>(JWT + OTP Verify)"]
        ScanCtrl["Scan Controller<br/>(Buffer Ingestion)"]
        FactCtrl["FactCheck Controller<br/>(Text / URL / File)"]
        NewsCtrl["News Controller<br/>(5-min Cached Wire)"]
        PayCtrl["Payment Controller<br/>(Razorpay Orders & Webhooks)"]
        UserCtrl["User Profile Controller<br/>(Cloudinary Avatars)"]

        Express --> AuthCtrl
        Express --> ScanCtrl
        Express --> FactCtrl
        Express --> NewsCtrl
        Express --> PayCtrl
        Express --> UserCtrl
    end

    subgraph CLOUD_AI["AWS INTELLIGENCE CORE"]
        Textract["Amazon Textract<br/>(DetectDocumentText LINE OCR)"]
        Bedrock["AWS Bedrock Runtime<br/>(DeepSeek V3.2 Foundation Model)"]
    end

    subgraph DATA_TIER["DATA & CACHING PERSISTENCE"]
        MongoDB[("MongoDB Atlas Cluster<br/>(Users, FactChecks, Orders)")]
        Redis[("Upstash Redis (TLS)<br/>(Sessions, Token Whitelists, News Cache)")]
    end

    subgraph WORKER_TIER["BACKGROUND WORKER #2 (Render Web Service)"]
        BullQueue["BullMQ Queue ('email-dispatch')"]
        EmailWorker["emailWorker.js<br/>(Native HTTP Health Server)"]
        Brevo["Brevo SMTP Relay<br/>(6-Digit OTP Delivery)"]
        
        BullQueue --> EmailWorker
        EmailWorker --> Brevo
    end

    subgraph EXTERNAL_SERVICES["THIRD-PARTY PROVIDERS"]
        NewsAPI["NewsAPI.org / Event Registry"]
        RazorpayGateway["Razorpay Payment Gateway"]
        CloudinaryCDN["Cloudinary Media Storage"]
    end

    NextApp -- "HTTPS + Bearer Token + httpOnly Cookie" --> Express
    ScanCtrl -- "In-Memory Image Buffer" --> Textract
    Textract -- "Extracted Text Lines" --> Bedrock
    FactCtrl -- "Normalized Claim" --> Bedrock
    AuthCtrl -- "Revocation & Token Blacklist" --> Redis
    AuthCtrl -- "Enqueue OTP Job" --> BullQueue
    NewsCtrl -- "Cached Articles" <--> Redis
    NewsCtrl -- "Wire Fallback" --> NewsAPI
    PayCtrl -- "Create Orders & Verify HMAC" --> RazorpayGateway
    UserCtrl -- "Avatar Upload" --> CloudinaryCDN
    Express <--> MongoDB
```

---

## 📷 Core Features

### 1. 🔍 Optical Character Audit & Live Camera Scanner (`/scan`)
- **Direct Optical Viewfinder**: Hardware-accelerated webcam/mobile camera streaming with a laser reticle and interactive capture frame.
- **Zero-Disk In-Memory OCR**: Uploaded frames and camera snapshots are held in volatile RAM buffers and sent directly to **Amazon Textract** (`DetectDocumentTextCommand`).
- **Dual-Pass Extraction**: Filters high-confidence `LINE` blocks, combines text cohesively, and computes average OCR confidence percentages.
- **Graceful Detection Handling**: Non-text frames or blurred captures trigger friendly in-app repositioning tips without triggering application crashes or unhandled developer overlays.
- **Interactive Sample Newspaper Generator**: 1-click test article generator for instant pipeline demonstration without requiring printed paper in front of the lens.

### 2. 🧠 AWS Bedrock DeepSeek V3.2 Neural Forensics (`/detect`)
- **Exhaustive Multi-Dimensional Dossier**:
  - **Verdict**: Strictly assigned to `TRUE`, `FALSE`, `MISLEADING`, or `UNCERTAIN`.
  - **Confidence**: Quantified integer score (0–100%).
  - **Forensic Synthesis**: Multi-paragraph investigative breakdown explaining the factual truth, historical context, and origin of the narrative.
  - **Debunking Evidence**: 3 to 5 concrete contradiction points disproving false claims.
  - **Key Forensic Signals**: Technical manipulation indicators (e.g. lack of official gazette notification, domain spoofing, recycled viral templates).
  - **Identified Tactics**: Categorizes disinformation mechanisms (e.g. *Death Hoax Formula*, *Clickbait Content Farm*, *Out-of-Context Telemetry*).
  - **Corroborated Registries**: 4 to 6 verified institutional sources cited (e.g. *PIB Fact Check Desk*, *Doordarshan Archives*, *Prime Minister's Office Press Bureau*).
  - **Consumer Advisory**: Concrete guidance for readers on handling and contextualizing the claim.

### 3. 🌐 Multi-Modal Verification Engine
- **Text Claim**: Direct statement parsing and linguistic analysis.
- **Article URL**: Real-time extraction of published articles from web links.
- **File Ingestion**: Scans uploaded documents (`.pdf`, `.txt`, `.png`, `.jpg`) with forensic metadata validation.

### 4. 📰 Live Misinformation News Wire (`/news`)
- Ingests real-time headlines categorized by **Politics**, **Technology**, **Science**, **Health**, and **Climate**.
- 5-minute automated caching in **Upstash Redis** ensures low-latency page loads and API rate-limit resilience.
- 1-click **"Fact Check This Wire Story"** initiates deep investigation on any published headline.

### 5. 🔒 Enterprise Security & Cross-Site Authentication
- **Dual-Token Architecture**: Short-lived 15-minute Access Tokens in client state + 7-day Refresh Tokens stored in strict `httpOnly` cookies.
- **Environment-Aware Cross-Site Cookies**: Configured with `SameSite=None` and `Secure=True` in production, allowing seamless cookie transmission across Vercel and Render domains.
- **Session Revocation**: Refresh tokens are stored and verified against Upstash Redis keys (`refresh:<tokenId>`), enabling instant server-side revocation on logout.
- **2FA OTP Delivery**: 6-digit cryptographic verification codes dispatched asynchronously via **Brevo SMTP** and processed by an isolated **BullMQ** worker.

### 6. 💳 Freemium Trial Gate & Razorpay Billing (`/plans`)
- **2 Free Trials Limit**: Unregistered or free-tier users receive exactly 2 free fact checks across text, URL, file, and camera scans.
- **Cryptographic Paywall Enforcement**: Exceeding 2 checks triggers HTTP 402 with seamless routing to the subscription gateway.
- **Razorpay Checkout**: Seamless subscription activation at **₹200/month** (20,000 paise) with server-side order generation and cryptographic HMAC-SHA256 signature verification.

---

## 🔄 Pipeline and Data Flows

### A. Optical Camera & Document Scan Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Investigator
    participant UI as CameraScanner.jsx (Next.js)
    participant API as scanController.js (Express)
    participant Textract as Amazon Textract
    participant Bedrock as AWS Bedrock (DeepSeek V3.2)
    participant Mongo as MongoDB Atlas

    User->>UI: Points camera & captures document
    UI->>UI: Draws snapshot to canvas (1280x720 / 0.92 JPEG)
    UI->>API: POST /api/scan (Multipart Form: image buffer)
    API->>API: Validates MIME (JPG/PNG) & Size (<5MB)
    API->>API: Checks user tier (trial limit <= 2)
    API->>Textract: DetectDocumentTextCommand(Bytes: buffer)
    Textract-->>API: Blocks [LINE, WORD] + Confidence Scores
    alt No Text Detected (LINE count === 0)
        API-->>UI: HTTP 400 { success: false, message: "No readable text was detected." }
        UI-->>User: Displays helpful repositioning banner (no crash)
    else Legible Text Found
        API->>API: Joins LINE blocks & calculates average OCR confidence
        API->>Bedrock: factCheckWithAI(extractedText)
        Bedrock-->>API: Validated JSON Dossier (Verdict, Evidence, Tactics)
        API->>Mongo: FactCheck.create(type: "scan", extractedText, verdict)
        API-->>UI: HTTP 200 { success: true, data: dossier }
        UI-->>User: Renders full Forensic Dossier & Verdict
    end
```

### B. User Authentication & Background OTP Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Frontend as Next.js Frontend
    participant Backend as Express API Server
    participant Redis as Upstash Redis
    participant Queue as BullMQ ('email-dispatch')
    participant Worker as emailWorker.js
    participant Brevo as Brevo SMTP

    User->>Frontend: Enters Registration Details
    Frontend->>Backend: POST /api/auth/register
    Backend->>Backend: Hashes password (bcryptjs salt 10)
    Backend->>Backend: Generates 6-digit OTP
    Backend->>Redis: SET otp:user@domain.com (TTL: 300s)
    Backend->>Queue: addEmailJob("send-otp", { email, otp })
    Backend-->>Frontend: HTTP 201 "OTP dispatched"
    Queue->>Worker: Worker picks up job
    Worker->>Brevo: Transporter.sendMail()
    Brevo-->>User: OTP email arrives in inbox
    User->>Frontend: Enters OTP code
    Frontend->>Backend: POST /api/auth/verify-otp
    Backend->>Redis: GET otp:user@domain.com
    Backend->>Redis: DEL otp:user@domain.com
    Backend->>Redis: SET refresh:tokenId (TTL: 7d)
    Backend-->>Frontend: HTTP 200 + AccessToken (JSON) + RefreshToken (httpOnly Cookie)
```

---

## 💻 Tech Stack Summary

| Layer | Technology | Key Details |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Turbopack, React 19, Lucide Icons, Canvas Viewfinder |
| **Styling** | Vanilla CSS + Tailwind | Custom Neo-Brutalist design system (hard shadows, high contrast) |
| **Backend Framework** | Express.js 5.2 | Node.js ES Modules, Cookie-Parser, Multer Memory Storage |
| **Database** | MongoDB Atlas & Mongoose 9 | Relational-style document schemas for Users, FactChecks, and Payments |
| **Caching & Storage** | Upstash Redis & `ioredis` | TLS-encrypted session tracking, token blacklisting, and news cache |
| **Task Queue** | BullMQ 6 | Asynchronous background job processing with decoupled worker |
| **AI Foundation Model** | AWS Bedrock (`deepseek.v3.2`) | Structured system prompt returning schema-validated forensic dossiers |
| **OCR Service** | Amazon Textract | Server-side image decoding extracting `LINE` text blocks |
| **Payment Gateway** | Razorpay Node.js SDK | ₹200.00 / month recurring subscription checkout & HMAC webhooks |
| **Transactional Email** | Nodemailer & Brevo SMTP | High-deliverability HTML templates for account clearance OTPs |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance or free MongoDB Atlas URI
- **Redis**: Local Redis or free Upstash Redis instance
- **AWS Credentials**: IAM user with `AmazonTextractFullAccess` and `AmazonBedrockFullAccess`

---

### Step 1: Clone Repository
```bash
git clone https://github.com/ashutosh231/TruthScanAI-V2.git
cd TruthScanAI-V2
```

---

### Step 2: Backend Configuration & Startup

```bash
cd backend
npm install
```

Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/TruthScanAI
REDIS_URL=rediss://default:<password>@<host>.upstash.io:6379

JWT_ACCESS_SECRET=your_32_character_access_secret_key_here
JWT_REFRESH_SECRET=your_32_character_refresh_secret_key_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_login
SMTP_PASS=your_brevo_smtp_password
EMAIL_FROM=verified_sender@yourdomain.com

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
BEDROCK_MODEL_ID=deepseek.v3.2

NEWSAPI_AI_KEY=your_newsapi_org_key
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_key
```

Run the Express API server:
```bash
npm run dev
# Server running at http://localhost:5000 (API Base: http://localhost:5000/api)
```

In a separate terminal, launch the BullMQ Email Worker:
```bash
cd backend
npm run worker
# [Worker] Starting TruthScan AI Email Worker on queue: 'email-dispatch'...
```

---

### Step 3: Frontend Configuration & Startup

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the Next.js development server:
```bash
npm run dev
# Frontend running at http://localhost:3000
```

---

## 🌐 Production Deployment Architecture

```text
FRONTEND:
Next.js 16 App ──▶ Vercel (Root: frontend)

BACKEND API:
Express.js API ──▶ Render Web Service #1 (Root: backend, Start: npm start)

BACKGROUND WORKER:
BullMQ Worker  ──▶ Render Web Service #2 (Root: backend, Start: npm run worker)

PERSISTENCE:
Database       ──▶ MongoDB Atlas (IP: 0.0.0.0/0 allowed)
Cache & Queue  ──▶ Upstash Redis (TLS rediss://)
AI & OCR       ──▶ AWS Bedrock + Amazon Textract
Transactional  ──▶ Brevo SMTP
Payments       ──▶ Razorpay (Webhook: https://YOUR-API.onrender.com/api/payments/webhook)
```

### 1. Vercel Deployment (Frontend)
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://truthscan-backend.onrender.com/api`

### 2. Render Web Service #1 (Express Backend)
- **Name**: `truthscan-backend`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Key Environment Variables**:
  - `NODE_ENV`: `production`
  - `CLIENT_URL`: `https://truthscan-frontend.vercel.app`
  - `MONGO_URI`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AWS_*`, `RAZORPAY_*`

### 3. Render Web Service #2 (BullMQ Worker)
- **Name**: `truthscan-worker`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm run worker`
- **Health Check Path**: `/health` *(served via the lightweight internal health server on `$PORT`)*
- **Key Environment Variables**:
  - `NODE_ENV`: `production`
  - `REDIS_URL`: *(Identical Upstash instance as Backend)*
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Clearance |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & enqueue Brevo OTP | Public |
| `POST` | `/api/auth/send-otp` | Request or resend 6-digit OTP code | Public |
| `POST` | `/api/auth/verify-otp` | Verify OTP, issue JWT + httpOnly cookie | Public |
| `POST` | `/api/auth/login` | Email/password login & session cookie | Public |
| `POST` | `/api/auth/refresh` | Silently refresh access token via cookie | Public (Cookie) |
| `POST` | `/api/auth/logout` | Revoke session in Redis & clear cookie | Authenticated |

### 📷 Optical Character Recognition (`/api/scan`)
| Method | Endpoint | Description | Clearance |
|---|---|---|---|
| `POST` | `/api/scan` | Upload image, run Textract OCR & DeepSeek V3.2 | Authenticated |

### 🔍 Fact-Checking (`/api/fact-check`)
| Method | Endpoint | Description | Clearance |
|---|---|---|---|
| `POST` | `/api/fact-check` | Verify text statement or claim | Authenticated |
| `POST` | `/api/fact-check/url` | Scrape and analyze article URL | Authenticated |
| `POST` | `/api/fact-check/file` | Analyze uploaded document (`.pdf`, `.txt`) | Authenticated |
| `GET` | `/api/fact-check/history` | Retrieve user fact-check audit dossiers | Authenticated |

### 📰 Live News (`/api/news`)
| Method | Endpoint | Description | Clearance |
|---|---|---|---|
| `GET` | `/api/news` | Get syndicated news wire (with Redis cache) | Public |
| `GET` | `/api/news/categories` | Get supported news categories | Public |

### 💳 Payments & Subscriptions (`/api/payments`)
| Method | Endpoint | Description | Clearance |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Create Razorpay order (₹200 / month) | Authenticated |
| `POST` | `/api/payments/verify` | Verify Razorpay payment signature | Authenticated |
| `POST` | `/api/payments/webhook` | Handle asynchronous Razorpay webhooks | Public (HMAC Verified) |

### 🩺 System Health (`/api/health`)
| Method | Endpoint | Description | Clearance |
|---|---|---|---|
| `GET` | `/api/health` | Service uptime and heartbeat status | Public |

---

## 🔒 Security Best Practices Implemented

- **No Secret Leakage**: All `.env` and `.env.local` files are strictly excluded from git.
- **Cross-Site Cookie Isolation**: `SameSite=None; Secure=True; HttpOnly=True` ensures cookies cannot be read by JavaScript (mitigating XSS) while allowing cross-domain communication between Vercel and Render.
- **Strict CORS Policy**: Disallows wildcard `*` with credentials; strictly validates `origin === CLIENT_URL`.
- **In-Memory File Processing**: File uploads never write to the local server disk in production, preventing filesystem clutter and remote code execution vulnerabilities.
- **Cryptographic Signatures**: Webhook payloads are verified using SHA-256 HMAC digest validation against the raw request buffer.
- **Production Error Masking**: `NODE_ENV=production` strips call stacks and database errors from API responses.

---

## 📄 License
TruthScan AI is open-source software licensed under the **MIT License**.
