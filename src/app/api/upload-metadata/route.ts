import { NextRequest, NextResponse } from 'next/server';
import { saveMetadata } from '@/services/saml-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const metadataFile = formData.get('metadata') as File;
    const type = formData.get('type') as string;
    
    if (!metadataFile || !type || (type !== 'sp' && type !== 'idp')) {
      return NextResponse.json(
        { error: 'Invalid request. Provide metadata file and type (sp or idp).' },
        { status: 400 }
      );
    }
    
    const metadataContent = await metadataFile.text();
    
    // Validate that the content is XML and contains SAML metadata
    if (!metadataContent.includes('EntityDescriptor') || 
        !metadataContent.includes('urn:oasis:names:tc:SAML:2.0:metadata')) {
      return NextResponse.json(
        { error: 'Invalid SAML metadata format' },
        { status: 400 }
      );
    }
    
    await saveMetadata(metadataContent, type as 'sp' | 'idp');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return NextResponse.json(
      { error: 'Failed to process metadata upload' },
      { status: 500 }
    );
  }
}
