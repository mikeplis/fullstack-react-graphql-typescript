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
            // need double quotes or else column name will be converted to lowercase
            .orderBy('"createdAt"', "DESC")
            .take(realLimitPlusOne);

        if (cursor) {
            query.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
        }

        const posts = await query.getMany();

        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id") id: number): Promise<Post | undefined> {
        return Post.findOne({ id });
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
    async deletePost(@Arg("id") id: number): Promise<Boolean> {
        await Post.delete(id);
        return true;
    }
}
