using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Services
{
    public class CartService(IConnectionMultiplexer redis) : ICartService
    {
        private readonly IDatabase _db = redis.GetDatabase();

        public async Task<bool> DeleteCartAsync(string key)
        {
            return await _db.KeyDeleteAsync(key);
        }

        public async Task<ShoppingCart?> GetCartAsync(string cartId)
        {
            var data = await _db.StringGetAsync(cartId);
  
            return data.IsNullOrEmpty ? null : JsonSerializer.Deserialize<ShoppingCart>(data!);  
        }

        public async Task<ShoppingCart?> SetCartAsync(ShoppingCart cart)
        {
            var created = await _db.StringSetAsync(cart.Id,
                JsonSerializer.Serialize(cart), TimeSpan.FromDays(30));

            if (!created) return null;
            
            return await GetCartAsync(cart.Id);
        }
    }
}