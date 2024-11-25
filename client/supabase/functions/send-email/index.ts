import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'npm:resend@4.0.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { MagicLinkEmail } from './_templates/magic-link.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')!;

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  try {
    const { user, email_data } = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
      };
    };

    const html = await renderAsync(
      React.createElement(MagicLinkEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        ...email_data,
      })
    );

    const subject = email_data.email_action_type === 'signup' 
      ? 'Welcome to Your Wellness Center!' 
      : 'Reset Your Password';

    const { error } = await resend.emails.send({
      from: 'Serenity Team <admin@serenitywellness.email>',
      to: [user.email],
      subject,
      html,
    });

    if (error) throw error;

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});