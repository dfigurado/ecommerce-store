using API.Controllers.Base;
using API.Helpers;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProductsController(IUnitOfWork unitOfWork) : BaseApiController
    {
        [Cache(600)]
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts(
            [FromQuery]ProductSpecParams specParams)
        {
            var spec = new ProductSpecification(specParams);
            return await CreatePagedResult(unitOfWork.Repository<Product>(), spec, specParams.PageIndex, specParams.PageSize);
        }

        [Cache(600)]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await unitOfWork.Repository<Product>().GetByIdAsync(id);

            if (product == null) return NotFound();

            return product;
        }

        [InvalidateCache("api/products|")]
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            unitOfWork.Repository<Product>().Add(product);

            if (await unitOfWork.Complete())
            {
                return CreatedAtAction("GetProduct", new { id = product.Id }, product);
            }

            return BadRequest("Failed to create product");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult> UpdateProduct(int id, Product product)
        {
            if (product.Id != id || !ProductExists(id))
                return BadRequest("Cannot update this product");

            unitOfWork.Repository<Product>().Update(product);

            if (await unitOfWork.Complete())
            {
                return NoContent();
            }

            return BadRequest("Failed to update product");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await unitOfWork.Repository<Product>().GetByIdAsync(id);

            if (product == null) return NotFound();

            unitOfWork.Repository<Product>().Delete(product);

            if (await unitOfWork.Complete())
            {
                return NoContent();
            }

            return BadRequest("Failed to delete product");
        }

        [Cache(10000)]
        [HttpGet("brands")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
        {
            var spec = new BrandListSpecification();
            return Ok(await unitOfWork.Repository<Product>().ListAsync(spec));
        }

        [Cache(10000)]
        [HttpGet("types")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
        {
            var spec = new TypeListSpecification();
            return Ok(await unitOfWork.Repository<Product>().ListAsync(spec));
        }

        private bool ProductExists(int id)
        {
            return unitOfWork.Repository<Product>().Exists(id);
        }
    }
}