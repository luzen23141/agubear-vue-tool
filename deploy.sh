#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Build the project
echo "📦 Building project..."
npm run build

echo "✅ Build successful!"
echo "NOTE: This is a simulation. In a real environment, this would push to gh-pages or similar."
