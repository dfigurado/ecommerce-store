using API.Controllers.Base;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProductsController(IUnitOfWork unitOfWork) : BaseApiController
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts([FromQuery]ProductSpecParams specParams)
        {
            var spec = new ProductSpecification(specParams);
            return await CreatePageResult(_unitOfWork.Repository<Product>(), spec, specParams.PageIndex, specParams.PageSize);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id);

            if (product == null) return NotFound();

            return product;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            _unitOfWork.Repository<Product>().Add(product);

            if (await _unitOfWork.Complete())
            {
                return CreatedAtAction("GetProduct", new { id = product.Id }, product);
            }

            return BadRequest("Failed to create product");
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> UpdateProduct(int id, Product product)
        {
            if (product.Id != id || !ProductExists(id))
                return BadRequest("Cannot update this product");

            _unitOfWork.Repository<Product>().Update(product);

            if (await _unitOfWork.Complete())
            {
                return NoContent();
            }

            return BadRequest("Failed to update product");
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id);

            if (product == null) return NotFound();

            _unitOfWork.Repository<Product>().Delete(product);

            if (await _unitOfWork.Complete())
            {
                return NoContent();
            }

            return BadRequest("Failed to delete product");
        }

        [HttpGet("brands")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
        {
            var spec = new BrandListSpecification();
            return Ok(await _unitOfWork.Repository<Product>().ListAsync(spec));
        }

        [HttpGet("types")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
        {
            var spec = new TypeListSpecification();
            return Ok(await _unitOfWork.Repository<Product>().ListAsync(spec));
        }

        private bool ProductExists(int id)
        {
            return unitOfWork.Repository<Product>().Exists(id);
        }
    }
}