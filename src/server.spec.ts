import { describe, test } from "vitest";
import {
  givenAnAuthenticatedSession,
  thenTheResponseIsCreated,
  thenTheResponseIsUnauthorized,
  thenTheResponseIsUser,
  thenTheUserExists,
  whenRegistering,
  whenRequestingWhoAmI,
} from "./server.steps";

describe("GET /whoami", () => {
  describe("unauthorized", () => {
    test("no credentials", async () => {
      whenRequestingWhoAmI();
      await thenTheResponseIsUnauthorized();
    });

    test("non-existent user", async () => {
      whenRequestingWhoAmI("sasquatch@example.com", "password");
      await thenTheResponseIsUnauthorized();
    });
  });

  test("authorized", async () => {
    await givenAnAuthenticatedSession("user@example.com", "password");
    whenRequestingWhoAmI("user@example.com", "password");
    await thenTheResponseIsUser("user@example.com");
  });
});

describe("POST /register", () => {
  test("valid credentials", async () => {
    whenRegistering("user@example.com", "password");
    await thenTheResponseIsCreated();
    await thenTheUserExists("user@example.com", "password");
  });

  // TODO: Pick up here
  test("invalid credentials", async () => {});
});
