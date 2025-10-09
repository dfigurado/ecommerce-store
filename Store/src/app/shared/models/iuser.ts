import { IAddress } from "./iaddress";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  address: IAddress;
  roles: string | string[];
}
