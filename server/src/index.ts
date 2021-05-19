import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/postResolver";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);

    await orm.getMigrator().up();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            // don't like the default validator that type-graphql uses
            validate: false,
        }),
        context: () => ({ em: orm.em }),
    });

    app.get("/", (req, res) => {
        res.send("hello");
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4001, () => {
        console.log("server started on localhost:4001");
    });
};

main().catch((err) => console.error(err));
