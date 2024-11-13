// DUMMY DATA rendered on here. Need to get actual practitioner info from supabase
import { 
    Container, 
    Typography, 
    Box, 
    Card, 
    CardContent,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText 
  } from '@mui/material';
  import Grid from '@mui/material/Grid2';
  import {
    MedicalServices,
    AccessTime,
    LocationOn,
    Phone
  } from '@mui/icons-material';
  
  const About = () => {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            About Serenity
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Your Trusted Partner in Health and Wellness
          </Typography>
        </Box>
  
        {/* Mission Statement */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            At Serenity, we are dedicated to providing exceptional wellness services 
            that prioritize your well-being and comfort. Our mission is to deliver 
            personalized care through innovative practices and compassionate 
            service.
          </Typography>
        </Box>
  
        {/* Key Information */}
        <Box sx={{ mb: 8 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <LocationOn color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Location" 
                secondary="123 Healthcare Avenue, Toronto, ON M5V 2T6"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccessTime color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Hours" 
                secondary="Monday - Friday: 8:00 AM - 8:00 PM | Saturday: 9:00 AM - 5:00 PM"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Phone color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Contact" 
                secondary="Phone: (416) 555-0123 | Email: info@serenity.ca"
              />
            </ListItem>
          </List>
        </Box>
  
        {/* Services */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom>
            Our Services
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Health and Wellness
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wellness classes and health sessions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Specialized Care
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expert classes and sessions with specialists in various fields.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Virtual Classes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Convenient online classes from the comfort of your home.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
  
        {/* Team Section */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Our Team
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    margin: '0 auto',
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}
                >
                  <MedicalServices />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Sarah Johnson
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nutritionist
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    margin: '0 auto',
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}
                >
                  <MedicalServices />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Michael Chen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Physiotherapist
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    margin: '0 auto',
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}
                >
                  <MedicalServices />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Emily Patel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yoga Instructor
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  };
  
  export default About;