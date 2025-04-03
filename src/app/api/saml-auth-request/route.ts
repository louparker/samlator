import { NextRequest, NextResponse } from 'next/server';
import { generateAuthRequest, loadMetadata } from '@/services/saml-service';
import { getBaseUrl, updateMetadataUrls } from '@/utils/url-helpers';
import * as crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Get the IdP Entity ID from the query parameters
    const idpEntityId = request.nextUrl.searchParams.get('idpEntityId');
    
    if (!idpEntityId) {
      return NextResponse.json(
        { error: 'IdP Entity ID is required' },
        { status: 400 }
      );
    }
    
    // Load saved metadata if available
    const spMetadata = await loadMetadata('sp');
    const idpMetadata = await loadMetadata('idp');
    
    // Get the base URL for the application
    const baseUrl = getBaseUrl(request);
    
    // Generate a more minimal AuthnRequest that matches the example format
    const requestId = `_${crypto.randomBytes(16).toString('hex').substring(0, 32)}`;
    const issueInstant = new Date().toISOString();
    const destination = `${idpEntityId}/saml/login`;
    const entityId = baseUrl + '/sp';
    
    // Create a minimal AuthnRequest that matches the example format
    const authRequest = `<?xml version="1.0" encoding="UTF-8"?>
<saml2p:AuthnRequest xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" 
                     AttributeConsumingServiceIndex="1"
                     Destination="${destination}" 
                     ForceAuthn="true"
                     ID="${requestId}" 
                     IssueInstant="${issueInstant}"
                     Version="2.0">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
        ${entityId}
    </saml2:Issuer>
</saml2p:AuthnRequest>`;

    // Encode the AuthnRequest for redirect binding
    const encodedRequest = Buffer.from(authRequest).toString('base64');
    
    // Create the redirect URL
    const redirectUrl = `${destination}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${encodeURIComponent(baseUrl + '/test-idp')}`;
    
    return NextResponse.json({ 
      success: true,
      authRequest,
      redirectUrl
    });
  } catch (error) {
    console.error('Error generating auth request:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication request' },
      { status: 500 }
    );
  }
}
