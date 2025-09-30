import { IPaymentSummary } from './ipaymentsummary';
import { IShippingAddress } from './ishippingaddress';

export interface IOrderToCreate {
  cartId: string;
  deliveryMethodId: number;
  shippingAddress: IShippingAddress;
  paymentSummary: IPaymentSummary;
  discount?: number;
}
