import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user:        null,
            hasHydrated: false,
            isLoading:   true, // ← stays true until AuthProvider finishes /api/auth/me

            setUser:      (user)  => set({ user }),
            setHydrated:  ()      => set({ hasHydrated: true }),
            setLoading:   (val)   => set({ isLoading: val }), // ← add this
            login:        (user)  => set({ user, isLoading: false }),
            logout:       ()      => set({ user: null, isLoading: false }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state.setHydrated();
            },
        }
    )
);

export default useAuthStore;