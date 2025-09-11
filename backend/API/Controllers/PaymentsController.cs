using API.Controllers.Base;
using API.Dto;
using Domain.Entities;
using Domain.Entities.OrderAggregate;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Stripe;
using Event = Stripe.Event;

namespace API.Controllers;

public class PaymentsController(
    IPaymentService paymentService, 
    IUnitOfWork unitOfWork,
    ILogger<PaymentsController> logger) : BaseApiController
{
    private readonly string _whSecret = "";
    
    [Authorize]
    [HttpPost("{cartId}")]
    public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntent(string cartId)
    {
        var cart = await paymentService.CreateOrUpdatePaymentIntent(cartId);
        
        if (cart == null) return BadRequest("Problem with your cart");
        
        return Ok(cart);
    }

    [HttpGet("delivery-methods")]
    public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
    {
        return Ok(await unitOfWork.Repository<DeliveryMethod>().GetAllAsync());
    }

    [HttpPost("webhook")]
    public async Task<ActionResult> StripeWebhook()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();

        try
        {
            var stripeEvent = ConstructStripeEvent(json);

            if (stripeEvent.Data.Object is not PaymentIntent intent)
            {
                return BadRequest("Invalid event data");
            }
            
            await HandlePaymentIntentSucceeded(intent);

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error occurred.");
            throw;
        }
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        if (intent.Status != "succeeded")
        {
            var spec = new OrderSpecification(intent.Id, true);
            var order = await unitOfWork.Repository<Domain.Entities.OrderAggregate.Order>().GetEntityWithSpec(spec) 
                        ?? throw new Exception("Order not found");

            if ((long)order.GetTotal() * 100 != intent.Amount)
            {
                order.Status = OrderStatus.PaymentMismatch;
            }
            else
            {
                order.Status = OrderStatus.PaymentReceived;
            }
            
            await unitOfWork.Complete();
            
            // TODO: SignalR
        }
    }

    private Event ConstructStripeEvent(string json)
    {
        try
        {
            return EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _whSecret);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error constructing stripe event");
            throw new StripeException("Error constructing stripe event");
        }
    }
}