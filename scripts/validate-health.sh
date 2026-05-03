#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-http://localhost:3000}"

echo "Validating application health at ${APP_URL}/api/health"
curl -fsS "${APP_URL}/api/health" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s); if(!j.ok) throw new Error("health status is not ok"); console.log(JSON.stringify(j,null,2));})'

echo "Health validation passed."
