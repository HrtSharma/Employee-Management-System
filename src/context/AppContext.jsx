import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { recognitionData, surveyData, activityData, announcementData } from '../data/mockData';
import { db } from '../data/inMemoryDB';
import { payrollDB } from '../data/payrollDB';

const AppContext = createContext(null);

export function AppProvider({ children, mode, setMode }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('engagement-auth');
    return stored ? JSON.parse(stored) : { isAuthenticated: false, user: null };
  });

  const [themeMode, setThemeMode] = useState(mode);
  const [employees, setEmployees] = useState([]);
  const [recognitions, setRecognitions] = useState(recognitionData);
  const [surveys, setSurveys] = useState(surveyData);
  const [activities, setActivities] = useState(() => {
    // Persist activities to localStorage so CRUD edits survive refreshes
    try {
      const stored = localStorage.getItem('engagement-activities');
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
    return activityData;
  });
  const [announcements, setAnnouncements] = useState(announcementData);
  const [loading, setLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);

  // Load employees from in-memory DB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const employeeList = await db.getEmployees();
        setEmployees(employeeList);
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
      // Detect admin login via email
      const isAdminLogin = email.toLowerCase().includes('admin');
      const role = isAdminLogin ? 'Admin' : 'HR Lead';
      const user = { id: response.data.id, name: response.data.name, email, role };

      // Restore the profile photo persisted in the in-memory DB (if any)
      try {
        const storedPhoto = await db.getProfilePhoto(email);
        if (storedPhoto) user.photo = storedPhoto;
        const allEmployees = await db.getEmployees();
        const linkedEmployee = allEmployees.find((emp) => emp.email?.toLowerCase() === email.toLowerCase());
        if (linkedEmployee?.photo) user.photo = linkedEmployee.photo;
      } catch {
        // Non-critical: sign-in should still succeed even if photo restore fails
      }

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

  // ===== CRUD Operations for Employees =====

  // CREATE
  const addEmployee = async (employeeData) => {
    setCrudLoading(true);
    try {
      const newEmployee = await db.createEmployee(employeeData);
      // Auto-create a default salary structure for the new employee
      await payrollDB.createDefaultSalaryStructure(newEmployee.id, newEmployee);
      setEmployees((prev) => [...prev, newEmployee]);
      return { success: true, employee: newEmployee };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setCrudLoading(false);
    }
  };

  // READ (already loaded via useEffect, but expose refresh)
  const refreshEmployees = async () => {
    setCrudLoading(true);
    try {
      const employeeList = await db.getEmployees();
      setEmployees(employeeList);
      return { success: true, employees: employeeList };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setCrudLoading(false);
    }
  };

  // UPDATE
  const updateEmployee = async (id, employeeData) => {
    setCrudLoading(true);
    try {
      const updatedEmployee = await db.updateEmployee(id, employeeData);
      setEmployees((prev) => prev.map((emp) => (emp.id === Number(id) ? updatedEmployee : emp)));
      return { success: true, employee: updatedEmployee };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setCrudLoading(false);
    }
  };

  // DELETE
  const deleteEmployee = async (id) => {
    setCrudLoading(true);
    try {
      const deletedEmployee = await db.deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== Number(id)));
      return { success: true, employee: deletedEmployee };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setCrudLoading(false);
    }
  };

  // ===== CRUD Operations for Activities =====

  // CREATE
  const addActivity = async (activityData) => {
    const newActivity = {
      id: Math.max(...activities.map((a) => a.id), 0) + 1,
      ...activityData,
    };
    const next = [...activities, newActivity];
    setActivities(next);
    try {
      localStorage.setItem('engagement-activities', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
    return { success: true, activity: newActivity };
  };

  // UPDATE
  const updateActivity = async (id, activityData) => {
    const updatedActivity = { ...activityData, id: Number(id) };
    const next = activities.map((a) => (a.id === Number(id) ? updatedActivity : a));
    setActivities(next);
    try {
      localStorage.setItem('engagement-activities', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
    return { success: true, activity: updatedActivity };
  };

  // DELETE
  const deleteActivity = async (id) => {
    const next = activities.filter((a) => a.id !== Number(id));
    setActivities(next);
    try {
      localStorage.setItem('engagement-activities', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
    return { success: true, id: Number(id) };
  };

  // UPDATE - Profile photo for the signed-in user
  // Persists in the in-memory DB, mirrors it on the linked employee record,
  // and updates the auth user so every avatar in the app refreshes instantly.
  const updateProfilePhoto = async (photo) => {
    setCrudLoading(true);
    try {
      const email = auth?.user?.email;
      const name = auth?.user?.name;

      // 1. Persist in the in-memory DB keyed by the signed-in user's email
      await db.saveProfilePhoto(email, photo);

      // 2. Mirror the photo on the linked employee record when one matches
      const allEmployees = await db.getEmployees();
      const linkedEmployee = allEmployees.find(
        (emp) =>
          (email && emp.email?.toLowerCase() === email.toLowerCase()) ||
          (name && emp.name.toLowerCase() === name.toLowerCase())
      );
      if (linkedEmployee) {
        const updatedEmployee = await db.updateProfilePhoto(linkedEmployee.id, photo);
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
        );
      }

      // 3. Update the signed-in user object for instant UI updates
      setAuth((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, photo } : prev.user,
      }));

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setCrudLoading(false);
    }
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
      crudLoading,
      // CRUD operations
      addEmployee,
      updateEmployee,
      deleteEmployee,
      updateProfilePhoto,
      refreshEmployees,
      addActivity,
      updateActivity,
      deleteActivity,
    }),
    [auth, themeMode, employees, recognitions, surveys, activities, announcements, loading, crudLoading, mode, addActivity, deleteActivity, updateActivity]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}