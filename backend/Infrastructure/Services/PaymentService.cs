using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Common.Helper;
using Microsoft.Extensions.Options;
using Stripe;

namespace Infrastructure.Services
{
    public class PaymentService(
        ICartService cartService,
        IUnitOfWork unitOfWork,
        IOptions<StripeSettings> options) : IPaymentService
    {
        private readonly ICartService _cartService = cartService;
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly StripeSettings _stripeSettings = options.Value;

        public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
        {
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;

            var cart = await _cartService.GetCartAsync(cartId);

            if (cart == null) return null;

            var shippingPrice = await GetShippingPriceAsync(cart) ?? 0;

            await ValidatedCartItemsInCartAsync(cart);

            var subtotal = CalculateSubtotal(cart);

            if (cart.Coupon != null)
            {
                subtotal = await ApplyDiscountAsync(cart.Coupon, subtotal);
            }

            var total = subtotal + shippingPrice;

            await CreateUpdatePaymentIntentAsync(cart, total);

            await _cartService.SetCartAsync(cart);

            return cart;
        }

        private async Task CreateUpdatePaymentIntentAsync(ShoppingCart cart, long total)
        {
            var service = new PaymentIntentService();

            if (string.IsNullOrEmpty(cart.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = total,
                    Currency = "GBP",
                    PaymentMethodTypes = ["card"]
                };
                var intent = await service.CreateAsync(options);
                cart.PaymentIntentId = intent.Id;
                cart.ClientSecret = intent.ClientSecret;
            } 
            else
            {
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = total
                };
                await service.UpdateAsync(cart.PaymentIntentId, options);
            }
        }

        private async Task<long> ApplyDiscountAsync(StoreCoupon storeCoupon, long amount)
        {
            var couponService = new Stripe.CouponService();

            var coupon = await couponService.GetAsync(storeCoupon.CouponId);

            if(coupon.AmountOff.HasValue)
            {
                amount -= (long)coupon.AmountOff * 100;
            } 
            if (coupon.PercentOff.HasValue)
            {
                var discount = amount * (coupon.PercentOff.Value / 100);
                amount -= (long)discount;
            }
            
            return amount;
        }

        private long CalculateSubtotal(ShoppingCart cart)
        {
            var itemTotal = cart.Items!.Sum(x => x.Quantity * x.Price * 100);
            return (long)itemTotal;
        }

        private async Task ValidatedCartItemsInCartAsync(ShoppingCart cart)
        {
            foreach (var item in cart.Items!)
            {
                var productionItem = await _unitOfWork.Repository<Domain.Entities.Product>()
                    .GetByIdAsync(item.ProductId)
                        ?? throw new Exception("Problem getting product in cart");

                if (item.Price != productionItem.Price)
                {
                    item.Price = productionItem.Price;
                }
            }
        }

        private async Task<long?> GetShippingPriceAsync(ShoppingCart cart)
        {
            if (!cart.DeliveryMethodId.HasValue) return null;
            var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync((int)cart.DeliveryMethodId)
                                 ?? throw new Exception("Problem with delivery method");

            return (long)deliveryMethod.Price * 100;
        }
    }
}