namespace Domain.Entities.OrderAggregate;

public class OrderItem : BaseEntity
{
    public ProductItemOrdered ItemOrdered { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}