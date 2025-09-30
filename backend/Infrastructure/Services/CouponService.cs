using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Common.Helper;
using Microsoft.Extensions.Options;
using Stripe;

namespace Infrastructure.Services
{
    public class CouponService (
        IOptions<StripeSettings> options) : ICouponService
    {
        private readonly StripeSettings _stripeSettings = options.Value;

        public async Task<StoreCoupon?> GetCouponFromPromoCode(string code)
        {
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;

            var promotionService = new PromotionCodeService();

            var options = new PromotionCodeListOptions
            {
                Code = code
            };

            var promotionCodes = await promotionService.ListAsync(options);

            var promotionCode = promotionCodes.FirstOrDefault();

            if (promotionCode != null && promotionCode.Coupon != null)
            {
                return new StoreCoupon
                {
                    Name = promotionCode.Coupon.Name,
                    AmountOff = promotionCode.Coupon.AmountOff,
                    PercentOff = promotionCode.Coupon.PercentOff,
                    CouponId = promotionCode.Coupon.Id,
                    PromotionCode = promotionCode.Code
                };
            }

            return null;
        }
    }
}