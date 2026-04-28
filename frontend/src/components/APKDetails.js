import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, Grid, Chip, Divider } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function APKDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/apk/${id}/analysis`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching details:', error);
      setLoading(false);
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!data) return <Container><Typography>APK not found</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        APK Analysis Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography><strong>Package:</strong> {data.apk?.package_name}</Typography>
              <Typography><strong>Version:</strong> {data.apk?.version_name}</Typography>
              <Typography><strong>Hash:</strong> {data.apk?.file_hash}</Typography>
              <Typography><strong>Size:</strong> {(data.apk?.size / 1024 / 1024).toFixed(2)} MB</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Certificate</Typography>
            {data.certificate && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2"><strong>Subject:</strong> {data.certificate.subject}</Typography>
                <Typography variant="body2"><strong>Issuer:</strong> {data.certificate.issuer}</Typography>
                <Typography variant="body2"><strong>Fingerprint:</strong> {data.certificate.fingerprint}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Network Artifacts</Typography>
            <Typography variant="body2" gutterBottom><strong>Domains ({data.domains?.length || 0}):</strong></Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {data.domains?.slice(0, 5).map((domain, i) => (
                <Chip key={i} label={domain} size="small" />
              ))}
            </Box>
            <Typography variant="body2" gutterBottom><strong>IPs ({data.ips?.length || 0}):</strong></Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.ips?.slice(0, 5).map((ip, i) => (
                <Chip key={i} label={ip} size="small" color="secondary" />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default APKDetails;
