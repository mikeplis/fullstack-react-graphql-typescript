import { ApolloClient, InMemoryCache } from "@apollo/client";
import { withApollo as withNextApollo } from "next-apollo";
import { PaginatedPosts } from "../generated/graphql";

const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL as string,
    credentials: "include",
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    posts: {
                        keyArgs: [],
                        merge(
                            existing: PaginatedPosts | undefined,
                            incoming: PaginatedPosts
                        ): PaginatedPosts {
                            return {
                                ...incoming,
                                posts: [...(existing?.posts || []), ...incoming.posts],
                            };
                        },
                    },
                },
            },
        },
    }),
});

export const withApollo = withNextApollo(client);
