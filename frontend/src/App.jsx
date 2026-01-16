import { useState } from 'react';
import { LayoutDashboard, FileText, Activity, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import RxAnalyzer from './components/RxAnalyzer';
import MedTracker from './components/MedTracker';
import './index.css';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analyzer', label: 'Rx Analyzer', icon: FileText },
        { id: 'tracker', label: 'Med Tracker', icon: Activity }
    ];

    return (
        <div className="app-background">
            <div style={{
                display: 'flex',
                minHeight: '100vh',
                padding: '1.5rem',
                gap: '1.5rem'
            }}>
                {/* Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="glass-card"
                            style={{
                                width: '280px',
                                padding: '2rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                height: 'fit-content',
                                position: 'sticky',
                                top: '1.5rem'
                            }}
                        >
                            {/* Logo */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'var(--gradient-primary)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Activity size={24} color="white" />
                                    </div>
                                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>MedAnalysis</h1>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', paddingLeft: '3rem' }}>
                                    AI-Powered Healthcare
                                </p>
                            </div>

                            {/* Navigation */}
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;

                                    return (
                                        <motion.button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            whileHover={{ x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.875rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                                                color: isActive ? 'white' : 'var(--text-secondary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                fontWeight: isActive ? '600' : '500',
                                                transition: 'all var(--transition-fast)',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <Icon size={20} />
                                            {tab.label}
                                        </motion.button>
                                    );
                                })}
                            </nav>

                            {/* Patient Info Card */}
                            <div style={{
                                marginTop: 'auto',
                                paddingTop: '2rem'
                            }}>
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Current Patient
                                    </p>
                                    <p style={{ fontWeight: '700', fontSize: '1rem' }}>
                                        Patient #1
                                    </p>
                                    <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    {/* Header */}
                    <motion.header
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-card"
                        style={{
                            padding: '1.25rem 1.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </motion.header>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'dashboard' && <Dashboard />}
                            {activeTab === 'analyzer' && <RxAnalyzer />}
                            {activeTab === 'tracker' && <MedTracker />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default App;
