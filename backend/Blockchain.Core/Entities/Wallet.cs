using Blockchain.Core.Logic;

namespace Blockchain.Core.Entities;

public class Wallet
{
    public AsymmetricKeyPair KeyPair { get; private set; }
    public string Mnemonic { get; private set; } // Recovery code

    // Generate a new wallet
    public Wallet()
    {
        Mnemonic = MnemonicGenerator.GenerateMnemonic();
        byte[] seed = MnemonicGenerator.MnemonicToSeed(Mnemonic);
        KeyPair = CryptoLogic.GenerateKeyPairFromSeed(seed);
    }

    // Restore a wallet from mnemonic
    public Wallet(string mnemonic)
    {
        Mnemonic = mnemonic;
        byte[] seed = MnemonicGenerator.MnemonicToSeed(mnemonic);
        KeyPair = CryptoLogic.GenerateKeyPairFromSeed(seed);
    }
}