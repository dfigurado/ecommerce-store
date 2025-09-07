export interface IPagination<T> {
    data: T[];
    pageIndex: number;
    pageSize: number;
    count: number;
}
