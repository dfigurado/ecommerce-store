using System.ComponentModel.DataAnnotations;

namespace API.Dto
{
    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be a greater than 0.")]
        public decimal Price { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string Brand { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "Quantity in stock must be a non-negative integer.")]
        public int QuantityInStock { get; set; }
    }
}