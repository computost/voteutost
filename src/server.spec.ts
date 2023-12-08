import "reflect-metadata";
import type { Express } from "express";
import request, { Test } from "supertest";
import { beforeEach, describe, test } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import start from "./server";
import { User } from "./entities/User";
import { DataSource } from "typeorm";
import { promisify } from "util";
import { randomBytes, pbkdf2 } from "crypto";
import createDataSource from "./createDataSource";
const pbkdf2Async = promisify(pbkdf2);

let app: Express;
let dbContainer: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeEach(async () => {
  dbContainer = await new PostgreSqlContainer().start();
  const dataSourceUrl = dbContainer.getConnectionUri();
  app = await start(dataSourceUrl);
  dataSource = createDataSource(dataSourceUrl);
  await dataSource.initialize();
}, 100000);

describe("GET /whoami", () => {
  let response: Test;

  test("unauthorized", async () => {
    whenRequestingWhoAmI();
    await thenTheResponseHasStatus(401);
  });

  test("authorized", async () => {
    await givenAnAuthenticatedSession("user@example.com", "password");
    whenRequestingWhoAmI("user@example.com", "password");
    await thenTheResponseHasStatus(200);
  });

  async function givenAnAuthenticatedSession(
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

  function whenRequestingWhoAmI(username?: string, password?: string) {
    response = request(app).get("/whoami");
    if (username && password) {
      response = response.auth(username, password);
    }
  }

  async function thenTheResponseHasStatus(status: number) {
    await response.expect(status);
  }
});
