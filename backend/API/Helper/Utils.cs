namespace API.Helper;

public static class Utils
{
    public static decimal GetTotal(decimal subtotal, decimal shippingPrice)
    {
        return subtotal + shippingPrice;
    }
}