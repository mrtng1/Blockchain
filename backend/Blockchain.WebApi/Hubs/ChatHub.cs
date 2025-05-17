using Microsoft.AspNetCore.SignalR;
using Blockchain.Core.DTOs;

namespace Blockchain.WebApi.Hubs;

public class ChatHub : Hub
{
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
}
