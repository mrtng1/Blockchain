using Blockchain.Core.Logic;

namespace Blockchain.Core.Entities;

using System;

public class Transaction
{
    public Transaction(string fromAddress, string toAddress, decimal amount)
    {
        FromAddress = fromAddress;
        ToAddress = toAddress;
        Amount = amount;
    }
    
    public string FromAddress  { get; set; }
    public string ToAddress    { get; set; }
    public decimal Amount      { get; set; }
    public string Signature    { get; set; }

    /// <summary>
    /// A unique ID for this TX, based on its contents.
    /// </summary>
    public string CalculateHash()
    {
        var raw = $"{FromAddress}-{ToAddress}-{Amount}";
        return CryptoLogic.ComputeArgon2Hash(raw, FromAddress ?? "");
    }

    /// <summary>
    /// (Stub) verify signature—you’ll plug in real ECDSA/RSA later.
    /// </summary>
    public bool IsValid()
    {
        if (FromAddress == null) return true; 
        if (string.IsNullOrEmpty(Signature)) 
            throw new InvalidOperationException("No signature on transaction.");
        // TODO: verify Signature against CalculateHash() and FromAddress’s public key
        return true;
    }
}
