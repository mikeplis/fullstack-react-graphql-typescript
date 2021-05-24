import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
@ObjectType()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id!: number;

    @Column()
    @Field()
    title!: string;

    @CreateDateColumn()
    @Field(() => String)
    createdAt: Date;

    @UpdateDateColumn()
    @Field(() => String)
    updatedAt: Date;
}
