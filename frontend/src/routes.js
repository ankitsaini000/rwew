// Import Facebook authentication components
import FacebookAuthCallback from './components/auth/FacebookAuthCallback';

const routes = [
  // Facebook authentication routes
  {
    path: '/auth/facebook/success',
    element: <FacebookAuthCallback />
  },
]; 