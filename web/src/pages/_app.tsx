import { ChakraProvider } from "@chakra-ui/react";

import theme from "../theme";
import { AppProps } from "next/app";
import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import { cacheExchange, QueryInput, Cache } from "@urql/exchange-graphcache";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
} from "../generated/graphql";

// wrapper function around updateQuery to have better types
function betterUpdateQuer<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
    url: "http://localhost:4001/graphql",
    fetchOptions: {
        // ensures that cookie is sent
        credentials: "include",
    },
    // If this was my project, I'd probably turn this on so I don't have to deal with caches
    // at all. For now, I'll leave the default so I can learn along with the video
    // requestPolicy: 'network-only',
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                Mutation: {
                    // updates the cache whenever these mutations runs
                    // honestly not convinced this is necessary - I feel like there's a better way,
                    // but this is what he did in the video
                    // could maybe just refetch query or invalidate cache or something
                    login: (result_, _args, cache, _info) => {
                        betterUpdateQuer<LoginMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            result_,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.login.user,
                                    };
                                }
                            }
                        );
                    },
                    register: (result_, _args, cache, _info) => {
                        betterUpdateQuer<RegisterMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            result_,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.register.user,
                                    };
                                }
                            }
                        );
                    },
                    logout: (result_, _args, cache, _info) => {
                        betterUpdateQuer<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            result_,
                            () => ({ me: null })
                        );
                    },
                },
            },
        }),
        fetchExchange,
    ],
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider value={client}>
            <ChakraProvider resetCSS theme={theme}>
                <Component {...pageProps} />
            </ChakraProvider>
        </Provider>
    );
}

export default MyApp;
