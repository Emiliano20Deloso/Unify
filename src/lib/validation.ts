import { z } from "zod";

export const quoteRequestSchema = z.object({
    origin: z.string().min(3).max(300),
    originLat: z.number().min(-90).max(90).optional(),
    originLng: z.number().min(-180).max(180).optional(),

    destination: z.string().min(3).max(300),
    destinationLat: z.number().min(-90).max(90).optional(),
    destinationLng: z.number().min(-180).max(180).optional(),

    pickupAt: z.string().datetime({ offset: true }),

    passengers: z.number().int().min(1).max(10),
    luggage: z.number().int().min(0).max(20),
    serviceLevel: z.enum(["practico", "select", "premium"]),

    customerName: z.string().min(2).max(120),
    customerEmail: z.string().email().max(200),
    customerPhone: z.string().min(7).max(30).optional().nullable(),
    isCorporate: z.boolean().default(false),
    notes: z.string().max(500).optional().nullable(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
