import { createRoot } from 'react-dom/client';
import '@sohumsuthar/liquid-glass/css/liquid-glass-core.css';
import './shared.css';
import './sohum-glass.css';
import './react-pages.css';
import MockupApp from './MockupApp.jsx';

createRoot(document.getElementById('root')).render(<MockupApp />);
