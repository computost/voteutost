import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import start from "./server";

let app: Express;

beforeEach(() => {
  app = start();
});

describe("GET /hello", () => {
  it('responds with "Hello, World!"', async () => {
    const response = await request(app).get("/hello");
    expect(response.text).toBe("Hello, World!");
  });
});
