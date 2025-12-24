import React from 'react'
import { Typography, Box } from '@mui/material'

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the SHOEX Admin Dashboard.
      </Typography>
    </Box>
  )
}

export default Dashboard
