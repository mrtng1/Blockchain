import Keycloak from 'keycloak-js';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT } from '../environment';

class AuthService {
    constructor() {
        this.keycloak = new Keycloak({
            url: KEYCLOAK_URL,
            realm: KEYCLOAK_REALM,
            clientId: KEYCLOAK_CLIENT,
        });
        this.initialized = false;
        this.tokenRefreshInterval = null;
    }

    /**
     * Initialize Keycloak instance
     * @returns {Promise<boolean>} Authentication status
     */
    init() {
        return this.keycloak.init({
            onLoad: 'check-sso',
            pkceMethod: 'S256',
            checkLoginIframe: false,
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        })
            .then(authenticated => {
                this.initialized = true;
                if (authenticated) {
                    this.setupTokenRefresh();
                }
                return authenticated;
            })
            .catch(err => {
                console.error('Keycloak init error:', err);
                this.initialized = false;
                throw err;
            });
    }

    /** Redirect to Keycloak login */
    login() {
        return this.keycloak.login();
    }

    /** Logout from Keycloak */
    logout() {
        this.keycloak.logout({ redirectUri: window.location.origin });
        this.clearTokenRefresh();
    }

    /** Get current access token with automatic refresh */
    async getToken() {
        if (!this.initialized) {
            throw new Error('Auth service not initialized');
        }

        if (!this.keycloak.authenticated) {
            this.clearTokenRefresh();
            return null;
        }

        try {
            await this.keycloak.updateToken(5);
            return this.keycloak.token;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            this.clearTokenRefresh();
            throw error;
        }
    }

    /** Get user ID from parsed token */
    getUserId() {
        if (this.keycloak.tokenParsed) {
            return this.keycloak.tokenParsed.sub;
        }
        return null;
    }

    /** Setup automatic token refresh */
    setupTokenRefresh() {
        this.clearTokenRefresh();
        this.tokenRefreshInterval = setInterval(() => {
            this.keycloak.updateToken(60)
                .then(refreshed => {
                    if (refreshed) {
                        console.debug('Token refreshed in background');
                    }
                })
                .catch(err => {
                    console.error('Background token refresh failed:', err);
                    this.clearTokenRefresh();
                });
        }, 60000);
    }

    /** Clear refresh interval */
    clearTokenRefresh() {
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
            this.tokenRefreshInterval = null;
        }
    }

    /** Check authentication status */
    isAuthenticated() {
        return this.keycloak.authenticated && !this.keycloak.isTokenExpired();
    }
}

const authService = new AuthService();
export default authService;