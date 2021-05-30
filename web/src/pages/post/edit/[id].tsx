import { Box, Button, Stack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";

const EditPost = () => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{ data, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId,
        },
    });
    const [, updatePost] = useUpdatePostMutation();
    if (fetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        );
    }
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: data.post.title, text: data.post.text }}
                onSubmit={async (values) => {
                    await updatePost({ id: intId, ...values });
                    router.back();
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Stack>
                            <InputField name="title" placeholder="Title" label="Title" />
                            <InputField textarea name="text" placeholder="Text..." label="Body" />
                            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                                Update Post
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);
