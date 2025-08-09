import React, {createContext, useContext, useReducer, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'SET_USER'; payload: User | null}
  | {type: 'LOGOUT'};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, isLoading: action.payload};
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({type: 'SET_USER', payload: user});
      } else {
        dispatch({type: 'SET_LOADING', payload: false});
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({type: 'SET_LOADING', payload: true});
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        const user = {
          id: userData._id,
          email: userData.email,
          name: userData.name,
        };
        
        await AsyncStorage.setItem('authToken', userData.token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        dispatch({type: 'SET_USER', payload: user});
        return true;
      } else {
        dispatch({type: 'SET_LOADING', payload: false});
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({type: 'SET_LOADING', payload: false});
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    dispatch({type: 'SET_LOADING', payload: true});
    
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name: name || 'User',
      });

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        const user = {
          id: userData._id,
          email: userData.email,
          name: userData.name,
        };
        
        await AsyncStorage.setItem('authToken', userData.token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        dispatch({type: 'SET_USER', payload: user});
        return true;
      } else {
        dispatch({type: 'SET_LOADING', payload: false});
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      dispatch({type: 'SET_LOADING', payload: false});
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    dispatch({type: 'LOGOUT'});
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};