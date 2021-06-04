import { Button, Link, Stack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

// TODO: replace with react-hook-form
const Login = () => {
    const router = useRouter();
    const [login] = useLoginMutation();
    return (
        <Wrapper>
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({ variables: values });
                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user) {
                        if (typeof router.query.next === "string") {
                            router.push(router.query.next || "/");
                        } else {
                            router.push("/");
                        }
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Stack>
                            <InputField
                                name="usernameOrEmail"
                                placeholder="Username or Email"
                                label="Username or Email"
                            />

                            <InputField
                                name="password"
                                placeholder="Password"
                                label="Password"
                                type="password"
                            />

                            <NextLink href="/forgot-password">
                                <Link>Forget password?</Link>
                            </NextLink>

                            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                                Login
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default Login;
