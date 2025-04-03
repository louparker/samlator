import * as saml2 from 'saml2-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Function to read certificate and key files
function readCertificates() {
  try {
    // Check if we're running on the server
    if (typeof window !== 'undefined') {
      console.warn('Certificate reading is only available on the server');
      return {
        spSigningCert: '',
        spSigningKey: '',
        spEncryptionCert: '',
        spEncryptionKey: '',
        idpSigningCert: '',
        idpSigningKey: ''
      };
    }

    // Check if environment variables are set for certificates
    if (process.env.SAML_SP_SIGNING_CERT && process.env.SAML_SP_SIGNING_KEY &&
        process.env.SAML_SP_ENCRYPTION_CERT && process.env.SAML_SP_ENCRYPTION_KEY &&
        process.env.SAML_IDP_SIGNING_CERT && process.env.SAML_IDP_SIGNING_KEY) {
      
      console.log('Using certificates from environment variables');
      
      return {
        spSigningCert: process.env.SAML_SP_SIGNING_CERT,
        spSigningKey: process.env.SAML_SP_SIGNING_KEY,
        spEncryptionCert: process.env.SAML_SP_ENCRYPTION_CERT,
        spEncryptionKey: process.env.SAML_SP_ENCRYPTION_KEY,
        idpSigningCert: process.env.SAML_IDP_SIGNING_CERT,
        idpSigningKey: process.env.SAML_IDP_SIGNING_KEY
      };
    }

    // Read certificates from files
    console.log('Reading certificates from files');
    
    const certDir = path.join(process.cwd(), 'certs');
    
    // Read SP certificates
    const spSigningCert = fs.readFileSync(path.join(certDir, 'sp/sp-signing.pem'), 'utf8');
    const spSigningKey = fs.readFileSync(path.join(certDir, 'sp/sp-signing.key'), 'utf8');
    const spEncryptionCert = fs.readFileSync(path.join(certDir, 'sp/sp-encryption.pem'), 'utf8');
    const spEncryptionKey = fs.readFileSync(path.join(certDir, 'sp/sp-encryption.key'), 'utf8');
    
    // Read IdP certificates
    const idpSigningCert = fs.readFileSync(path.join(certDir, 'idp/idp-signing.pem'), 'utf8');
    const idpSigningKey = fs.readFileSync(path.join(certDir, 'idp/idp-signing.key'), 'utf8');
    
    return {
      spSigningCert,
      spSigningKey,
      spEncryptionCert,
      spEncryptionKey,
      idpSigningCert,
      idpSigningKey
    };
  } catch (error) {
    console.error('Error reading certificates:', error);
    throw new Error('Failed to read certificates. Make sure you have generated them using the generate-certificates.sh script.');
  }
}

// Get certificates
let certificates;
try {
  certificates = readCertificates();
} catch (error) {
  console.error('Error initializing certificates:', error);
  // Provide fallback for development/testing only
  certificates = {
    spSigningCert: '',
    spSigningKey: '',
    spEncryptionCert: '',
    spEncryptionKey: '',
    idpSigningCert: '',
    idpSigningKey: ''
  };
}

// Format certificate for use in XML
const formatCertForXml = (cert: string) => {
  return cert
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\n/g, '');
};

// Generate SP metadata
export const generateSPMetadata = () => {
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
                        ${formatCertForXml(certificates.spSigningCert)}
                    </ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:KeyDescriptor use="encryption">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>
                        ${formatCertForXml(certificates.spEncryptionCert)}
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
                        ${formatCertForXml(certificates.idpSigningCert)}
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
