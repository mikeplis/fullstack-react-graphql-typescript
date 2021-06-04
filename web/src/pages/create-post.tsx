import { Button, Stack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../hooks/useIsAuth";
import { withApollo } from "../utils/withApollo";

// TODO: fix flicker
const CreatePost = () => {
    const router = useRouter();
    useIsAuth();
    const [createPost] = useCreatePostMutation();
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: "", text: "" }}
                onSubmit={async (values) => {
                    const { errors } = await createPost({ variables: values });
                    if (!errors) {
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Stack>
                            <InputField name="title" placeholder="Title" label="Title" />
                            <InputField textarea name="text" placeholder="Text..." label="Body" />
                            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                                Create Post
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withApollo({ ssr: false })(CreatePost);
