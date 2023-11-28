import type { Express } from "express";
import request, { Test } from "supertest";
import { beforeEach, describe, test } from "vitest";
import start from "./server";

let app: Express;

beforeEach(() => {
  app = start();
});

describe("GET /whoami", () => {
  let response: Test;

  test("unauthorized", async () => {
    whenRequestingWhoAmI();
    await thenTheResponseIsUnauthorized(401);
  });

  function whenRequestingWhoAmI() {
    response = request(app).get("/whoami");
  }

  async function thenTheResponseIsUnauthorized(status: number) {
    await response.expect(status);
  }
});
