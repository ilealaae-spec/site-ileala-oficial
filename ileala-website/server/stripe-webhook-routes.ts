import express, { Express, Request, Response } from "express";
import { logger } from "./_core/logger";
import Stripe from "stripe";
import * as db from "./db";

// Get expected Stripe API version from the installed package
// @ts-ignore - access the default API version
const STRIPE_API_VERSION = "2025-10-29.clover" as const;

// Initialize Stripe with the secret key
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    logger.warn("[Stripe] STRIPE_SECRET_KEY not configured");
    return null;
  }
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
};

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
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      const bodyBuffer = req.body;
      const isBuffer = Buffer.isBuffer(bodyBuffer);

      logger.info("[Stripe Webhook] Received webhook request", {
        hasSignature: !!sig,
        hasWebhookSecret: !!webhookSecret,
        bodySize: bodyBuffer ? bodyBuffer.length : 0,
        isBuffer,
        contentType: req.headers["content-type"],
      });

      // If no webhook secret is configured, just acknowledge
      if (!webhookSecret) {
        logger.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured - acknowledging without verification");
        return res.status(200).json({ received: true, warning: "webhook_secret_not_configured" });
      }

      if (!sig) {
        logger.warn("[Stripe Webhook] Missing stripe-signature header");
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      if (!bodyBuffer || bodyBuffer.length === 0) {
        logger.warn("[Stripe Webhook] Empty request body");
        return res.status(400).json({ error: "Empty request body" });
      }

      try {
        const stripe = getStripe();
        if (!stripe) {
          logger.warn("[Stripe Webhook] Stripe not configured - acknowledging");
          return res.status(200).json({ received: true, warning: "stripe_not_configured" });
        }

        // Verify the webhook signature
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        logger.info("[Stripe Webhook] Event verified successfully", {
          type: event.type,
          id: event.id,
        });

        // Handle specific event types
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            logger.info("[Stripe Webhook] Checkout session completed", {
              sessionId: session.id,
              paymentStatus: session.payment_status,
              orderId: session.metadata?.orderId,
            });

            // Fulfill the order - update payment status
            if (session.payment_status === "paid" && session.metadata?.orderId) {
              const orderId = parseInt(session.metadata.orderId);
              try {
                await db.updateOrderPaymentStatus(orderId, "paid");
                logger.info(`[Stripe Webhook] Order #${orderId} marked as paid`);

                // Send order confirmation email
                try {
                  const order = await db.getOrderById(orderId);
                  if (order && order.customerEmail) {
                    const orderItems = await db.getOrderItems(orderId);
                    const { sendOrderConfirmationEmail } = await import("./email");
                    await sendOrderConfirmationEmail(
                      order.customerEmail,
                      order.customerName || "Customer",
                      orderId,
                      order.totalAmount,
                      orderItems.map((item: any) => ({
                        name: item.product?.nameEN || "Product",
                        quantity: item.quantity,
                        price: item.priceAtPurchase,
                      }))
                    );
                    logger.info(`[Stripe Webhook] Confirmation email sent to ${order.customerEmail}`);

                    // Update loyalty program
                    if (order.userId) {
                      try {
                        const amountInFils = Math.round(order.totalAmount * 100);
                        const loyaltyResult = await db.updateMemberSpending(order.userId, amountInFils, orderId);
                        if (loyaltyResult.tierChanged && loyaltyResult.newTier) {
                          const { sendTierUpgradeEmail } = await import("./email");
                          await sendTierUpgradeEmail(
                            order.customerEmail,
                            order.customerName || "Valued Customer",
                            loyaltyResult.newTier,
                            loyaltyResult.member?.previousTier || "green"
                          );
                        }
                      } catch (loyaltyError) {
                        logger.error("[Stripe Webhook] Loyalty update failed:", loyaltyError);
                      }
                    }
                  }
                } catch (emailError) {
                  logger.error("[Stripe Webhook] Failed to send confirmation email:", emailError);
                }
              } catch (dbError) {
                logger.error(`[Stripe Webhook] Failed to update order #${orderId}:`, dbError);
              }
            }
            break;
          }

          case "payment_intent.succeeded":
            logger.info("[Stripe Webhook] Payment intent succeeded", {
              paymentIntentId: (event.data.object as any).id,
            });
            break;

          case "payment_intent.payment_failed":
            logger.warn("[Stripe Webhook] Payment intent failed", {
              paymentIntentId: (event.data.object as any).id,
            });
            break;

          default:
            logger.info("[Stripe Webhook] Unhandled event type", { type: event.type });
        }

        // Return 200 OK to acknowledge receipt
        res.status(200).json({ received: true });
      } catch (error: any) {
        if (error.type === "StripeSignatureVerificationError") {
          logger.error("[Stripe Webhook] Signature verification failed", {
            message: error.message,
            signatureHeader: sig ? sig.substring(0, 50) + "..." : "none",
            secretConfigured: !!webhookSecret,
            secretLength: webhookSecret ? webhookSecret.length : 0,
          });
          return res.status(400).json({
            error: "Webhook signature verification failed",
            hint: "Check STRIPE_WEBHOOK_SECRET environment variable"
          });
        }

        logger.error("[Stripe Webhook] Error processing webhook:", {
          errorName: error.name,
          errorMessage: error.message,
          errorType: error.type,
          stack: error.stack?.substring(0, 500),
        });
        // Return 200 to prevent Stripe from retrying for other errors
        res.status(200).json({ received: true, error: "processing_error_logged" });
      }
    }
  );
}
