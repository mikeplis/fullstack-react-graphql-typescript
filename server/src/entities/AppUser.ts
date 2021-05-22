import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// named AppUser instead of User so it doesn't conflict with postgresql reserved word "user"
// https://stackoverflow.com/questions/22256124/cannot-create-a-database-table-named-user-in-postgresql
@Entity()
@ObjectType()
export class AppUser {
    @PrimaryKey()
    @Field()
    id!: number;

    @Property({ type: "text", unique: true })
    @Field()
    username!: string;

    @Property({ type: "text", unique: true })
    @Field()
    email!: string;

    @Property({ type: "text" })
    password!: string;


    @Property({ type: "date" })
    @Field(() => String)
    createdAt = new Date();

    @Property({ type: "date", onUpdate: () => new Date() })
    @Field(() => String)
    updatedAt = new Date();
}
