using API.Controllers.Base;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CouponsController(ICouponService couponService) : BaseApiController
    {
        private readonly ICouponService _couponService = couponService;

        [HttpGet("{code}")]
        public async Task<ActionResult<StoreCoupon>> ValidateCoupon(string code)
        {
            var coupon = await _couponService.GetCouponFromPromoCode(code);

            if (coupon == null) return BadRequest("Invalid voucher code");

            return coupon;
        }
    }
}
