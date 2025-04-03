'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestIdentityProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequest, setAuthRequest] = useState<string | null>(null);
  const [samlResponse, setSamlResponse] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [idpEntityId, setIdpEntityId] = useState('');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const generateAuthRequest = async () => {
    if (!idpEntityId) {
      setError('IdP Entity ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setRedirectUrl(null);

    try {
      const response = await fetch(`/api/auth-request?idpEntityId=${encodeURIComponent(idpEntityId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate authentication request');
      }

      setAuthRequest(data.authRequest);
      
      // If a redirect URL is provided, store it
      if (data.redirectUrl) {
        setRedirectUrl(data.redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const redirectToIdp = () => {
    if (redirectUrl) {
      // Open in a new tab
      window.open(redirectUrl, '_blank');
    } else {
      setError('No redirect URL available. Please generate a new authentication request.');
    }
  };

  const validateSamlResponse = async () => {
    if (!samlResponse) {
      setError('SAML Response is required');
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
        body: JSON.stringify({ samlResponse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate SAML response');
      }

      setValidationResult(data);
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

      <h1 className="text-3xl font-bold text-secondary mb-6">Test Identity Provider</h1>
      <p className="mb-8">
        This page allows you to simulate a Service Provider (SP) to test your Identity Provider (IdP) implementation.
        Generate an authentication request, send it to your IdP, and then validate the SAML response.
      </p>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate Authentication Request</h2>
        <p className="mb-4">
          Enter your IdP Entity ID and click the button below to generate a SAML authentication request that you can send to your Identity Provider.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">IdP Entity ID</label>
          <input
            type="text"
            value={idpEntityId}
            onChange={(e) => setIdpEntityId(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-secondary focus:border-secondary"
            placeholder="e.g., https://your-idp.example.com"
          />
          <p className="mt-1 text-sm text-gray-500">
            This should match the entityID from your IdP metadata
          </p>
        </div>
        
        <button
          onClick={generateAuthRequest}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Generating...' : 'Generate Authentication Request'}
        </button>

        {error && !authRequest && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {authRequest && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication Request</h2>
          <p className="mb-4">
            Use this authentication request with your Identity Provider. You can copy it and use it in your testing tools.
          </p>
          <div className="bg-gray-100 p-4 rounded overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap break-all">{authRequest}</pre>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => navigator.clipboard.writeText(authRequest)}
              className="btn-secondary"
            >
              Copy to Clipboard
            </button>
            
            {redirectUrl && (
              <button
                onClick={redirectToIdp}
                className="btn-primary"
              >
                Redirect to IdP
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Validate SAML Response</h2>
        <p className="mb-4">
          Paste the SAML response from your Identity Provider below to validate it.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">SAML Response</label>
          <textarea
            value={samlResponse}
            onChange={(e) => setSamlResponse(e.target.value)}
            className="w-full p-2 border rounded h-40 focus:ring-2 focus:ring-secondary focus:border-secondary"
            placeholder="Paste the SAML response here"
          />
        </div>

        <button
          onClick={validateSamlResponse}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Validating...' : 'Validate SAML Response'}
        </button>

        {error && !validationResult && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {validationResult && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Validation Result</h2>
          {validationResult.success ? (
            <>
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                SAML Response is valid!
              </div>
              <div className="mb-4">
                <h3 className="font-medium mb-2">NameID:</h3>
                <div className="bg-gray-100 p-3 rounded">
                  {validationResult.nameID}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Attributes:</h3>
                <div className="bg-gray-100 p-3 rounded">
                  <pre className="text-sm">
                    {JSON.stringify(validationResult.attributes, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {validationResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
