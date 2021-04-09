export interface IProductAvailabilityEvent {
    product: string;
    available: boolean;
    message ? : string;
}

export interface ICustomerEvent {
    product: string;
    available: boolean;
    message ? : string;
}

export interface IOrderEvent {
    orderId: string;
}