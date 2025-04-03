'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DownloadMetadata() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadMetadata = async (type: 'sp' | 'idp') => {
    setDownloading(true);
    setError(null);

    try {
      const response = await fetch(`/api/metadata?type=${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to download ${type.toUpperCase()} metadata`);
      }

      // Get the metadata content
      const metadata = await response.text();
      
      // Create a blob and download link
      const blob = new Blob([metadata], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-metadata.xml`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-700 mb-6">Download Metadata</h1>
      <p className="mb-8">
        Download SAMLator's metadata files to configure your SAML Service Provider or Identity Provider for testing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-primary mb-4">Service Provider Metadata</h2>
          <p className="mb-6">
            Download the Service Provider metadata to configure your Identity Provider for testing with SAMLator.
          </p>
          <button
            onClick={() => downloadMetadata('sp')}
            disabled={downloading}
            className="btn-primary w-full"
          >
            {downloading ? 'Downloading...' : 'Download SP Metadata'}
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-secondary mb-4">Identity Provider Metadata</h2>
          <p className="mb-6">
            Download the Identity Provider metadata to configure your Service Provider for testing with SAMLator.
          </p>
          <button
            onClick={() => downloadMetadata('idp')}
            disabled={downloading}
            className="btn-secondary w-full"
          >
            {downloading ? 'Downloading...' : 'Download IdP Metadata'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Metadata Information</h3>
        <p className="text-blue-700 mb-4">
          The metadata files contain the following security configurations:
        </p>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>SHA-256 signatures with RSA 2048-bit keys</li>
          <li>Separate signing and encryption certificates</li>
          <li>AES-256-GCM for assertion encryption</li>
          <li>Signed authentication requests</li>
          <li>Encrypted assertions</li>
        </ul>
      </div>
    </div>
  );
}
