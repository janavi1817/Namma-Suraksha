import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, Target, ShieldAlert, Network, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const RISK_COLORS = {
  Critical: '#ff3333',
  High: '#ff8800',
  Medium: '#ffcc00',
  Low: '#0dcaf0'
};

function Dashboard({ officer }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, message: 'New SBI fake APK detected', time: new Date(Date.now() - 120000), severity: 'critical' },
    { id: 2, message: 'Campaign CAMP_001 - 3 new victims', time: new Date(Date.now() - 300000), severity: 'high' },
    { id: 3, message: 'Certificate XYZ seen in new APK', time: new Date(Date.now() - 600000), severity: 'medium' }
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>Loading...</Typography>
      </Container>
    );
  }

  const pieData = [
    { name: 'APKs', value: stats?.total_apks || 0 },
    { name: 'Certificates', value: stats?.total_certs || 0 },
    { name: 'Domains', value: stats?.total_domains || 0 },
    { name: 'IPs', value: stats?.total_ips || 0 },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#e2e8f0',
            mb: 1
          }}
        >
          <Activity size={28} style={{ color: '#0dcaf0' }} />
          RAKSHAK Dashboard
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#94a3b8',
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem'
          }}
        >
          {officer ? `Welcome, ${officer.name} — ${officer.district} District` : 'Real-time overview of analyzed threats and campaigns'}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Stats Cards - RAKSHAK specific */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid',
            '&:hover': { borderColor: '#0dcaf0', transition: 'border-color 0.3s' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography 
                  sx={{ 
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}
                >
                  Total APKs
                </Typography>
                <Target size={16} style={{ color: '#94a3b8' }} />
              </Box>
              <Typography variant="h3" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>
                312
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                Analyzed samples
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid',
            '&:hover': { borderColor: '#ff3333', transition: 'border-color 0.3s' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography 
                  sx={{ 
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}
                >
                  High Risk APKs
                </Typography>
                <ShieldAlert size={16} style={{ color: '#ff3333' }} />
              </Box>
              <Typography variant="h3" sx={{ color: '#ff3333', fontWeight: 700, mb: 0.5 }}>
                47
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                Requires immediate action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid',
            '&:hover': { borderColor: '#0dcaf0', transition: 'border-color 0.3s' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography 
                  sx={{ 
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}
                >
                  Active Campaigns
                </Typography>
                <Network size={16} style={{ color: '#94a3b8' }} />
              </Box>
              <Typography variant="h3" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>
                23
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                Identified threat groups
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid',
            '&:hover': { borderColor: '#ffcc00', transition: 'border-color 0.3s' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography 
                  sx={{ 
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}
                >
                  Linked Gangs
                </Typography>
                <AlertTriangle size={16} style={{ color: '#94a3b8' }} />
              </Box>
              <Typography variant="h3" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>
                8
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                Root source operators
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid'
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                letterSpacing: '0.1em',
                color: '#e2e8f0',
                mb: 3
              }}
            >
              Weekly Fraud Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { day: 'Mon', frauds: 12 },
                    { day: 'Tue', frauds: 19 },
                    { day: 'Wed', frauds: 15 },
                    { day: 'Thu', frauds: 25 },
                    { day: 'Fri', frauds: 22 },
                    { day: 'Sat', frauds: 18 },
                    { day: 'Sun', frauds: 14 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1f2e', 
                      borderColor: '#2d3748',
                      color: '#e2e8f0'
                    }}
                  />
                  <Bar dataKey="frauds" fill="#0dcaf0" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid',
            height: '100%'
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                letterSpacing: '0.1em',
                color: '#e2e8f0',
                mb: 3
              }}
            >
              Latest Alerts
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {alerts.map((alert) => (
                <Card 
                  key={alert.id}
                  sx={{ 
                    bgcolor: '#0f1419',
                    borderColor: alert.severity === 'critical' ? '#ff3333' : alert.severity === 'high' ? '#ff8800' : '#2d3748',
                    border: '1px solid',
                    borderLeft: `4px solid ${alert.severity === 'critical' ? '#ff3333' : alert.severity === 'high' ? '#ff8800' : '#ffcc00'}`
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography 
                      variant="body2"
                      sx={{
                        color: '#e2e8f0',
                        fontSize: '0.75rem',
                        mb: 0.5
                      }}
                    >
                      {alert.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#64748b',
                        fontSize: '0.65rem'
                      }}
                    >
                      {formatDistanceToNow(alert.time, { addSuffix: true })}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Infrastructure Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid'
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                letterSpacing: '0.1em',
                color: '#e2e8f0',
                mb: 3
              }}
            >
              Infrastructure Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0dcaf0', '#ff8800', '#4ade80', '#ffcc00'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1f2e', 
                      borderColor: '#2d3748',
                      color: '#e2e8f0'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#1a1f2e', 
            borderColor: '#2d3748',
            border: '1px solid'
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                letterSpacing: '0.1em',
                color: '#e2e8f0',
                mb: 3
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: '#0f1419',
                  borderColor: '#2d3748',
                  border: '1px solid',
                  '&:hover': { 
                    borderColor: '#0dcaf0',
                    bgcolor: 'rgba(13, 202, 240, 0.05)',
                    transition: 'all 0.3s'
                  }
                }} 
                onClick={() => window.location.href = '/upload'}
              >
                <CardContent>
                  <Typography 
                    variant="h6"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.875rem',
                      color: '#e2e8f0',
                      mb: 0.5
                    }}
                  >
                    Upload New APK
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Analyze a new APK file for fraud indicators
                  </Typography>
                </CardContent>
              </Card>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: '#0f1419',
                  borderColor: '#2d3748',
                  border: '1px solid',
                  '&:hover': { 
                    borderColor: '#0dcaf0',
                    bgcolor: 'rgba(13, 202, 240, 0.05)',
                    transition: 'all 0.3s'
                  }
                }} 
                onClick={() => window.location.href = '/clusters'}
              >
                <CardContent>
                  <Typography 
                    variant="h6"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.875rem',
                      color: '#e2e8f0',
                      mb: 0.5
                    }}
                  >
                    View Fraud Clusters
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Explore related fraudulent APKs
                  </Typography>
                </CardContent>
              </Card>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: '#0f1419',
                  borderColor: '#2d3748',
                  border: '1px solid',
                  '&:hover': { 
                    borderColor: '#0dcaf0',
                    bgcolor: 'rgba(13, 202, 240, 0.05)',
                    transition: 'all 0.3s'
                  }
                }} 
                onClick={() => window.location.href = '/root-sources'}
              >
                <CardContent>
                  <Typography 
                    variant="h6"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.875rem',
                      color: '#e2e8f0',
                      mb: 0.5
                    }}
                  >
                    Root Sources
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Identify repeat offenders and campaign origins
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
