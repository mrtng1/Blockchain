using Microsoft.AspNetCore.Mvc;
using Blockchain.Core.Entities;
using Blockchain.Core.Logic; 
using Blockchain.Core.DTOs;

namespace Blockchain.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WalletsController : ControllerBase
{
    /// <summary>
    /// POST /api/wallets
    /// Generates a new ECDSA keypair.
    /// </summary>
    [HttpPost]
    public ActionResult<WalletDto> CreateWallet()
    {
        var wallet = new Wallet();
        return Ok(new WalletDto(
            Address: wallet.KeyPair.PublicKey,
            PrivateKey: Convert.ToBase64String(
                wallet.KeyPair.PrivateKey.ExportPkcs8PrivateKey()
            )
        ));
    }

    [HttpGet("{address}/balance")]
    public ActionResult<BalanceDto> GetBalance(string address, [FromServices] Blockchain.Core.Entities.Blockchain bc)
    {
        string decodedAddress = Uri.UnescapeDataString(address);
        var bal = bc.GetBalance(decodedAddress);
        return Ok(new BalanceDto(address, bal));
    }
}