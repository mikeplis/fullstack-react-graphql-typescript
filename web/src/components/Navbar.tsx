import { Box, Button, Flex, HStack, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

export const Navbar = () => {
    const [{ data, fetching }] = useMeQuery({
        // our nextjs server isn't set up to use cookies, so when this query runs on the server
        // (which it will because we use the Navbar on the index page which is SSR), the result
        // is always null. since user-specific info is not needed for SEO, we can skip this
        // query on the server
        pause: isServer(),
    });
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

    let body = null;

    if (fetching) {
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
                <Button
                    variant="link"
                    onClick={() => {
                        logout();
                    }}
                    isLoading={logoutFetching}
                >
                    Logout
                </Button>
            </HStack>
        );
    }

    return (
        <Flex bgColor="tan" p={4} justifyContent="flex-end">
            {body}
        </Flex>
    );
};