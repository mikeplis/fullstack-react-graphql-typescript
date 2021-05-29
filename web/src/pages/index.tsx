import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
    Box,
    Heading,
    Link,
    Text,
    Stack,
    Flex,
    Button,
    IconButton,
    HStack,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery, useVoteMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [variables, setVariables] = React.useState<{ limit: number; cursor: null | string }>({
        limit: 15,
        cursor: null,
    });
    const [{ data, fetching }] = usePostsQuery({ variables });
    const [, vote] = useVoteMutation();

    // TODO: some kind of abstraction to handle loading/empty/etc states (like RedwoodJS)
    if (!fetching && !data) {
        return <Box>No data</Box>;
    }

    return (
        <Layout>
            <Flex mb={4} alignItems="center" justifyContent="space-between">
                <Heading>LiReddit</Heading>
                <NextLink href="/create-post">
                    <Link>Create post</Link>
                </NextLink>
            </Flex>
            {!data && fetching ? (
                <Box>Loading...</Box>
            ) : (
                <Stack>
                    {data?.posts.posts.map((post) => {
                        console.log({ post });
                        return (
                            <HStack key={post.id} spacing={8} p={5} shadow="md" borderWidth="1px">
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
                                        colorScheme={post.voteStatus === 1 ? "green" : undefined}
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
                                    <Heading fontSize="xl">{post.title}</Heading>
                                    <Text fontSize="xs">posted by {post.creator.username}</Text>
                                    <Text mt={4}>{post.textSnippet}</Text>
                                </Stack>
                            </HStack>
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
