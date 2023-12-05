import "reflect-metadata";
import type { Express } from "express";
import request, { Test } from "supertest";
import { beforeEach, describe, test } from "vitest";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import start from "./server";
import { User } from "./entities/User";
import { DataSource } from "typeorm";

let app: Express;
let dbContainer: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeEach(async () => {
  app = start();

  dbContainer = await new PostgreSqlContainer().start();
  dataSource = new DataSource({
    type: "postgres",
    url: dbContainer.getConnectionUri(),
    //database: "test",
    synchronize: true,
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
  });
  await dataSource.initialize();
});

describe("GET /whoami", () => {
  let response: Test;

  test("unauthorized", async () => {
    whenRequestingWhoAmI();
    await thenTheResponseHasStatus(401);
  });

  test("authorized", async () => {
    await givenAnAuthenticatedSession("user@example.com", "password");
    whenRequestingWhoAmI();
    await thenTheResponseHasStatus(200);
  });

  async function givenAnAuthenticatedSession(username: string, password: string) {
    
  }

  function whenRequestingWhoAmI() {
    response = request(app).get("/whoami");
  }

  async function thenTheResponseHasStatus(status: number) {
    await response.expect(status);
  }
});
