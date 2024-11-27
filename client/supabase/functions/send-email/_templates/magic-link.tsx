/// <reference lib="dom" />

import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,}
    from 'npm:@react-email/components';
    
import * as React from 'npm:react@18.3.1';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface MagicLinkEmailProps {
  token: string;
  supabase_url: string;
  email_action_type: 'welcome' | 'signup' | 'reset' | 'invite';
  redirect_to: string;
  _token_hash: string;
}

const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  _token_hash,
}: MagicLinkEmailProps): React.ReactElement => {
  const isWelcome = email_action_type === 'welcome' || email_action_type === 'invite';
  const isReset = email_action_type === 'reset';
  
  return (
    <Html>
      <Head />
      <Preview>
        {isWelcome 
          ? 'Welcome to Wellness Center - Set Up Your Account' 
          : isReset 
            ? 'Reset Your Password'
            : 'Sign in to Wellness Center'}
      </Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>
            {isWelcome 
              ? 'Welcome to Wellness Center!' 
              : isReset
                ? 'Reset Your Password'
                : 'Sign in to Wellness Center'}
          </Heading>
          
          <Text style={styles.text}>
            {isWelcome 
              ? 'Please click the button below to set up your account and create your password.'
              : isReset
                ? 'Click the button below to reset your password.'
                : 'Click the button below to sign in to your account.'}
          </Text>
          
          <Link href={`${supabase_url}/auth/v1/verify?token=${token}&type=${email_action_type}&redirect_to=${redirect_to}`} style={styles.link}>
            {isWelcome 
              ? 'Set Up Account'
              : isReset
                ? 'Reset Password'
                : 'Sign In'}
          </Link>

          <Text style={{ ...styles.text, marginBottom: '14px' }}>
            Or, use this verification code:
          </Text>
          <code style={styles.code}>{token}</code>

          <Text style={{ ...styles.text, color: '#ababab', marginTop: '14px', marginBottom: '16px' }}>
            {isWelcome 
              ? "If you didn't expect to receive this invitation, you can safely ignore this email."
              : isReset
                ? "If you didn't request a password reset, you can safely ignore this email."
                : "If you didn't request this email, you can safely ignore it."}
          </Text>

          <Text style={styles.footer}>
            <Link
              href="https://yourwellnesscenter.com"
              target="_blank"
              style={{ ...styles.link, color: '#898989' }}
            >
              Wellness Center
            </Link>
            , your path to wellness.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  main: {
     backgroundColor: '#ffffff',
     fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  container: {
     padding: '20px',
     margin: '0 auto',
     maxWidth: '580px',
  },
  h1: {
     color: '#333',
     fontSize: '24px',
     fontWeight: 'bold',
     margin: '30px 0',
     padding: '0',
  },
  link: {
     color: '#2563eb',
     textDecoration: 'underline',
     margin: '0 0 30px',
     display: 'block',
     textAlign: 'center',
  },
  text: {
     color: '#333',
     fontSize: '16px',
     margin: '20px 0',
  },
  footer: {
     color: '#898989',
     fontSize: '14px',
     margin: '50px 0 0 0',
  },
  code: {
     display: 'inline-block',
     padding: '16px 4.5%',
     width: '90.5%',
     backgroundColor: '#f4f4f4',
     borderRadius: '5px',
     border: '1px solid #eee',
     color: '#333',
     fontSize: '18px',
     textAlign: 'center' as const,
  },
};

export default MagicLinkEmail;