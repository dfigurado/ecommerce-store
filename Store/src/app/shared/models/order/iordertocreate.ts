import {IShippingAddress} from './ishippingaddress';
import {IPaymentSummary} from './ipaymentsummary';

export interface IOrderToCreate {
  cartId: string
  deliveryMethodId: number
  shippingAddress: IShippingAddress
  paymentSummary: IPaymentSummary
}
