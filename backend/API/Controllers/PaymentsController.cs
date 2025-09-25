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
    IHubContext<NotificationsHub> notificationHubContext): BaseApiController
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
    public async Task<IActionResult> StripeWebHook()
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
    
    private async Task<Order?> UpdateOrderPaymentStatus(PaymentIntent intent)
    {
        var spec = new OrderSpecification(intent.Id, true);
        var order = await unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

        if (order == null)
        {
            logger.LogWarning("No order found for payment intent {PaymentIntentId}", intent.Id);
            return null;
        }

        var oderTotalInCents = (long)Math.Round(order.GetTotal() * 100, MidpointRounding.AwayFromZero);

        if (oderTotalInCents != intent.Amount)
        {
            order.Status = OrderStatus.PaymentMismatch;
        }
        else
        {
            order.Status = OrderStatus.PaymentReceived;
        }

        await unitOfWork.Complete();

        logger.LogInformation("Updated order {OrderId} status to {Status}", order.Id, order.Status);

        return order;
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        if (intent.Status != "succeeded")
        {
            logger.LogWarning("Payment intent {PaymentIntentId} has status {Status}, skipping processing", 
                intent.Id, intent.Status);
            return;
        }

        var order = await UpdateOrderPaymentStatus(intent);
    
        if (order == null)
        {
            logger.LogWarning("Order not found for payment intent {PaymentIntentId}. This could be a duplicate webhook or orphaned payment.", 
                intent.Id);
            return; // Don't throw - webhook should still return 200 OK
        }

        logger.LogInformation("Order {OrderId} payment completed successfully", order.Id);

        var connectionId = NotificationsHub.GetConnectionIdByEmail(order.BuyerEmail);

        if (!string.IsNullOrEmpty(connectionId))
        {
            await notificationHubContext.Clients.Client(connectionId)
                .SendAsync("OrderCompletionNotification", order.ToDto());
        
            logger.LogInformation("Sent order completion notification to user {Email}", order.BuyerEmail);
        }
        else
        {
            logger.LogInformation("No active connection found for user {Email}, notification not sent", order.BuyerEmail);
        }
    }

    private Event ConstructStripeEvent(string json)
    {
        try
        {
            var ent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _whSecret);
            return ent;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to construct stripe event.");
            throw new StripeException("Invalid signature");
        }
    }
}