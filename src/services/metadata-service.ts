import * as saml2 from 'saml2-js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Define the base directory for storing certificates and keys
const CERT_DIR = path.join(process.cwd(), 'certs');

// Ensure the certificate directory exists
if (typeof window === 'undefined' && !fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

// Generate a sample certificate for testing purposes
// In a production environment, you would use proper certificates
const SAMPLE_CERTIFICATE = `MIIDazCCAlOgAwIBAgIUOd0ukLcjH43TfGgnl96V0dA94ZAwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNTA0MDMxMjQxMjFaFw0yNjA0
MDMxMjQxMjFaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDK/FdIl4UMeU8XS4ns6/RGX5hSaK8rKrL8xqsLfVZU
nMmJfPrTNtBB8Aai/MkJjxBAZ6PxdVQXw7TvlIcKnQgOugHzQRPYEO/3lKfWcBGD
xJ5Lkr8ydHm+7PbxEUQ+lWOYTnqKESZnNY2vW8j5i5MeW/dxWfVnp/QfPmkWKEnw
F5+80g1GmV/Vw9LKxzfuuWjm/7vLt+uSFR5vhpYJa3+0EB8YkdZJaROV9O2JoRuN
t0K8ZlOPLMJuYpFn8LYtKwTCnTxBfR7+hfq7IQRIl1qP/HuAIXtDFpvjHO+6n1ZN
NvzLlJpfHfWgNKDVbxGftTh/cI0q7g5cZpBLq1KFHfXHAgMBAAGjUzBRMB0GA1Ud
DgQWBBR5yzB/GujpSlLrn0l2p+BslakGZjAfBgNVHSMEGDAWgBR5yzB/GujpSlLr
n0l2p+BslakGZjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCj
TqvcIQnHn1Pik/DSk2S7yzUVYdAfwxvA4R3+mBQf0QnP6TB6fHvtAlGSjhFnUXPz
p1qs7vhLiaSjsJjEjPGnbZ5I8TYgAeWrKvQJGP2mFZf7NxNVWYaKMwBLDlLQMCnG
Rss6zF2yLF0EjWHRe/NS9BdKwIVxkbmDtKDNwO8gV4eMZ8NbL+2jvlzv0FsTKhHE
sCXEfbUc/5CNYpQnVitgSc9LDaZJWTQR5EpVHmtYy8G+FOKyYYFYfSQZ4D6nRRXW
7l/wVb/7MZmcLOokN6jIKJFJqqUFLK1Vwt6Md6DfW6+kqJlN27SfUTMPFDbnmcYE
eVCu0WOkKlQQVZ4K1Pjt`;

// Generate a sample private key for testing purposes
// In a production environment, you would use proper keys
const SAMPLE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDK/FdIl4UMeU8X
S4ns6/RGX5hSaK8rKrL8xqsLfVZUnMmJfPrTNtBB8Aai/MkJjxBAZ6PxdVQXw7Tv
lIcKnQgOugHzQRPYEO/3lKfWcBGDxJ5Lkr8ydHm+7PbxEUQ+lWOYTnqKESZnNY2v
W8j5i5MeW/dxWfVnp/QfPmkWKEnwF5+80g1GmV/Vw9LKxzfuuWjm/7vLt+uSFR5v
hpYJa3+0EB8YkdZJaROV9O2JoRuNt0K8ZlOPLMJuYpFn8LYtKwTCnTxBfR7+hfq7
IQRIl1qP/HuAIXtDFpvjHO+6n1ZNNvzLlJpfHfWgNKDVbxGftTh/cI0q7g5cZpBL
q1KFHfXHAgMBAAECggEAMhFkhtpFOFIoFJgp+zRkRgf+9jqG91nGHmEVF4P2oH2h
Kq1FzMkLmVmeLTNBmCvpnC2VxvuFmBnLxUrZJZ8Z0QlEVLZYYNK3LgsNHsqDT3Qg
ZUrn0FwlctELVpJI+ZgGmK6JDMwIjh5rR9GMnEUYvMZRdaR9+K7NN2jWYqkF4VUK
+/FlyX7kCfk9qQxHWWIrMi3LKZRIzYiHhiZnEuD6xyBEv3rHmRGjEQMdYzUmPWpP
lHxzf6NjOL9JC3yD5kX5n4P5t6SYIpLRFJpjnFUDlfEfJoFtbvGXnNK5I3SQag1I
x8PjQrpGkTmOXHX6Gu+Xd6pT7Lj6PK4VHdSaX/bUOQKBgQD/Fp/uQonMBh1h4Vi4
HlxZdqSOArTdGESXr2pI/BTKFn4drvGY2i7QZuKrjtKsd3JX93OPJULNCksCWO9R
J5SkZbcHLjPEUKVn9Y4gBM/pcrQdwXHKPO7pq/MweZ3890zUVqUQsLHh+xNwxaiO
cpOrGO0QkWFfROQb7uT0CpdMuwKBgQDLnkKlT/7Gk0tLZXkUOyAakNHkHVlAQ1jK
WbKgLQhYvFJHUrSU1pOiCq2ZGgq5MYQRaE5rMvlWt6VasOTc7hfKBPdtWlJWQpEH
nZjIfUhLA9Vy9KIi3Aa9OEz3K8wMQGOAj2fKdIJcJ7pEoXCQwmJFIgHlYEPvDW0Y
6JD5tVMFNQKBgQCLHQVMNhL4xmOHzXRPqzGgUgWULmICJhxnOxmwjRtSiZXltVfD
QLONpMBsNxo0JKmAg5POFEqLvdQKdAHd0qEuAZJzcFxQfIUB4XoJA4h3E8wTDRfX
7sXVEXrKQ8/jP2QLbPPRS060kDGhDRfyxXGXwE3WRHm+JzvDWRzaLOZgOQKBgGaK
+KxbfwbVQzd7F8KCn0gVXfw0GQQmwQnxpFRTIq8Oz9JZ1Jx1Jvd/nSUXdWm9jqsQ
FzAGPVTTF1xCXtTb2xTqjJ7ticEDsXJM+QHjjNvY2CJLdCYLxEjF/bjmIq7K3HjD
yCZXuxQDdghzTjIjsKVpzBSQ+nV52fEw9/RM3YhFAoGBAKllB8iTunbA1ACnvVi6
3j2ZBn1QvQWi68U2jL5WXYz9YfxHRKFKpAEWKBGHf+XBuMtUWnARUCCwHJVheSl3
rLGpNBzyLxLQRbtpJvLRTXPFQhzyGEOgFNpB1/CSG1Ym1IPHOZTMnLIcBQBMPRBs
RZ2Lbd4D4QFdcjVHJlk4p9sH
-----END PRIVATE KEY-----`;

// Generate certificates if they don't exist
export const generateCertificatesIfNeeded = () => {
  if (typeof window !== 'undefined') return; // Only run on server

  const signingKeyPath = path.join(CERT_DIR, 'sp-signing.key');
  const signingCertPath = path.join(CERT_DIR, 'sp-signing.crt');
  const encryptionKeyPath = path.join(CERT_DIR, 'sp-encryption.key');
  const encryptionCertPath = path.join(CERT_DIR, 'sp-encryption.crt');

  // Check if certificates already exist
  if (
    fs.existsSync(signingKeyPath) &&
    fs.existsSync(signingCertPath) &&
    fs.existsSync(encryptionKeyPath) &&
    fs.existsSync(encryptionCertPath)
  ) {
    return;
  }

  // Create signing certificate and key
  fs.writeFileSync(signingKeyPath, SAMPLE_PRIVATE_KEY);
  fs.writeFileSync(signingCertPath, `-----BEGIN CERTIFICATE-----
${SAMPLE_CERTIFICATE}
-----END CERTIFICATE-----`);
  
  // Create encryption certificate and key (using the same sample for simplicity)
  fs.writeFileSync(encryptionKeyPath, SAMPLE_PRIVATE_KEY);
  fs.writeFileSync(encryptionCertPath, `-----BEGIN CERTIFICATE-----
${SAMPLE_CERTIFICATE}
-----END CERTIFICATE-----`);
};

// Generate SP metadata
export const generateSPMetadata = () => {
  generateCertificatesIfNeeded();
  
  // Create metadata XML
  const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" ID="_${crypto.randomBytes(16).toString('hex')}"
                     entityID="https://samlator.example.com/sp">
    <md:SPSSODescriptor AuthnRequestsSigned="true" WantAssertionsSigned="true"
                        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>
                        ${SAMPLE_CERTIFICATE}
                    </ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:KeyDescriptor use="encryption">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>
                        ${SAMPLE_CERTIFICATE}
                    </ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                     Location="https://samlator.example.com/sp/acs" index="0"
                                     isDefault="true"/>
    </md:SPSSODescriptor>
    <md:Organization>
        <md:OrganizationName xml:lang="en">SAMLator</md:OrganizationName>
        <md:OrganizationDisplayName xml:lang="en">SAMLator SAML Testing Tool</md:OrganizationDisplayName>
        <md:OrganizationURL xml:lang="en">https://samlator.example.com</md:OrganizationURL>
    </md:Organization>
</md:EntityDescriptor>`;
  
  return metadata;
};

// Generate IdP metadata
export const generateIdPMetadata = () => {
  generateCertificatesIfNeeded();
  
  // Create metadata XML
  const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" ID="_${crypto.randomBytes(16).toString('hex')}"
                     entityID="https://samlator.example.com/idp">
    <md:IDPSSODescriptor WantAuthnRequestsSigned="true"
                         protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>
                        ${SAMPLE_CERTIFICATE}
                    </ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                                Location="https://samlator.example.com/idp/sso"/>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                                Location="https://samlator.example.com/idp/slo"/>
    </md:IDPSSODescriptor>
    <md:Organization>
        <md:OrganizationName xml:lang="en">SAMLator</md:OrganizationName>
        <md:OrganizationDisplayName xml:lang="en">SAMLator SAML Testing Tool</md:OrganizationDisplayName>
        <md:OrganizationURL xml:lang="en">https://samlator.example.com</md:OrganizationURL>
    </md:Organization>
</md:EntityDescriptor>`;
  
  return metadata;
};
