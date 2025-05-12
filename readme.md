# Simulated Crypto-Blockchain App

## Overview

This project is an educational endeavor designed to simulate the fundamental workings of a blockchain. It aims to provide a practical understanding of how various cryptographic principles come together to create a decentralized and secure ledger system. The simulation includes features like wallet creation, transaction processing, block mining, and maintaining chain integrity, all built from scratch to illustrate the core concepts.

**Disclaimer:** This is a simplified simulation for learning purposes and should **not** be used for managing real assets or in production environments.

## Cryptographic Principles Implemented

This project demonstrates several key cryptographic techniques:

* **Elliptic Curve Digital Signature Algorithm (ECDSA):** Used for creating and verifying digital signatures for transactions, ensuring authenticity and integrity. Key pairs (public and private keys) are generated using the `nistP256` curve.
* **SHA-256:** Employed as the hashing algorithm in conjunction with ECDSA for signing transaction data.
* **Argon2id:** A modern, secure key derivation function used for hashing block data and transaction data to generate their respective hashes.
* **Mnemonic Phrases (BIP-39 like):** Wallets can be generated from and recovered using 12-word mnemonic phrases.
    * **Entropy & Checksum:** Random entropy is used to generate mnemonics, with a checksum derived from the SHA-256 hash of the entropy added for validation.
    * **PBKDF2 (Rfc2898DeriveBytes with SHA512):** The mnemonic phrase is converted into a seed using PBKDF2, which is then used to deterministically generate the ECDSA key pair for the wallet.
* **Proof-of-Work (PoW):** A simple PoW consensus mechanism is implemented where miners must find a nonce that results in a block hash starting with a predefined number of zeros.

## Core Features

* **Wallet Management:**
    * Generation of new wallets with unique ECDSA key pairs and mnemonic recovery phrases.
    * Recovery of existing wallets using their mnemonic phrases.
    * Retrieval of wallet balances.
* **Transactions:**
    * Creation of transactions between wallet addresses.
    * Signing of transactions using the sender's private key (ECDSA).
    * Validation of transaction signatures and sender funds.
    * A mempool for pending transactions.
* **Blocks & Blockchain:**
    * Organization of transactions into blocks.
    * A Genesis block to initialize the chain.
    * Hashing of block content using Argon2id.
    * Linking of blocks via the previous block's hash to form a chain.
* **Mining:**
    * Proof-of-Work (PoW) mining process to add new blocks to the chain.
    * Mining rewards for successful miners.
* **Chain Integrity:**
    * Mechanisms to validate the integrity of the entire blockchain by checking hashes and transaction validity.

## Tech Stack

* **Backend:** C# with ASP.NET Core (providing the blockchain logic and API)
* **Frontend:** React (providing the user interface)
* **Authentication:** Keycloak (handling user authentication and authorization)
* **Containerization:** Docker & Docker Compose

## Setup and Running the Application

This chapter explains how to get the simulated blockchain application up and running on your local machine using Docker.

### Prerequisites

* **Docker Desktop:** Ensure you have Docker Desktop installed and running on your system. It includes Docker Engine and Docker Compose. You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop/).

### Installation & Launch

1.  **Clone the Repository (if applicable):**
    If you have the project in a Git repository, clone it to your local machine:
    ```bash
    git clone https://github.com/mrtng1/Blockchain.git
    cd Blockchain
    ```
    If you just have the files, ensure you are in the root directory where the `docker-compose.yml` file is located.

2.  **Prepare Realm Configuration (Important for Keycloak):**
    * This project uses Keycloak for authentication. A realm configuration file (`myblockchainapp-realm.json` or similar) should be present in the root directory.
    * This file defines an application-specific realm (e.g., `myblockchainapp`) and the necessary client (`blockchainapp`) for the frontend.
    * Ensure your frontend application is configured to use this specific realm and client ID.

3.  **Run the Application:**
    Open a terminal or command prompt in the root directory of the project (where your `docker-compose.yml` file is located) and execute the following command:
    ```bash
    docker compose up --build
    ```
    * `docker compose up`: This command starts (or creates if they don't exist) all the services defined in your `docker-compose.yml` file (Keycloak, backend, frontend).
    * `--build`: This flag ensures that Docker images for your custom services (backend, frontend) are rebuilt if there have been changes to their Dockerfiles or source code.

    This command will pull necessary images (like Keycloak), build your application images, and start the containers. You will see logs from all the services in your terminal.

### Accessing the Application

Once the services are up and running (you'll see log output indicating they've started without critical errors):

* **Frontend Application:** Open your web browser and navigate to `http://localhost:3000`
* **Backend API:** The backend API will be accessible (primarily by the frontend) at `http://localhost:5215`
* **Keycloak Admin Console:** You can manage Keycloak by navigating to `http://localhost:8080`
    * Username: `admin`
    * Password: `admin` (as defined in `docker-compose.yml`)

To stop the application, press `Ctrl+C` in the terminal where `docker compose up` is running, and then you can run:
```bash
docker compose down