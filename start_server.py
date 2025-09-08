#!/usr/bin/env python3

import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the Flask app
from app import app

if __name__ == '__main__':
    print("🚀 Starting QueryBox AI Backend Server...")
    print("🌐 Server will be available at: http://127.0.0.1:8000")
    print("🏥 Health check: http://127.0.0.1:8000/health")
    print("⏹️  Press Ctrl+C to stop")
    print("-" * 50)
    
    # Start the Flask app
    app.run(
        host='127.0.0.1',
        port=8000,
        debug=True,
        use_reloader=False  # Disable reloader to avoid issues
    )
