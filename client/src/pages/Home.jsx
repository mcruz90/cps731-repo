import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Card,
  CardContent,
  CardMedia,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Paper,
  Rating 
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { 
  ExpandMore,
  FormatQuote 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  // FAQ data
  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Simply create an account, log in, and use our booking system to select your preferred service, practitioner, and time slot."
    },
    {
      question: "What services do you offer?",
      answer: "We offer a range of services including general consultation, physical therapy, massage therapy, and more. Each service is provided by qualified healthcare professionals."
    },
    {
      question: "How can I cancel or reschedule?",
      answer: "You can manage your appointments through your account dashboard. We request at least 24 hours notice for cancellations or changes."
    },
    {
      question: "Are your services covered by insurance?",
      answer: "Many of our services are covered by insurance. We recommend checking with your provider for specific coverage details."
    }
  ];

  // Testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      rating: 5,
      comment: "The booking process was incredibly smooth. I love being able to schedule appointments at my convenience.",
      avatar: "/path-to-avatar1.jpg"
    },
    {
      name: "Michael Chen",
      role: "Patient",
      rating: 5,
      comment: "Professional service from start to finish. The practitioners are excellent and the booking system is user-friendly.",
      avatar: "/path-to-avatar2.jpg"
    },
    {
      name: "Emily Rodriguez",
      role: "Patient",
      rating: 5,
      comment: "I've been using this service for months now. It's so convenient and the care quality is outstanding.",
      avatar: "/path-to-avatar3.jpg"
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section with enhanced styling */}
      <Box 
        sx={{ 
          py: 12,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #f3f4f6 30%, #ffffff 90%)',
          borderRadius: 4,
          mb: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography 
          variant="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}
        >
          Healthcare Made Simple
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}
        >
          Book your healthcare appointments online with ease
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/login')}
          sx={{ 
            py: 2,
            px: 4,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
          }}
        >
          Get Started
        </Button>
      </Box>

      {/* Services Section with enhanced cards */}
      <Box sx={{ mb: 10 }}>
        <Typography 
          variant="h4" 
          textAlign="center" 
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Our Services
        </Typography>
        <Grid container spacing={4}>
          {/* Service cards with hover effect */}
          {['General Consultation', 'Physical Therapy', 'Massage Therapy'].map((service, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`/path-to-${service.toLowerCase().replace(' ', '-')}.jpg`}
                  alt={service}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>{service}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Professional healthcare services tailored to your needs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ mb: 10 }}>
        <Typography 
          variant="h4" 
          textAlign="center" 
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          What Our Patients Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: 'background.paper',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={testimonial.avatar} sx={{ width: 56, height: 56 }} />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {testimonial.name}
                    </Typography>
                    <Rating value={testimonial.rating} readOnly size="small" />
                  </Box>
                </Box>
                <FormatQuote sx={{ color: 'primary.main', fontSize: 40, opacity: 0.3 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {testimonial.comment}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 10 }}>
        <Typography 
          variant="h4" 
          textAlign="center" 
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Frequently Asked Questions
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion 
            key={index}
            sx={{ 
              mb: 1,
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px !important',
              '&:not(:last-child)': { mb: 2 }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Enhanced CTA Section */}
      <Box 
        sx={{ 
          py: 8,
          px: 4, 
          textAlign: 'center',
          background: 'linear-gradient(45deg, #f3f4f6 30%, #ffffff 90%)',
          borderRadius: 4,
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Join our healthcare community today and experience the difference.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{ 
              py: 1.5,
              px: 4,
              borderRadius: 3,
              textTransform: 'none'
            }}
          >
            Register Now
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => navigate('/about')}
            sx={{ 
              py: 1.5,
              px: 4,
              borderRadius: 3,
              textTransform: 'none'
            }}
          >
            Learn More
          </Button>
        </Box>
      </Box>
    </Container>
  );
};