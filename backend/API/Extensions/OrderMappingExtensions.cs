using API.Dto;
using API.Helper;
using Domain.Entities.OrderAggregate;

namespace API.Extensions;

public static class OrderMappingExtensions
{
    public static GetOrderDto ToDto(this Order order)
    {
        return new GetOrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            BuyerEmail = order.BuyerEmail,
            ShippingAddress = order.ShippingAddress,
            DeliveryMethod = order.DeliveryMethod.Description,
            ShippingPrice = order.DeliveryMethod.Price,
            PaymentSummary = order.PaymentSummary,
            OrderItems = order.OrderItems.Select(item => item.ToDto()).ToList(),
            Subtotal = order.Subtotal,
            Discount = order.Discount,
            Total = order.GetTotal(),
            OrderStatus = order.Status.ToString(),
            PaymentIntentId = order.PaymentIntentId
        };
    }

    private static OrderItemDto ToDto(this OrderItem orderItem)
    {
        return new OrderItemDto
        {
            ProductId = orderItem.ItemOrdered.ProductId,
            ProductName = orderItem.ItemOrdered.ProductName,
            ImageUrl = orderItem.ItemOrdered.ImageUrl,
            Price = orderItem.UnitPrice,
            Quantity = orderItem.Quantity
        };
    }
}