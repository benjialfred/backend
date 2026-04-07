/**
 * Mock Notification API for Event-Driven Notification System
 * Simulating Backend behaviour for the Couture Platform
 */

export interface AppNotification {
    id: string;
    target_role: 'admin' | 'client';
    type: 'UserRegistered' | 'OrderCreated' | 'MeasurementsAdded' | 'OrderInProduction' | 'OrderCompleted' | 'AppointmentScheduled';
    message: string;
    is_read: boolean;
    created_at: string;
}

// Initial mock data
let mockDB: AppNotification[] = [
    {
        id: 'n-1',
        target_role: 'client',
        type: 'OrderCreated',
        message: 'Votre commande #CMD-1029 a bien été enregistrée.',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: 'n-2',
        target_role: 'client',
        type: 'UserRegistered',
        message: 'Bienvenue dans notre univers de confection sur-mesure.',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
];

export const notificationAPI = {
    getAll: async (): Promise<{ results: AppNotification[] }> => {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real app we filter by authenticated user id
                resolve({ results: mockDB.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
            }, 500);
        });
    },

    markAsRead: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockDB = mockDB.map(n => n.id === id ? { ...n, is_read: true } : n);
                resolve();
            }, 300);
        });
    },

    markAllAsRead: async (): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockDB = mockDB.map(n => ({ ...n, is_read: true }));
                resolve();
            }, 300);
        });
    },

    // Internal Mock Helper to trigger new events
    dispatchMockEvent: (type: AppNotification['type'], message: string, role: 'admin' | 'client' = 'client') => {
        const newNotif: AppNotification = {
            id: `n-${Date.now()}`,
            target_role: role,
            type,
            message,
            is_read: false,
            created_at: new Date().toISOString()
        };
        mockDB = [newNotif, ...mockDB];
    }
};
