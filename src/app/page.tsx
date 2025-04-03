import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">SAMLator</h1>
        <p className="text-xl text-gray-600">
          A simple tool for testing SAML Service Providers and Identity Providers
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/test-sp" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-primary mb-4">Test Service Provider</h2>
            <p className="mb-6">
              Test your SAML Service Provider implementation by simulating an Identity Provider.
            </p>
            <button className="btn-primary">Start Testing SP</button>
          </div>
        </Link>

        <Link href="/test-idp" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Test Identity Provider</h2>
            <p className="mb-6">
              Test your SAML Identity Provider implementation by simulating a Service Provider.
            </p>
            <button className="btn-secondary">Start Testing IdP</button>
          </div>
        </Link>

        <Link href="/upload-metadata" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-accent mb-4">Upload Metadata</h2>
            <p className="mb-6">
              Upload your SAML metadata to configure SAMLator for testing.
            </p>
            <button className="btn-accent">Upload Metadata</button>
          </div>
        </Link>

        <Link href="/download-metadata" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Download Metadata</h2>
            <p className="mb-6">
              Download SAMLator's metadata for configuring your SAML implementation.
            </p>
            <button className="bg-gray-700 btn hover:bg-gray-800 focus:ring-gray-500">
              Download Metadata
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}
