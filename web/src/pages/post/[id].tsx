import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post = () => {
    const router = useRouter();
    const postId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    const [{ data, error, fetching }] = usePostQuery({
        variables: { id: postId },
        pause: postId === -1,
    });
    if (fetching) {
        return <Layout>loading...</Layout>;
    }
    if (error) {
        return <Box>{error}</Box>;
    }
    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find post for id {postId}</Box>
            </Layout>
        );
    }
    const { post } = data;
    return (
        <Layout>
            <Heading>{post.title}</Heading>
            {post?.text}
        </Layout>
    );
};

// urql types seem wrong. hopefully we can just ignore
// @ts-ignore
export default withUrqlClient(createUrqlClient)(Post);
