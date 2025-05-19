using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Blockchain.Core.DTOs;

namespace Blockchain.WebApi.Hubs;

public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<string, string> PublicKeys = new();
    
    public override async Task OnConnectedAsync()
    {
        var http   = Context.GetHttpContext()!;
        string username = http.Request.Query["username"].ToString();

        if (!string.IsNullOrEmpty(username))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, username);
        }

        await base.OnConnectedAsync();
    }

    public async Task SendPrivateMessage(MessageDto message)
    {
        await Clients
            .Group(message.Recipient)
            .SendAsync("ReceiveEncryptedMessage", message);
    }
    
    public record ExchangeKeysDto(
        string SenderUsername,
        string SenderPublicKey,
        string RecipientUsername
    );

    public async Task ExchangePublicKeys(ExchangeKeysDto dto)
    {
        PublicKeys[dto.SenderUsername] = dto.SenderPublicKey;

        // Forward the sender's public key to the recipient
        await Clients.Group(dto.RecipientUsername).SendAsync(
            "RetrieveExchangedKey",
            new {
                Sender = dto.SenderUsername,
                PublicKey = dto.SenderPublicKey
            });
    }
}
