namespace Blockchain.Core.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;

public class Blockchain
{
    public List<Block> Chain               { get; } = new();
    public List<Transaction> PendingTxs    { get; private set; } = new();
    public int Difficulty                  { get; set; } = 3; // block needs to generate a hash starting at least X zeros 
    public decimal MiningReward            { get; set; } = 2.5m;

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

    public void MinePending(string minerAddress)
    {
        // Copy pending transactions into the new block
        var transactions = new List<Transaction>(PendingTxs);

        // Add mining reward to THIS block
        transactions.Add(new Transaction(null, minerAddress, MiningReward));

        Block block = new Block
        {
            Index = Chain.Count,
            Timestamp = DateTime.UtcNow,
            Transactions = transactions,
            PreviousHash = GetLatest().Hash,
            Nonce = 0
        };

        block.Mine(Difficulty);
        Chain.Add(block);

        // Clear pending transactions 
        PendingTxs.Clear();
    }

    /// <summary>
    /// Add a new, valid transaction to the pending pool, if the sender has sufficient funds.
    /// </summary>
    public void AddTransaction(Transaction tx)
    {
        // Mining reward transactions don't have a FromAddress
        if (tx.FromAddress == null)
        {
            if (!tx.IsValid())
            {
                throw new ValidationException("Transaction is not valid.");
            }
            PendingTxs.Add(tx);
            return; 
        }

        if (string.IsNullOrEmpty(tx.FromAddress) || string.IsNullOrEmpty(tx.ToAddress))
            throw new ArgumentException("Transaction must include both from and to addresses.");

        if (tx.Amount <= 0)
            throw new ArgumentException("Transaction amount must be positive.");

        if (!tx.IsValid()) 
            throw new InvalidOperationException("Cannot add invalid (bad signature) transaction.");

        decimal currentBalanceOnChain = GetBalance(tx.FromAddress);

        // Calculate how much this sender has already committed in other pending transactions
        decimal pendingOutgoingAmount = PendingTxs
            .Where(ptx => ptx.FromAddress == tx.FromAddress)
            .Sum(ptx => ptx.Amount);

        decimal availableBalance = currentBalanceOnChain - pendingOutgoingAmount;

        if (tx.Amount > availableBalance)
        {
            throw new InvalidOperationException($"Insufficient funds. " +
                                                $"Requested: {tx.Amount}, " +
                                                $"Available (after other pending tx): {availableBalance}, " +
                                                $"Chain Balance: {currentBalanceOnChain}, " +
                                                $"Total Pending Outgoing: {pendingOutgoingAmount}");
        }

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
    
    public IEnumerable<Transaction> GetPendingTransactions() => PendingTxs.AsReadOnly();
    
    public decimal GetBalance(string address)
    {
        decimal balance = 0m;
        foreach (Block block in Chain)
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
