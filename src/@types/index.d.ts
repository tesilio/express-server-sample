declare module '@types' {
  interface RequestIssueCoupon {
    userId: string;
  }

  interface CouponMetadata {
    startTime: string;
    endTime: string;
    quantity: number;
  }
}
