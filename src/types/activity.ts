export type ActivityCategory = 'Ocio' | 'Campamentos' | 'Formaciones' | 'Talleres';

export interface Activity {
    id: string;
    title: string;
    description: string | null;
    category: ActivityCategory;
    date: string; // ISO date string
    location: string | null;
    max_spots: number;
    created_at: string;
    created_by: string;
}

export interface ActivityFilter {
    category?: ActivityCategory | 'Todas';
}
