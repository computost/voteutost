import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./server";

describe("GET /hello", () => {
  it('responds with "Hello, World!"', async () => {
    const response = await request(app).get("/hello");
    expect(response.text).toBe("Hello, World!");
  });
});
