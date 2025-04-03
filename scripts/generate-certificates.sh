#!/bin/bash
# Script to generate SAML certificates for SAMLator
# This script generates:
# 1. A root CA certificate
# 2. Service Provider (SP) signing and encryption certificates
# 3. Identity Provider (IdP) signing certificate

# Create directories for certificates
mkdir -p certs/ca
mkdir -p certs/sp
mkdir -p certs/idp

# Set variables
DOMAIN="samlator.example.com"
COUNTRY="US"
STATE="California"
LOCALITY="San Francisco"
ORGANIZATION="SAMLator"
ORGANIZATIONAL_UNIT="Security"
EMAIL="admin@samlator.example.com"
DAYS_VALID=3650  # 10 years

# Generate a private key for the CA
openssl genrsa -out certs/ca/ca.key 4096

# Generate a self-signed CA certificate
openssl req -x509 -new -nodes -key certs/ca/ca.key -sha256 -days $DAYS_VALID -out certs/ca/ca.crt \
  -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$DOMAIN CA/emailAddress=$EMAIL"

echo "CA certificate generated."

# Function to generate a certificate signed by our CA
generate_cert() {
  NAME=$1
  CN=$2
  DIR=$3

  # Generate a private key
  openssl genrsa -out certs/$DIR/$NAME.key 2048

  # Create a certificate signing request (CSR)
  openssl req -new -key certs/$DIR/$NAME.key -out certs/$DIR/$NAME.csr \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$CN/emailAddress=$EMAIL"

  # Create a config file for the certificate
  cat > certs/$DIR/$NAME.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
EOF

  # Generate the certificate using the CSR, CA certificate, CA key, and config file
  openssl x509 -req -in certs/$DIR/$NAME.csr -CA certs/ca/ca.crt -CAkey certs/ca/ca.key \
    -CAcreateserial -out certs/$DIR/$NAME.crt -days $DAYS_VALID -sha256 \
    -extfile certs/$DIR/$NAME.ext

  # Convert to PEM format (base64)
  openssl x509 -in certs/$DIR/$NAME.crt -out certs/$DIR/$NAME.pem -outform PEM

  # Clean up temporary files
  rm certs/$DIR/$NAME.csr certs/$DIR/$NAME.ext

  echo "$NAME certificate generated."
}

# Generate SP signing certificate
generate_cert "sp-signing" "$DOMAIN SP Signing" "sp"

# Generate SP encryption certificate
generate_cert "sp-encryption" "$DOMAIN SP Encryption" "sp"

# Generate IdP signing certificate
generate_cert "idp-signing" "$DOMAIN IdP Signing" "idp"

echo "All certificates generated successfully!"
echo "Certificates are stored in the 'certs' directory."
