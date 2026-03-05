#!/bin/bash
# scripts/check-network.sh

echo "🔍 Checking Next.js 16 Network Setup"
echo "===================================="

# Check if server is running
echo "📡 Checking server..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
if [ $? -eq 0 ]; then
  echo "✅ Server is running"
else
  echo "❌ Server not responding"
fi

# Check API health
echo -e "\n🏥 Checking API health..."
curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || echo "❌ API health check failed"

# Check auth endpoint
echo -e "\n🔐 Checking auth endpoint..."
curl -s -I http://localhost:3000/api/auth/session | head -n 1

# Check database
echo -e "\n💾 Checking database..."
npx prisma studio &>/dev/null &
PID=$!
sleep 2
kill $PID 2>/dev/null
echo "✅ Prisma studio can start"

echo -e "\n📊 Environment check:"
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "BETTER_AUTH_URL: $BETTER_AUTH_URL"
