using System.Text;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Helpers;

[AttributeUsage(AttributeTargets.All)]
public class CacheAttribute(int timeToLiveSeconds) : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var cacheService = context.HttpContext.RequestServices
            .GetRequiredService<IResponseCacheService>();
        var cacheKey = GenerateCacheKeyFromRequest(context.HttpContext.Request);
        var cachedResponse = await cacheService.GetCashedResponseAsync(cacheKey);

        if (!string.IsNullOrEmpty(cachedResponse))
        {
            var contentResult = new ContentResult
            {
                Content = cachedResponse,
                ContentType = "application/json",
                StatusCode = 200
            };
            
            context.Result = contentResult;
            return;
        }
        
        var executedContext = await next(); // move to the action

        if (executedContext.Result is OkObjectResult okObjectResult)
        {
            if (okObjectResult.Value != null)
            {
                await cacheService.CashedResponseAsync(cacheKey, okObjectResult.Value, 
                    TimeSpan.FromSeconds(timeToLiveSeconds));
            }
        }
    }

    private string GenerateCacheKeyFromRequest(HttpRequest requet)
    {
        var keyBuilder = new StringBuilder();
        
        keyBuilder.Append($"{requet.Path}");
        foreach (var (key, value) in requet.Query.OrderBy(x => x.Key))
        {
            keyBuilder.Append($"|{key}-{value}");
        }
        
        return keyBuilder.ToString();
    }
}