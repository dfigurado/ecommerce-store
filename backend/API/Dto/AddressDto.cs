using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace API.Dto
{
    public class AddressDto
    {
        [Required]
        public string Line1 { get; set; } = string.Empty;
        public string? Line2 { get; set; } 
        [Required]
        public string City { get; set; } = string.Empty;
        [Required]
        public string County { get; set; } = string.Empty;
        [Required]
        public string PostalCode { get; set; } = string.Empty;
        [Required]
        public string Country { get; set; } = string.Empty;
    }
}