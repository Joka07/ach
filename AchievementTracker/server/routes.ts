import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAchievementSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express): Server {
  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Achievements
  app.get("/api/achievements", async (_req, res) => {
    const achievements = await storage.getAchievements();
    res.json(achievements);
  });

  app.post("/api/achievements", async (req, res) => {
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

  app.get("/api/users/:userId/achievements", async (req, res) => {
    const achievements = await storage.getUserAchievements(parseInt(req.params.userId));
    res.json(achievements);
  });

  app.post("/api/users/:userId/achievements/:achievementId", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}