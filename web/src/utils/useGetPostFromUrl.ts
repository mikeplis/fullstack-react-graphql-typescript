import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetPostFromUrl = () => {
    const router = useRouter();
    const postId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    return usePostQuery({
        variables: { id: postId },
        pause: postId === -1,
    });
};
