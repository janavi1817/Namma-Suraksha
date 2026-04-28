import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function RootSources() {
  const [sources, setSources] = useState([]);
  const [offenders, setOffenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sourcesRes, offendersRes] = await Promise.all([
        axios.get(`${API_URL}/api/root-sources`),
        axios.get(`${API_URL}/api/repeat-offenders`)
      ]);
      setSources(sourcesRes.data);
      setOffenders(offendersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Root Sources & Repeat Offenders
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Root Sources (Certificates with Multiple APKs)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certificate Subject</TableCell>
                <TableCell>Fingerprint</TableCell>
                <TableCell align="right">APK Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sources.map((source, index) => (
                <TableRow key={index}>
                  <TableCell>{source.subject}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {source.cert_fingerprint?.substring(0, 16)}...
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={source.apk_count} color="primary" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Repeat Offenders (Fraudulent APKs)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certificate Subject</TableCell>
                <TableCell>Fingerprint</TableCell>
                <TableCell align="right">Fraud Count</TableCell>
                <TableCell>Packages</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offenders.map((offender, index) => (
                <TableRow key={index}>
                  <TableCell>{offender.subject}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {offender.cert_fingerprint?.substring(0, 16)}...
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={offender.fraud_count} color="error" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {offender.packages?.slice(0, 3).map((pkg, i) => (
                        <Chip key={i} label={pkg} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default RootSources;
