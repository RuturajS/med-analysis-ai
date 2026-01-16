import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2, XCircle, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function Dashboard({ patientId = 1 }) {
    const [medications, setMedications] = useState([]);
    const [compliance, setCompliance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [patientId]);

    const fetchDashboardData = async () => {
        try {
            const [medsResponse, complianceResponse] = await Promise.all([
                axios.get(`${API_URL}/medications/${patientId}/active`),
                axios.get(`${API_URL}/compliance/${patientId}`)
            ]);

            setMedications(medsResponse.data.medications || []);
            setCompliance(complianceResponse.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                Active Medications
                            </p>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>
                                {compliance?.total_medications || 0}
                            </h3>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--gradient-primary)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Activity size={24} color="white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                    style={{ padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                Doses Taken
                            </p>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>
                                {compliance?.taken_count || 0}
                            </h3>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--gradient-success)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle2 size={24} color="white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                    style={{ padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                Compliance Rate
                            </p>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: getComplianceColor(compliance?.compliance_rate) }}>
                                {compliance?.compliance_rate || 0}%
                            </h3>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: `linear-gradient(135deg, ${getComplianceColor(compliance?.compliance_rate)} 0%, ${getComplianceColor(compliance?.compliance_rate)}CC 100%)`,
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUp size={24} color="white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                Missed Doses
                            </p>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--danger)' }}>
                                {compliance?.missed_count || 0}
                            </h3>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--gradient-danger)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <XCircle size={24} color="white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Active Medications List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card"
                style={{ padding: '2rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Calendar size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Active Medications</h2>
                </div>

                {medications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                        <Activity size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No active medications found. Upload a prescription to get started.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {medications.map((med, idx) => (
                            <motion.div
                                key={med.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    padding: '1.25rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all var(--transition-fast)'
                                }}
                                whileHover={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.15)'
                                }}
                            >
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                        {med.drug_name}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {med.dosage && <span className="badge badge-info">{med.dosage}</span>}
                                        {med.frequency && <span className="badge badge-success">{med.frequency}</span>}
                                        {med.duration && <span className="badge badge-warning">{med.duration}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <Clock size={16} />
                                    <span>{new Date(med.prescription_date).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function getComplianceColor(rate) {
    if (!rate) return 'var(--text-muted)';
    if (rate >= 80) return '#10b981';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
}

export default Dashboard;
