namespace Domain.Entities.OrderAggregate;

public enum OrderStatus
{
    Pending,
    PaymentReceived,
    PaymentFailed,
    Shipped,
    Delivered,
    Cancelled
}