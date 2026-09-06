// DEPRECATED: Supabase replaced with REST API backend
// This file is kept for compatibility but should not be used
// Use api.ts instead

// Placeholder export to prevent import errors
export const supabase = {
  auth: {
    signIn: () => console.warn('Use api.login() instead'),
    signOut: () => console.warn('Use api.logout() instead'),
    signUp: () => console.warn('Use api.register() instead'),
  },
  from: () => console.warn('Use api methods instead'),
};
