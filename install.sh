#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo "   Direct Hosting Auto-Installer (Node.js App)"
echo "=================================================="

# 1. Check Node.js >= 18
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed. Please install Node.js 18 or newer first."
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "[ERROR] Node.js v18+ is required. Current version: $(node -v)"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm is not installed. Please install npm first."
  exit 1
fi

echo "[OK] Node.js $(node -v) detected."

# 2. Ensure writable data directory
mkdir -p data
chmod 755 data
echo "[OK] Data directory ready (./data)."

# 3. Auto-create production .env with strong random SESSION_SECRET if missing
if [ ! -f .env ]; then
  GENERATED_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat > .env <<EOF
NODE_ENV="production"
PORT="3000"
APP_URL="http://localhost:3000"
SESSION_SECRET="${GENERATED_SECRET}"
FORCE_INSTALL_REDIRECT="true"
SUPPORT_MAX_UPLOAD_MB="5"
EOF
  chmod 600 .env
  echo "[OK] Created .env with a secure random SESSION_SECRET (chmod 600)."
else
  echo "[OK] Existing .env found — keeping your current environment settings."
fi

# 4. Install dependencies & build production bundle
echo "[...] Installing dependencies..."
npm install --legacy-peer-deps --no-audit --no-fund

echo "[...] Building frontend and production server..."
npm run build

# 5. Start with PM2 if available, otherwise display direct start command
if command -v pm2 >/dev/null 2>&1; then
  echo "[...] Starting application via PM2..."
  pm2 start ecosystem.config.cjs --update-env
  pm2 save || true
  echo ""
  echo "=================================================="
  echo "  INSTALL READY! Open your browser and visit:"
  echo "  http://YOUR-DOMAIN-OR-IP:3000/install"
  echo "=================================================="
else
  echo ""
  echo "=================================================="
  echo "  BUILD COMPLETE!"
  echo "  Start the server with:  npm start"
  echo "  (or install PM2: npm i -g pm2 && pm2 start ecosystem.config.cjs)"
  echo "  Then open in browser:   http://YOUR-DOMAIN-OR-IP:3000/install"
  echo "=================================================="
fi
