declare module '@types' {
  interface RequestIssueCoupon {
    userId: string;
  }

  interface ResponseIssueCoupon {
    issued: boolean;
  }

  interface CouponMetadata {
    startTime: string;
    endTime: string;
    quantity: number;
  }
}
