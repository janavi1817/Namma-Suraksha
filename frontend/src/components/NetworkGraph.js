import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function NetworkGraph() {
  const { id } = useParams();
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, [id]);

  const fetchGraphData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/graph/relationships/${id}`);
      
      // Transform data for react-force-graph
      const nodes = response.data.nodes.map(node => ({
        id: node.id,
        name: node.properties.name || node.properties.package_name || node.properties.address || node.id,
        label: node.label,
        ...node.properties
      }));

      const links = response.data.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type
      }));

      setGraphData({ nodes, links });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching graph:', error);
      setLoading(false);
    }
  };

  const getNodeColor = (node) => {
    switch (node.label) {
      case 'APK': return '#00bcd4';
      case 'Certificate': return '#ff5722';
      case 'Domain': return '#4caf50';
      case 'IP': return '#ff9800';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        APK Relationship Network
      </Typography>
      
      <Paper sx={{ p: 2, height: '80vh' }}>
        {graphData && (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.25}
            linkLabel="type"
            onNodeClick={(node) => {
              console.log('Clicked node:', node);
            }}
          />
        )}
      </Paper>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#00bcd4', borderRadius: '50%' }} />
          <Typography>APK</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#ff5722', borderRadius: '50%' }} />
          <Typography>Certificate</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#4caf50', borderRadius: '50%' }} />
          <Typography>Domain</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#ff9800', borderRadius: '50%' }} />
          <Typography>IP Address</Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default NetworkGraph;
