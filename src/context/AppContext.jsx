import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  const [recognitions, setRecognitions] = useState(() => {
    // Persist to localStorage so CRUD edits survive refreshes
    try {
      const stored = localStorage.getItem('engagement-recognitions');
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load recognitions:', error);
    }
    return recognitionData;
  });
  const [surveys, setSurveys] = useState(() => {
    try {
      const stored = localStorage.getItem('engagement-surveys');
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    }
    return surveyData;
  });
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
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const stored = localStorage.getItem('engagement-announcements');
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
    return announcementData;
  });
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
      // Look up the account and verify credentials against the stored accounts.
      const account = await db.findUserByEmail(email);
      if (!account) {
        return { success: false, message: 'No account found for this email. Please create an account first.' };
      }
      if (account.password !== password) {
        return { success: false, message: 'Invalid email or password.' };
      }

      const user = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        department: account.department,
      };

      // Restore the profile photo persisted in the in-memory DB (if any)
      try {
        const storedPhoto = await db.getProfilePhoto(email);
        if (storedPhoto) user.photo = storedPhoto;
      } catch {
        // Non-critical: sign-in should still succeed even if photo restore fails
      }

      setAuth({ isAuthenticated: true, user });
      localStorage.setItem('engagement-auth', JSON.stringify({ isAuthenticated: true, user }));
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Unable to sign in. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setCrudLoading(true);
    try {
      // 1. Register the new account (email + password) as an Employee
      const account = await db.createUserAccount({
        name: `${payload.firstName} ${payload.lastName}`.trim(),
        email: payload.email,
        password: payload.password,
        role: 'Employee',
        department: payload.department,
        designation: payload.role,
      });

      // 2. Create the matching employee record so the sign-up data is reflected
      //    in the Employees directory.
      const newEmployee = await db.createEmployee({
        name: account.name,
        department: payload.department,
        designation: payload.role,
        email: payload.email,
        location: 'Remote',
        status: 'Active',
        satisfaction: 82,
        skills: [],
      });

      // 3. Auto-create a default salary structure for the new employee
      try {
        await payrollDB.createDefaultSalaryStructure(newEmployee.id, newEmployee);
      } catch (error) {
        console.error('Failed to create default salary structure:', error);
      }

      // 4. Refresh the employees state so the new hire shows up immediately
      setEmployees((prev) => [...prev.filter((e) => e.id !== newEmployee.id), newEmployee]);

      return { success: true, user: account };
    } catch (error) {
      return { success: false, message: error.message || 'Unable to create your account.' };
    } finally {
      setCrudLoading(false);
    }
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

  // ===== CRUD Operations for Surveys =====

  // CREATE
  const addSurvey = async (surveyData) => {
    const newSurvey = {
      id: Math.max(...surveys.map((s) => s.id), 0) + 1,
      ...surveyData,
    };
    const next = [...surveys, newSurvey];
    setSurveys(next);
    try {
      localStorage.setItem('engagement-surveys', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save surveys:', error);
    }
    return { success: true, survey: newSurvey };
  };

  // UPDATE
  const updateSurvey = async (id, surveyData) => {
    const updatedSurvey = { ...surveyData, id: Number(id) };
    const next = surveys.map((s) => (s.id === Number(id) ? updatedSurvey : s));
    setSurveys(next);
    try {
      localStorage.setItem('engagement-surveys', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save surveys:', error);
    }
    return { success: true, survey: updatedSurvey };
  };

  // DELETE
  const deleteSurvey = async (id) => {
    const next = surveys.filter((s) => s.id !== Number(id));
    setSurveys(next);
    try {
      localStorage.setItem('engagement-surveys', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save surveys:', error);
    }
    return { success: true, id: Number(id) };
  };

  // ===== CRUD Operations for Recognitions =====

  // CREATE
  const addRecognition = async (recognitionData) => {
    const newRecognition = {
      id: Math.max(...recognitions.map((r) => r.id), 0) + 1,
      ...recognitionData,
    };
    const next = [...recognitions, newRecognition];
    setRecognitions(next);
    try {
      localStorage.setItem('engagement-recognitions', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save recognitions:', error);
    }
    return { success: true, recognition: newRecognition };
  };

  // UPDATE
  const updateRecognition = async (id, recognitionData) => {
    const updatedRecognition = { ...recognitionData, id: Number(id) };
    const next = recognitions.map((r) => (r.id === Number(id) ? updatedRecognition : r));
    setRecognitions(next);
    try {
      localStorage.setItem('engagement-recognitions', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save recognitions:', error);
    }
    return { success: true, recognition: updatedRecognition };
  };

  // DELETE
  const deleteRecognition = async (id) => {
    const next = recognitions.filter((r) => r.id !== Number(id));
    setRecognitions(next);
    try {
      localStorage.setItem('engagement-recognitions', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save recognitions:', error);
    }
    return { success: true, id: Number(id) };
  };

  // ===== CRUD Operations for Announcements =====

  // CREATE
  const addAnnouncement = async (announcementData) => {
    const newAnnouncement = {
      id: Math.max(...announcements.map((a) => a.id), 0) + 1,
      ...announcementData,
    };
    const next = [...announcements, newAnnouncement];
    setAnnouncements(next);
    try {
      localStorage.setItem('engagement-announcements', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save announcements:', error);
    }
    return { success: true, announcement: newAnnouncement };
  };

  // UPDATE
  const updateAnnouncement = async (id, announcementData) => {
    const updatedAnnouncement = { ...announcementData, id: Number(id) };
    const next = announcements.map((a) => (a.id === Number(id) ? updatedAnnouncement : a));
    setAnnouncements(next);
    try {
      localStorage.setItem('engagement-announcements', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save announcements:', error);
    }
    return { success: true, announcement: updatedAnnouncement };
  };

  // DELETE
  const deleteAnnouncement = async (id) => {
    const next = announcements.filter((a) => a.id !== Number(id));
    setAnnouncements(next);
    try {
      localStorage.setItem('engagement-announcements', JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save announcements:', error);
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
      addSurvey,
      updateSurvey,
      deleteSurvey,
      addRecognition,
      updateRecognition,
      deleteRecognition,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
    }),
    [auth, themeMode, employees, recognitions, surveys, activities, announcements, loading, crudLoading, mode, addActivity, deleteActivity, updateActivity, addSurvey, updateSurvey, deleteSurvey, addRecognition, updateRecognition, deleteRecognition, addAnnouncement, updateAnnouncement, deleteAnnouncement]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}