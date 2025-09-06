using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class DeliveryMethod : BaseEntity
    {
        public required string ShortName { get; set; }
        public required string DeliveryTime { get; set; }
        public required string Description { get; set; }
        public required decimal Price { get; set; } 
    }
}