import { NextRequest, NextResponse } from 'next/server';
import { generateAuthRequest, loadMetadata } from '@/services/saml-service';
import { getBaseUrl, updateMetadataUrls } from '@/utils/url-helpers';
import * as crypto from 'crypto';
import * as zlib from 'zlib';

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
    
    // Generate AuthnRequest parameters
    const requestId = `_${crypto.randomBytes(16).toString('hex').substring(0, 32)}`;
    const issueInstant = new Date().toISOString();
    const destination = `${idpEntityId}/sso`; // Use SSO endpoint instead of /saml/login
    const entityId = baseUrl + '/sp';
    const acsUrl = `${baseUrl}/sp/acs`; // AssertionConsumerServiceURL
    
    // Create an AuthnRequest that matches the example format
    const authRequest = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
                   AssertionConsumerServiceURL="${acsUrl}" 
                   Destination="${destination}" 
                   ForceAuthn="false" 
                   ID="${requestId}" 
                   IsPassive="false" 
                   IssueInstant="${issueInstant}" 
                   ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
                   Version="2.0" 
                   xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
    <saml:Issuer Format="urn:oasis:names:tc:SAML:2.0:nameid-format:entity">
        ${entityId}
    </saml:Issuer>
</samlp:AuthnRequest>`;

    console.log('Generated AuthnRequest:', authRequest);

    // Try a third approach for encoding the SAML request
    // Skip deflation completely and just use base64 encoding
    // Some IdPs don't require deflation for HTTP-Redirect binding
    const encodedRequest = Buffer.from(authRequest, 'utf8').toString('base64');
    
    // Create the redirect URL with properly encoded parameters
    const redirectUrl = `${destination}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${encodeURIComponent(baseUrl + '/test-idp')}`;
    
    // Also provide an alternative URL that uses standard deflate compression
    // This is for testing with different IdP implementations
    const deflatePromise = (buffer: Buffer): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        zlib.deflate(buffer, { level: 9 }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };
    
    const deflated = await deflatePromise(Buffer.from(authRequest, 'utf8'));
    const deflatedEncodedRequest = deflated.toString('base64');
    const alternativeUrl = `${destination}?SAMLRequest=${encodeURIComponent(deflatedEncodedRequest)}&RelayState=${encodeURIComponent(baseUrl + '/test-idp')}`;
    
    return NextResponse.json({ 
      success: true,
      authRequest,
      redirectUrl,
      alternativeUrl,
      note: "If the primary redirectUrl doesn't work with your IdP, try the alternativeUrl"
    });
  } catch (error) {
    console.error('Error generating auth request:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication request' },
      { status: 500 }
    );
  }
}
