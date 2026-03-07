import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    username: string;
    password: string;
    fullName: string;
    role: string;
}

// Static credentials for 4 users
const STATIC_USERS: User[] = [
    {
        username: 'user1',
        password: 'password1',
        fullName: 'John Smith',
        role: 'Admin'
    },
    {
        username: 'user2',
        password: 'password2',
        fullName: 'Sarah Johnson',
        role: 'Manager'
    },
    {
        username: 'user3',
        password: 'password3',
        fullName: 'Michael Brown',
        role: 'Trader'
    },
    {
        username: 'user4',
        password: 'password4',
        fullName: 'Emily Davis',
        role: 'Analyst'
    }
];

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    isLoading: boolean;
    username: string | null;
    fullName: string | null;
    role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Check if user is already logged in (from localStorage)
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUsername = localStorage.getItem('username');
        const storedFullName = localStorage.getItem('fullName');
        const storedRole = localStorage.getItem('role');
        if (token && storedUsername) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
            setFullName(storedFullName);
            setRole(storedRole);
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, password: string): boolean => {
        // Find user in static credentials
        const user = STATIC_USERS.find(
            u => u.username === email && u.password === password
        );
        
        if (user) {
            const mockToken = 'mock-jwt-token-' + Date.now();
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('username', user.username);
            localStorage.setItem('fullName', user.fullName);
            localStorage.setItem('role', user.role);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            setIsAuthenticated(true);
            setUsername(user.username);
            setFullName(user.fullName);
            setRole(user.role);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('role');
        localStorage.removeItem('loginTime');
        setIsAuthenticated(false);
        setUsername(null);
        setFullName(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, username, fullName, role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export users for reference
export { STATIC_USERS };
