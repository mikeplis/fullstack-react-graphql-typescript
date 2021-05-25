import { useRouter } from "next/router";
import React from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();
    React.useEffect(() => {
        // redirect to login page if use is not logged in
        if (!fetching && !data?.me) {
            // put current path in URL query param
            router.replace(`/login?next=${router.pathname}`);
        }
    }, [router, fetching, data]);
};
