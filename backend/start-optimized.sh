#!/bin/bash

echo "🚀 Starting Optimized Backend Server..."

# Check if Redis is running
echo "📊 Checking Redis connection..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Starting Redis..."
    if command -v brew > /dev/null; then
        # macOS
        brew services start redis
    elif command -v systemctl > /dev/null; then
        # Linux with systemd
        sudo systemctl start redis-server
    else
        echo "❌ Redis not found. Please install Redis first:"
        echo "   macOS: brew install redis"
        echo "   Ubuntu: sudo apt-get install redis-server"
        exit 1
    fi
    sleep 2
fi

echo "✅ Redis is running"

# Check if MongoDB is accessible
echo "🗄️  Checking MongoDB connection..."
if ! node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://influencer-market:1111111@cluster0.udo3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { 
  serverSelectionTimeoutMS: 5000 
}).then(() => {
  console.log('MongoDB connected');
  process.exit(0);
}).catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});
" > /dev/null 2>&1; then
    echo "❌ MongoDB connection failed. Please check your MONGO_URI environment variable."
    exit 1
fi

echo "✅ MongoDB is accessible"

# Set environment variables for optimization
export NODE_ENV=production
export ENABLE_PERFORMANCE_MONITORING=true
export LOG_SLOW_QUERIES=true
export SLOW_QUERY_THRESHOLD=500

echo "🔧 Environment configured for performance"

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Start the optimized server
echo "🚀 Starting optimized server..."
echo "📊 Performance monitoring: ENABLED"
echo "🗄️  Database optimization: ENABLED"
echo "💾 Redis caching: ENABLED"
echo "📈 Rate limiting: ENABLED"
echo "🔒 Security headers: ENABLED"

npm start
