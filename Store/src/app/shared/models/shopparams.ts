export class ShopParams {
  brands: string[] = [];
  types: string[] = [];
  sort = 'name';
  pageSize: number = 10;
  pageNumber: number = 1;
  search: string = '';
}
