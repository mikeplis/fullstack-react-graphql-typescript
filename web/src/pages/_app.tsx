import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { PaginatedPosts } from "../generated/graphql";
import theme from "../theme";

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

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ApolloProvider client={client}>
            <ChakraProvider resetCSS theme={theme}>
                <Component {...pageProps} />
            </ChakraProvider>
        </ApolloProvider>
    );
}

export default MyApp;
