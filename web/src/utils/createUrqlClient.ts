import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => {
    return {
        url: "http://localhost:4001/graphql",
        fetchOptions: {
            // ensures that cookie is sent
            credentials: "include" as const,
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
                            betterUpdateQuery<LoginMutation, MeQuery>(
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
                            betterUpdateQuery<RegisterMutation, MeQuery>(
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
                            betterUpdateQuery<LogoutMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                result_,
                                () => ({ me: null })
                            );
                        },
                    },
                },
            }),
            ssrExchange,
            fetchExchange,
        ],
    };
};