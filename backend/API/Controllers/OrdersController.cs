using API.Controllers.Base;
using API.Dto;
using API.Extensions;
using Domain.Entities;
using Domain.Entities.OrderAggregate;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class OrdersController(
    ICartService cartService, 
    IUnitOfWork unitOfWork) : BaseApiController
{

    private readonly ICartService _cartService = cartService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(OrderDto orderDto)
    {
        var email = HttpContext.User.GetEmail();
        var cart = await _cartService.GetCartAsync(orderDto.CartId);
        
        if (cart == null) return BadRequest("Cart not found");
        if (cart.PaymentIntentId == null) return BadRequest("No payment intent found");

        var items = new List<OrderItem>();

        foreach (var item in cart.Items!)
        {
            var productItem = await _unitOfWork.Repository<Domain.Entities.Product>().GetByIdAsync(item.ProductId);

             if (productItem == null) return BadRequest("Product not found");

             var itemOrdered = new ProductItemOrdered
             {
                 ProductId = productItem.Id,
                 ProductName = productItem.Name,
                 ImageUrl = productItem.ImageUrl
             };

             var orderItem = new OrderItem
             {
                 ItemOrdered = itemOrdered,
                 UnitPrice = productItem.Price,
                 Quantity = item.Quantity
             };

             items.Add(orderItem);
        }
        
        var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync(orderDto.DeliveryMethodId);

        if (deliveryMethod == null) return BadRequest("Delivery method not found");

        var order = new Order
        {
            OrderItems = items,
            DeliveryMethod = deliveryMethod,
            ShippingAddress = orderDto.ShippingAddress,
            Subtotal = items.Sum(x => x.UnitPrice * x.Quantity),
            Discount = orderDto.Discount,
            PaymentSummary = orderDto.PaymentSummary,
            PaymentIntentId = cart.PaymentIntentId,
            BuyerEmail = email
        };

        unitOfWork.Repository<Order>().Add(order);

        if (await unitOfWork.Complete())
        {
            return CreatedAtAction("GetOrder", new { id = order.Id }, order);
        }

        return BadRequest("Failed to create order");
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<GetOrderDto>>> GetOrdersForUser()
    {
        var spec = new OrderSpecification(HttpContext.User.GetEmail());
        var orders = await _unitOfWork.Repository<Order>().ListAsync(spec);
        var ordersToReturn = orders.Select(order => order.ToDto()).ToList();
        
        return Ok(ordersToReturn);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GetOrderDto>> GetOrder(int id)
    {
        var spec = new OrderSpecification(HttpContext.User.GetEmail(), id);
        var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
        
        if (order == null) return NotFound();
        
        return Ok(order.ToDto());
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<IReadOnlyList<GetOrderDto>>> DeleteOrder(int id)
    {
        var spec = new OrderSpecification(HttpContext.User.GetEmail(), id);
        var result = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
        
        if (result == null) return NotFound();

        _unitOfWork.Repository<Order>().Delete(result);

        if (!await _unitOfWork.Complete()) return BadRequest("Failed to delete order");
        
        // Retrieve a new list of orders after deletion
        var specTwo = new OrderSpecification(HttpContext.User.GetEmail());
        var orders = await _unitOfWork.Repository<Order>().ListAsync(specTwo);
        var ordersToReturn = orders.Select(order => order.ToDto()).ToList();

        return Ok(ordersToReturn);

    }
}