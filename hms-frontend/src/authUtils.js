// Complete Auth Data Cleanup Utility
export const clearAllAuthData = () => {
  console.log('[AUTH_CLEAR] Starting complete auth data wipe...');

  // All possible auth keys
  const authKeys = [
    'authToken',
    'user',
    'userRole',
    'token',
    'role',
    'admin_logged_in',
    'patient_logged_in',
    'doctor_logged_in',
    'isAuthenticated',
    'userData',
    'userProfile',
    'login_token',
    'jwt_token',
    'session_token',
  ];

  // Clear localStorage
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`[AUTH_CLEAR] Removing localStorage.${key}`);
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  authKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      console.log(`[AUTH_CLEAR] Removing sessionStorage.${key}`);
      sessionStorage.removeItem(key);
    }
  });

  // Clear all localStorage just in case
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('auth') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('role') ||
        key.toLowerCase().includes('login')) {
      console.log(`[AUTH_CLEAR] Removing suspicious localStorage.${key}`);
      localStorage.removeItem(key);
    }
  });

  // Clear cookies (in case any auth cookies exist)
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
    if (name.toLowerCase().includes('auth') ||
        name.toLowerCase().includes('token') ||
        name.toLowerCase().includes('session')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      console.log(`[AUTH_CLEAR] Removed cookie: ${name}`);
    }
  });

  console.log('[AUTH_CLEAR] ✓ All auth data cleared successfully');
  return true;
};

// Verify all auth data is cleared
export const verifyAuthCleared = () => {
  const hasToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const hasRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const hasUser = localStorage.getItem('user') || sessionStorage.getItem('user');

  const isCleared = !hasToken && !hasRole && !hasUser;

  if (isCleared) {
    console.log('[AUTH_VERIFY] ✓ All auth data confirmed cleared');
  } else {
    console.warn('[AUTH_VERIFY] ⚠ Some auth data still present!');
    console.warn('  - Token:', hasToken ? 'EXISTS' : 'cleared');
    console.warn('  - Role:', hasRole ? 'EXISTS' : 'cleared');
    console.warn('  - User:', hasUser ? 'EXISTS' : 'cleared');
  }

  return isCleared;
};

// Check if user is authenticated
export const isUserAuthenticated = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  const isAuth = !!(user && token && userRole);

  if (isAuth) {
    try {
      const userData = JSON.parse(user);
      console.log('[AUTH_CHECK] ✓ User authenticated:', userData.username, '| Role:', userRole);
    } catch (e) {
      console.warn('[AUTH_CHECK] ⚠ User data corrupted');
      return false;
    }
  } else {
    console.log('[AUTH_CHECK] ✗ No authentication found');
  }

  return isAuth;
};

// Get current user authentication state
export const getCurrentUserAuth = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  return {
    isAuthenticated: !!(user && token && userRole),
    user: user ? JSON.parse(user) : null,
    token: token,
    role: userRole,
  };
};
