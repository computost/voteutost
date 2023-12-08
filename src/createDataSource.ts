import { DataSource } from "typeorm";
import { User } from "./entities/User";

const createDataSource = (url: string) =>
  new DataSource({
    type: "postgres",
    url,
    synchronize: true,
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
  });

export default createDataSource;
