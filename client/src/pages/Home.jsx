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
  Rating 
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { 
  ExpandMore,
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

  // testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      service: "Yoga",
      rating: 5,
      comment: "The Yoga classes have transformed my core strength and posture. The instructors are knowledgeable and attentive to form.",
      image: "/assets/images/yogagroup.jpg"
    },
    {
      name: "Michael Chen",
      service: "Physiotherapy",
      rating: 5,
      comment: "After my sports injury, the physiotherapy services here helped me recover completely. The treatment plan was personalized and effective.",
      image: "/assets/images/physiotherapist2.jpg"
    }
  ];

  // Services data
  const services = [
    {
      title: "Pilates Classes",
      description: "Transform your core strength and flexibility with our expert-led pilates classes. Perfect for all skill levels.",
      image: "/assets/images/pilatesclass.jpg",
      link: "/services/pilates"
    },
    {
      title: "Physiotherapy",
      description: "Professional physiotherapy services to help you recover from injuries and improve mobility.",
      image: "/assets/images/physiotherapy.jpg",
      link: "/services/physiotherapy"
    },
    {
      title: "Nutrition Counseling",
      description: "Personalized nutrition guidance to help you achieve your health and wellness goals.",
      image: "/assets/images/nutritionist.jpg",
      link: "/services/nutrition"
    }
  ];

  return (
    <>
      {/* Full-width Hero Section */}
      <Box 
        sx={{ 
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/assets/images/yogapic4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.85,
            zIndex: -1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4))',
            zIndex: -1
          }
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              px: 2
            }}
          >
            Healthcare Made Simple
          </Typography>
          <Typography 
            variant="h5" 
            paragraph
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 4,
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              px: 2
            }}
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
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Main content in container */}
      <Container maxWidth="xl">
        {/* Our Services Section */}
        <Box sx={{ my: 10 }}>
          <Typography 
            variant="h4" 
            textAlign="center" 
            gutterBottom
            sx={{ fontWeight: 600, mb: 6 }}
          >
            Our Services
          </Typography>
          <Grid 
            container 
            spacing={4} 
            sx={{ 
              maxWidth: '1600px', 
              mx: 'auto' 
            }}
          >
            {services.map((service, index) => (
              <Grid 
                key={index} 
                xs={12} 
                md={4} 
                sx={{
                  maxWidth: '400px',
                  mx: 'auto'
                }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(service.link)}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={service.image}
                    alt={service.title}
                    sx={{
                      objectFit: 'cover',
                      width: '100%'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2"
                      sx={{ fontWeight: 600 }}
                    >
                      {service.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ my: 10 }}>
          <Typography 
            variant="h4" 
            textAlign="center" 
            gutterBottom
            sx={{ fontWeight: 600, mb: 6 }}
          >
            What Our Clients Say
          </Typography>

          <Box sx={{ 
            flexGrow: 1, 
            maxWidth: '1200px',
            mx: 'auto',
            overflow: 'hidden'
          }}>
            <Grid 
              container 
              spacing={2}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gridTemplateRows: 'auto auto',
                gap: 2
              }}
            >
              <Grid item>
                <Box sx={{ p: 4, height: '100%', bgcolor: '#f8f9fa' }}>
                  <Rating value={testimonials[0].rating} readOnly size="small" sx={{ mb: 2 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3,
                      fontStyle: 'italic',
                      color: 'text.secondary'
                    }}
                  >
                    &ldquo;{testimonials[0].comment}&rdquo;
                  </Typography>
                  <Box sx={{ 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    pt: 2
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonials[0].name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.main' }}>
                      {testimonials[0].service} Client
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item>
                <Box 
                  component="img"
                  src="/assets/images/yogagroup.jpg"
                  alt="Yoga class"
                  sx={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: 2
                  }}
                />
              </Grid>

              <Grid item>
                <Box 
                  component="img"
                  src="/assets/images/physiotherapist2.jpg"
                  alt="Physiotherapy session"
                  sx={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: 2
                  }}
                />
              </Grid>

              <Grid item>
                <Box sx={{ p: 4, height: '100%', bgcolor: '#f8f9fa' }}>
                  <Rating value={testimonials[1].rating} readOnly size="small" sx={{ mb: 2 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3,
                      fontStyle: 'italic',
                      color: 'text.secondary'
                    }}
                  >
                    &ldquo;{testimonials[1].comment}&rdquo;
                  </Typography>
                  <Box sx={{ 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    pt: 2
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonials[1].name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.main' }}>
                      {testimonials[1].service} Client
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
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
      </Container>

      {/* Full-width CTA Section */}
      <Box 
        sx={{ 
          py: 8,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/assets/images/yogapic4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15,
            zIndex: -1
          }
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 600,
            position: 'relative',
            zIndex: 1
          }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" paragraph sx={{ 
            mb: 4,
            position: 'relative',
            zIndex: 1
          }}>
            Join our healthcare community today and experience the difference.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            position: 'relative',
            zIndex: 1
          }}>
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
        </Container>
      </Box>
    </>
  );
};