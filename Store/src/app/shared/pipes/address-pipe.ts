import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmationToken } from '@stripe/stripe-js';
import { IShippingAddress } from '../models/order/ishippingaddress';

@Pipe({
  name: 'address',
  standalone: true
})

export class AddressPipe implements PipeTransform {
  transform(value?: ConfirmationToken['shipping'] | IShippingAddress, ...args: unknown[]): unknown {
    if (value && 'address' in value && value.name) {
      const {
        line1,
        line2,
        city,
        state,
        country,
        postal_code
      } = (value as ConfirmationToken['shipping'])?.address!;

      return `${value.name}, ${line1}, ${line2 ? ',' + line2 : ''},
        ${city}, ${state}, ${postal_code}, ${country}`;
    } else if (value && 'line1' in value) {
      const {
        line1,
        line2,
        city,
        county,
        country,
        postalCode
      } = value as IShippingAddress;

      return `${line1}${line2 ? ', ' + line2 : ''},
        ${city}, ${county}, ${postalCode}, ${country}`;
    } else {
      return 'Unknown address';
    }
  }
}
