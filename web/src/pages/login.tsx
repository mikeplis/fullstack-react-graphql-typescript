import { Stack, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

// TODO: replace with react-hook-form
const Login = () => {
    const router = useRouter();
    const [, register] = useLoginMutation();
    return (
        <Wrapper>
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({
                        options: {
                            username: values.username,
                            password: values.password,
                        },
                    });
                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user) {
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Stack>
                            <InputField name="username" placeholder="Username" label="Username" />

                            <InputField
                                name="password"
                                placeholder="Password"
                                label="Password"
                                type="password"
                            />

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
