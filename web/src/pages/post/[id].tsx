import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = () => {
    const [{ data, error, fetching }] = useGetPostFromUrl()
    if (fetching) {
        return <Layout>loading...</Layout>;
    }
    if (error) {
        return <Box>{error}</Box>;
    }
    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find post</Box>
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

export default withUrqlClient(createUrqlClient)(Post);
