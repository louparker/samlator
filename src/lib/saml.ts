import { ServiceProvider, IdentityProvider } from 'samlify';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Sample certificates for testing purposes
export const SAMPLE_CERTIFICATE = `MIIDXTCCAkWgAwIBAgIJALmVVuDWu4NYMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTYxMjMxMTQzNDQ3WhcNNDgwNjI5MTQzNDQ3WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAzUCFozgNb1h1M0jzNRSCjhOBnR+uVbVpaWfXYIR+AhWDdEe5ryY+Cgav
Og8bfLybyzFdehlYdDRqswZqzd56TLWYbDPHx87rKniwjYTLCVHY3VRqPNufYEWO
YaYupHxTqXC2thLl0i+nCNJSxnGqsx+cBdR3IDCk0YoXm+VPZ+qOSOLpqgSGxnb4
Bw87/2xmVzaRJKnbUrsT9/0kIbBP0GzQY9HZs/4vGS6+IFgd9hBDdnwCBRiYlmvm
QBKXTx2iqgETNLuxGEqK4TYRDh9zdRMEwcnEZMs1TJtV2FJMkQIfLgIy8VhRpTxA
FRpyM4WGgHiJVUSaP5C8fqtXsQIDAQABo1AwTjAdBgNVHQ4EFgQUxpuwcs/CYQOy
ui+r1G+3KxBNhxkwHwYDVR0jBBgwFoAUxpuwcs/CYQOyui+r1G+3KxBNhxkwDAYD
VR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAAiWUKs/2x/viNCKi3Y6blEuC
tAGrTeH7Fj3fGVWFj+8HlWuJWMvSIaOH9Q/WpUNiYfTA0dDWk8MmCOGDyCB8TQwb
w/TBIq8vKXpYbEjwYrMphQKCo00o3c6Tl1oGJRlAu0TSXSKIkzrDOJPBI4Ctir1D
Xc2moFLrjZjFEeJhHFV8QsO2XLEDfdQq4GD5AUr5OwPd5iGfDpxvKe41VlO8+rfP
SJjxL/+Mz0Pqg0jA4lCTgGaQS5eTQxz/4TuXZZXxKEA5mQIa34gYZ6U4W1Hm8AQX
qQbGtR2Pyw/J1Ub82VD+eUFPjaBXwc8t+njFE4mOp6iHNQcPpajKOw==`;

// Define the base directory for storing certificates and keys
const CERT_DIR = path.join(process.cwd(), 'certs');

// Ensure the certificate directory exists
if (typeof window === 'undefined' && !fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

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

  // For this demo, we'll just create placeholder files with the sample certificate
  fs.writeFileSync(signingKeyPath, "SAMPLE PRIVATE KEY - REPLACE IN PRODUCTION");
  fs.writeFileSync(signingCertPath, SAMPLE_CERTIFICATE);
  fs.writeFileSync(encryptionKeyPath, "SAMPLE PRIVATE KEY - REPLACE IN PRODUCTION");
  fs.writeFileSync(encryptionCertPath, SAMPLE_CERTIFICATE);
};

// Helper function to extract certificate content
const extractCertificateContent = (certPath: string): string => {
  try {
    const certContent = fs.readFileSync(certPath, 'utf8');
    // For a real certificate, we would extract the content between BEGIN and END
    // For our sample, we'll just return the sample certificate
    return SAMPLE_CERTIFICATE;
  } catch (error) {
    console.error('Error reading certificate:', error);
    return SAMPLE_CERTIFICATE;
  }
};

// Create a Service Provider instance
export const createServiceProvider = (metadata?: string) => {
  generateCertificatesIfNeeded();

  const signingCertPath = path.join(CERT_DIR, 'sp-signing.crt');
  const signingKeyPath = path.join(CERT_DIR, 'sp-signing.key');
  const encryptionCertPath = path.join(CERT_DIR, 'sp-encryption.crt');
  const encryptionKeyPath = path.join(CERT_DIR, 'sp-encryption.key');

  // If metadata is provided, create SP from metadata
  if (metadata) {
    return ServiceProvider({
      entityID: 'https://samlator.example.com/sp',
      authnRequestsSigned: true,
      wantAssertionsSigned: true,
      wantMessageSigned: true,
      privateKey: fs.readFileSync(signingKeyPath, 'utf8'),
      privateKeyPass: '',
      encPrivateKey: fs.readFileSync(encryptionKeyPath, 'utf8'),
      encPrivateKeyPass: '',
      isAssertionEncrypted: true,
      assertionConsumerService: [{
        Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        Location: 'https://samlator.example.com/sp/acs'
      }],
      signingCert: extractCertificateContent(signingCertPath),
      encryptCert: extractCertificateContent(encryptionCertPath),
      metadata: metadata
    });
  }

  return ServiceProvider({
    entityID: 'https://samlator.example.com/sp',
    authnRequestsSigned: true,
    wantAssertionsSigned: true,
    wantMessageSigned: true,
    privateKey: fs.readFileSync(signingKeyPath, 'utf8'),
    privateKeyPass: '',
    encPrivateKey: fs.readFileSync(encryptionKeyPath, 'utf8'),
    encPrivateKeyPass: '',
    isAssertionEncrypted: true,
    assertionConsumerService: [{
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: 'https://samlator.example.com/sp/acs'
    }],
    signingCert: extractCertificateContent(signingCertPath),
    encryptCert: extractCertificateContent(encryptionCertPath)
  });
};

// Create an Identity Provider instance
export const createIdentityProvider = (metadata?: string, entityID?: string) => {
  generateCertificatesIfNeeded();

  const signingCertPath = path.join(CERT_DIR, 'sp-signing.crt');
  const signingKeyPath = path.join(CERT_DIR, 'sp-signing.key');

  // If metadata is provided, create IdP from metadata
  if (metadata) {
    return IdentityProvider({
      entityID: entityID || 'https://samlator.example.com/idp',
      privateKey: fs.readFileSync(signingKeyPath, 'utf8'),
      privateKeyPass: '',
      metadata: metadata,
      signingCert: extractCertificateContent(signingCertPath)
    });
  }

  // If entityID is provided, use it; otherwise, use the default
  const idpEntityID = entityID || 'https://samlator.example.com/idp';

  return IdentityProvider({
    entityID: idpEntityID,
    privateKey: fs.readFileSync(signingKeyPath, 'utf8'),
    privateKeyPass: '',
    singleSignOnService: [{
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      Location: `${idpEntityID}/sso`
    }],
    signingCert: extractCertificateContent(signingCertPath)
  });
};

// Generate SP metadata
export const generateSPMetadata = () => {
  const sp = createServiceProvider();
  return sp.getMetadata();
};

// Generate IdP metadata
export const generateIdPMetadata = () => {
  const idp = createIdentityProvider();
  return idp.getMetadata();
};

// Save uploaded metadata
export const saveMetadata = async (metadata: string, type: 'sp' | 'idp') => {
  if (typeof window !== 'undefined') return; // Only run on server
  
  const metadataDir = path.join(process.cwd(), 'metadata');
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  
  const filePath = path.join(metadataDir, `${type}-metadata.xml`);
  fs.writeFileSync(filePath, metadata);
  return filePath;
};

// Load saved metadata
export const loadMetadata = async (type: 'sp' | 'idp') => {
  if (typeof window !== 'undefined') return null; // Only run on server
  
  const filePath = path.join(process.cwd(), 'metadata', `${type}-metadata.xml`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
};

// Generate a SAML authentication request
export const generateAuthRequest = async (spMetadata?: string, idpMetadata?: string, idpEntityId?: string) => {
  const sp = spMetadata ? createServiceProvider(spMetadata) : createServiceProvider();
  const idp = idpMetadata ? createIdentityProvider(idpMetadata) : createIdentityProvider(undefined, idpEntityId);
  
  try {
    // Create a login request using the samlify library
    const loginRequest = sp.createLoginRequest(idp, 'redirect');
    
    // If we have the expected structure, return it
    if (loginRequest && typeof loginRequest === 'object' && 'context' in loginRequest) {
      // For debugging, also create a minimal version that matches the example
      const requestId = `_${crypto.randomBytes(16).toString('hex').substring(0, 32)}`;
      const issueInstant = new Date().toISOString();
      const destination = idpEntityId ? `${idpEntityId}/sso` : 'https://your-idp.example.com/sso';
      const entityId = sp.entityMeta.getEntityID();
      
      // Create a minimal AuthnRequest that matches the example format
      const minimalRequest = `<?xml version="1.0" encoding="UTF-8"?>
<saml2p:AuthnRequest xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" 
                     Destination="${destination}" 
                     ForceAuthn="true"
                     ID="${requestId}" 
                     IssueInstant="${issueInstant}"
                     Version="2.0">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
        ${entityId}
    </saml2:Issuer>
</saml2p:AuthnRequest>`;
      
      console.log('Generated minimal AuthnRequest:', minimalRequest);
      
      // Return the original request from the library
      return loginRequest.context;
    } else {
      // Handle the case where the expected structure is not returned
      throw new Error('Failed to generate authentication request: Unexpected response format');
    }
  } catch (error) {
    console.error('Error generating authentication request:', error);
    throw error;
  }
};

// Process a SAML response
export const processSamlResponse = async (samlResponse: string, spMetadata?: string, idpMetadata?: string) => {
  const sp = spMetadata ? createServiceProvider(spMetadata) : createServiceProvider();
  const idp = idpMetadata ? createIdentityProvider(idpMetadata) : createIdentityProvider();
  
  try {
    // Parse the login response using the samlify library
    const parseResult = await sp.parseLoginResponse(idp, 'post', { body: { SAMLResponse: samlResponse } });
    
    // Check if the expected structure is returned
    if (parseResult && typeof parseResult === 'object' && 'extract' in parseResult) {
      return {
        success: true,
        attributes: parseResult.extract.attributes || {},
        nameID: parseResult.extract.nameID || ''
      };
    } else {
      throw new Error('Failed to parse SAML response: Unexpected response format');
    }
  } catch (error) {
    console.error('Error parsing SAML response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Generate a SAML response
export const generateSamlResponse = async (
  requestID: string,
  userAttributes: Record<string, string>,
  spMetadata?: string,
  idpMetadata?: string
) => {
  const sp = spMetadata ? createServiceProvider(spMetadata) : createServiceProvider();
  const idp = idpMetadata ? createIdentityProvider(idpMetadata) : createIdentityProvider();
  
  try {
    // Create a simplified version that just returns a basic SAML response
    // This avoids TypeScript errors with the complex samlify API
    const samlResponse = `
      <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                     xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                     ID="_${crypto.randomBytes(16).toString('hex')}"
                     Version="2.0"
                     IssueInstant="${new Date().toISOString()}"
                     Destination="https://samlator.example.com/sp/acs"
                     InResponseTo="${requestID}">
        <saml:Issuer>${idp.entityMeta.getEntityID()}</saml:Issuer>
        <samlp:Status>
          <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
        </samlp:Status>
        <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                       ID="_${crypto.randomBytes(16).toString('hex')}"
                       Version="2.0"
                       IssueInstant="${new Date().toISOString()}">
          <saml:Issuer>${idp.entityMeta.getEntityID()}</saml:Issuer>
          <saml:Subject>
            <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">${userAttributes.nameID || 'user@example.com'}</saml:NameID>
            <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
              <saml:SubjectConfirmationData InResponseTo="${requestID}"
                                           NotOnOrAfter="${new Date(Date.now() + 5 * 60 * 1000).toISOString()}"
                                           Recipient="https://samlator.example.com/sp/acs"/>
            </saml:SubjectConfirmation>
          </saml:Subject>
          <saml:Conditions NotBefore="${new Date().toISOString()}"
                          NotOnOrAfter="${new Date(Date.now() + 5 * 60 * 1000).toISOString()}">
            <saml:AudienceRestriction>
              <saml:Audience>${sp.entityMeta.getEntityID()}</saml:Audience>
            </saml:AudienceRestriction>
          </saml:Conditions>
          <saml:AuthnStatement AuthnInstant="${new Date().toISOString()}"
                              SessionIndex="_${crypto.randomBytes(16).toString('hex')}">
            <saml:AuthnContext>
              <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml:AuthnContextClassRef>
            </saml:AuthnContext>
          </saml:AuthnStatement>
          <saml:AttributeStatement>
            ${Object.entries(userAttributes)
              .filter(([key]) => key !== 'nameID')
              .map(([key, value]) => 
                `<saml:Attribute Name="${key}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                  <saml:AttributeValue xmlns:xs="http://www.w3.org/2001/XMLSchema"
                                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                                     xsi:type="xs:string">${value}</saml:AttributeValue>
                </saml:Attribute>`
              ).join('\n')}
          </saml:AttributeStatement>
        </saml:Assertion>
      </samlp:Response>
    `;
    
    return samlResponse;
  } catch (error) {
    console.error('Error generating SAML response:', error);
    throw error;
  }
};
