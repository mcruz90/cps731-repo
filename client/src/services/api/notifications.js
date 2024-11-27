import { supabase } from './index';


// defines all services related to notifications
// Available methods:
// sendWelcomeEmail, - sends a welcome email to a new user (params: userData (Object))
// sendPasswordResetEmail, - sends a password reset email to a user (params: email (String))

// BACKBURNER FOR NOW--SEND-EMAILS EDGE FUNCTIONS NOT WORKING YET
export const notificationService = {
    async sendWelcomeEmail(userData) {
        try {
            console.log('Sending welcome email with data:', userData);
            
            // Use password reset flow instead of invite since user exists
            const { error } = await supabase.auth.resetPasswordForEmail(userData.email, {
                redirectTo: `${window.location.origin}/set-password`,
                data: {
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    role: userData.role,
                    is_welcome_email: true
                }
            });

            if (error) {
                console.error('Welcome email error:', error);
                throw error;
            }
            
            console.log('Welcome email sent successfully');
            return { success: true };
        } catch (error) {
            console.error('Send welcome email error:', error);
            throw new Error(`Failed to send welcome email: ${error.message}`);
        }
    },

    async sendPasswordResetEmail(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
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