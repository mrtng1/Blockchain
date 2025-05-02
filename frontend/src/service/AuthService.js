// src/service/AuthService.js
import Keycloak from 'keycloak-js';
import { KEYCLOAK_URL } from '../environment';

class AuthService {
    constructor() {
        this.keycloak = new Keycloak({
            url: `${KEYCLOAK_URL}`,   // make sure the “/auth” path is included
            realm: 'master',
            clientId: 'blockchainapp',
        });
        this.token = null;
        this.refreshToken = null;
    }

    /**
     * Initialize Keycloak instance.
     * @param {Function} onInitialized - Called once Keycloak has finished its init (regardless of auth state)
     */
    init(onInitialized) {
        this.keycloak
            .init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                checkLoginIframe: false,
                silentCheckSsoRedirectUri:
                    window.location.origin + '/silent-check-sso.html',
            })
            .then((authenticated) => {
                if (authenticated) {
                    this.token = this.keycloak.token;
                    this.refreshToken = this.keycloak.refreshToken;
                    this.setupTokenRefresh();
                }
                // fire the callback whether or not the user is authenticated
                onInitialized(authenticated);
            })
            .catch((err) => console.error('Keycloak init error:', err));
    }

    /** Redirect to Keycloak login */
    login() {
        this.keycloak.login();
    }

    /** Logout from Keycloak and redirect to app root */
    logout() {
        this.keycloak.logout({ redirectUri: window.location.origin });
    }

    /** Retrieve current access token */
    getToken() {
        return this.token;
    }

    /** Setup automatic token refresh before expiry */
    setupTokenRefresh() {
        this.tokenRefreshInterval = setInterval(() => {
            this.keycloak
                .updateToken(60)
                .then((refreshed) => {
                    if (refreshed) {
                        this.token = this.keycloak.token;
                        this.refreshToken = this.keycloak.refreshToken;
                        console.log('Keycloak token refreshed');
                    }
                })
                .catch((err) =>
                    console.error('Failed to refresh Keycloak token', err)
                );
        }, 60000);
    }

    /** Clear the token refresh interval */
    clearTokenRefresh() {
        clearInterval(this.tokenRefreshInterval);
    }
}

const authService = new AuthService();
export default authService;
