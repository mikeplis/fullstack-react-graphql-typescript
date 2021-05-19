import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@Entity()
@ObjectType()
export class Post {
    @PrimaryKey()
    @Field()
    id!: number;

    @Property({ type: "text" })
    @Field()
    title!: string;

    @Property({ type: "date" })
    @Field(() => String)
    createdAt = new Date();

    @Property({ type: "date", onUpdate: () => new Date() })
    @Field(() => String)
    updatedAt = new Date();
}
