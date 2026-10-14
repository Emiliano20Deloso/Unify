export type QuoteStatus =
    | "pending_review"
    | "sent"
    | "accepted"
    | "paid"
    | "completed"
    | "cancelled";

export type ServiceLevel = "practico" | "select" | "premium";

export type Quote = {
    id: string;
    status: QuoteStatus;

    origin: string;
    origin_lat: number | null;
    origin_lng: number | null;
    destination: string;
    destination_lat: number | null;
    destination_lng: number | null;

    pickup_at: string;

    passengers: number;
    luggage: number;
    service_level: ServiceLevel;

    distance_km: number | null;
    duration_min: number | null;

    price_preliminary: number | null;
    price_final: number | null;

    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    is_corporate: boolean;
    notes: string | null;

    created_at: string;
    updated_at: string;
};

export type QuoteInsert = {
    id?: string;
    status?: QuoteStatus;

    origin: string;
    origin_lat?: number | null;
    origin_lng?: number | null;
    destination: string;
    destination_lat?: number | null;
    destination_lng?: number | null;

    pickup_at: string;

    passengers: number;
    luggage?: number;
    service_level: ServiceLevel;

    distance_km?: number | null;
    duration_min?: number | null;

    price_preliminary?: number | null;
    price_final?: number | null;

    customer_name: string;
    customer_email: string;
    customer_phone?: string | null;
    is_corporate?: boolean;
    notes?: string | null;

    created_at?: string;
    updated_at?: string;
};

export type QuoteUpdate = Partial<QuoteInsert>;

export type UserRole = "customer" | "admin";

export type Profile = {
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
};

export type ProfileInsert = {
    id: string;
    email: string;
    role?: UserRole;
};

export type ProfileUpdate = Partial<Omit<ProfileInsert, "id">>;

export type Database = {
    public: {
        Tables: {
            quotes: {
                Row: Quote;
                Insert: QuoteInsert;
                Update: QuoteUpdate;
                Relationships: [];
            };
            profiles: {
                Row: Profile;
                Insert: ProfileInsert;
                Update: ProfileUpdate;
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: {
            is_admin: {
                Args: { user_id: string };
                Returns: boolean;
            };
        };
        Enums: {
            quote_status: QuoteStatus;
            service_level: ServiceLevel;
            user_role: UserRole;
        };
        CompositeTypes: Record<string, never>;
    };
};
