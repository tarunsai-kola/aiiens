import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

// ── Storage Keys ──────────────────────────────────────────────────────────────
const KEYS = {
  accessToken:  'hms_access_token',
  refreshToken: 'hms_refresh_token',
  hospitalId:   'hms_hospital_id',
  user:         'hms_user',
};

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  user:            JSON.parse(localStorage.getItem(KEYS.user) || 'null'),
  accessToken:     localStorage.getItem(KEYS.accessToken) || null,
  refreshToken:    localStorage.getItem(KEYS.refreshToken) || null,
  hospitalId:      localStorage.getItem(KEYS.hospitalId)   || null,
  isAuthenticated: false,
  isInitialized:   false,
  isLoading:       true,
  error:           null,
};

// ── Action Types ──────────────────────────────────────────────────────────────
const A = {
  LOADING:       'LOADING',
  AUTH_SUCCESS:  'AUTH_SUCCESS',
  LOGOUT:        'LOGOUT',
  SET_USER:      'SET_USER',
  SET_ERROR:     'SET_ERROR',
  CLEAR_ERROR:   'CLEAR_ERROR',
  INIT_COMPLETE: 'INIT_COMPLETE',
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, { type, payload }) {
  switch (type) {
    case A.LOADING:
      return { ...state, isLoading: payload };

    case A.AUTH_SUCCESS:
      return {
        ...state,
        user:            payload.user,
        accessToken:     payload.accessToken,
        refreshToken:    payload.refreshToken,
        hospitalId:      payload.user?.hospitalId || payload.hospitalId || state.hospitalId,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      };

    case A.SET_USER:
      return {
        ...state,
        user:            payload,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      };

    case A.LOGOUT:
      return {
        ...state,
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        hospitalId:      null,
        isAuthenticated: false,
        isLoading:       false,
        error:           null,
      };

    case A.INIT_COMPLETE:
      return { ...state, isInitialized: true, isLoading: false };

    case A.SET_ERROR:
      return { ...state, error: payload, isLoading: false };

    case A.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Sync Persist Helpers ──────────────────────────────────────────────────
  const persistAuth = (payload) => {
    if (!payload) return;
    const { user, accessToken, refreshToken } = payload;
    const hospitalId = user?.hospitalId || payload.hospitalId || '';
    
    if (accessToken)  localStorage.setItem(KEYS.accessToken, accessToken);
    if (refreshToken) localStorage.setItem(KEYS.refreshToken, refreshToken);
    if (hospitalId)   localStorage.setItem(KEYS.hospitalId, hospitalId);
    if (user)         localStorage.setItem(KEYS.user, JSON.stringify(user));
  };

  const clearAuth = () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  };

  // ── Bootstrap: verify token on mount ─────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem(KEYS.accessToken);
      if (!token) {
        dispatch({ type: A.INIT_COMPLETE });
        return;
      }
      try {
        const res = await authApi.getMe();
        const user = res.data.data;
        localStorage.setItem(KEYS.user, JSON.stringify(user));
        dispatch({ type: A.SET_USER, payload: user });
      } catch {
        // Token invalid — clear silently
        clearAuth();
        dispatch({ type: A.LOGOUT });
      } finally {
        dispatch({ type: A.INIT_COMPLETE });
      }
    };
    bootstrap();
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(async (credentials) => {
    dispatch({ type: A.LOADING, payload: true });
    try {
      const res = await authApi.login(credentials);
      const payload = res.data.data; // { user, accessToken, refreshToken }
      persistAuth(payload);
      dispatch({ type: A.AUTH_SUCCESS, payload });
      return payload;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      dispatch({ type: A.SET_ERROR, payload: msg });
      throw err;
    }
  }, []);

  const registerHospital = useCallback(async (formData) => {
    dispatch({ type: A.LOADING, payload: true });
    try {
      const res = await authApi.registerHospital(formData);
      const payload = res.data.data; // { user, accessToken, refreshToken }
      persistAuth(payload);
      dispatch({ type: A.AUTH_SUCCESS, payload });
      return payload;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      dispatch({ type: A.SET_ERROR, payload: msg });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* silent */ }
    clearAuth();
    dispatch({ type: A.LOGOUT });
  }, []);

  const forgotPassword = useCallback(async (data) => {
    return authApi.forgotPassword(data);
  }, []);

  const resetPassword = useCallback(async (token, data, hospitalId) => {
    return authApi.resetPassword(token, data, hospitalId);
  }, []);

  const changePassword = useCallback(async (data) => {
    return authApi.changePassword(data);
  }, []);

  const inviteStaff = useCallback(async (data) => {
    return authApi.inviteStaff(data);
  }, []);

  const acceptInvite = useCallback(async (token, data, hospitalId) => {
    const res = await authApi.acceptInvite(token, data, hospitalId);
    persistAuth(res.data);
    dispatch({ type: A.AUTH_SUCCESS, payload: res.data });
    return res.data;
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: A.CLEAR_ERROR });
  }, []);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const hasPermission = useCallback((slug) => {
    return state.user?.permissions?.includes(slug) ?? false;
  }, [state.user]);

  const hasRole = useCallback((role) => {
    if (Array.isArray(role)) return role.includes(state.user?.role);
    return state.user?.role === role;
  }, [state.user]);

  const value = {
    ...state,
    login,
    logout,
    registerHospital,
    forgotPassword,
    resetPassword,
    changePassword,
    inviteStaff,
    acceptInvite,
    clearError,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
