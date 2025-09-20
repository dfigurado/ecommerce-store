using API.Controllers.Base;
using API.Extensions;
using API.SignalR;
using Domain.Entities;
using Domain.Entities.OrderAggregate;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Stripe;
using Event = Stripe.Event;

namespace API.Controllers;

public class PaymentsController(
    IPaymentService paymentService, 
    IUnitOfWork unitOfWork,
    ILogger<PaymentsController> logger, 
    IConfiguration config,
    IHubContext<NotificationHub> notificationHubContext): BaseApiController
{
    private readonly string _whSecret = config["StripeSettings:WhSecret"]!;
    
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
    public async Task<IActionResult> StripeWebhook()
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
        catch (StripeException ex)
        {
            logger.LogError(ex, "Stripe exception occurred.");
            return StatusCode(StatusCodes.Status500InternalServerError, "Webhook error");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An Unexpected error occurred.");
            return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
        }
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        if (intent.Status != "succeeded")
        {
            var spec = new OrderSpecification(intent.Id, true);
            var order = await unitOfWork.Repository<Order>().GetEntityWithSpec(spec) 
                        ?? throw new Exception("Order not found");

            order.Status = (long)order.GetTotal() * 100 != intent.Amount ? OrderStatus.PaymentMismatch : OrderStatus.PaymentReceived;
            
            await unitOfWork.Complete();

            var connectionId = NotificationHub.GetConnectionIdByEmail(order.BuyerEmail);

            if (!string.IsNullOrEmpty(connectionId))
            {
                await notificationHubContext.Clients.Client(connectionId)
                    .SendAsync("OrderCompleteNotification", order.ToDto());
            }
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
            logger.LogError(ex, "Failed to construct stripe event.");
            throw new StripeException("Invalid signature");
        }
    }
}