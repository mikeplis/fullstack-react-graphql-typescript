import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import { AppUser } from "./AppUser";
import { Post } from "./Post";

/**
 * Many-to-many relationship between users and posts
 *
 * Not always necessary to set this up ourselves, but we're adding
 * an extra field to the relationship, so it makes sense in this case
 */
@Entity()
@ObjectType()
export class Upvote extends BaseEntity {

    @Field()
    @Column({ type: "int" })
    value: number;

    @PrimaryColumn()
    @Field()
    userId: number;

    @Field(() => AppUser)
    @ManyToOne(() => AppUser, (user) => user.upvotes)
    user: AppUser;

    @PrimaryColumn()
    @Field()
    postId: number;

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.upvotes)
    post: Post;
}
