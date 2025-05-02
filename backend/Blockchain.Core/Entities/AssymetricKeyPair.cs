using System;
using System.Security.Cryptography;

namespace Blockchain.Core.Entities;

public class AsymmetricKeyPair
{
    /// <summary>
    /// Holds both private & public parameters for signing.
    /// </summary>
    public ECDsa PrivateKey { get; }

    /// <summary>
    /// Base64-encoded public key (SubjectPublicKeyInfo DER).
    /// Use this string to share your “address.”
    /// </summary>
    public string PublicKey { get; }

    public AsymmetricKeyPair(ECDsa privateKey, string publicKeyBase64)
    {
        PrivateKey = privateKey;
        PublicKey  = publicKeyBase64;
    }
}