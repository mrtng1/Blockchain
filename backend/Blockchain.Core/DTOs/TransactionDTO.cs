namespace Blockchain.Core.DTOs;

/// <summary>
/// Incoming transaction payload
/// </summary>
public record TransactionDto(
    string FromAddress,
    string ToAddress,
    decimal Amount,
    string SenderPrivateKey
);