using System.Text.Json;
using Domain.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class ResponseCacheService(IConnectionMultiplexer redis): IResponseCacheService
{
    private readonly IDatabase _database = redis.GetDatabase(1);
    
    public async Task CashedResponseAsync(string casheKey, object response, TimeSpan timeToLive)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        var serializedResponse = JsonSerializer.Serialize(response, options);
        await _database.StringSetAsync(casheKey, serializedResponse, timeToLive);
    }

    public async Task<string?> GetCashedResponseAsync(string casheKey)
    {
        var cachedResponse = await _database.StringGetAsync(casheKey);
        if (cachedResponse.IsNullOrEmpty) return null;
        return cachedResponse;
    }

    public async Task RemoveCacheByPattern(string pattern)
    {
        var server = redis.GetServer(redis.GetEndPoints().First());
        var key = server.Keys(database:1, pattern:$"*{pattern}*").ToArray();

        if (key.Length != 0)
        {
            await _database.KeyDeleteAsync(key);
        }
    }
}