import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function RxAnalyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/prescriptions/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rx-analyzer">
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-4 mb-4">
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'var(--gradient-primary)', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              Prescription Analysis
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Upload a prescription image for AI-powered digitization
            </p>
          </div>
        </div>

        {!preview ? (
          <div
            className={`upload-area ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Camera size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Drop prescription image here
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              or click to browse (PNG, JPG, JPEG)
            </p>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '1.5rem' }}
          >
            <div style={{ 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden', 
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <img 
                src={preview} 
                alt="Prescription preview" 
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#000' }}
              />
            </div>

            <div className="flex gap-4">
              <button 
                className="btn btn-primary" 
                onClick={handleAnalyze}
                disabled={loading}
                style={{ flex: 1, position: 'relative' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Analyze Prescription
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => { setPreview(null); setFile(null); setResult(null); }}
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: '2rem' }}
            >
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '1.5rem', 
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} color="var(--success)" />
                  Analysis Results
                </h3>

                {/* Extracted Text */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Extracted Text:
                  </h4>
                  <div style={{ 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {result.raw_text || 'No text extracted'}
                  </div>
                </div>

                {/* Medications */}
                {result.drugs && result.drugs.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Detected Medications:
                    </h4>
                    <div className="flex flex-col gap-4">
                      {result.drugs.map((drug, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            padding: '1rem', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                              <h5 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                {drug.drug_name}
                              </h5>
                              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {drug.dosage && (
                                  <span className="badge badge-info">
                                    Dosage: {drug.dosage}
                                  </span>
                                )}
                                {drug.frequency && (
                                  <span className="badge badge-success">
                                    {drug.frequency}
                                  </span>
                                )}
                                {drug.duration && (
                                  <span className="badge badge-warning">
                                    Duration: {drug.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {result.alerts && result.alerts.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Alerts & Warnings:
                    </h4>
                    <div className="flex flex-col gap-4">
                      {result.alerts.map((alert, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            padding: '0.875rem', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <AlertCircle size={18} color="var(--danger)" />
                          <span style={{ fontSize: '0.9rem' }}>{alert}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default RxAnalyzer;
