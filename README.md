# express-server-sample

## 구현 기능
- [x] [Hello World!](src/services/IndexService.ts)
- [x] [선착순 쿠폰 발급](src/services/IssueCouponService.ts)(Redis)
  - [x] 단일 노드로 TPS 1,200 까지 확인
  - [x] 중복 유저 아이디로 발급 요청 시, 중복 발급 문제 해결
