import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { AppUser } from "./AppUser";

@Entity()
@ObjectType()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id!: number;

    @Column()
    @Field()
    title!: string;

    @Column()
    @Field()
    text!: string;

    @Column({ type: "int", default: 0 })
    @Field()
    points!: number;

    @Column()
    @Field() // sometimes it's helpful to be able to just select the id
    // name should match the ManyToOne field below
    creatorId: number;

    // this sets up a foreign key in the database with the name creatorId
    @Field()
    @ManyToOne(() => AppUser, (user) => user.posts)
    creator: AppUser;

    @CreateDateColumn()
    @Field(() => String)
    createdAt: Date;

    @UpdateDateColumn()
    @Field(() => String)
    updatedAt: Date;
}
