import express, { Express, Request, Response } from "express";
import { logger } from "./_core/logger";

/**
 * Register Stripe webhook routes
 */
export function registerStripeWebhookRoutes(app: Express) {
  // Stripe webhook endpoint
  // Must use raw body for signature verification
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      try {
        const sig = req.headers["stripe-signature"];

        if (!sig) {
          logger.warn("[Stripe Webhook] Missing stripe-signature header");
          return res.status(400).json({ error: "Missing stripe-signature header" });
        }

        // Log webhook receipt
        logger.info("[Stripe Webhook] Received event", {
          signature: sig ? "present" : "missing",
          bodySize: req.body ? req.body.length : 0,
        });

        // For now, just acknowledge receipt with 200 OK
        // This will stop Stripe from retrying
        // TODO: Implement actual Stripe webhook verification and processing when needed
        
        // Parse event if body is buffer
        let event;
        try {
          if (Buffer.isBuffer(req.body)) {
            event = JSON.parse(req.body.toString());
          } else {
            event = req.body;
          }
          
          logger.info("[Stripe Webhook] Event type:", event?.type || "unknown");
        } catch (parseError) {
          logger.warn("[Stripe Webhook] Could not parse event body");
        }

        // Return 200 OK to acknowledge receipt
        res.status(200).json({ received: true });
      } catch (error) {
        logger.error("[Stripe Webhook] Error processing webhook:", error);
        
        // Still return 200 to prevent Stripe from retrying
        // Log the error for investigation
        res.status(200).json({ received: true, error: "logged" });
      }
    }
  );
}
