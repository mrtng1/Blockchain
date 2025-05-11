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
        Wallet wallet = new Wallet();

        return Ok(new WalletDto(
            Address: wallet.KeyPair.PublicKey,
            PrivateKey: Convert.ToBase64String(wallet.KeyPair.PrivateKey.ExportPkcs8PrivateKey()),
            Mnemonic: wallet.Mnemonic
        ));
    }
    
    [HttpPost("private-key")]
    public ActionResult<WalletDto> RecoverWallet([FromBody] MnemonicRecoveryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Mnemonic))
        {
            return BadRequest("Mnemonic is required.");
        }
        try
        {
            Wallet wallet = new Wallet(request.Mnemonic);
            return Ok(new WalletDto(
                Address: wallet.KeyPair.PublicKey,
                PrivateKey: Convert.ToBase64String(wallet.KeyPair.PrivateKey.ExportPkcs8PrivateKey()),
                Mnemonic: wallet.Mnemonic
            ));
        }
        catch (ArgumentException ex) 
        {
            return BadRequest($"Invalid mnemonic format: {ex.Message}");
        }
        catch (FormatException ex)
        {
            return BadRequest($"Error recovering wallet (invalid format or checksum): {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while recovering the wallet.");
        }
    }
    
    [HttpGet("{address}/balance")]
    public ActionResult<BalanceDto> GetBalance(string address, [FromServices] Blockchain.Core.Entities.Blockchain bc)
    {
        string decodedAddress = Uri.UnescapeDataString(address);
        var bal = bc.GetBalance(decodedAddress);
        return Ok(new BalanceDto(address, bal));
    }
}