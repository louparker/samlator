'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadMetadata() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [metadataType, setMetadataType] = useState<'sp' | 'idp'>('sp');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a metadata file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('metadata', file);
      formData.append('type', metadataType);

      const response = await fetch('/api/upload-metadata', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload metadata');
      }

      setSuccess(true);
      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById('metadata-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-accent mb-6">Upload Metadata</h1>
      <p className="mb-8">
        Upload your SAML metadata to configure SAMLator for testing. This will allow SAMLator to use your 
        specific SAML configuration when generating requests and responses.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Metadata Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="metadataType"
                  value="sp"
                  checked={metadataType === 'sp'}
                  onChange={() => setMetadataType('sp')}
                  className="mr-2"
                />
                Service Provider (SP)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="metadataType"
                  value="idp"
                  checked={metadataType === 'idp'}
                  onChange={() => setMetadataType('idp')}
                  className="mr-2"
                />
                Identity Provider (IdP)
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Metadata File (XML)</label>
            <input
              id="metadata-file"
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:border-accent"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="btn-accent w-full"
          >
            {loading ? 'Uploading...' : 'Upload Metadata'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              Metadata uploaded successfully! SAMLator will now use this metadata for testing.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
