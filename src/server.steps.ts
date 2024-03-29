import "reflect-metadata";
import { type Express } from "express";
import { randomBytes, pbkdf2, timingSafeEqual } from "crypto";
import { default as request, Test } from "supertest";
import { promisify } from "util";
import { beforeEach, expect } from "vitest";
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

export function whenRegistering(username: string, password: string) {
  response = request(app)
    .post("/register")
    .send({ username, password })
    .set("Content-Type", "application/json");
}

export async function thenTheResponseIsUnauthorized() {
  await response.expect(401);
}

export async function thenTheResponseIsUser(username: string) {
  await response.expect(200, username);
}

export async function thenTheResponseIsCreated() {
  await response.expect(201);
}

expect.extend({
  toTimingSafeEqual(received: Parameters<typeof timingSafeEqual>[0], expected: Parameters<typeof timingSafeEqual>[1]) {
    return {
      pass: timingSafeEqual(received, expected),
      actual: received,
      expected,
      message: () => `${received} is${this.isNot ? " not" : ""} ${expected}`,
    };
  },
});

export async function thenTheUserExists(username: string, password: string) {
  const user = await dataSource.manager.findOneBy(User, { name: username });
  expect(user).not.toBeNull();
  const hashedPassword = await pbkdf2Async(
    password,
    user!.salt,
    310000,
    32,
    "sha256"
  );
  expect(hashedPassword).toTimingSafeEqual(user!.password);
}
