import { Box } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Navbar } from "../components/Navbar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [{ data }] = usePostsQuery();
    return (
        <Box>
            <Navbar />
            {!data ? (
                <Box>Loading...</Box>
            ) : (
                data.posts.map((post) => <Box key={post.id}>{post.title}</Box>)
            )}
        </Box>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
