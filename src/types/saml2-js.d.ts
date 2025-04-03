declare module 'saml2-js' {
  export class ServiceProvider {
    constructor(options: {
      entity_id: string;
      private_key: string;
      certificate: string;
      assert_endpoint: string;
      sign_get_request?: boolean;
      allow_unencrypted_assertion?: boolean;
    });
  }

  export class IdentityProvider {
    constructor(options: {
      sso_login_url: string;
      sso_logout_url?: string;
      certificates: string[];
    });
  }
}
