using Blockchain.Core.Logic;

namespace Blockchain.Core.Entities;

public class Wallet
{
    public AsymmetricKeyPair KeyPair { get; private set; }

    public Wallet()
    {
        KeyPair = CryptoLogic.GenerateKeyPair();
    }

}
