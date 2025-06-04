#!/bin/bash
# Simple script to serve the site locally

echo "Starting local server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"

# Use Python's built-in HTTP server
if command -v python3 &>/dev/null; then
    python3 -m http.server
elif command -v python &>/dev/null; then
    python -m SimpleHTTPServer
else
    echo "Error: Python is not installed. Please install Python or use another web server."
    exit 1
fi 