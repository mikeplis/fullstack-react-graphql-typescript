import { Box } from "@chakra-ui/react";
import React from "react";

export type Props = {
    children: React.ReactNode;
    variant?: "small" | "regular";
};

export const Wrapper = ({ children, variant = "regular" }: Props) => {
    return (
        <Box mt={8} mx="auto" maxW={variant === "regular" ? "800px" : "400px"} w="100%">
            {children}
        </Box>
    );
};
