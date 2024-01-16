import express, { Request } from "express";
import passport from "passport";
import { BasicStrategy } from "passport-http";
import { Strategy as AnonymousStrategy } from "passport-anonymous";
import { pbkdf2, timingSafeEqual, randomBytes } from "crypto";
import { promisify } from "util";
import createDataSource from "./createDataSource";
import { User } from "./entities/User";
import { json as jsonBodyParser } from "body-parser";
import "./types";

const pbkdf2Async = promisify(pbkdf2);

const start = async (dataSourceUrl: string) => {
  const dataSource = createDataSource(dataSourceUrl);
  await dataSource.initialize();

  passport.use(
    new BasicStrategy(async (username, password, cb) => {
      const user = await dataSource.manager.findOneBy(User, { name: username });

      if (!user) {
        cb(null, false);
        return;
      }

      const hashedPassword = await pbkdf2Async(
        password,
        user.salt,
        310000,
        32,
        "sha256"
      );
      if (timingSafeEqual(user.password, hashedPassword)) {
        cb(null, user);
      } else {
        cb(null, false);
        // TODO {
        //  message: "Incorrect username or password.",
        //}
      }
    })
  );

  const app = express();
  app.use(jsonBodyParser());
  app.post(
    "/register",
    passport.authenticate(new AnonymousStrategy()),
    async (
      request: Request<object, never, { username: string; password: string }>,
      response
    ) => {
      // TODO validate body schema
      const salt = randomBytes(16);
      const hashedPassword = await pbkdf2Async(
        request.body.password,
        salt,
        310000,
        32,
        "sha256"
      );
      await dataSource.manager.insert(User, {
        name: request.body.username,
        password: hashedPassword,
        salt,
      });

      response.status(201).send();
    }
  );

  app.use(
    passport.authenticate("basic", { session: false, failWithError: true })
  );

  app.get("/whoami", (request, response) =>
    response.status(200).send(request.user?.name)
  );

  return app;
};
export default start;
