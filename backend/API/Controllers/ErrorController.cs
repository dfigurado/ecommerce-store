using System.Security.Claims;
using API.Controllers.Base;
using API.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ErrorController : BaseApiController
{
    [HttpGet("unauthorized")]
    public IActionResult GetUnauthorized()
    {
        return Unauthorized();
    }

    [HttpGet("forbidden")]
    public IActionResult GetForbidden()
    {
        return Forbid();
    }

    [HttpGet("notfound")]
    public IActionResult GetNotFound()
    {
        return NotFound();
    }

    [HttpGet("badrequest")]
    public IActionResult GetBadRequest()
    {
        return BadRequest();
    }

    [HttpGet("internalerror")]
    public IActionResult GetInternalServerError()
    {
        throw new Exception("Internal server error");
    }

    [HttpPost("validationerror")]
    public IActionResult GetValidationError(CreateProductDto product)
    {
        return Ok();
    }

    [Authorize]
    [HttpGet("secret")]
    public IActionResult GetSecret()
    {
        var name  = User.FindFirst(ClaimTypes.Name)?.Value;
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok($"Hello {name} your id is {id}");
    }
}