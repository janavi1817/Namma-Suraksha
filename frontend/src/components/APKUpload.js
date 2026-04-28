import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Box, Alert, CircularProgress, Chip, TextField, MenuItem, LinearProgress } from '@mui/material';
import { CloudUpload, FileUp, Shield } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function APKUpload({ officer }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [caseNumber, setCaseNumber] = useState('');
  const [complainant, setComplainant] = useState('');
  const [district, setDistrict] = useState(officer?.district || 'Bengaluru');
  const navigate = useNavigate();

  const districts = [
    'Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 
    'Kalaburagi', 'Davangere', 'Ballari'
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.apk')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid APK file');
    }
  };

  const handleUpload = async () => {
    if (!file || !caseNumber || !complainant) {
      setError('Please fill all required fields');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_number', caseNumber);
    formData.append('complainant', complainant);
    formData.append('district', district);
    formData.append('officer_id', officer?.id || 'unknown');

    try {
      const response = await axios.post(`${API_URL}/api/apk/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
      setUploading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
      setUploading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, bgcolor: '#1a1f2e', borderColor: '#2d3748', border: '1px solid' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Shield size={32} style={{ color: '#0dcaf0' }} />
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase',
                color: '#e2e8f0'
              }}
            >
              Upload APK for Analysis
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Karnataka CB/CID — Case Registration & Analysis
            </Typography>
          </Box>
        </Box>

        {/* Case Information */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.875rem',
              color: '#0dcaf0'
            }}
          >
            CASE INFORMATION
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Case Number"
              variant="outlined"
              fullWidth
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="CB/CID/2026/..."
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: '"JetBrains Mono", monospace',
                },
              }}
            />
            
            <TextField
              label="Complainant Name"
              variant="outlined"
              fullWidth
              value={complainant}
              onChange={(e) => setComplainant(e.target.value)}
              placeholder="Enter complainant name"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: '"Inter", sans-serif',
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
          </Box>
        </Box>

        {/* APK Upload */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.875rem',
              color: '#0dcaf0'
            }}
          >
            APK FILE
          </Typography>
          
          <input
            accept=".apk"
            style={{ display: 'none' }}
            id="apk-file-input"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="apk-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FileUp size={20} />}
              fullWidth
              size="large"
              sx={{
                py: 2,
                borderColor: '#2d3748',
                color: '#e2e8f0',
                '&:hover': {
                  borderColor: '#0dcaf0',
                  bgcolor: 'rgba(13, 202, 240, 0.05)'
                }
              }}
            >
              Select APK File
            </Button>
          </label>
        </Box>

        {file && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(13, 202, 240, 0.1)',
              borderColor: '#0dcaf0',
              border: '1px solid'
            }}
          >
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(255, 51, 51, 0.1)',
              borderColor: '#ff3333',
              border: '1px solid'
            }}
          >
            {error}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1,
                fontFamily: '"JetBrains Mono", monospace',
                color: '#0dcaf0'
              }}
            >
              Analyzing APK... Please wait
            </Typography>
            <LinearProgress 
              sx={{
                bgcolor: '#2d3748',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#0dcaf0'
                }
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                ✓ Extracting metadata...
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                ✓ Analyzing permissions...
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                ⟳ Running fraud detection...
              </Typography>
            </Box>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || !caseNumber || !complainant || uploading}
          fullWidth
          size="large"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload size={20} />}
          sx={{
            py: 1.5,
            bgcolor: '#0dcaf0',
            color: '#0f1419',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#0aa2c0'
            },
            '&:disabled': {
              bgcolor: '#2d3748',
              color: '#64748b'
            }
          }}
        >
          {uploading ? 'Analyzing...' : 'Start Analysis'}
        </Button>

        {result && (
          <Box sx={{ mt: 4 }}>
            <Alert severity={result.is_fraudulent ? 'error' : 'success'} sx={{ mb: 2 }}>
              <Typography variant="h6">
                Fraud Score: {(result.fraud_score * 100).toFixed(1)}%
              </Typography>
              <Typography>
                Status: {result.is_fraudulent ? 'FRAUDULENT' : 'CLEAN'}
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Fraud Indicators ({result.indicators.length})
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {result.indicators.map((indicator, index) => (
                <Paper key={index} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {indicator.description}
                    </Typography>
                    <Chip 
                      label={indicator.severity.toUpperCase()} 
                      color={getSeverityColor(indicator.severity)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Type: {indicator.type}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/apk/${result.id}`)}
                fullWidth
                sx={{
                  borderColor: '#2d3748',
                  color: '#e2e8f0',
                  '&:hover': {
                    borderColor: '#0dcaf0',
                    bgcolor: 'rgba(13, 202, 240, 0.05)'
                  }
                }}
              >
                View Details
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/graph/${result.id}`)}
                fullWidth
                sx={{
                  borderColor: '#2d3748',
                  color: '#e2e8f0',
                  '&:hover': {
                    borderColor: '#0dcaf0',
                    bgcolor: 'rgba(13, 202, 240, 0.05)'
                  }
                }}
              >
                View Network Graph
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/report/${result.id}`)}
                fullWidth
                sx={{
                  bgcolor: '#0dcaf0',
                  color: '#0f1419',
                  '&:hover': {
                    bgcolor: '#0aa2c0'
                  }
                }}
              >
                AI Report
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default APKUpload;
