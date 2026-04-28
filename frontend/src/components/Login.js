import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, MenuItem } from '@mui/material';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const districts = [
  'Bengaluru',
  'Mysuru',
  'Hubli',
  'Mangaluru',
  'Belagavi',
  'Kalaburagi',
  'Davangere',
  'Ballari'
];

function Login({ onLogin }) {
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Bengaluru');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock authentication
    if (officerId && password) {
      const officer = {
        id: officerId,
        name: officerId.includes('ravi') ? 'Ravi Kumar' : 'Officer ' + officerId,
        district: district
      };
      onLogin(officer);
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 5,
            bgcolor: '#1a1f2e',
            borderColor: '#2d3748',
            border: '1px solid',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Shield size={64} style={{ color: '#0dcaf0', marginBottom: '16px' }} />
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#0dcaf0',
                mb: 1,
              }}
            >
              🛡️ RAKSHAK
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#94a3b8',
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Karnataka CB/CID Intelligence Platform
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Officer ID"
                variant="outlined"
                fullWidth
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="Enter your officer ID"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"JetBrains Mono", monospace',
                  },
                }}
              />

              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"JetBrains Mono", monospace',
                  },
                }}
              />

              <TextField
                select
                label="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                fullWidth
              >
                {districts.map((dist) => (
                  <MenuItem key={dist} value={dist}>
                    {dist}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  fontFamily: '"JetBrains Mono", monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '1rem',
                  bgcolor: '#0dcaf0',
                  '&:hover': {
                    bgcolor: '#0aa2c0',
                  },
                }}
              >
                🔐 Login Securely
              </Button>
            </Box>
          </form>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              color: '#64748b',
            }}
          >
            Karnataka CB/CID — Official Use Only
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
