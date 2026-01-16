import { useState } from 'react';
import { Pill, CheckCircle, XCircle, Clock, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function MedTracker() {
    const [medicationId, setMedicationId] = useState('');
    const [status, setStatus] = useState('taken');
    const [verificationMethod, setVerificationMethod] = useState('manual');
    const [logs, setLogs] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleLogIntake = async () => {
        if (!medicationId) {
            alert('Please enter medication ID');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/intake/log`, {
                medication_id: parseInt(medicationId),
                status: status,
                verification_method: verificationMethod
            });

            setLogs([response.data, ...logs]);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            setMedicationId('');
        } catch (error) {
            console.error('Error logging intake:', error);
            alert('Error logging medication intake. Please check medication ID.');
        }
    };

    return (
        <div className="med-tracker">
            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--gradient-success)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Pill size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            Medication Tracker
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Log medication intake and track compliance
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        <CheckCircle size={20} color="var(--success)" />
                        <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                            Medication intake logged successfully!
                        </span>
                    </motion.div>
                )}

                {/* Input Form */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '2rem'
                }}>
                    <div className="input-group">
                        <label className="input-label">Medication ID</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="Enter medication ID or scan barcode"
                            value={medicationId}
                            onChange={(e) => setMedicationId(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Status</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            <button
                                className={`btn ${status === 'taken' ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => setStatus('taken')}
                                style={{ width: '100%' }}
                            >
                                <CheckCircle size={16} />
                                Taken
                            </button>
                            <button
                                className={`btn ${status === 'missed' ? 'btn-danger' : 'btn-outline'}`}
                                onClick={() => setStatus('missed')}
                                style={{ width: '100%' }}
                            >
                                <XCircle size={16} />
                                Missed
                            </button>
                            <button
                                className={`btn ${status === 'skipped' ? 'btn-outline' : 'btn-outline'}`}
                                onClick={() => setStatus('skipped')}
                                style={{ width: '100%' }}
                            >
                                <Clock size={16} />
                                Skipped
                            </button>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Verification Method</label>
                        <select
                            className="input-field"
                            value={verificationMethod}
                            onChange={(e) => setVerificationMethod(e.target.value)}
                        >
                            <option value="manual">Manual Entry</option>
                            <option value="barcode">Barcode Scan</option>
                            <option value="qr">QR Code Scan</option>
                        </select>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleLogIntake}
                        style={{ width: '100%', marginTop: '1.5rem' }}
                    >
                        <Scan size={18} />
                        Log Medication Intake
                    </button>
                </div>

                {/* Recent Logs */}
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
                        Recent Activity
                    </h3>

                    {logs.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <Clock size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                            <p>No recent activity. Log your first medication intake above.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${getStatusBorderColor(log.status)}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {getStatusIcon(log.status)}
                                        <div>
                                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                Medication #{log.medication_id}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {log.verification_method} • {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`badge badge-${getStatusBadge(log.status)}`}>
                                        {log.status}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getStatusIcon(status) {
    const iconProps = { size: 20 };
    switch (status) {
        case 'taken':
            return <CheckCircle {...iconProps} color="var(--success)" />;
        case 'missed':
            return <XCircle {...iconProps} color="var(--danger)" />;
        case 'skipped':
            return <Clock {...iconProps} color="var(--warning)" />;
        default:
            return <Clock {...iconProps} color="var(--text-muted)" />;
    }
}

function getStatusBorderColor(status) {
    switch (status) {
        case 'taken':
            return 'rgba(16, 185, 129, 0.3)';
        case 'missed':
            return 'rgba(239, 68, 68, 0.3)';
        case 'skipped':
            return 'rgba(245, 158, 11, 0.3)';
        default:
            return 'rgba(255, 255, 255, 0.1)';
    }
}

function getStatusBadge(status) {
    switch (status) {
        case 'taken':
            return 'success';
        case 'missed':
            return 'danger';
        case 'skipped':
            return 'warning';
        default:
            return 'info';
    }
}

export default MedTracker;
