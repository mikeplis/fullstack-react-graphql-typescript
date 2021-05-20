import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    Box,
    Stack,
    Button,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";

// TODO: replace with react-hook-form
const Register = () => {
    return (
        <Wrapper>
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={(values) => {
                    console.log({ values });
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
                                Register
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default Register;
