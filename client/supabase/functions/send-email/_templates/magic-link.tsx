/// <reference lib="dom" />

import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
} from 'npm:@react-email/components@0.0.22';
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
   email_action_type: string;
   redirect_to: string;
   token_hash: string;
}

const styles = {
   main: {
      backgroundColor: '#ffffff',
      fontFamily:
         "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
   },
   container: {
      paddingLeft: '12px',
      paddingRight: '12px',
      margin: '0 auto',
      maxWidth: '580px',
   },
   h1: {
      color: '#333',
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '40px 0',
      padding: '0',
      textAlign: 'center' as const,
   },
   link: {
      color: '#2563eb',
      fontSize: '14px',
      textDecoration: 'underline',
   },
   text: {
      color: '#333',
      fontSize: '14px',
      margin: '24px 0',
      textAlign: 'center' as const,
   },
   footer: {
      color: '#898989',
      fontSize: '12px',
      lineHeight: '22px',
      marginTop: '12px',
      marginBottom: '24px',
      textAlign: 'center' as const,
   },
   code: {
      display: 'block',
      padding: '16px 4.5%',
      width: '90.5%',
      backgroundColor: '#f4f4f4',
      borderRadius: '5px',
      border: '1px solid #eee',
      color: '#333',
      fontSize: '18px',
      textAlign: 'center' as const,
      margin: '0 auto',
   },
};

export const MagicLinkEmail: React.FC<MagicLinkEmailProps> = ({
   token,
   supabase_url,
   email_action_type,
   redirect_to,
   token_hash,
}: MagicLinkEmailProps) => {
   const isSignup = email_action_type === 'signup';
   
   return (
     <Html>
       <Head />
       <Preview>
         {isSignup ? 'Welcome to Serenity Wellness!' : 'Reset Your Password'}
       </Preview>
       <Body style={styles.main}>
         <Container style={styles.container}>
           <Heading style={styles.h1}>
             {isSignup ? 'Welcome!' : 'Reset Password'}
           </Heading>
           <Link
             href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
             target="_blank"
             style={{
               ...styles.link,
               display: 'block',
               marginBottom: '16px',
             }}
           >
             {isSignup 
               ? 'Click here to verify your email'
               : 'Click here to reset your password'}
           </Link>
           <Text style={{ ...styles.text, marginBottom: '14px' }}>
             Or, use this verification code:
           </Text>
           <code style={styles.code}>{token}</code>
           <Text
             style={{
               ...styles.text,
               color: '#ababab',
               marginTop: '14px',
               marginBottom: '16px',
             }}
           >
             {isSignup 
               ? "If you didn't sign up for an account, you can safely ignore this email."
               : "If you didn't request a password reset, you can safely ignore this email."}
           </Text>
           <Text style={styles.footer}>
             <Link
               href="https://yourwellnesscenter.com"
               target="_blank"
               style={{ ...styles.link, color: '#898989' }}
             >
               Serenity Wellness
             </Link>
             , your path to wellness.
           </Text>
         </Container>
       </Body>
     </Html>
   );
};

export default MagicLinkEmail;