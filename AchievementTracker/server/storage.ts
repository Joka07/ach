import { users, achievements, userAchievements, friends, type User, type Achievement, type UserAchievement, type Friend, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Achievements
  getAchievements(): Promise<(Achievement & { completedCount: number })[]>;
  createAchievement(achievement: typeof insertAchievementSchema._type): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  updateUserAchievement(userId: number, achievementId: number, progress: number): Promise<UserAchievement>;

  // Friends
  getFriends(userId: number): Promise<(Friend & { friend: User })[]>;
  addFriend(userId: number, friendId: number): Promise<Friend>;
  acceptFriend(userId: number, friendId: number): Promise<Friend>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAchievements(): Promise<(Achievement & { completedCount: number })[]> {
    const achievementsData = await db.select().from(achievements);
    const completedStats = await db
      .select({
        achievementId: userAchievements.achievementId,
        completedCount: sql<number>`count(*)::int`,
      })
      .from(userAchievements)
      .where(eq(userAchievements.completed, true))
      .groupBy(userAchievements.achievementId);

    const statsMap = new Map(completedStats.map(stat => [stat.achievementId, stat.completedCount]));

    return achievementsData.map(achievement => ({
      ...achievement,
      completedCount: statsMap.get(achievement.id) || 0,
    }));
  }

  async createAchievement(achievement: typeof insertAchievementSchema._type): Promise<Achievement> {
    const [created] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return created;
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const results = await db
      .select({
        userAchievement: userAchievements,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    return results.map(({ userAchievement, achievement }) => ({
      ...userAchievement,
      achievement,
    }));
  }

  async updateUserAchievement(userId: number, achievementId: number, progress: number): Promise<UserAchievement> {
    const completed = progress >= 100;
    const completedAt = completed ? new Date() : null;

    // Try to update existing achievement
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(userAchievements)
        .set({ progress, completed, completedAt })
        .where(eq(userAchievements.id, existing.id))
        .returning();
      return updated;
    }

    // Create new achievement if it doesn't exist
    const [created] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        progress,
        completed,
        completedAt,
      })
      .returning();
    return created;
  }

  async getFriends(userId: number): Promise<(Friend & { friend: User })[]> {
    const results = await db
      .select({
        friend: friends,
        user: users,
      })
      .from(friends)
      .innerJoin(
        users,
        and(
          eq(users.id, friends.friendId),
          eq(friends.userId, userId)
        )
      );

    return results.map(({ friend, user }) => ({
      ...friend,
      friend: user,
    }));
  }

  async addFriend(userId: number, friendId: number): Promise<Friend> {
    const [friend] = await db
      .insert(friends)
      .values({
        userId,
        friendId,
        status: 'pending',
      })
      .returning();
    return friend;
  }

  async acceptFriend(userId: number, friendId: number): Promise<Friend> {
    const [updated] = await db
      .update(friends)
      .set({ status: 'accepted' })
      .where(
        and(
          eq(friends.userId, friendId),
          eq(friends.friendId, userId)
        )
      )
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();