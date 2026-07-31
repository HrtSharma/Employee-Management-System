import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { employeesData, recognitionData, surveyData, activityData, announcementData } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children, mode, setMode }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('engagement-auth');
    return stored ? JSON.parse(stored) : { isAuthenticated: false, user: null };
  });

  const [themeMode, setThemeMode] = useState(mode);
  const [employees, setEmployees] = useState(employeesData);
  const [recognitions, setRecognitions] = useState(recognitionData);
  const [surveys, setSurveys] = useState(surveyData);
  const [activities, setActivities] = useState(activityData);
  const [announcements, setAnnouncements] = useState(announcementData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setEmployees(employeesData);
      setRecognitions(recognitionData);
      setSurveys(surveyData);
      setActivities(activityData);
      setAnnouncements(announcementData);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('engagement-auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem('engagement-theme', themeMode);
  }, [themeMode]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.get('https://jsonplaceholder.typicode.com/users/1');
      const user = { id: response.data.id, name: response.data.name, email, role: 'HR Lead' };
      setAuth({ isAuthenticated: true, user });
      return { success: true, user };
    } catch {
      setAuth({ isAuthenticated: false, user: null });
      return { success: false, message: 'Unable to sign in with mock credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setAuth({ isAuthenticated: true, user: { ...payload, role: payload.department } });
    return { success: true };
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, user: null });
  };

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    setMode(next);
  };

  const value = useMemo(
    () => ({
      auth,
      setAuth,
      login,
      signup,
      logout,
      themeMode,
      toggleTheme,
      employees,
      recognitions,
      surveys,
      activities,
      announcements,
      loading,
    }),
    [auth, themeMode, employees, recognitions, surveys, activities, announcements, loading, mode]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
