'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestServiceProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [samlResponse, setSamlResponse] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Record<string, string>>({
    'firstName': 'Test',
    'lastName': 'User',
    'email': 'test.user@example.com',
    'role': 'user'
  });
  const [requestId, setRequestId] = useState('');

  const handleAttributeChange = (key: string, value: string) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  const addAttribute = () => {
    setAttributes(prev => ({ ...prev, '': '' }));
  };

  const removeAttribute = (key: string) => {
    setAttributes(prev => {
      const newAttributes = { ...prev };
      delete newAttributes[key];
      return newAttributes;
    });
  };

  const generateSamlResponse = async () => {
    if (!requestId) {
      setError('Request ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/saml-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestID: requestId,
          userAttributes: attributes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate SAML response');
      }

      setSamlResponse(data.samlResponse);
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

      <h1 className="text-3xl font-bold text-primary mb-6">Test Service Provider</h1>
      <p className="mb-8">
        This page allows you to simulate an Identity Provider (IdP) to test your Service Provider (SP) implementation.
        Enter the SAML request ID from your SP and configure the user attributes to include in the SAML response.
      </p>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Configure SAML Response</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Request ID</label>
          <input
            type="text"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter the SAML request ID"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">User Attributes</label>
            <button
              onClick={addAttribute}
              className="text-sm text-primary hover:underline"
            >
              + Add Attribute
            </button>
          </div>

          {Object.entries(attributes).map(([key, value], index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  const newAttributes = { ...attributes };
                  delete newAttributes[key];
                  newAttributes[newKey] = value;
                  setAttributes(newAttributes);
                }}
                className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Attribute name"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
                className="w-2/3 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Attribute value"
              />
              <button
                onClick={() => removeAttribute(key)}
                className="px-2 text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={generateSamlResponse}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Generating...' : 'Generate SAML Response'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {samlResponse && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">SAML Response</h2>
          <p className="mb-4">
            Use this SAML response to test your Service Provider. You can copy it and use it in your testing tools.
          </p>
          <div className="bg-gray-100 p-4 rounded overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap break-all">{samlResponse}</pre>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(samlResponse)}
            className="mt-4 btn-secondary"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
