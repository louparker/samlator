#!/bin/bash
# Script to prepare certificates for environment variables
# This script reads the certificate files and formats them for use in .env file

# Check if certificates exist
if [ ! -d "certs" ]; then
  echo "Error: Certificate directory not found. Run generate-certificates.sh first."
  exit 1
fi

# Create .env file from example if it doesn't exist
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env file from .env.example"
fi

# Function to format certificate for env var (macOS compatible)
format_cert() {
  awk 'NF {sub(/\r/, ""); printf "%s\\n", $0}' "$1"
}

# Format certificates and keys
SP_SIGNING_CERT=$(format_cert "certs/sp/sp-signing.pem")
SP_SIGNING_KEY=$(format_cert "certs/sp/sp-signing.key")
SP_ENCRYPTION_CERT=$(format_cert "certs/sp/sp-encryption.pem")
SP_ENCRYPTION_KEY=$(format_cert "certs/sp/sp-encryption.key")
IDP_SIGNING_CERT=$(format_cert "certs/idp/idp-signing.pem")
IDP_SIGNING_KEY=$(format_cert "certs/idp/idp-signing.key")

# Create a temporary file with the updated environment variables
cat > .env.tmp << EOF
# Base URL for the application
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com

# SAML Certificates
# SP Signing Certificate
SAML_SP_SIGNING_CERT=${SP_SIGNING_CERT}
# SP Signing Key
SAML_SP_SIGNING_KEY=${SP_SIGNING_KEY}
# SP Encryption Certificate
SAML_SP_ENCRYPTION_CERT=${SP_ENCRYPTION_CERT}
# SP Encryption Key
SAML_SP_ENCRYPTION_KEY=${SP_ENCRYPTION_KEY}
# IdP Signing Certificate
SAML_IDP_SIGNING_CERT=${IDP_SIGNING_CERT}
# IdP Signing Key
SAML_IDP_SIGNING_KEY=${IDP_SIGNING_KEY}
EOF

# Replace the .env file with the temporary file
mv .env.tmp .env

echo "Certificate environment variables prepared in .env file"
echo "For Vercel deployment, copy these values to your Vercel environment variables"
