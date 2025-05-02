using Blockchain.Core.Logic;

namespace Blockchain.Core.Entities;

public class Wallet
{
    public AsymmetricKeyPair KeyPair { get; private set; }

    public Wallet()
    {
        KeyPair = CryptoLogic.GenerateKeyPair();
    }

    /// <summary>
    /// Creates a new transaction from this wallet to the given address,
    /// signs it with the wallet’s private key, and returns it ready for submission.
    /// </summary>
    public Transaction CreateTransaction(string toAddress, decimal amount)
    {
        var tx = new Transaction(KeyPair.PublicKey, toAddress, amount);
        string hash = tx.CalculateHash();
        tx.Signature = CryptoLogic.SignData(hash, KeyPair.PrivateKey);
        return tx;
    }
}
