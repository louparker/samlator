import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    console.log('Received metadata upload request');
    
    const formData = await request.formData();
    const metadataFile = formData.get('metadata') as File;
    const type = formData.get('type') as string;
    
    console.log(`Upload request details: type=${type}, file size=${metadataFile?.size || 'unknown'}`);
    
    if (!metadataFile || !type || (type !== 'sp' && type !== 'idp')) {
      console.error('Invalid upload request', { type, hasFile: !!metadataFile });
      return NextResponse.json(
        { error: 'Invalid request. Provide metadata file and type (sp or idp).' },
        { status: 400 }
      );
    }
    
    const metadataContent = await metadataFile.text();
    console.log(`Metadata content length: ${metadataContent.length} characters`);
    
    // Validate that the content is XML and contains SAML metadata
    if (!metadataContent.includes('EntityDescriptor') || 
        !metadataContent.includes('urn:oasis:names:tc:SAML:2.0:metadata')) {
      console.error('Invalid SAML metadata format');
      return NextResponse.json(
        { error: 'Invalid SAML metadata format' },
        { status: 400 }
      );
    }
    
    // Save metadata using Vercel Blob Storage directly
    console.log(`Saving ${type} metadata to Vercel Blob Storage`);
    const filename = `samlator/${type}-metadata.xml`;
    
    // Use put from Vercel Blob directly
    const blob = await put(filename, metadataContent, {
      access: 'public',
      addRandomSuffix: false, // Use the same name to overwrite existing files
    });
    
    console.log(`Metadata saved successfully: ${blob.url}`);
    return NextResponse.json({ 
      success: true,
      message: `${type.toUpperCase()} metadata uploaded successfully`,
      url: blob.url
    });
  } catch (error) {
    console.error('Error uploading metadata:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error 
      ? `${error.message}\n${error.stack}` 
      : 'Unknown error occurred';
    
    console.error('Detailed error:', errorMessage);
    
    return NextResponse.json(
      { 
        error: 'Failed to process metadata upload',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
