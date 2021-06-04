import { Box, Heading } from "@chakra-ui/react";
import React from "react";
import { Layout } from "../../components/Layout";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = () => {
    const { data, error, loading } = useGetPostFromUrl();
    if (loading) {
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

export default Post;
