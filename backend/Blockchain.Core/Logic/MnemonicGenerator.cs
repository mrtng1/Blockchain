using System.Security.Cryptography;
using System.Text;

namespace Blockchain.Core.Logic;

public static class MnemonicGenerator
{
    public static string[] WordList = File.ReadAllLines("../Blockchain.Core/Utils/wordlist.txt");
    
    public static string GenerateMnemonic(int entropyBits = 128)
        {
            if (entropyBits % 32 != 0 || entropyBits < 128 || entropyBits > 256)
                throw new ArgumentException("Entropy must be 128–256 bits and divisible by 32.");

            byte[] entropy = RandomNumberGenerator.GetBytes(entropyBits / 8);
            return GenerateMnemonicFromEntropy(entropy);
        }

        public static string GenerateMnemonicFromEntropy(byte[] entropy)
        {
            int entropyBits = entropy.Length * 8;
            if (entropyBits % 32 != 0 || entropyBits < 128 || entropyBits > 256)
                throw new ArgumentException("Entropy must be 128–256 bits (16-32 bytes) and divisible by 32 (4 bytes).");

            byte[] hash = SHA256.HashData(entropy);
            int checksumBitsCount = entropyBits / 32;

            List<bool> bits = new List<bool>();
            foreach (byte b in entropy)
            {
                for (int i = 7; i >= 0; i--) // MSB first
                {
                    bits.Add((b & (1 << i)) != 0);
                }
            }

            for (int i = 0; i < checksumBitsCount; i++) // Add checksum bits (MSB of the start of the hash)
            {
                int byteIndex = i / 8;
                int bitInByteIndex = 7 - (i % 8); // MSB first within the byte
                bits.Add((hash[byteIndex] & (1 << bitInByteIndex)) != 0);
            }

            var mnemonicWords = new List<string>();
            int totalBits = entropyBits + checksumBitsCount;
            if (bits.Count != totalBits) // Sanity check
            {
                throw new InvalidOperationException($"Expected {totalBits} bits, but got {bits.Count}");
            }

            for (int i = 0; i < totalBits; i += 11)
            {
                int index = 0;
                for (int j = 0; j < 11; j++)
                {
                    if (bits[i + j])
                    {
                        index |= (1 << (10 - j)); // Build integer from 11 bits, MSB first
                    }
                }
                mnemonicWords.Add(WordList[index]);
            }
            return string.Join(" ", mnemonicWords);
        }

        public static byte[] MnemonicToSeed(string mnemonic)
        {
            string normalizedMnemonic = mnemonic.Normalize(NormalizationForm.FormKD);
            string saltString = "mnemonic";
            byte[] saltBytes = Encoding.UTF8.GetBytes(saltString);
            byte[] mnemonicBytes = Encoding.UTF8.GetBytes(normalizedMnemonic);

            using (var pbkdf2 = new Rfc2898DeriveBytes(mnemonicBytes, saltBytes, 2048, HashAlgorithmName.SHA512))
            {
                return pbkdf2.GetBytes(64); // 512 bits seed
            }
        }
}
