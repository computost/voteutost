import "reflect-metadata";
import { type Express } from "express";
import { randomBytes, pbkdf2 } from "crypto";
import { default as request, Test } from "supertest";
import { promisify } from "util";
import { beforeEach } from "vitest";
import { User } from "./entities/User";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { DataSource } from "typeorm";
import start from "./server";
import createDataSource from "./createDataSource";
const pbkdf2Async = promisify(pbkdf2);

let app: Express;
let dbContainer: StartedPostgreSqlContainer;
let dataSource: DataSource;
let response: Test;

beforeEach(async () => {
  dbContainer = await new PostgreSqlContainer().start();
  const dataSourceUrl = dbContainer.getConnectionUri();
  app = await start(dataSourceUrl);
  dataSource = createDataSource(dataSourceUrl);
  await dataSource.initialize();
}, 100000);

export async function givenAnAuthenticatedSession(
  username: string,
  password: string
) {
  const salt = randomBytes(16);
  const encryptedPassword = await pbkdf2Async(
    password,
    salt,
    310000,
    32,
    "sha256"
  );
  await dataSource.manager.insert(User, {
    name: username,
    password: encryptedPassword,
    salt,
  });
}

export function whenRequestingWhoAmI(username?: string, password?: string) {
  response = request(app).get("/whoami");
  if (username && password) {
    response = response.auth(username, password);
  }
}

export async function thenTheResponseIsUnauthorized() {
  await response.expect(401);
}

export async function thenTheResponseIsUser(username: string) {
  await response.expect(200, username);
}
