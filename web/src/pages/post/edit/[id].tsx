import { Box, Button, Stack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";

const EditPost = () => {
    const router = useRouter();
    const intId = useGetIntId();
    const { data, loading } = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId,
        },
    });
    const [updatePost] = useUpdatePostMutation();
    if (loading) {
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
                    await updatePost({ variables: { id: intId, ...values } });
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

export default EditPost;
