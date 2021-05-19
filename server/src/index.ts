import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);

    await orm.getMigrator().up();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            // don't like the default validator that type-graphql uses
            validate: false,
        }),
    });

    app.get("/", (req, res) => {
        res.send("hello");
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4001, () => {
        console.log("server started on localhost:6000");
    });
};

main().catch((err) => console.error(err));
