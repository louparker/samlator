import { NextRequest, NextResponse } from 'next/server';
import { generateSPMetadata, generateIdPMetadata } from '@/services/metadata-service';
import { getBaseUrl, updateMetadataUrls } from '@/utils/url-helpers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  
  if (!type || (type !== 'sp' && type !== 'idp')) {
    return NextResponse.json(
      { error: 'Invalid metadata type. Use "sp" or "idp".' },
      { status: 400 }
    );
  }
  
  try {
    // Get the base URL for the application
    const baseUrl = getBaseUrl(request);
    
    // Generate the metadata
    let metadata = type === 'sp' ? generateSPMetadata() : generateIdPMetadata();
    
    // Update URLs in the metadata to use the correct base URL
    metadata = updateMetadataUrls(metadata, baseUrl);
    
    return new NextResponse(metadata, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${type}-metadata.xml"`
      }
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}
