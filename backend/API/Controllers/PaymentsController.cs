using API.Controllers.Base;
using API.Extensions;
using API.SignalR;
using Domain.Entities;
using Domain.Entities.OrderAggregate;
using Domain.Interfaces;
using Domain.Specifications;
using Infrastructure.Common.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Stripe;
using Event = Stripe.Event;

namespace API.Controllers;

public class PaymentsController(
    IPaymentService paymentService, 
    IUnitOfWork unitOfWork,
    ILogger<PaymentsController> logger,
    IOptions<StripeSettings> options,
    IHubContext<NotificationsHub> notificationHubContext): BaseApiController
{

    private readonly IPaymentService _paymentService = paymentService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ILogger<PaymentsController> _logger = logger;
    private readonly StripeSettings _stripeSettings = options.Value;
    private readonly IHubContext<NotificationsHub> _notificationHubContext = notificationHubContext;

    [Authorize]
    [HttpPost("{cartId}")]
    public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntent(string cartId)
    {
        var cart = await _paymentService.CreateOrUpdatePaymentIntent(cartId);
        
        if (cart == null) return BadRequest("Problem with your cart");
        
        return Ok(cart);
    }

    [HttpGet("delivery-methods")]
    public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
    {
        return Ok(await _unitOfWork.Repository<DeliveryMethod>().GetAllAsync());
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
            _logger.LogError(ex, "Stripe exception occurred.");
            return StatusCode(StatusCodes.Status500InternalServerError, "Webhook error");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An Unexpected error occurred.");
            return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
        }
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        if (intent.Status != "succeeded")
        {
            _logger.LogWarning("Payment intent {PaymentIntentId} has status {Status}, skipping processing", 
                intent.Id, intent.Status);
            return;
        }

        var order = await UpdateOrderPaymentStatus(intent);
    
        if (order == null)
        {
            _logger.LogWarning("Order not found for payment intent {PaymentIntentId}. This could be a duplicate webhook or orphaned payment.", 
                intent.Id);
            return; // Don't throw - webhook should still return 200 OK
        }

        _logger.LogInformation("Order {OrderId} payment completed successfully", order.Id);

        var connectionId = NotificationsHub.GetConnectionIdByEmail(order.BuyerEmail);

        if (!string.IsNullOrEmpty(connectionId))
        {
            await _notificationHubContext.Clients.Client(connectionId)
                .SendAsync("OrderCompletionNotification", order.ToDto());

            _logger.LogInformation("Sent order completion notification to user {Email}", order.BuyerEmail);
        }
        else
        {
            _logger.LogInformation("No active connection found for user {Email}, notification not sent", order.BuyerEmail);
        }
    }

    private async Task<Order?> UpdateOrderPaymentStatus(PaymentIntent intent)
    {
        var spec = new OrderSpecification(intent.Id, true);
        var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

        if (order == null)
        {
            _logger.LogWarning("No order found for payment intent {PaymentIntentId}", intent.Id);
            return null;
        }

        var oderTotalInCents = (long)Math.Round(order.GetTotal() * 100, MidpointRounding.AwayFromZero);

        order.Status = oderTotalInCents != intent.Amount 
            ? OrderStatus.PaymentMismatch 
            : OrderStatus.PaymentReceived;

        await _unitOfWork.Complete();

        _logger.LogInformation("Updated order {OrderId} status to {Status}", order.Id, order.Status);

        return order;
    }

    private Event ConstructStripeEvent(string json)
    {
        try
        {
            var ent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _stripeSettings.WhSecret);
            return ent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to construct stripe event.");
            throw new StripeException("Invalid signature");
        }
    }
}