import { NextRequest, NextResponse } from 'next/server';
import { processSamlResponse, generateSamlResponse, loadMetadata } from '@/lib/saml';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { samlResponse, requestID, userAttributes } = body;
    
    // Load saved metadata if available
    const spMetadata = await loadMetadata('sp');
    const idpMetadata = await loadMetadata('idp');
    
    if (samlResponse) {
      // Process SAML response
      const result = await processSamlResponse(
        samlResponse, 
        spMetadata || undefined, 
        idpMetadata || undefined
      );
      return NextResponse.json(result);
    } else if (requestID && userAttributes) {
      // Generate SAML response
      const response = await generateSamlResponse(
        requestID,
        userAttributes,
        spMetadata || undefined,
        idpMetadata || undefined
      );
      return NextResponse.json({ success: true, samlResponse: response });
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Provide either samlResponse or requestID with userAttributes.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing SAML response:', error);
    return NextResponse.json(
      { error: 'Failed to process SAML response' },
      { status: 500 }
    );
  }
}
