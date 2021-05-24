import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { AppUser } from "../entities/AppUser";
import { MyContext } from "../types";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../entities/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => AppUser, { nullable: true })
    user?: AppUser;
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        // duplicating logic from validateRegister
        if (newPassword.length <= 3) {
            return { errors: [{ field: "newPassword", message: "length must be greater than 3" }] };
        }

        const key = `${FORGOT_PASSWORD_PREFIX}${token}`;
        const userId = await redis.get(key);

        if (!userId) {
            return { errors: [{ field: "token", message: "token expired" }] };
        }

        const userIdNum = parseInt(userId);
        const user = await AppUser.findOne(userIdNum);

        if (!user) {
            return { errors: [{ field: "token", message: "user not found" }] };
        }

        const hashedPassword = await argon2.hash(newPassword);
        await AppUser.update({ id: userIdNum }, { password: hashedPassword });

        // log in user after change password
        req.session.userId = user.id;

        // delete key so same token can't be used to reset password again
        await redis.del(key);

        return { user };
    }

    @Mutation(() => Boolean)
    async forgotPassword(@Arg("email") email: string, @Ctx() { redis }: MyContext) {
        const user = await AppUser.findOne({ where: { email } });
        if (!user) {
            // email not in db
            // for security reasons, it's simpler to just return true here
            return true;
        }

        const token = v4();

        await redis.set(
            `${FORGOT_PASSWORD_PREFIX}${token}`,
            user.id,
            "ex",
            1000 * 60 * 60 * 24 * 3 // 3 days
        );

        await sendEmail(
            email,
            // need to include token in URL so we can validate who they are
            `<a href="http://localhost:3001/change-password/${token}">Reset password</a>`
        );
        return true;
    }

    @Query(() => AppUser, { nullable: true })
    async me(@Ctx() { req }: MyContext): Promise<AppUser | undefined> {
        if (!req.session.userId) {
            return undefined;
        }

        return AppUser.findOne(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }

        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            // Also could do `User.create({}).save()`
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(AppUser)
                .values({
                    username: options.username,
                    password: hashedPassword,
                    email: options.email,
                })
                .returning("*")
                .execute();
            user = result.raw[0];
        } catch (error) {
            // || error.detail.includes('already exists')) {
            if (error.code === "23505") {
                return {
                    errors: [{ field: "usernameOrEmail", message: "username already taken" }],
                };
            }
        }

        // store user id session
        // this will set a cookie on the user
        // keep them logged in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await AppUser.findOne({
            where: usernameOrEmail.includes("@")
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail },
        });
        if (!user) {
            return {
                errors: [{ field: "usernameOrEmail", message: "that username doesn't exist" }],
            };
        }

        const valid = await argon2.verify(user.password, password);

        if (!valid) {
            return {
                errors: [{ field: "password", message: "incorrect password" }],
            };
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                // clear cookie even if session isn't destroyed
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        );
    }
}
