import { computeEstimate } from "@/lib/estimate/estimate";
import { estimateRequestSchema } from "@/lib/estimate/schema";
import { errorResponse, guardJsonRequest, jsonResponse, zodIssues } from "@/lib/http/guard";

export const runtime = "nodejs";

// Estimación de tarifa: sin datos personales y sin base de datos.
// Google caído o sin llave nunca es error: responde 200 con distanceSource "approx".
export async function POST(req: Request) {
    const guarded = await guardJsonRequest(req, "estimate");
    if (!guarded.ok) return guarded.response;

    const parsed = estimateRequestSchema.safeParse(guarded.body);
    if (!parsed.success) {
        return errorResponse(422, "VALIDATION", "Datos inválidos", { issues: zodIssues(parsed.error) });
    }

    const result = await computeEstimate(parsed.data);
    if (!result.ok) {
        return errorResponse(result.status, result.code, result.message, { issues: result.issues });
    }
    return jsonResponse(result);
}
