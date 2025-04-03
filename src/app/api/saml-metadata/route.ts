import { NextRequest, NextResponse } from 'next/server';
import { generateSPMetadata, generateIdPMetadata } from '@/services/metadata-service';
import { getBaseUrl, updateMetadataUrls } from '@/utils/url-helpers';
import { list } from '@vercel/blob';
import { loadMetadata } from '@/services/saml-service';

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
    console.log(`Retrieving ${type} metadata...`);
    
    // Get the base URL for the application
    const baseUrl = getBaseUrl(request);
    console.log(`Using base URL: ${baseUrl}`);
    
    // First try to load metadata from Vercel Blob Storage
    console.log(`Checking Blob Storage for existing ${type} metadata...`);
    const existingMetadata = await loadMetadata(type as 'sp' | 'idp');
    
    let metadata;
    
    if (existingMetadata) {
      console.log(`Found existing ${type} metadata in Blob Storage`);
      metadata = existingMetadata;
      
      // Update URLs in the existing metadata to use the correct base URL
      metadata = updateMetadataUrls(metadata, baseUrl);
    } else {
      console.log(`No existing ${type} metadata found in Blob Storage, generating new metadata...`);
      
      // Generate the metadata
      metadata = type === 'sp' ? generateSPMetadata() : generateIdPMetadata();
      
      // Update URLs in the metadata to use the correct base URL
      metadata = updateMetadataUrls(metadata, baseUrl);
    }
    
    console.log(`Successfully processed ${type} metadata`);
    
    return new NextResponse(metadata, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${type}-metadata.xml"`
      }
    });
  } catch (error) {
    console.error('Error retrieving metadata:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error 
      ? `${error.message}\n${error.stack}` 
      : 'Unknown error occurred';
    
    console.error('Detailed error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to retrieve metadata', details: errorMessage },
      { status: 500 }
    );
  }
}
