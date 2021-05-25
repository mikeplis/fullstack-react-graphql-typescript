import { Box, Button, Link, Stack } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from "next/link";

const ChangePassword = () => {
    const [, changePassword] = useChangePasswordMutation();
    const router = useRouter();

    const [tokenError, setTokenError] = React.useState("");
    return (
        <Wrapper>
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token: typeof router.query.token === "string" ? router.query.token : "",
                    });
                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors);
                        if ("token" in errorMap) {
                            setTokenError(errorMap.token);
                        }
                        setErrors(errorMap);
                    } else if (response.data?.changePassword.user) {
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Stack>
                            <InputField
                                name="newPassword"
                                placeholder="New Password"
                                label="New Password"
                                type="password"
                            />

                            {tokenError ? (
                                <Stack>
                                    <Box color="red">{tokenError}</Box>
                                    <NextLink href="/forgot-password">
                                        <Link>Forget password again</Link>
                                    </NextLink>
                                </Stack>
                            ) : null}

                            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                                Reset password
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

// urql types seem wrong. hopefully we can just ignore
// @ts-ignore
export default withUrqlClient(createUrqlClient)(ChangePassword);
