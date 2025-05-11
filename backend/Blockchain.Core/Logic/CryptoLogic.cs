using System.Security.Cryptography;
using Blockchain.Core.Entities;
using System.Text;
using Konscious.Security.Cryptography;

namespace Blockchain.Core.Logic;

public static class CryptoLogic
{
    /// <summary>
    /// Deterministically hashes arbitrary data with Argon2id, using the given salt text.
    /// </summary>
    public static string ComputeArgon2Hash(string data, string saltText)
    {
        var argon2 = new Argon2id(Encoding.UTF8.GetBytes(data));
        argon2.Salt = Encoding.UTF8.GetBytes(saltText);
        argon2.DegreeOfParallelism = 4;    // threads
        argon2.Iterations         = 3;    // passes
        argon2.MemorySize         = 1024; // KB

        // produce a 256-bit (32-byte) hash:
        var hash = argon2.GetBytes(32);
        return Convert.ToHexString(hash);
    }
    
    /// <summary>
    /// Generates a new ECDSA key-pair on curve P-256.
    /// </summary>
    /// Not in use
    // public static AsymmetricKeyPair GenerateKeyPair()
    // {
    //     var ecdsa = ECDsa.Create(ECCurve.NamedCurves.nistP256);
    //     // export public key as DER
    //     byte[] pubDer = ecdsa.ExportSubjectPublicKeyInfo();
    //     string pubBase64 = Convert.ToBase64String(pubDer);
    //     return new AsymmetricKeyPair(ecdsa, pubBase64);
    // }

    /// <summary>
    /// Signs UTF-8 bytes of `data` with the given private ECDSA key.
    /// </summary>
    public static string SignData(string data, ECDsa privateKey)
    {
        byte[] payload   = Encoding.UTF8.GetBytes(data);
        byte[] signature = privateKey.SignData(payload, HashAlgorithmName.SHA256);
        return Convert.ToBase64String(signature);
    }

    /// <summary>
    /// Verifies that `signatureBase64` matches `data` under the given public key.
    /// </summary>
    public static bool VerifySignature(string data, string signatureBase64, string publicKeyBase64)
    {
        byte[] sigBytes = Convert.FromBase64String(signatureBase64);
        byte[] pubDer   = Convert.FromBase64String(publicKeyBase64);

        using var ecdsa = ECDsa.Create();
        ecdsa.ImportSubjectPublicKeyInfo(pubDer, out _);

        byte[] payload = Encoding.UTF8.GetBytes(data);
        return ecdsa.VerifyData(payload, sigBytes, HashAlgorithmName.SHA256);
    }


    /// <summary>
    /// Import a Base‑64 PKCS#8 private key into an ECDsa object.
    /// </summary>
    public static ECDsa ImportPrivateKey(string base64Pkcs8)
    {
        var ecdsa = ECDsa.Create();
        var pkcs8 = Convert.FromBase64String(base64Pkcs8);
        ecdsa.ImportPkcs8PrivateKey(pkcs8, out _);
        return ecdsa;
    }

    /// <summary>
    /// Sign the given transaction in‑place (sets its Signature), using its CalculateHash().
    /// </summary>
    public static void SignTransaction(Transaction tx, ECDsa privateKey)
    {
        // Ensure the private key matches tx.FromAddress
        var pubDer = privateKey.ExportSubjectPublicKeyInfo();
        var pubBase64 = Convert.ToBase64String(pubDer);
        if (pubBase64 != tx.FromAddress)
            throw new InvalidOperationException("Private key does not match FromAddress.");

        // Compute the hash and sign it
        var hash = tx.CalculateHash();
        tx.Signature = SignData(hash, privateKey);
    }
    
    public static AsymmetricKeyPair GenerateKeyPairFromSeed(byte[] seed)
    {
        if (seed == null || seed.Length < 32)
            throw new ArgumentException("Seed must be at least 32 bytes long for a 256-bit private key.", nameof(seed));

        // For nistP256 -> private key is 32 bytes
        // Take the first 32 bytes of the 64-byte seed
        // the entire seed is a master key to derive child keys via paths
        byte[] privateKeyScalar = new byte[32];
        Array.Copy(seed, 0, privateKeyScalar, 0, 32);
        
        ECParameters parameters = new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            D = privateKeyScalar
        };

        // Validate parameters
        ECDsa ecdsaKey = ECDsa.Create(parameters);

        // Export the public key in SubjectPublicKeyInfo format
        byte[] publicKeyBytes = ecdsaKey.ExportSubjectPublicKeyInfo();
        string publicKeyBase64 = Convert.ToBase64String(publicKeyBytes);

        return new AsymmetricKeyPair(ecdsaKey, publicKeyBase64);
    }
}
