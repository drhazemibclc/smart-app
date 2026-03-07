#!/bin/bash

# Postman Testing Setup Script
# This script helps you set up Postman testing for your app

set -e

echo "🚀 Postman Testing Setup"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Newman is installed
echo "📦 Checking dependencies..."
if ! command -v newman &> /dev/null; then
    echo -e "${YELLOW}Newman not found. Installing...${NC}"
    npm install -g newman newman-reporter-htmlextra
    echo -e "${GREEN}✓ Newman installed${NC}"
else
    echo -e "${GREEN}✓ Newman is already installed${NC}"
fi

# Check if dev server is running
echo ""
echo "🔍 Checking if dev server is running..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dev server is running${NC}"
else
    echo -e "${RED}✗ Dev server is not running${NC}"
    echo -e "${YELLOW}Please start your dev server in another terminal:${NC}"
    echo "  npm run dev"
    echo ""
    read -p "Press Enter when dev server is ready..."
fi

# Generate collection
echo ""
echo "📝 Generating Postman collection..."
npm run generate:postman
echo -e "${GREEN}✓ Collection generated${NC}"

# Create test-reports directory
echo ""
echo "📁 Creating test-reports directory..."
mkdir -p test-reports
echo -e "${GREEN}✓ Directory created${NC}"

# Run tests
echo ""
echo "🧪 Running tests..."
echo ""
npm run test:postman

# Generate HTML report
echo ""
echo "📊 Generating HTML report..."
npm run test:postman:report

# Open report
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "📄 Test report generated at: test-reports/postman-report.html"
echo ""
echo "Next steps:"
echo "  1. Open test-reports/postman-report.html in your browser"
echo "  2. Import .postman/collections/pediatric-clinic-medical.json to Postman Desktop"
echo "  3. Import .postman/environments/local.json to Postman Desktop"
echo "  4. Read the full guide: docs/POSTMAN_TESTING_GUIDE.md"
echo ""

# Ask if user wants to open report
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Open HTML report now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open test-reports/postman-report.html
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    read -p "Open HTML report now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open test-reports/postman-report.html
    fi
fi

echo ""
echo "Happy testing! 🎉"
