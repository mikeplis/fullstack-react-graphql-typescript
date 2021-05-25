import { Box, Heading, Link, Text, Stack, Flex, Button } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [variables, setVariables] = React.useState<{ limit: number; cursor: null | string }>({
        limit: 10,
        cursor: null,
    });
    const [{ data, fetching }] = usePostsQuery({ variables });

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
                    {data?.posts.posts.map((post) => (
                        <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                            <Heading fontSize="xl">{post.title}</Heading>
                            <Text mt={4}>{post.textSnippet}</Text>
                        </Box>
                    ))}
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
