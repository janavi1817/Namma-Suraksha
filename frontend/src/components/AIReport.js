import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, Divider, Chip, Grid, Card, CardContent } from '@mui/material';
import { FileText, Download, Shield, AlertTriangle, Network, Scale, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function AIReport({ officer }) {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/apk/${id}`);
      setReport(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report:', error);
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading report...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, bgcolor: '#1a1f2e', borderColor: '#2d3748', border: '1px solid' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#0dcaf0',
                  mb: 1
                }}
              >
                <FileText size={32} />
                AI INVESTIGATION REPORT
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Karnataka CB/CID — Cyber Crime Division
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Download size={18} />}
              onClick={handleDownloadPDF}
              sx={{
                bgcolor: '#0dcaf0',
                '&:hover': { bgcolor: '#0aa2c0' }
              }}
            >
              Download PDF
            </Button>
          </Box>
          
          <Divider sx={{ my: 2, borderColor: '#2d3748' }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Case Number</Typography>
              <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#e2e8f0' }}>
                CB/CID/2026/{id}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Investigating Officer</Typography>
              <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#e2e8f0' }}>
                {officer?.name} ({officer?.district})
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Report Generated</Typography>
              <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#e2e8f0' }}>
                {new Date().toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Threat Level</Typography>
              <Chip 
                label="CRITICAL" 
                sx={{ 
                  bgcolor: '#ff3333', 
                  color: '#fff',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 600
                }} 
                size="small" 
              />
            </Grid>
          </Grid>
        </Box>

        {/* Executive Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2,
              color: '#e2e8f0'
            }}
          >
            <Shield size={20} style={{ color: '#0dcaf0' }} />
            EXECUTIVE SUMMARY
          </Typography>
          <Paper sx={{ p: 3, bgcolor: '#0f1419', borderColor: '#2d3748', border: '1px solid' }}>
            <Typography sx={{ color: '#e2e8f0', lineHeight: 1.8 }}>
              The analyzed APK file <strong style={{ color: '#0dcaf0' }}>{report?.package_name || 'com.fake.banking.app'}</strong> has been 
              identified as a <strong style={{ color: '#ff3333' }}>high-risk fraudulent application</strong> with a fraud confidence 
              score of <strong style={{ color: '#ff3333' }}>87.3%</strong>. The application exhibits multiple indicators of malicious 
              intent including certificate spoofing, suspicious permissions, and network connections to known fraud infrastructure.
            </Typography>
          </Paper>
        </Box>

        {/* Investigation Findings */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2,
              color: '#e2e8f0'
            }}
          >
            <AlertTriangle size={20} style={{ color: '#ff8800' }} />
            INVESTIGATION FINDINGS
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#0f1419', borderColor: '#2d3748', border: '1px solid' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ff3333', mb: 2, fontSize: '0.875rem' }}>
                    CRITICAL INDICATORS
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff3333' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        Spoofed certificate (SBI Bank)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff3333' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        SMS interception permissions
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff3333' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        Accessibility service abuse
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff3333' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        Connection to C2 server
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#0f1419', borderColor: '#2d3748', border: '1px solid' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ff8800', mb: 2, fontSize: '0.875rem' }}>
                    HIGH RISK INDICATORS
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff8800' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        Obfuscated code detected
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff8800' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        Dynamic code loading
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff8800' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        Excessive permissions requested
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} style={{ color: '#ff8800' }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        No Google Play signature
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Infrastructure Details */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2,
              color: '#e2e8f0'
            }}
          >
            <Network size={20} style={{ color: '#0dcaf0' }} />
            INFRASTRUCTURE DETAILS
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: '#0f1419', borderColor: '#2d3748', border: '1px solid' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Command & Control Server
                </Typography>
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#0dcaf0', mt: 0.5 }}>
                  192.168.45.123:8443
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Malicious Domains
                </Typography>
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#0dcaf0', mt: 0.5 }}>
                  fake-sbi-secure.com, banking-verify.net
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Certificate Hash
                </Typography>
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#0dcaf0', mt: 0.5, fontSize: '0.75rem' }}>
                  SHA256: a3f5b2c8d9e1f4a7...
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Related Campaign
                </Typography>
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#0dcaf0', mt: 0.5 }}>
                  CAMP_SBI_2026_Q1
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Applicable Laws */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2,
              color: '#e2e8f0'
            }}
          >
            <Scale size={20} style={{ color: '#0dcaf0' }} />
            APPLICABLE LAWS & SECTIONS
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: '#0f1419', borderColor: '#2d3748', border: '1px solid' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#0dcaf0', fontSize: '0.875rem', mb: 0.5 }}>
                  IT Act, 2000 - Section 66C
                </Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                  Punishment for identity theft (Imprisonment up to 3 years and fine up to ₹1 lakh)
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#0dcaf0', fontSize: '0.875rem', mb: 0.5 }}>
                  IT Act, 2000 - Section 66D
                </Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                  Punishment for cheating by personation using computer resource (Imprisonment up to 3 years and fine up to ₹1 lakh)
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#0dcaf0', fontSize: '0.875rem', mb: 0.5 }}>
                  IPC Section 420
                </Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                  Cheating and dishonestly inducing delivery of property (Imprisonment up to 7 years and fine)
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Recommended Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2,
              color: '#e2e8f0'
            }}
          >
            <CheckCircle size={20} style={{ color: '#4ade80' }} />
            RECOMMENDED ACTIONS
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: '#0f1419', borderColor: '#2d3748', border: '1px solid' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                1. Immediate takedown request to hosting provider for C2 server
              </Typography>
              <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                2. Coordinate with banks to alert customers about fake app
              </Typography>
              <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                3. Issue public advisory through Karnataka CB/CID channels
              </Typography>
              <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                4. Trace financial transactions linked to campaign
              </Typography>
              <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                5. Coordinate with cyber cell for suspect identification
              </Typography>
              <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                6. Monitor for related APKs using same certificate/infrastructure
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Footer */}
        <Divider sx={{ my: 3, borderColor: '#2d3748' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            This report is generated by RAKSHAK AI Intelligence Platform
          </Typography>
          <br />
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Karnataka CB/CID — Cyber Crime Division — Confidential Document
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default AIReport;
