namespace Blockchain.Core.Entities;

// Blockchain.cs
using System;
using System.Collections.Generic;
using System.Linq;

public class Blockchain
{
    public List<Block> Chain               { get; } = new();
    public List<Transaction> PendingTxs    { get; private set; } = new();
    public int Difficulty                  { get; set; } = 4; // block needs to generate a hash starting at least X zeros 
    public decimal MiningReward            { get; set; } = 50m;

    public Blockchain()
    {
        Chain.Add(CreateGenesisBlock());
    }

    private Block CreateGenesisBlock()
    {
        return new Block
        {
            Index        = 0,
            Timestamp    = DateTime.UtcNow,
            PreviousHash = "0",
            Hash         = "0",
            Nonce        = 0,
        };
    }

    public Block GetLatest() => Chain.Last();

    /// <summary>
    /// Collect pending TXs into a block, mine it, award the miner, then reset the pool.
    /// </summary>
    public void MinePending(string minerAddress)
    {
        var block = new Block
        {
            Index          = Chain.Count,
            Timestamp      = DateTime.UtcNow,
            Transactions   = new List<Transaction>(PendingTxs),
            PreviousHash   = GetLatest().Hash,
            Nonce          = 0
        };
        block.Mine(Difficulty);
        Chain.Add(block);

        // reward for next round
        PendingTxs = new List<Transaction>
        {
            new Transaction(null, minerAddress, MiningReward) 
        };
    }

    /// <summary>
    /// Add a new, valid transaction to the pending pool.
    /// </summary>
    public void AddTransaction(Transaction tx)
    {
        if (string.IsNullOrEmpty(tx.FromAddress) || string.IsNullOrEmpty(tx.ToAddress))
            throw new ArgumentException("Transaction must include both from and to addresses.");
        if (!tx.IsValid())
            throw new InvalidOperationException("Cannot add invalid transaction.");
        PendingTxs.Add(tx);
    }

    /// <summary>
    /// Walk the chain to ensure all hashes & links are intact.
    /// </summary>
    public bool IsValidChain()
    {
        for (int i = 1; i < Chain.Count; i++)
        {
            var curr = Chain[i];
            var prev = Chain[i - 1];

            if (curr.Hash != curr.CalculateHash())         return false;
            if (curr.PreviousHash != prev.Hash)            return false;
            if (!curr.Transactions.All(tx => tx.IsValid())) return false;
        }
        return true;
    }
    
    public IEnumerable<Transaction> GetPendingTransactions() 
        => PendingTxs.AsReadOnly();
    
    public decimal GetBalance(string address)
    {
        decimal balance = 0m;
        foreach (var block in Chain)
        {
            foreach (var tx in block.Transactions)
            {
                if (tx.FromAddress == address) balance -= tx.Amount;
                if (tx.ToAddress   == address) balance += tx.Amount;
            }
        }
        return balance;
    }

}
