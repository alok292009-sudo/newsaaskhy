
import { User } from '../types';

// Robust API URL generation
const getBaseUrl = () => {
    const { hostname, protocol } = window.location;
    if (!hostname || protocol === 'blob:' || protocol === 'file:') {
        return 'http://localhost:5000/api/auth';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api/auth';
    }
    return `http://${hostname}:5000/api/auth`;
};

const API_URL = getBaseUrl();
const TOKEN_KEY = 'saakshy_token';
const USER_KEY = 'saakshy_user';

// --- Auth State Management (Observer Pattern) ---
type AuthListener = (user: User | null) => void;
const listeners: AuthListener[] = [];

export const subscribeToAuth = (listener: AuthListener) => {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
};

const notifyListeners = (user: User | null) => {
    listeners.forEach(listener => listener(user));
};

// --- Helper: Auth Headers ---
const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
    };
};

// --- Public Auth API ---

export const register = async (
  name: string,
  mobile: string,
  email: string,
  password: string
): Promise<User> => {
    try {
        const payload = { 
            name, 
            mobile, 
            password,
            email: email && email.trim() !== '' ? email.trim() : undefined 
        };

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Registration failed');

        localStorage.setItem(TOKEN_KEY, data.token);
        const user = { ...data.user, id: data.user._id || data.user.id }; 
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        notifyListeners(user); // Notify App
        return user;
    } catch (error: any) {
        console.error("Auth Error:", error);
        if (error.name === 'TypeError' && error.message && error.message.includes('Failed to fetch')) {
             throw new Error("Cannot connect to server. Please check if the backend is running on port 5000.");
        }
        throw new Error(error.message || "Authentication Failed");
    }
};

export const login = async (identifier: string, password: string): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Login failed');

        localStorage.setItem(TOKEN_KEY, data.token);
        const user = { ...data.user, id: data.user._id || data.user.id };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        notifyListeners(user); // Notify App
        return user;
    } catch (error: any) {
        console.error("Auth Error:", error);
        if (error.name === 'TypeError' && error.message && error.message.includes('Failed to fetch')) {
             throw new Error("Cannot connect to server. Please check if the backend is running on port 5000.");
        }
        throw new Error(error.message || "Login Failed");
    }
};

// --- OTP Services ---

export const sendOtp = async (mobile: string): Promise<string | undefined> => {
    try {
        const response = await fetch(`${API_URL}/send-otp`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ mobile })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Failed to send OTP');
        
        // Return the mock OTP if provided by the backend (for dev environments)
        return data.otp;
    } catch (error: any) {
        throw new Error(error.message || "OTP Service Error");
    }
};

export const loginWithOtp = async (mobile: string, otp: string): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/login-otp`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ mobile, otp })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'OTP Login failed');

        localStorage.setItem(TOKEN_KEY, data.token);
        const user = { ...data.user, id: data.user._id || data.user.id };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        notifyListeners(user); // Notify App
        return user;
    } catch (error: any) {
        throw new Error(error.message || "OTP Login Failed");
    }
};

export const loginWithGoogle = async (credential: string): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Google Login failed');

        localStorage.setItem(TOKEN_KEY, data.token);
        const user = { ...data.user, id: data.user._id || data.user.id };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        notifyListeners(user); // Notify App
        return user;
    } catch (error: any) {
        console.error("Google Auth Error:", error);
        if (error.name === 'TypeError' && error.message && error.message.includes('Failed to fetch')) {
             throw new Error("Cannot connect to server.");
        }
        throw new Error(error.message || "Google Login Failed");
    }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Update failed');

        const updatedUser = { ...data, id: data._id || data.id };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        
        notifyListeners(updatedUser); // Notify App
        return updatedUser;
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        throw new Error(error.message || "Update Failed");
    }
};

// --- Session Management ---

export const getSessionUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
      return null;
  }
};

// Special function for Offline/Demo mode to inject user and notify app
export const setOfflineSession = (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, 'offline-demo-token');
    notifyListeners(user);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyListeners(null); // Notify App to clear user state
  window.location.hash = '#/'; // Navigate to home
};
