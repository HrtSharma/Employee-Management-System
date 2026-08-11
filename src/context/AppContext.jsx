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
  const [activities, setActivities] = useState(activityData);
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

  // Resolve the stored profile photo for the given email/name.
  // Checks the user photo store first, then the linked employee record.
  const resolveUserPhoto = async (email, name) => {
    try {
      const storedPhoto = await db.getUserPhoto(email);
      if (storedPhoto) return storedPhoto;
      const allEmployees = await db.getEmployees();
      const linkedEmployee = allEmployees.find(
        (emp) =>
          (email && emp.email?.toLowerCase() === email.toLowerCase()) ||
          (name && emp.name.toLowerCase() === name.toLowerCase())
      );
      return linkedEmployee?.photo || null;
    } catch {
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.get('https://jsonplaceholder.typicode.com/users/1');
      // Detect admin login via email
      const isAdminLogin = email.toLowerCase().includes('admin');
      const role = isAdminLogin ? 'Admin' : 'HR Lead';
      const user = { id: response.data.id, name: response.data.name, email, role };

      // Restore the profile photo persisted in the in-memory DB (if any)
      user.photo = await resolveUserPhoto(email, user.name);

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
    const name = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || payload.email;
    const user = { ...payload, name, role: payload.department };
    // Restore any photo previously saved for this email
    user.photo = await resolveUserPhoto(payload.email, name);
    setAuth({ isAuthenticated: true, user });
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

  // UPDATE - Profile photo for the signed-in user
  // Persists in the in-memory DB, mirrors it on the linked employee record,
  // and updates the auth user so every avatar in the app refreshes instantly.
  const updateProfilePhoto = async (photo) => {
    setCrudLoading(true);
    try {
      const email = auth?.user?.email;
      const name = auth?.user?.name;

      // 1. Persist in the in-memory DB keyed by the signed-in user's email
      await db.setUserPhoto(email, photo);

      // 2. Mirror the photo on the linked employee record when one matches
      const allEmployees = await db.getEmployees();
      const linkedEmployee = allEmployees.find(
        (emp) =>
          (email && emp.email?.toLowerCase() === email.toLowerCase()) ||
          (name && emp.name.toLowerCase() === name.toLowerCase())
      );
      if (linkedEmployee) {
        const updatedEmployee = await db.updateEmployeePhoto(linkedEmployee.id, photo);
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

  // Remove the signed-in user's profile photo (reverts to initials)
  const removeProfilePhoto = async () => {
    setCrudLoading(true);
    try {
      const email = auth?.user?.email;
      const name = auth?.user?.name;

      // 1. Remove from the in-memory user photo store
      await db.setUserPhoto(email, null);

      // 2. Clear the linked employee record when one matches
      const allEmployees = await db.getEmployees();
      const linkedEmployee = allEmployees.find(
        (emp) =>
          (email && emp.email?.toLowerCase() === email.toLowerCase()) ||
          (name && emp.name.toLowerCase() === name.toLowerCase())
      );
      if (linkedEmployee) {
        const updatedEmployee = await db.updateEmployeePhoto(linkedEmployee.id, null);
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
        );
      }

      // 3. Reflect instantly on the signed-in user
      setAuth((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, photo: null } : prev.user,
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
      removeProfilePhoto,
      refreshEmployees,
    }),
    [auth, themeMode, employees, recognitions, surveys, activities, announcements, loading, crudLoading, mode]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}