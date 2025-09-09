using System.ComponentModel.DataAnnotations;
using Domain.Entities.OrderAggregate;
using Stripe;

namespace API.Dto;

public class OrderDto
{
    [Required]
    public string CartId { get; set; } = string.Empty;
    [Required]
    public int DeliveryMethodId { get; set; }
    [Required]
    public ShippingAddress ShippingAddress { get; set; } = null!;
    [Required]
    public PaymentSummary PaymentSummary { get; set; } = null!;
}