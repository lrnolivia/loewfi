import { createRoot } from 'react-dom/client';
import '@sohumsuthar/liquid-glass/css/liquid-glass-core.css';
import HybridApp from './HybridApp.jsx';
import './hybrid.css';

createRoot(document.getElementById('hybrid-root')).render(<HybridApp />);
