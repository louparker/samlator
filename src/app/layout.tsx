import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SAMLator - SAML Testing Tool',
  description: 'Test SAML Service Providers and Identity Providers with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
