# Blockchain Crypto App

## Setup
+ Run keycloak<code>docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:21.1.0 start-dev
</code>

docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -e KC_HTTP_CORS_ORIGINS='http://localhost:3000' -e KC_HTTP_CORS_ALLOWED_METHODS='GET,POST,PUT,DELETE' -e KC_HTTP_CORS_ALLOW_CREDENTIALS=true -e KC_HOSTNAME=localhost quay.io/keycloak/keycloak:21.1.0 start-dev --features=admin-fine-grained-authz