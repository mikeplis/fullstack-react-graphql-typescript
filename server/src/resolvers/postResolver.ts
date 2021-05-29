import {
    Arg,
    Args,
    ArgsType,
    Ctx,
    Field,
    FieldResolver,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Upvote } from "../entities/Upvote";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@ArgsType()
class PostInput {
    @Field()
    title!: string;

    @Field()
    text!: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    // This could go in its own resolver but that's not really necessary
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session;
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;

        const upvote = await Upvote.findOne({ where: { postId, userId } });

        if (upvote && upvote.value !== realValue) {
            // user voted before but is changing their vote
            await getConnection().transaction(async (transactionManager) => {
                await transactionManager.query(
                    `
                    update upvote
                    set value = $1
                    where "postId" = $2 and "userId" = $3;
                    `,
                    [realValue, postId, userId]
                );

                await transactionManager.query(
                    `
                    update post
                    set points = points + $1
                    where id = $2;
                    `,
                    // multiply realValue by two since user is replacing a previous vote with the opposite vote
                    [2 * realValue, postId]
                );
            });
        } else if (!upvote) {
            // user has not voted before
            await getConnection().transaction(async (transactionManager) => {
                await transactionManager.query(
                    `
                    insert into upvote ("userId", "postId", value)
                    values ($1, $2, $3);
                    `,
                    [userId, postId, realValue]
                );

                await transactionManager.query(
                    `
                    update post
                    set points = points + $1
                    where id = $2;
                    `,
                    [realValue, postId]
                );
            });
        }

        return true;
    }

    // TODO: probably prefer to add an argument to the `text` field rather than a new field here
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        // cap the limit at 50 - keep the cap hidden from users
        const realLimit = Math.min(50, limit);
        // fetch one additional item to check if more items exist
        const realLimitPlusOne = realLimit + 1;
        const query = getConnection()
            .getRepository(Post)
            .createQueryBuilder("p")
            // need to specify relation since we're using query builder
            .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
            // need double quotes or else column name will be converted to lowercase
            .orderBy("p.createdAt", "DESC")
            .take(realLimitPlusOne);

        if (cursor) {
            query.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
        }

        const posts = await query.getMany();

        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(@Root() post: Post, @Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }

        const upvote = await Upvote.findOne({
            where: {
                postId: post.id,
                userId: req.session.userId,
            },
        });

        return upvote ? upvote.value : null;
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id, { relations: ["creator"] });
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(@Args() { title, text }: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
        return Post.create({ title, text, creatorId: req.session.userId }).save();
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne({ id });
        if (!post) {
            return null;
        }
        if (typeof title !== "undefined") {
            await Post.update({ id }, { title });
        }
        return post;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        // not cascade
        // const post = await Post.findOne(id);
        // if (!post) {
        //     return false;
        // }
        // if (post.creatorId !== req.session.userId) {
        //     throw new Error("not authorized");
        // }

        // await Upvote.delete({ postId: id });
        // await Post.delete({ id, creatorId: req.session.userId });

        await Post.delete({ id, creatorId: req.session.userId });
        return true;
    }
}
