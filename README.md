# 🌐 Spectra Agency Funnel & CRM Platform

> A premium, high-converting digital product agency funnel and automated lead CRM platform featuring a protected VSL (Video Sales Letter) streaming engine, multilingual support, and intelligent booking automation.

---

## 🌟 Key Highlights & Capabilities

- **Cyberpunk / Glassmorphism Landing Funnel**: Ultra-refined dark aesthetic, interactive service selector, dynamic slot scheduling, and conversion-optimized flow.
- **Protected VSL Video Player**:
  - **Anti-Download Protection**: Blocks external download managers (**Internet Download Manager - IDM**, FDM, JDownloader, aria2, curl, wget, yt-dlp).
  - **Ephemeral HMAC Stream Tickets**: Media requests require cryptographically signed short-lived tokens generated server-side.
  - **Direct URL & Tab Navigation Blocked**: Prevents opening raw video links in new browser tabs or address bars (`Sec-Fetch-Dest` enforcement).
  - **Anti-Sniffing & Anti-Attachment Headers**: Responses sent with `Content-Disposition: inline; filename="stream.bin"`, `nosniff`, and aggressive `no-store` cache controls.
  - **DOM Overlay Shield & Custom Controls**: Transparent overlay prevents IDM hover buttons from hooking the video element; context menu (`Save video as...`) and inspect shortcuts are completely disabled.
- **Autonomous Lead Management CRM**:
  - Real-time lead tracking with color-coded status badges (`registered`, `reviewing`, `approved`, `refused`, `scheduled`, `met`, `fit`, `unfit`).
  - Interactive lead management actions (detail modal, status update, and lead deletion).
- **Booking & Availability Engine**:
  - Timezone-aware booking engine configured for **Tlemcen, Algeria (GMT+1)** with customizable day rules and time slots.
- **Multilingual Support**: Seamless English, French, and Arabic (`ar-DZ`) interface with complete RTL alignment.
- **Self-Contained Storage & Video Management**: Admin dashboard video upload with chunked byte-range streaming (`HTTP 206 Partial Content`) without third-party cloud lock-in.

---

## 🏗 Monorepo Architecture

```
Spectra-Agency-Funnel/
├── artifacts/
│   ├── api-server/           # Express 5 + TypeScript backend with Drizzle ORM
│   │   ├── src/routes/crm.ts # CRM leads, bookings, public config
│   │   └── src/routes/storage.ts # Protected video streaming & upload handler
│   └── spectra-agency/       # React 19 + Vite + Tailwind CSS frontend
│       ├── src/App.tsx       # Visitor landing page & booking funnel
│       ├── src/pages/admin.tsx # CRM Admin dashboard & video manager
│       └── src/components/ProtectedVideoPlayer.tsx # Custom secure player
├── lib/
│   ├── api-client-react/     # Type-safe React Query API client
│   ├── api-spec/             # OpenAPI 3.1 specification & Orval config
│   ├── api-zod/              # Shared Zod validation schemas
│   └── db/                   # Drizzle ORM schema & PostgreSQL connection
├── pnpm-workspace.yaml       # Monorepo workspace configuration
└── package.json
```

---

## 📋 Prerequisites

Before running or deploying the project, ensure you have:

- **Node.js**: `v20.18.0` or higher (Node `20.x` or `22.x` LTS recommended)
- **Package Manager**: `pnpm` (`v9.x` or `v10.x`)
- **Database**: PostgreSQL `15+` or `16+`

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone git@github.com:Aizen00Rayen/Spectra-Agency-Funnel.git
cd Spectra-Agency-Funnel
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://spectra:spectra@127.0.0.1:5432/spectra
PORT=5000
NODE_ENV=development
BASE_PATH=/
```

### 4. Push Database Schema
Initialize and synchronize the PostgreSQL schema:
```bash
pnpm --filter @workspace/db run push
```

### 5. Start Development Servers
Open two terminal tabs:

**Terminal 1 — API Server:**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend Client:**
```bash
pnpm --filter @workspace/spectra-agency run dev
```

- **Visitor Funnel**: `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5173/admin`
- **Backend API**: `http://localhost:5000/api`

---

## ☁️ Hostinger VPS Deployment Guide (Ubuntu 22.04 / 24.04 LTS)

Follow this end-to-end guide to deploy Spectra Agency Funnel on a fresh Hostinger VPS.

### Step 1: Update Server & Install Core Packages

Connect to your VPS via SSH:
```bash
ssh root@<YOUR_VPS_IP>
```

Update system repositories and install essential tools:
```bash
apt update && apt upgrade -y
apt install -y curl git ufw nginx postgresql postgresql-contrib certbot python3-certbot-nginx
```

---

### Step 2: Install Node.js (v20 LTS) & pnpm

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pnpm pm2
```

Verify installations:
```bash
node -v   # v20.x.x
pnpm -v   # v9.x or v10.x
pm2 -v
```

---

### Step 3: Configure PostgreSQL

Log into PostgreSQL and create the production database and user:
```bash
sudo -u postgres psql
```

Run the following SQL commands:
```sql
CREATE DATABASE spectra;
CREATE USER spectra_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE spectra TO spectra_user;
ALTER DATABASE spectra OWNER TO spectra_user;
\q
```

Grant schema permissions:
```bash
sudo -u postgres psql -d spectra -c "GRANT ALL ON SCHEMA public TO spectra_user;"
```

---

### Step 4: Setup Deployment Directory & Clone Codebase

Create directory and set permissions:
```bash
mkdir -p /var/www/spectra
cd /var/www/spectra
```

Clone the repository:
```bash
git clone git@github.com:Aizen00Rayen/Spectra-Agency-Funnel.git .
```
*(If prompted for SSH access, ensure your VPS public key is added to GitHub Deploy Keys)*

Install project dependencies:
```bash
pnpm install --frozen-lockfile
```

---

### Step 5: Configure Production Environment

Create `/var/www/spectra/.env`:
```bash
cat << 'EOF' > /var/www/spectra/.env
DATABASE_URL=postgresql://spectra_user:YOUR_STRONG_PASSWORD_HERE@127.0.0.1:5432/spectra
PORT=5000
NODE_ENV=production
BASE_PATH=/
STREAM_SECRET=YOUR_RANDOM_LONG_SECRET_KEY_FOR_STREAMING_PROTECTION
EOF
```

Protect the `.env` file:
```bash
chmod 600 /var/www/spectra/.env
```

---

### Step 6: Push Database Schema & Build Applications

Apply database tables:
```bash
pnpm --filter @workspace/db run push
```

Build the frontend and backend:
```bash
# Build shared libraries & client
pnpm --filter @workspace/spectra-agency run build

# Build API server
pnpm --filter @workspace/api-server run build
```

---

### Step 7: Manage Process with PM2

Start the API server (which automatically serves the compiled frontend and API):
```bash
pm2 start "node --enable-source-maps --env-file=.env ./artifacts/api-server/dist/index.mjs" \
  --name "spectra-app" \
  --cwd /var/www/spectra

pm2 save
pm2 startup systemd
```
*(Follow the output command from `pm2 startup` to enable automatic boot on server restart)*

Check logs:
```bash
pm2 logs spectra-app
```

---

### Step 8: Configure Nginx Reverse Proxy

Create an Nginx configuration file:
```bash
nano /etc/nginx/sites-available/spectra.conf
```

Paste the following configuration (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Allow large video file uploads (up to 500MB)
    client_max_body_size 500M;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Video streaming buffer configuration
        proxy_buffering off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

Enable the site and verify syntax:
```bash
ln -s /etc/nginx/sites-available/spectra.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

### Step 9: Configure Firewall & SSL with Let's Encrypt

Configure UFW firewall:
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Obtain a free SSL certificate:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Select the option to automatically redirect HTTP traffic to HTTPS. Certbot will configure SSL renewal cron automatically.

---

## 🔄 Updating Your Production Deployment

When new changes are pushed to GitHub, run this simple update sequence on your VPS:

```bash
cd /var/www/spectra
git pull origin main
pnpm install
pnpm --filter @workspace/spectra-agency run build
pnpm --filter @workspace/api-server run build
pm2 reload spectra-app
```

---

## 🛡️ Security & Video Anti-Download Architecture

The video delivery engine enforces multiple security barriers:

| Layer | Defense Mechanism | Outcome |
|---|---|---|
| **Server User-Agent Filter** | Regex pattern matching `IDM`, `IDMan`, `FDM`, `curl`, `wget`, `aria2`, `yt-dlp` | Returns `403 Forbidden` |
| **Server Header Check** | Checks for download-manager specific headers (`x-idm-*`) | Returns `403 Forbidden` |
| **Direct Tab Access** | Detects `Sec-Fetch-Dest: document` / `navigate` | Returns `403 Forbidden` |
| **HMAC Stream Ticket** | 12-hour signed token bound to file ID | Unticketed requests rejected with `403` |
| **Anti-Attachment Headers** | `Content-Disposition: inline; filename="stream.bin"`, `nosniff`, `no-cache` | Prevents disk save prompts |
| **Frontend Pointer Shield** | Transparent overlay captures clicks, disabling video DOM hover sniffing | IDM hover button cannot attach |
| **UI Context Blocking** | `onContextMenu` disabled, keyboard shortcuts (`Ctrl+S`, `Ctrl+U`) blocked | Right-click save options disabled |

---

## 📄 License

Proprietary — All rights reserved © **Spectra Digital Agency**.
