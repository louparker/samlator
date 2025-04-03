# SAMLator

SAMLator is a simple yet powerful SAML testing tool that allows you to test both Service Providers (SP) and Identity Providers (IdP) implementations. With SAMLator, you can generate SAML requests, validate SAML responses, and manage SAML metadata.

## Features

- **Test Service Providers**: Simulate an Identity Provider to test your Service Provider implementation
- **Test Identity Providers**: Simulate a Service Provider to test your Identity Provider implementation
- **Upload Metadata**: Configure SAMLator with your own SAML metadata
- **Download Metadata**: Get SAMLator's metadata for configuring your SAML implementation

## Security Configuration

SAMLator implements enhanced security configurations:

- Separate signing and encryption certificates
- SHA-256 signatures with RSA 2048-bit keys
- AES-256-GCM for assertion encryption
- Signed authentication requests
- Encrypted assertions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Testing a Service Provider

1. Navigate to "Test Service Provider"
2. Enter the SAML request ID from your SP
3. Configure user attributes to include in the SAML response
4. Generate the SAML response
5. Use the generated response to test your SP

### Testing an Identity Provider

1. Navigate to "Test Identity Provider"
2. Enter your IdP Entity ID
3. Generate an authentication request
4. Click "Redirect to IdP" to open your IdP's authentication page in a new tab
5. Complete the authentication process with your IdP
6. Paste the SAML response from your IdP
7. Validate the response

### Using ngrok for External Testing

To test with an external IdP while running locally:

1. Make sure you have ngrok installed (`brew install ngrok`)
2. Run the tunnel script:

```bash
./tunnel.sh
```

3. The script will:
   - Check if ngrok is authenticated (and prompt for your authtoken if needed)
   - Verify that the Next.js server is running
   - Start an ngrok tunnel to your local server
   
4. Use the provided ngrok URL to configure your IdP
5. The metadata URL will be: `https://YOUR_NGROK_DOMAIN/api/saml-metadata?type=sp`

### Managing Metadata

- **Upload Metadata**: Upload your SP or IdP metadata to configure SAMLator
- **Download Metadata**: Download SAMLator's SP or IdP metadata to configure your SAML implementation

## License

ISC

## Acknowledgements

- [samlify](https://github.com/tngan/samlify) - SAML library for Node.js
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
