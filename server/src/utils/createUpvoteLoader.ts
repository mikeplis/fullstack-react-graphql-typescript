import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

export const createUpvoteLoader = () =>
    new DataLoader<{ postId: number; userId: number }, Upvote | null, string>(
        async (keys) => {
            const upvotes = await Upvote.findByIds(keys as any);
            const upvoteIdsToUpvote: Record<string, Upvote> = {};
            upvotes.forEach((upvote) => {
                upvoteIdsToUpvote[`${upvote.userId}|${upvote.postId}`] = upvote;
            });

            return keys.map((key) => upvoteIdsToUpvote[`${key.userId}|${key.postId}`]);
        },
        // this is necessary because we're using an object as a key. without this, if we try to
        // get for the same upvote more than once in a request, it will be queried for twice.
        // this isn't in the tutorial because it wasn't necessary for the use case.
        { cacheKeyFn: (key) => `${key.postId}|${key.userId}` }
    );
