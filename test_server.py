#!/usr/bin/env python3
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "message": "Test server running"})

if __name__ == '__main__':
    print("🧪 Starting test server on http://127.0.0.1:8000")
    app.run(host='127.0.0.1', port=8000, debug=True)
