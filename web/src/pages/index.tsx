import { ChevronDownIcon, ChevronUpIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Link, Text, Stack, Button, IconButton, HStack, Flex } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { useDeletePostMutation, usePostsQuery, useVoteMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [variables, setVariables] = React.useState<{ limit: number; cursor: null | string }>({
        limit: 15,
        cursor: null,
    });
    const [{ data, fetching }] = usePostsQuery({ variables });
    const [, vote] = useVoteMutation();
    const [, deletePost] = useDeletePostMutation();

    // TODO: some kind of abstraction to handle loading/empty/etc states (like RedwoodJS)
    if (!fetching && !data) {
        return <Box>No data</Box>;
    }

    return (
        <Layout>
            {!data && fetching ? (
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
                                                    vote({ postId: post.id, value: 1 });
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
                                                    vote({ postId: post.id, value: -1 });
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
                                <IconButton
                                    size="xs"
                                    aria-label="delete post"
                                    icon={<DeleteIcon />}
                                    onClick={() => {
                                        deletePost({ id: post.id });
                                    }}
                                    colorScheme="pink"
                                />
                            </Flex>
                        );
                    })}
                    {data?.posts.hasMore ? (
                        <Button
                            onClick={() =>
                                setVariables((prevVariables) => ({
                                    limit: prevVariables.limit,
                                    cursor:
                                        data?.posts.posts[data?.posts.posts.length - 1].createdAt ??
                                        null,
                                }))
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
