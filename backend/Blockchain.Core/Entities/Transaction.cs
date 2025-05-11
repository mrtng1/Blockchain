using Blockchain.Core.Logic;
using System.Security.Cryptography;

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

    public bool IsValid()
    {
        if (FromAddress == null)
        {
            // Mining reward
            // TODO: Make sure its actually a mining reward and not just a null fromAddress
            return true;
        }

        if (string.IsNullOrWhiteSpace(FromAddress) || string.IsNullOrWhiteSpace(Signature))
        {
            return false;
        }

        // Calculate the transaction hash and verify the signature against it
        var txHash = CalculateHash();

        try
        {
            return CryptoLogic.VerifySignature(txHash, Signature, FromAddress);
        }
        catch (FormatException)
        {
            return false;
        }
        catch (CryptographicException)
        {
            return false;
        }
        catch (Exception)
        {
            return false;
        }
    }
}
