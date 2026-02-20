import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { User, UserRole } from '../types';

const USER_KEY = 'saakshy_user';

// --- Auth State Management (Observer Pattern) ---
type AuthListener = (user: User | null) => void;
const listeners: AuthListener[] = [];

export const subscribeToAuth = (listener: AuthListener) => {
    listeners.push(listener);
    // Immediate check if we already have a user in memory/storage
    const cached = getSessionUser();
    if (cached) listener(cached);

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

// Sync Firebase Auth state with our app state
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser && firebaseUser.emailVerified) {
        const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            emailVerified: firebaseUser.emailVerified,
            mobile: firebaseUser.phoneNumber || '',
            role: UserRole.OWNER, // Default role
            createdAt: Date.now()
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        notifyListeners(user);
    } else {
        localStorage.removeItem(USER_KEY);
        notifyListeners(null);
    }
});

// --- Public Auth API ---

export const register = async (
  name: string,
  mobile: string,
  email: string,
  password: string
): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update display name
        await updateProfile(firebaseUser, { displayName: name });

        // Send verification email
        await sendEmailVerification(firebaseUser);

        // Sign out immediately so they can't access the app until verified
        await signOut(auth);

        const newUser: User = {
            id: firebaseUser.uid,
            name,
            mobile,
            email,
            emailVerified: false,
            role: UserRole.OWNER,
            createdAt: Date.now()
        };

        // Do NOT set session or notify listeners
        return newUser;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("User already exists. Please sign in");
        }
        throw new Error(error.message || "Registration Failed");
    }
};

export const login = async (identifier: string, password: string): Promise<User> => {
    try {
        // Identifier is assumed to be email for Firebase Password Auth
        const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
        const firebaseUser = userCredential.user;

        if (!firebaseUser.emailVerified) {
            await signOut(auth);
            throw new Error("Email not verified");
        }

        const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            emailVerified: firebaseUser.emailVerified,
            mobile: firebaseUser.phoneNumber || '',
            role: UserRole.OWNER,
            createdAt: Date.now()
        };

        localStorage.setItem(USER_KEY, JSON.stringify(user));
        notifyListeners(user);
        return user;
    } catch (error: any) {
        if (error.message === "Email not verified") {
            throw error;
        }
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
            throw new Error("Email or password is incorrect");
        }
        throw new Error("Email or password is incorrect");
    }
};

// --- OTP Services (Mock) ---

export const sendOtp = async (mobile: string): Promise<string | undefined> => {
    return "123456";
};

export const loginWithOtp = async (mobile: string, otp: string): Promise<User> => {
    if (otp !== "123456") throw new Error("Invalid OTP");
    throw new Error("Phone Auth not fully implemented in this demo. Please use Email/Password.");
};

export const loginWithGoogle = async (credential?: string): Promise<User> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            mobile: firebaseUser.phoneNumber || '',
            role: UserRole.OWNER,
            createdAt: Date.now()
        };

        localStorage.setItem(USER_KEY, JSON.stringify(user));
        notifyListeners(user);
        return user;
    } catch (error: any) {
        console.error("Google Auth Error:", error);
        if (error.code === 'auth/unauthorized-domain') {
            throw new Error(`Domain not authorized: ${window.location.hostname}`);
        }
        throw new Error(error.message || "Google Login Failed");
    }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
    // No-op for now as we are not using Firestore
    const currentUser = getSessionUser();
    if (!currentUser) throw new Error("No user session");
    
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    notifyListeners(updatedUser);
    return updatedUser;
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

export const logout = async () => {
  await signOut(auth);
  localStorage.removeItem(USER_KEY);
  notifyListeners(null);
  // Redirect handled by app state change
};
