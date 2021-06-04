import { useApolloClient } from "@apollo/client";
import { Box, Button, Flex, Heading, HStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

export const Navbar = () => {
    const { data, loading } = useMeQuery({
        // since user-specific info is not needed for SEO, we can skip this
        // query on the server
        skip: isServer(),
    });
    const [logout, { loading: logoutFetching }] = useLogoutMutation();
    const apolloClient = useApolloClient();

    let body = null;

    if (loading) {
        // data is loading
    } else if (!data?.me) {
        body = (
            <HStack spacing={4}>
                <NextLink href="/login">
                    <Link>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
            </HStack>
        );
    } else {
        body = (
            <HStack spacing={4}>
                <Box>{data.me.username}</Box>
                <NextLink href="/create-post">
                    <Button colorScheme="cyan" variant="solid" as={Link}>
                        Create post
                    </Button>
                </NextLink>
                <Button
                    colorScheme="cyan"
                    variant="link"
                    onClick={async () => {
                        await logout();
                        await apolloClient.resetStore();
                    }}
                    isLoading={logoutFetching}
                >
                    Logout
                </Button>
            </HStack>
        );
    }

    return (
        <Box position="sticky" top="0" zIndex={1} bgColor="cyan.200" p={4}>
            <Flex mx="auto" maxW="container.lg" justifyContent="space-between">
                <NextLink href="/">
                    <Link>
                        <Heading>LiReddit</Heading>
                    </Link>
                </NextLink>
                {body}
            </Flex>
        </Box>
    );
};
