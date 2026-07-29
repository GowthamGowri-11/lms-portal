export const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode } }));
  }
};
