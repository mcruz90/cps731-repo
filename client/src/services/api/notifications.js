import { supabaseAdmin } from './adminClient';

export const notificationService = {
  async sendWelcomeEmail(userData) {
    try {
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: userData.email,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role
          },
          redirectTo: `${window.location.origin}/set-password`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Send welcome email error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  },

  // Other types of notifications here like password reset emails??? need to figure it out in supabase Edge functions
  async sendPasswordResetEmail(email) {
    try {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Send password reset email error:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
};