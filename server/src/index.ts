import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/postResolver";
import { UserResolver } from "./resolvers/userResolver";
import { createConnection } from "typeorm";

import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import path from "path";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

const main = async () => {
    const conn = await createConnection({
        type: "postgres",
        database: "lireddit2",
        username: "postgres",
        password: "postgres",
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [path.join(__dirname, "./entities/*")],
    });

    await conn.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(
        cors({
            // need to explicitly set origin since we want to send credentials
            // with our requests and we can't do that with a wildcard (*) origin,
            // which is apollo's default
            origin: "http://localhost:3001",
            credentials: true,
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redis, disableTouch: true, disableTTL: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                secure: __prod__, // cookie only works in https
                sameSite: "lax", // csrf
            },
            saveUninitialized: false,
            // TODO: put this in .env
            secret: "afwufhkjawehfawe",
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            // don't like the default validator that type-graphql uses
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            upvoteLoader: createUpvoteLoader(),
        }),
    });

    app.get("/", (_, res) => {
        res.send("hello");
    });

    apolloServer.applyMiddleware({
        app,
        // handling cors through middleware instead so it applies to all routes,
        // not just graphql one
        cors: false,
    });

    app.listen(4001, () => {
        console.log("server started on localhost:4001");
    });
};

main().catch((err) => console.error(err));
