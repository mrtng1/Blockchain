using System.Security.Cryptography;
using Blockchain.Core.Entities;
using System;
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
    public static AsymmetricKeyPair GenerateKeyPair()
    {
        var ecdsa = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        // export public key as DER
        byte[] pubDer = ecdsa.ExportSubjectPublicKeyInfo();
        string pubBase64 = Convert.ToBase64String(pubDer);
        return new AsymmetricKeyPair(ecdsa, pubBase64);
    }

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
}
