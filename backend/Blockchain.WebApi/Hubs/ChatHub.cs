using Microsoft.AspNetCore.SignalR;
using Blockchain.Core.DTOs;

namespace Blockchain.WebApi.Hubs;

public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var http   = Context.GetHttpContext()!;
        var userId = http.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            Console.WriteLine($"Added connection {Context.ConnectionId} to group {userId}.");
        }
        else
        {
            Console.WriteLine("No userId in query ⇒ no group assignment.");
        }

        await base.OnConnectedAsync();
    }

    public async Task SendPrivateMessage(MessageDto message)
    {
        await Clients
            .Group(message.Recipient)
            .SendAsync("ReceiveEncryptedMessage", message);
    }
}
