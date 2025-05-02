using Blockchain.Core.Logic;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Blockchain.Core.Entities;

public class Block
{
    public int Index                 { get; set; }
    public DateTime Timestamp        { get; set; }
    public List<Transaction> Transactions { get; set; } = new();
    public string PreviousHash       { get; set; }
    public string Hash               { get; set; }
    public int Nonce                 { get; set; }

    /// <summary>
    /// Recompute this block’s hash over index, timestamp, all TX-hashes, previousHash and nonce.
    /// </summary>
    public string CalculateHash()
    {
        var txData = string.Join("", Transactions.Select(tx => tx.CalculateHash()));
        var raw = $"{Index}-{Timestamp:o}-{txData}-{PreviousHash}-{Nonce}";
        return CryptoLogic.ComputeArgon2Hash(raw, PreviousHash ?? "");
    }

    /// <summary>
    /// Simple proof-of-work: increment nonce until hash starts with N zeros.
    /// </summary>
    public void Mine(int difficulty)
    {
        var prefix = new string('0', difficulty);
        do
        {
            Nonce++;
            Hash = CalculateHash();
        } while (!Hash.StartsWith(prefix));
    }
}

