import DataLoader from "dataloader";
import { AppUser } from "../entities/AppUser";

export const createUserLoader = () =>
    new DataLoader<number, AppUser>(async (userIds) => {
        const users = await AppUser.findByIds(userIds as number[]);
        const userIdToUser: Record<number, AppUser> = {};
        users.forEach((u) => {
            userIdToUser[u.id] = u;
        });

        const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
        return sortedUsers;
    });
