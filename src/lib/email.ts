import { Resend } from "resend";

export class EmailError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = "EmailError";
    }
}

export interface SendEmailInput {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
    replyTo?: string;
    headers?: Record<string, string>;
}

let client: Resend | null = null;

function getClient(): Resend {
    if (client) return client;
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        throw new EmailError("Falta RESEND_API_KEY en .env.local", "NO_API_KEY");
    }
    client = new Resend(key);
    return client;
}

export function getFromAddress(): string {
    const from = process.env.RESEND_FROM;
    if (!from) {
        throw new EmailError("Falta RESEND_FROM en .env.local", "NO_FROM");
    }
    return from;
}

export function getAdminEmail(): string {
    const email = process.env.ADMIN_EMAIL;
    if (!email) {
        throw new EmailError("Falta ADMIN_EMAIL en .env.local", "NO_ADMIN_EMAIL");
    }
    return email;
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
    const resend = getClient();
    const { data, error } = await resend.emails.send({
        from: getFromAddress(),
        to: input.to,
        subject: input.subject,
        react: input.react,
        replyTo: input.replyTo,
        headers: input.headers,
    });

    if (error) {
        throw new EmailError(error.message ?? "Resend send failed", error.name ?? "SEND_ERROR");
    }
    if (!data?.id) {
        throw new EmailError("Resend returned no id", "NO_ID");
    }
    return { id: data.id };
}

export function sendEmailSafe(input: SendEmailInput): Promise<{ id: string } | null> {
    return sendEmail(input).catch((e) => {
        console.warn("[email] send failed, continuing:", e);
        return null;
    });
}
