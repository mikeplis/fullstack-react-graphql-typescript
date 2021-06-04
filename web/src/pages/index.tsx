import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, HStack, IconButton, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import {
    useDeletePostMutation,
    useMeQuery,
    usePostsQuery,
    useVoteMutation,
} from "../generated/graphql";

const Index = () => {
    const { data, loading, fetchMore, variables } = usePostsQuery({
        variables: {
            limit: 15,
            cursor: null,
        },
        notifyOnNetworkStatusChange: true,
    });
    const { data: meData } = useMeQuery();
    const [vote] = useVoteMutation();
    const [deletePost] = useDeletePostMutation();

    // TODO: some kind of abstraction to handle loading/empty/etc states (like RedwoodJS)
    if (!loading && !data) {
        return <Box>No data</Box>;
    }

    return (
        <Layout>
            {!data && loading ? (
                <Box>Loading...</Box>
            ) : (
                <Stack>
                    {data?.posts.posts.map((post) => {
                        if (!post) {
                            return null;
                        }
                        return (
                            <Flex
                                key={post.id}
                                p={5}
                                shadow="md"
                                borderWidth="1px"
                                justifyContent="space-between"
                            >
                                <HStack spacing={8}>
                                    <Stack alignItems="center">
                                        <IconButton
                                            size="xs"
                                            aria-label="upvote"
                                            icon={<ChevronUpIcon />}
                                            onClick={() => {
                                                if (post.voteStatus !== 1) {
                                                    vote({
                                                        variables: { postId: post.id, value: 1 },
                                                    });
                                                }
                                            }}
                                            colorScheme={
                                                post.voteStatus === 1 ? "green" : undefined
                                            }
                                        />
                                        <Box>{post.points}</Box>
                                        <IconButton
                                            size="xs"
                                            aria-label="downvote"
                                            icon={<ChevronDownIcon />}
                                            onClick={() => {
                                                if (post.voteStatus !== -1) {
                                                    vote({
                                                        variables: { postId: post.id, value: -1 },
                                                    });
                                                }
                                            }}
                                            colorScheme={post.voteStatus === -1 ? "red" : undefined}
                                        />
                                    </Stack>
                                    <Stack>
                                        <NextLink href={`/post/${post.id}`}>
                                            <Link fontSize="xl">{post.title}</Link>
                                        </NextLink>
                                        <Text fontSize="xs">posted by {post.creator.username}</Text>
                                        <Text mt={4}>{post.textSnippet}</Text>
                                    </Stack>
                                </HStack>
                                {meData?.me?.id === post.creator.id ? (
                                    <HStack>
                                        <NextLink href={`/post/edit/${post.id}`}>
                                            <IconButton
                                                as={Link}
                                                size="xs"
                                                aria-label="edit post"
                                                icon={<EditIcon />}
                                            />
                                        </NextLink>
                                        <IconButton
                                            size="xs"
                                            aria-label="delete post"
                                            icon={<DeleteIcon />}
                                            onClick={() => {
                                                deletePost({ variables: { id: post.id } });
                                            }}
                                        />
                                    </HStack>
                                ) : null}
                            </Flex>
                        );
                    })}
                    {data?.posts.hasMore ? (
                        <Button
                            isLoading={loading}
                            onClick={() =>
                                fetchMore({
                                    variables: {
                                        limit: variables?.limit || 15,
                                        cursor:
                                            data?.posts.posts[data?.posts.posts.length - 1]
                                                .createdAt ?? null,
                                    },
                                    // updateQuery: (previousValue, { fetchMoreResult }) => {
                                    //     if (!fetchMoreResult) {
                                    //         return previousValue;
                                    //     }

                                    //     return {
                                    //         __typename: "Query",
                                    //         posts: {
                                    //             __typename: "PaginatedPosts",
                                    //             hasMore: fetchMoreResult.posts.hasMore,
                                    //             posts: [
                                    //                 ...previousValue.posts.posts,
                                    //                 ...fetchMoreResult.posts.posts,
                                    //             ],
                                    //         },
                                    //     };
                                    // },
                                })
                            }
                        >
                            Load more
                        </Button>
                    ) : null}
                </Stack>
            )}
        </Layout>
    );
};

export default Index;
