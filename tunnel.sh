#!/bin/bash

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ngrok is not installed. Please install it first."
    echo "You can install it with: brew install ngrok"
    exit 1
fi

# Check if ngrok is authenticated
if ! ngrok config check 2>/dev/null | grep -q "authtoken"; then
    echo "ngrok is not authenticated. Please enter your authtoken:"
    read -p "Authtoken: " authtoken
    ngrok config add-authtoken "$authtoken"
    
    if [ $? -ne 0 ]; then
        echo "Failed to authenticate ngrok. Please make sure your authtoken is correct."
        echo "You can find your authtoken at https://dashboard.ngrok.com/get-started/your-authtoken"
        exit 1
    fi
    
    echo "ngrok authenticated successfully!"
fi

# Use port 3002 directly since that's where the Next.js server is running
PORT=3002

# Verify that the Next.js server is running on the specified port
if ! curl -s http://localhost:$PORT > /dev/null; then
    echo "Next.js server is not running on port $PORT."
    echo "Starting it..."
    cd "$(dirname "$0")"
    npm run dev &
    # Wait for the server to start
    sleep 5
fi

# Start ngrok tunnel
echo "Starting ngrok tunnel to http://localhost:$PORT..."
echo "IMPORTANT: After ngrok starts, copy the https URL and use it to configure your IdP."
echo "Your SAMLator metadata URL will be: https://YOUR_NGROK_DOMAIN/api/saml-metadata?type=sp"

# Run ngrok
ngrok http $PORT
