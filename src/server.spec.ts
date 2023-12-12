import { describe, test } from "vitest";
import {
  givenAnAuthenticatedSession,
  thenTheResponseIsUnauthorized,
  thenTheResponseIsUser,
  whenRequestingWhoAmI,
} from "./server.steps";

describe("GET /whoami", () => {
  test("unauthorized", async () => {
    whenRequestingWhoAmI();
    await thenTheResponseIsUnauthorized();
  });

  test("authorized", async () => {
    await givenAnAuthenticatedSession("user@example.com", "password");
    whenRequestingWhoAmI("user@example.com", "password");
    await thenTheResponseIsUser("user@example.com");
  });
});
