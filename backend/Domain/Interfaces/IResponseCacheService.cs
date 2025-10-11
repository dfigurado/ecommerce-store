namespace Domain.Interfaces;

public interface IResponseCacheService
{
    Task CashedResponseAsync(string casheKey, object response, TimeSpan timeToLive);
    Task<string?> GetCashedResponseAsync(string casheKey);
    Task RemoveCacheByPattern(string pattern);
}