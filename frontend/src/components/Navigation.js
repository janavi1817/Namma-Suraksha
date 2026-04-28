import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, User, LogOut } from 'lucide-react';

function Navigation({ officer, onLogout }) {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(90deg, #0f1419 0%, #1a1f2e 100%)',
      borderBottom: '1px solid #2d3748'
    }}>
      <Toolbar>
        <Shield style={{ marginRight: '12px', color: '#0dcaf0' }} size={24} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }} 
          onClick={() => navigate('/dashboard')}
        >
          <Activity size={20} style={{ color: '#0dcaf0' }} />
          🛡️ RAKSHAK
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              '&:hover': { backgroundColor: 'rgba(13, 202, 240, 0.1)' }
            }}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/upload')}
            sx={{ 
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              '&:hover': { backgroundColor: 'rgba(13, 202, 240, 0.1)' }
            }}
          >
            Upload
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/clusters')}
            sx={{ 
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              '&:hover': { backgroundColor: 'rgba(13, 202, 240, 0.1)' }
            }}
          >
            Clusters
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/root-sources')}
            sx={{ 
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              '&:hover': { backgroundColor: 'rgba(13, 202, 240, 0.1)' }
            }}
          >
            Root Sources
          </Button>
          
          {officer && (
            <>
              <Box sx={{ mx: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={16} style={{ color: '#0dcaf0' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    color: '#e2e8f0'
                  }}
                >
                  {officer.name}
                </Typography>
                <Chip 
                  label={officer.district} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#0dcaf0',
                    color: '#0f1419',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }} 
                />
              </Box>
              <Button 
                color="inherit" 
                onClick={onLogout}
                startIcon={<LogOut size={16} />}
                sx={{ 
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  color: '#ff3333',
                  '&:hover': { backgroundColor: 'rgba(255, 51, 51, 0.1)' }
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
