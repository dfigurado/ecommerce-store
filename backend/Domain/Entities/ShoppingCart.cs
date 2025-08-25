using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ShoppingCart
    {
        public required string Id { get; set; }
        public List<CartItem>? Items { get; set; }
    }
}