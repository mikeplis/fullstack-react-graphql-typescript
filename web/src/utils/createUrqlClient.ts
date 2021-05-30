import { dedupExchange, Exchange, fetchExchange, gql } from "urql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import {
    DeletePostMutationVariables,
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
    VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";

import { ClientOptions, stringifyVariables } from "@urql/core";
import { isServer } from "./isServer";

// We need to do something to tell urql that repeated queries to this field should
// be combined into a single result set in the local cache.
const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolve(
            cache.resolveFieldByKey(entityKey, fieldKey) as string,
            "posts"
        );
        info.partial = !isItInTheCache;
        let hasMore = true;
        const results: string[] = [];
        fieldInfos.forEach((fi) => {
            const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, "posts") as string[];
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            results.push(...data);
        });

        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results,
        };
    };
};

const errorExchange: Exchange =
    ({ forward }) =>
    (ops$) => {
        return pipe(
            forward(ops$),
            tap(({ error }) => {
                // redirect user to login page whenever we see a "not authenticated" error
                // FWIW, I don't love this logic being here. Devs would need to know this is here
                // and nothing really prevents components from handling this differently
                if (error?.message.includes("not authenticated")) {
                    Router.replace("/login");
                }
            })
        );
    };

function invalidateAllPosts(cache: Cache) {
    const allFields = cache.inspectFields("Query");
    const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
    fieldInfos.forEach((fi) => {
        cache.invalidate("Query", "posts", fi.arguments || {});
    });
}

export const createUrqlClient = (ssrExchange: any, ctx: any): ClientOptions => {
    let cookie = "";
    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie;
    }

    return {
        url: "http://localhost:4001/graphql",
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? { cookie } : undefined,
        },
        // If this was my project, I'd probably turn this on so I don't have to deal with caches
        // at all. For now, I'll leave the default so I can learn along with the video
        // requestPolicy: 'network-only',
        exchanges: [
            dedupExchange,
            cacheExchange({
                keys: {
                    PaginatedPosts: () => null,
                },
                resolvers: {
                    Query: {
                        posts: cursorPagination(),
                    },
                },
                updates: {
                    Mutation: {
                        deletePost: (_result, args, cache, _info) => {
                            cache.invalidate({
                                __typename: "Post",
                                id: (args as DeletePostMutationVariables).id,
                            });
                        },
                        vote: (_result, args, cache, _info) => {
                            const { postId, value } = args as VoteMutationVariables;
                            const data = cache.readFragment(
                                gql`
                                    fragment _ on Post {
                                        id
                                        points
                                        voteStatus
                                    }
                                `,
                                { id: postId } as any
                            );

                            if (data) {
                                if (data.voteStatus === value) {
                                    return;
                                }
                                const newPoints =
                                    (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                                cache.writeFragment(
                                    gql`
                                        fragment __ on Post {
                                            points
                                            voteStatus
                                        }
                                    `,
                                    { id: postId, points: newPoints, voteStatus: value } as any
                                );
                            }
                        },
                        createPost: (_result, _args, cache, _info) => {
                            invalidateAllPosts(cache);
                        },
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
                            invalidateAllPosts(cache);
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
            errorExchange,
            ssrExchange,
            fetchExchange,
        ],
    };
};
