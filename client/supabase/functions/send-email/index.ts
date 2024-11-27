import { corsHeaders } from '../_shared/cors.ts';
import { Resend } from 'npm:resend@4.0.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import MagicLinkEmail from './_templates/magic-link.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const payload = await req.json();
      console.log('Received payload:', payload);
      
      const {
        email,
        type = 'signup',
        token,
        redirect_to,
        metadata = {}
      } = payload;

      if (!email || !token) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }), 
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Render the email template
      const emailHtml = await renderAsync(
        React.createElement(MagicLinkEmail, {
          token,
          supabase_url: Deno.env.get('SUPABASE_URL')!,
          email_action_type: type,
          redirect_to,
          ...metadata
        })
      );

      // Send the email
      const { data, error: resendError } = await resend.emails.send({
        from: 'Wellness Center <onboarding@resend.dev>',
        to: email,
        subject: type === 'welcome' 
          ? 'Welcome to Wellness Center - Set Up Your Account'
          : type === 'reset'
            ? 'Reset Your Password'
            : 'Sign in to Wellness Center',
        html: emailHtml,
      });

      if (resendError) {
        console.error('Email send error:', resendError);
        return new Response(
          JSON.stringify({ error: resendError.message }), 
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (err) {
      const error = err as Error;
      console.error('Server error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }), 
    { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
});