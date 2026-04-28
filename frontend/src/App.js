import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import APKUpload from './components/APKUpload';
import APKDetails from './components/APKDetails';
import NetworkGraph from './components/NetworkGraph';
import FraudClusters from './components/FraudClusters';
import RootSources from './components/RootSources';
import AIReport from './components/AIReport';
import Navigation from './components/Navigation';

// SOC-style dark theme with cyan primary color
const socTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0dcaf0', // Cyan/teal for SOC feel
      dark: '#0aa2c0',
      light: '#3dd5f3',
    },
    secondary: {
      main: '#2d3748',
    },
    error: {
      main: '#ff3333', // Critical risk
    },
    warning: {
      main: '#ff8800', // High risk
    },
    info: {
      main: '#ffcc00', // Medium risk
    },
    success: {
      main: '#0dcaf0', // Low risk (cyan)
    },
    background: {
      default: '#0f1419', // Very dark background
      paper: '#1a1f2e', // Card background
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderColor: '#2d3748',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          fontSize: '0.75rem',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [officer, setOfficer] = useState(null);

  const handleLogin = (officerData) => {
    setOfficer(officerData);
  };

  const handleLogout = () => {
    setOfficer(null);
  };

  return (
    <ThemeProvider theme={socTheme}>
      <CssBaseline />
      <Router>
        {officer && <Navigation officer={officer} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/login" 
            element={officer ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={officer ? <Dashboard officer={officer} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/upload" 
            element={officer ? <APKUpload officer={officer} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/apk/:id" 
            element={officer ? <APKDetails officer={officer} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/graph/:id" 
            element={officer ? <NetworkGraph officer={officer} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/clusters" 
            element={officer ? <FraudClusters officer={officer} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/root-sources" 
            element={officer ? <RootSources officer={officer} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/report/:id" 
            element={officer ? <AIReport officer={officer} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={officer ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
