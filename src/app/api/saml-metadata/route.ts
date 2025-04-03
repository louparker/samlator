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
    console.log(`Generating ${type} metadata...`);
    
    // Get the base URL for the application
    const baseUrl = getBaseUrl(request);
    console.log(`Using base URL: ${baseUrl}`);
    
    // Generate the metadata
    let metadata = type === 'sp' ? generateSPMetadata() : generateIdPMetadata();
    
    // Update URLs in the metadata to use the correct base URL
    metadata = updateMetadataUrls(metadata, baseUrl);
    
    console.log(`Successfully generated ${type} metadata`);
    
    return new NextResponse(metadata, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${type}-metadata.xml"`
      }
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error 
      ? `${error.message}\n${error.stack}` 
      : 'Unknown error occurred';
    
    console.error('Detailed error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to generate metadata', details: errorMessage },
      { status: 500 }
    );
  }
}
