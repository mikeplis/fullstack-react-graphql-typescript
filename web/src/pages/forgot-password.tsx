import { Box, Button, Link, Stack } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

const ForgotPassword = () => {
    const [complete, setComplete] = React.useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
        <Wrapper>
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await forgotPassword(values);
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) =>
                    complete ? (
                        <Box>
                            If an account with that email exists, we sent you an email with
                            instructions on how to change your password
                        </Box>
                    ) : (
                        <Form>
                            <Stack>
                                <InputField
                                    name="email"
                                    placeholder="Email"
                                    label="Email"
                                    type="email"
                                />

                                <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                                    Reset password
                                </Button>
                            </Stack>
                        </Form>
                    )
                }
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
