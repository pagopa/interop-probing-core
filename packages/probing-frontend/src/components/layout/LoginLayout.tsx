import { Paper, Typography } from '@mui/material'
import { Box } from '@mui/system'

type LoginLayoutProps = {
  children: React.ReactNode
  title: string
  description: string
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, description }) => {
  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="h1" variant="h4" fontWeight={700}>
        {title}
      </Typography>
      {description !== '' && (
        <Typography component="p" sx={{ mb: 3, mt: 2 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 480 }}>
        <Paper
          elevation={16}
          variant="elevation"
          sx={{
            borderRadius: 3,
            my: 4,
            p: 4,
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  )
}
