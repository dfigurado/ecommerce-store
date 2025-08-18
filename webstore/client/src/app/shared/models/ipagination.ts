export interface IPaggination<T> {
    data: T[];
    pageIndex: number;
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}