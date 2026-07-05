# V.O.I.C.E. AI: Municipal Citizen Grievance Analytics Dashboard 🏛️🗣️
## 🌐 Live Demo URL
👉 [Click here to view the Live Prototype App](https://v-o-i-c-e-ai-municipal-citizen-grievance-analytic-16396859728.asia-southeast1.run.app)

🚀 **Voice-Optimized Ingestion & Cognitive Extraction (V.O.I.C.E.) Platform** is a highly modern, production-grade analytics suite engineered specifically for the **Madurai Municipal Corporation**. It acts as a cognitive gateway, transforming unstructured, multilingual, and spoken regional dialect citizen complaints (mixes of Tamil, English, and regional colloquialisms) into structured, prioritized, and sanitized records optimized for GIS dispatch and BigQuery pipeline analytics.

---

## 🌟 Project Overview & Target Solution

In major municipal corporations like Madurai, traditional grievance registration systems (such as online forms or rigid interactive voice response systems) fail to capture the urgent needs of a diverse, mobile, and dialect-dependent population. Often, citizens dictate issues in a hybrid language format (*"Mattuthavani entrance road-la severe pothole collapse. Accidents block risk very high..."*) containing critical geographical clues, varying distress parameters, and private confidential information (PII).

**V.O.I.C.E. AI** bridges this gap through a unified processing system:
* **Target Audience:** Madurai Municipal administrative operators, zone officers, and city GIS dispatch dispatchers.
* **Problem Solved:** Eradicates the manual labor of categorizing unstructured, multilingual voice and text complaints, dynamically masking sensitive private citizen info, and providing real-time data streaming indicators.
* **Geographical Mapping:** Full zone tracking specifically integrated around Madurai's key hubs: *Mattuthavani, Periyar, Goripalayam, Arappalayam, and Anna Nagar*.

---

## 🛠️ Core Technical Architecture & Tech Stack

```
 ┌──────────────────────┐      ┌────────────────────────┐      ┌─────────────────────────┐
 │   Citizen Input      │ ───> │  V.O.I.C.E. AI Engine  │ ───> │  Secure Cloud Analytics │
 │ (Tamil/Eng Dialects) │      │ (PII Scrub/Translation)│      │  (BigQuery & GIS Maps)  │
 └──────────────────────┘      └────────────────────────┘      └─────────────────────────┘
```

The application leverages a robust full-stack architecture ensuring speed, precision, and enterprise compliance:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Tailwind CSS v4, Motion | Highly modern corporate slate theme, fluid voice-wave equalizers, and real-time dashboard telemetry. |
| **Parsing & LLM** | Google Gemini API (Gemini Pro) | Multilingual translation, sentiment parsing, and municipal category classification. |
| **PII Protection** | Python-style Regex Processing | Automated scrubbing of phone numbers, emails, and address fragments prior to storage. |
| **Data Warehouse** | Google BigQuery | Standardized storage schema with flashing `SUCCESS_LOGGED` telemetry payloads. |
| **Build System** | Vite, Esbuild, Node CJS | Lightweight bundler for fast loading and low container cold-start delay. |

---

## ⚡ Main Core Features

### 1. Unstructured Code-Mix Dialect Parsing
Processes raw spoken citizen audio transcripts and texts that interlace Tamil words and English phonetics. V.O.I.C.E. AI interprets context, extracts core complaints, and outputs pristine English translations.

### 2. Automatic Zone Mapping & GIS Slicing
Recognizes and parses core location references in Madurai (e.g. *Mattuthavani entrance*, *Goripalayam signal*) to instantly assign the complaint to its appropriate administrative zone bounds.

### 3. PII Masking & Privacy Scrubbing
Enterprise-grade compliance module that filters telephone numbers, mobile codes (e.g. `+91`), or system credentials, replacing them with standard confidential tokens (`[REDACTED_PHONE_NUMBER_CONFIDENTIAL]`).

### 4. Real-time Telemetry & Ingestion Dashboard
An immersive corporate layout tracking key metrics:
* **Total Grievances Logged**
* **Critical Actions Required**
* **PII Safeguard Status**
* **BigQuery Sync Backlog Lag**

---

## 🚀 Step-by-Step Installation & Local Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* **Google Gemini API Key** (Configured in your environment)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/voice-ai-municipal-dashboard.git
cd voice-ai-municipal-dashboard
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Google Gemini Credentials
GEMINI_API_KEY="your_gemini_api_key_here"

# App URL Configuration
APP_URL="http://localhost:3000"
```

### 3. Install Dependencies
Install all production and devDependencies specified in the manifest:
```bash
npm install
```

### 4. Run the Development Server
Launch the local Express-Vite development server (mapped to port 3000):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

### 5. Build for Production
To bundle and compile the server code into an optimized bundle:
```bash
npm run build
npm start
```

---

## 🏛️ Madurai Corporation Governance Alignment
This system is designed in compliance with modern smart city mandates, matching administrative workflows for localized action units:
* 🚧 **Roads & Highways:** Mattuthavani Zone road maintenance crews.
* 🧹 **Sanitation & Waste:** Swachh Bharat municipal cleaning coordinators.
* ⚡ **Electrical:** Streetlight grid inspectors.
* 💧 **Water Supply:** Engineering division distribution units.

---

*Engineered by **V.O.I.C.E. AI Systems** for the Madurai Municipal Corporation Smart City Hub.*
