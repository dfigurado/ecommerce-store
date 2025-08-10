using API.Helpers;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Base;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    protected async Task<ActionResult> CreatePageResult<T>(IGenericRepository<T> repo, ISpecification<T> spec,
        int pageIndex, int pageSize) where T : BaseEntity
    {
         var items = await repo.ListAsync(spec);
         var count = await repo.CountAsync(spec);
         
         var pagination = new Pagination<T>(pageIndex, pageSize, count, items);
         
         return Ok(pagination);
    }
}