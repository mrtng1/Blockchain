using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Blockchain.Core.Entities;
using Blockchain.Core.DTOs;

namespace Blockchain.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlockchainController : ControllerBase
{
    private readonly Blockchain.Core.Entities.Blockchain _bc;

    public BlockchainController(Blockchain.Core.Entities.Blockchain bc) => _bc = bc;

    [HttpGet]     // GET /api/blockchain
    public ActionResult<IEnumerable<Block>> GetChain() 
        => Ok(_bc.Chain);

    [HttpGet("block/{index}")]  // GET /api/blockchain/block/2
    public ActionResult<Block> GetBlock(int index)
    {
        if (index < 0 || index >= _bc.Chain.Count)
            return NotFound();
        return Ok(_bc.Chain[index]);
    }

    [HttpGet("mempool")]  // GET /api/blockchain/mempool
    public ActionResult<IEnumerable<Transaction>> GetPending() 
        => Ok(_bc.GetPendingTransactions());

    [HttpPost("transaction")]  
    public IActionResult CreateTransaction([FromBody] TransactionDto dto)
    {
        var tx = new Transaction(dto.FromAddress, dto.ToAddress, dto.Amount)
        {
            Signature = dto.Signature
        };
        try
        {
            _bc.AddTransaction(tx);
            return Ok(new { message = "Added to mempool" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("mine/{minerAddress}")]  
    public IActionResult Mine(string minerAddress)
    {
        _bc.MinePending(minerAddress);
        return Ok(new {
            message     = "Mined successfully",
            latestBlock = _bc.GetLatest()
        });
    }
}