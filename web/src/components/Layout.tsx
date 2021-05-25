import React from "react";
import { Navbar } from "./Navbar";
import { Wrapper, Props as WrapperProps } from "./Wrapper";

type Props = WrapperProps;

export const Layout = ({ children, ...props }: Props) => {
    return (
        <>
            <Navbar />
            <Wrapper {...props}>{children}</Wrapper>
        </>
    );
};
