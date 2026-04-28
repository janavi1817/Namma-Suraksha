import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Grid, Card, CardContent, Chip } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function FraudClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clusters`);
      setClusters(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clusters:', error);
      setLoading(false);
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Fraud Clusters
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Related APKs grouped by common fraud patterns
      </Typography>

      <Grid container spacing={3}>
        {clusters.map((cluster) => (
          <Grid item xs={12} key={cluster.cluster_id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Cluster #{cluster.cluster_id}
                  </Typography>
                  <Chip 
                    label={`Fraud Score: ${(cluster.fraud_score * 100).toFixed(0)}%`}
                    color={cluster.fraud_score > 0.7 ? 'error' : 'warning'}
                  />
                </Box>

                <Typography variant="body2" gutterBottom>
                  <strong>Size:</strong> {cluster.size} APKs
                </Typography>

                <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                  <strong>Common Features:</strong>
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {cluster.common_features.certificate && (
                    <Typography variant="body2">• Certificate: {cluster.common_features.certificate}</Typography>
                  )}
                  {cluster.common_features.domains && (
                    <Typography variant="body2">• Domains: {cluster.common_features.domains.join(', ')}</Typography>
                  )}
                  {cluster.common_features.permissions && (
                    <Typography variant="body2">• Permissions: {cluster.common_features.permissions.join(', ')}</Typography>
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom><strong>APK IDs:</strong></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {cluster.apk_ids.map((apkId) => (
                      <Chip 
                        key={apkId} 
                        label={apkId.substring(0, 8)} 
                        size="small"
                        onClick={() => window.location.href = `/apk/${apkId}`}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default FraudClusters;
