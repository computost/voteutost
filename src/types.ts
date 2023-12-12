import type { User as UserEntity } from "./entities/User";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface User extends UserEntity {}
  }
}
