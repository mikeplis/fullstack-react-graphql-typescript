import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/postResolver";
import { UserResolver } from "./resolvers/userResolver";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);

    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: "qid",
            store: new RedisStore({ client: redisClient, disableTouch: true, disableTTL: true }),
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
        context: ({ req, res }) => ({ em: orm.em, req, res }),
    });

    app.get("/", (_, res) => {
        res.send("hello");
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4001, () => {
        console.log("server started on localhost:4001");
    });
};

main().catch((err) => console.error(err));
