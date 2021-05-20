import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Session, SessionData } from "express-session";

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    // different from video https://www.youtube.com/watch?v=I6ypD7qv3Z8&lc=Ugy0Ve_tfZXDwHkAoup4AaABAg
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } };
    res: Response;
};
