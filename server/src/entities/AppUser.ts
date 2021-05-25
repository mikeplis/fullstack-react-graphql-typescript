import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";

// named AppUser instead of User so it doesn't conflict with postgresql reserved word "user"
// https://stackoverflow.com/questions/22256124/cannot-create-a-database-table-named-user-in-postgresql
@Entity()
@ObjectType()
export class AppUser extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id!: number;

    @Column({ unique: true })
    @Field()
    username!: string;

    @Column({ unique: true })
    @Field()
    email!: string;

    @Column()
    password!: string;

    @OneToMany(() => Post, post => post.creator)
    posts: Post[];

    @CreateDateColumn()
    @Field(() => String)
    createdAt: Date;

    @UpdateDateColumn()
    @Field(() => String)
    updatedAt: Date;
}
