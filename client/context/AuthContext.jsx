import {createContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom' ;
import axios from 'axios' ;
import toast from 'react-hot-toast';


// 1-backend 
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl ;


// 2-declare AuthContext
export const AuthContext = createContext();

// 3-declare AuthProvider 
// export const AuthProvider = ({children}) => {
export const AuthProvider = (props) => { 

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    //const [user, setUser] = useState(null);
    const [user, setUser] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true); // Add loading state
    const navigate = useNavigate();
   
    //fetch, login and logout Authentication 
    // Function to check if user logged in or not
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, redirecting to login');
                // useNavigate('/');
                setLoading(false);
                return;
            }
           
            // ✅ Ensure token is set in headers
            axios.defaults.headers.common["token"] = token;

            const { data } = await axios.get('/v1/api/auth/data');

            if (data.success) {
                setUser(data.user);
                setAuthUser(data.user); // Also set authUser for consistency
                setIsAdmin(data.user.role === 'admin');
                console.log("User fetched successfully:", data.user);
            } else {
                console.log("Failed to fetch user:", data.message);
                // Clear invalid token
                localStorage.removeItem('token');
                delete axios.defaults.headers.common["token"];
                // navigate('/');
                setToken(null);  // add this one  
            }
      
        } catch (error) {
            console.error("Error fetching user:", error);

            // Handle specific error cases
            if (error.response?.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                delete axios.defaults.headers.common["token"];
                setToken(null);
                toast.error("Session expired. Please login again.");
            } else {
                toast.error(error.response?.data?.message || error.message);
            }
        } finally {
            setLoading(false); // Always set loading to false
        }
    };


    
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/v1/api/auth/${state}`, credentials);
            
            if (data.success) {
                setAuthUser(data.userData);
                setUser(data.userData); // Also set user
                axios.defaults.headers.common["token"] = data.token;

                
                setToken(data.token);
                localStorage.setItem("token", data.token);
                navigate('/ar');
                
                // Store user data in localStorage for persistence
                if (data.userData) {
                    localStorage.setItem("user", JSON.stringify(data.userData));
                }
                
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
            
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // logout function
    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // Also remove user data
        setToken(null);
        setAuthUser(null);
        setUser(null);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
        
        // Only disconnect socket if it exists
        if (socket) {
            socket.disconnect();
        }
    };


        useEffect(() => {
        // Check if we have a token but no user data (page refresh)
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            try {
                // Immediately set user from localStorage while fetching fresh data
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setAuthUser(userData);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('user');
            }
        }
        
        // Always fetch fresh user data
        fetchUser();
    }, []);

    const value = {
        token,
        axios,
        authUser,
        login,
        logout,
        user, 
        setUser, 
        fetchUser,
        loading, // Export loading state
        isAdmin, setIsAdmin,
    }

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

      return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
}