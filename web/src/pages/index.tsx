import { Box, Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [{ data }] = usePostsQuery();
    return (
        <Layout>
            <NextLink href="/create-post">
                <Link>Create post</Link>
            </NextLink>
            {!data ? (
                <Box>Loading...</Box>
            ) : (
                data.posts.map((post) => <Box key={post.id}>{post.title}</Box>)
            )}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
