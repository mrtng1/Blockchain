namespace Blockchain.Core.DTOs;

// public record MessageDto(
//     string Sender, // sender publicKey
//     string SenderName,
//     string Recipient, // recipient publicKey
//     string RecipientName,
//     string Content,
//     string EncryptionIv
//     );

public record MessageDto(
    string Sender,
    string SenderName,
    string Recipient,
    string Content
);