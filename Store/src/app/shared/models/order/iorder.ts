import { IShippingAddress } from './ishippingaddress';
import { IPaymentSummary } from './ipaymentsummary';
import { IOrderItem } from './iorderitem';

export interface IOrder {
  id: number
  orderDate: string,
  buyerEmail: string,
  shippingAddress: IShippingAddress,
  deliveryMethod: string,
  shippingPrice: number,
  paymentSummary: IPaymentSummary,
  orderItems: IOrderItem[],
  subtotal: number,
  total: number,
  orderStatus: string,
  paymentIntentId: string
}
