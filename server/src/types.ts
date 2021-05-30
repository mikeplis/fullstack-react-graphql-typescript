import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
    // different from video https://www.youtube.com/watch?v=I6ypD7qv3Z8&lc=Ugy0Ve_tfZXDwHkAoup4AaABAg
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } };
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof createUserLoader>;
    upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
