using API.Controllers.Base;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CartController(ICartService cartService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<ShoppingCart>> GetCart(string id)
        {
            var cart = await cartService.GetCartAsync(id);

            return Ok(cart ?? new ShoppingCart { Id = id });
        }

        [HttpPut]
        public async Task<ActionResult<ShoppingCart>> UpdateCart(ShoppingCart cart)
        {
            var updateCart = await cartService.SetCartAsync(cart);

            if (updateCart == null) return BadRequest("Some thing went wrong when updating the cart");

            return updateCart;
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteCart(string id)
        {
            var result = await cartService.DeleteCartAsync(id);

            if (!result) return BadRequest("Failed to delete cart");

            return Ok();
        }
    }
}