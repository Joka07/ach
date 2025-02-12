var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  friends: () => friends,
  insertAchievementSchema: () => insertAchievementSchema,
  insertFriendSchema: () => insertFriendSchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserSchema: () => insertUserSchema,
  userAchievements: () => userAchievements,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  level: integer("level").default(1).notNull()
});
var achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull()
});
var userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at")
});
var friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  friendId: integer("friend_id").notNull(),
  status: text("status").notNull()
  // pending, accepted
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  avatarUrl: true
});
var insertAchievementSchema = createInsertSchema(achievements);
var insertUserAchievementSchema = createInsertSchema(userAchievements);
var insertFriendSchema = createInsertSchema(friends);

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, sql } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getAchievements() {
    const achievementsData = await db.select().from(achievements);
    const completedStats = await db.select({
      achievementId: userAchievements.achievementId,
      completedCount: sql`count(*)::int`
    }).from(userAchievements).where(eq(userAchievements.completed, true)).groupBy(userAchievements.achievementId);
    const statsMap = new Map(completedStats.map((stat) => [stat.achievementId, stat.completedCount]));
    return achievementsData.map((achievement) => ({
      ...achievement,
      completedCount: statsMap.get(achievement.id) || 0
    }));
  }
  async createAchievement(achievement) {
    const [created] = await db.insert(achievements).values(achievement).returning();
    return created;
  }
  async getUserAchievements(userId) {
    const results = await db.select({
      userAchievement: userAchievements,
      achievement: achievements
    }).from(userAchievements).innerJoin(achievements, eq(userAchievements.achievementId, achievements.id)).where(eq(userAchievements.userId, userId));
    return results.map(({ userAchievement, achievement }) => ({
      ...userAchievement,
      achievement
    }));
  }
  async updateUserAchievement(userId, achievementId, progress) {
    const completed = progress >= 100;
    const completedAt = completed ? /* @__PURE__ */ new Date() : null;
    const [existing] = await db.select().from(userAchievements).where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )
    );
    if (existing) {
      const [updated] = await db.update(userAchievements).set({ progress, completed, completedAt }).where(eq(userAchievements.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(userAchievements).values({
      userId,
      achievementId,
      progress,
      completed,
      completedAt
    }).returning();
    return created;
  }
  async getFriends(userId) {
    const results = await db.select({
      friend: friends,
      user: users
    }).from(friends).innerJoin(
      users,
      and(
        eq(users.id, friends.friendId),
        eq(friends.userId, userId)
      )
    );
    return results.map(({ friend, user }) => ({
      ...friend,
      friend: user
    }));
  }
  async addFriend(userId, friendId) {
    const [friend] = await db.insert(friends).values({
      userId,
      friendId,
      status: "pending"
    }).returning();
    return friend;
  }
  async acceptFriend(userId, friendId) {
    const [updated] = await db.update(friends).set({ status: "accepted" }).where(
      and(
        eq(friends.userId, friendId),
        eq(friends.friendId, userId)
      )
    ).returning();
    return updated;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { fromZodError } from "zod-validation-error";
function registerRoutes(app2) {
  app2.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });
  app2.get("/api/achievements", async (_req, res) => {
    const achievements2 = await storage.getAchievements();
    res.json(achievements2);
  });
  app2.post("/api/achievements", async (req, res) => {
    try {
      const data = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(data);
      res.json(achievement);
    } catch (error) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(400).json({ error: "Could not create achievement" });
      }
    }
  });
  app2.get("/api/users/:userId/achievements", async (req, res) => {
    const achievements2 = await storage.getUserAchievements(parseInt(req.params.userId));
    res.json(achievements2);
  });
  app2.post("/api/users/:userId/achievements/:achievementId", async (req, res) => {
    const { progress } = req.body;
    try {
      const achievement = await storage.updateUserAchievement(
        parseInt(req.params.userId),
        parseInt(req.params.achievementId),
        progress
      );
      res.json(achievement);
    } catch (error) {
      res.status(400).json({ error: "Could not update achievement" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
