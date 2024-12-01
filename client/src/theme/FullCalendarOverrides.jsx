import { GlobalStyles } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const FullCalendarOverrides = () => {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        
        '.fc-toolbar': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          border: 'none',
        },
        '.fc-toolbar-title': {
          ...theme.typography.h6,
          color: theme.palette.text.primary,
        },
        
        '.fc-button': {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          border: 'none',
          borderRadius: theme.shape.borderRadius,
          padding: '6px 12px',
          fontSize: theme.typography.button.fontSize,
          fontWeight: theme.typography.button.fontWeight,
          textTransform: theme.typography.button.textTransform,
          letterSpacing: theme.typography.button.letterSpacing,
          transition: 'background-color 0.3s, transform 0.2s',
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
            transform: 'translateY(-2px)',
          },
        },
        
        '.fc-button-today': {
          backgroundColor: theme.palette.info.main,
          color: theme.palette.getContrastText(theme.palette.info.main),
          '&:hover': {
            backgroundColor: theme.palette.info.dark,
          },
        },
        
        '.fc-daygrid-event, .fc-timegrid-event': {
          backgroundColor: theme.palette.success.main,
          border: 'none',
          color: theme.palette.getContrastText(theme.palette.success.main),
          borderRadius: theme.shape.borderRadius,
          padding: '2px 4px',
          fontSize: theme.typography.body2.fontSize,
          fontWeight: theme.typography.body2.fontWeight,
        },
        
        '.fc-daygrid-event:hover, .fc-timegrid-event:hover': {
          backgroundColor: theme.palette.success.dark,
          cursor: 'pointer',
        },
        
        '.fc-prev-button, .fc-next-button, .fc-prev-year-button, .fc-next-year-button': {
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          border: 'none',
          '&:hover': {
            backgroundColor: 'transparent',
            color: theme.palette.primary.contrastText,
          },
        },
        
        '.fc .fc-view, .fc .fc-scroller': {
          backgroundColor: theme.palette.background.paper,
        },
        
        '.fc-col-header-cell-cushion': {
          color: theme.palette.text.secondary,
          ...theme.typography.body1,
        },
        
        '.fc-daygrid-day, .fc-timegrid-slot-label': {
          color: theme.palette.text.primary,
          ...theme.typography.body1,
        },
        
        '.fc-daygrid-day.fc-day-today, .fc-timegrid-slot.fc-timegrid-slot-now': {
          backgroundColor: theme.palette.background.default,
        },
      }}
    />
  );
};

export default FullCalendarOverrides;