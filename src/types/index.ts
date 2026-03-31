export interface ResponseIndexHelloWorld {
  message: string;
}

export interface RequestIssueCoupon {
  userId: string;
}

export interface ResponseIssueCoupon {
  issued: boolean;
}

export interface CouponMetadata {
  startTime: string;
  endTime: string;
  quantity: number;
}
