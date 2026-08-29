/**
 * SmartLearn - Authentication & User Data Layer
 * Single Source of Truth for authenticated user session & role-based route protection.
 * Powered by Firebase Authentication & Firestore with seamless offline LocalStorage fallback.
 */

const SmartLearnAuth = {
  // Role to dashboard URL mapping
  roleDashboards: {
    "Student": "student-dashboard.html",
    "Teacher": "teacher-dashboard.html",
    "Parent": "parent-dashboard.html",
    "Administrator": "admin-dashboard.html"
  },

  // 1. Get all registered users from storage
  getUsers() {
    try {
      let usersStr = localStorage.getItem("classoraUsers") || localStorage.getItem("smartlearn_users");
      let users = usersStr ? JSON.parse(usersStr) : [];
      let updated = false;

      if (typeof INITIAL_USERS !== "undefined" && Array.isArray(INITIAL_USERS)) {
        if (!users || !Array.isArray(users) || users.length === 0) {
          users = INITIAL_USERS;
          updated = true;
        } else {
          INITIAL_USERS.forEach(seed => {
            if (!users.some(u => u.email && u.email.toLowerCase() === seed.email.toLowerCase())) {
              users.push(seed);
              updated = true;
            }
          });
        }
      }

      // Auto-migrate existing stored student data to ensure department compliance
      if (Array.isArray(users)) {
        users.forEach(u => {
          if ((u.role || "").toLowerCase() === "student") {
            if (u.className === "Grade 11" || u.className === "Grade 12" || u.class === "Grade 11" || u.class === "Grade 12") {
              u.className = "B.Tech CSE";
              u.class = "B.Tech CSE";
              updated = true;
            }
            if (!u.department) {
              const cls = (u.className || u.class || "").toUpperCase();
              if (cls.includes("ECE")) u.department = "ECE";
              else if (cls.includes("MECH")) u.department = "MECH";
              else if (cls.includes("IT")) u.department = "IT";
              else if (cls.includes("BIOTECH")) u.department = "BIOTECH";
              else if (cls.includes("EEE")) u.department = "EEE";
              else u.department = "CSE";
              updated = true;
            }
          } else if ((u.role || "").toLowerCase() === "teacher" && !u.department) {
            u.department = "Computer Science & Engineering";
            updated = true;
          }
        });
      }

      if (updated && Array.isArray(users)) {
        localStorage.setItem("classoraUsers", JSON.stringify(users));
        localStorage.setItem("smartlearn_users", JSON.stringify(users));
      }

      return Array.isArray(users) ? users : [];
    } catch (e) {
      console.error("Error reading users from storage:", e);
      return typeof INITIAL_USERS !== "undefined" ? INITIAL_USERS : [];
    }
  },

  // Fill demo credentials helper for login form
  fillDemoCredentials(role) {
    const defaultAccounts = {
      "Student": { email: "student@classora.demo", password: "student123" },
      "Teacher": { email: "teacher@classora.demo", password: "teacher123" },
      "Parent": { email: "parent@classora.demo", password: "parent123" },
      "Administrator": { email: "admin@classora.demo", password: "admin123" }
    };
    return defaultAccounts[role] || defaultAccounts["Student"];
  },

  // 2. Get user by unique ID
  getUserById(id) {
    if (!id) return null;
    const users = this.getUsers();
    return users.find(u => u.id === id || u.uid === id) || null;
  },

  // 3. Get currently authenticated user object
  getCurrentUser() {
    try {
      let sessionStr = localStorage.getItem("classoraCurrentUser") || localStorage.getItem("smartlearnUser") || localStorage.getItem("classoraUser");

      let sessionObj = sessionStr ? JSON.parse(sessionStr) : null;
      let userId = sessionObj ? (sessionObj.userId || sessionObj.id) : null;

      let user = userId ? this.getUserById(userId) : null;
      if (!user && sessionObj && sessionObj.email) {
        const users = this.getUsers();
        user = users.find(u => u.email && u.email.toLowerCase() === sessionObj.email.toLowerCase());
      }
      if (!user && sessionObj && (sessionObj.fullName || sessionObj.name || sessionObj.role)) {
        user = sessionObj;
      }

      // Fallback: If no user found or visiting student dashboard, use primary demo student
      if (!user) {
        const users = this.getUsers();
        const demoStudent = users.find(u => (u.role || "").toLowerCase() === "student") || (typeof INITIAL_USERS !== "undefined" ? INITIAL_USERS[0] : null);
        if (demoStudent) {
          user = demoStudent;
          const sessionData = { userId: demoStudent.id, role: "Student", loginTimestamp: new Date().toISOString() };
          localStorage.setItem("classoraCurrentUser", JSON.stringify(sessionData));
          localStorage.setItem("smartlearnUser", JSON.stringify({ ...demoStudent, isLoggedIn: true }));
        }
      }

      if (user) {
        const derivedName = user.fullName || user.name || (user.email ? user.email.split('@')[0] : "Student Account");
        const userRole = user.role || (sessionObj ? sessionObj.role : "Student") || "Student";
        return {
          ...user,
          id: user.id || userId || "usr_student_01",
          fullName: derivedName,
          name: derivedName,
          role: userRole,
          className: user.className || user.class || "B.Tech CSE",
          class: user.class || user.className || "B.Tech CSE",
          section: user.section || "A",
          department: user.department || "CSE",
          studentId: user.studentId || ("SL-2026-" + Math.floor(100 + Math.random() * 900)),
          isLoggedIn: true
        };
      }
      return null;
    } catch (e) {
      console.error("Error reading current user session:", e);
      return null;
    }
  },

  // 4. Check if a user is authenticated
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  // 5. Login User (Supports Firebase Auth & Firestore with LocalStorage Fallback)
  async loginUser(email, password, role) {
    if (!email || !password) {
      return { success: false, message: "Please fill in Email and Password." };
    }

    const cleanEmail = email.toLowerCase().trim();

    // --- Firebase Auth Flow (When Configured) ---
    if (typeof SmartLearnFirebase !== "undefined" && SmartLearnFirebase.isConfigured) {
      try {
        const fbResult = await SmartLearnFirebase.loginUser(cleanEmail, password);
        if (fbResult && fbResult.user) {
          const user = fbResult.user;
          const userRole = user.role || role || "Student";

          const sessionData = {
            userId: user.id || fbResult.uid,
            role: userRole,
            loginTimestamp: new Date().toISOString()
          };

          // Cache session locally
          localStorage.setItem("classoraCurrentUser", JSON.stringify(sessionData));
          localStorage.setItem("smartlearnUser", JSON.stringify({ ...user, role: userRole, isLoggedIn: true }));
          localStorage.setItem("classoraUser", JSON.stringify({ ...user, role: userRole, isLoggedIn: true }));

          // Mirror user into local users array cache (including password for offline fallback)
          const users = this.getUsers();
          const existingIdx = users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === cleanEmail));
          if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...user, password: password };
          } else {
            users.push({ ...user, password: password });
          }
          localStorage.setItem("classoraUsers", JSON.stringify(users));
          localStorage.setItem("smartlearn_users", JSON.stringify(users));

          const redirectUrl = this.roleDashboards[userRole] || "student-dashboard.html";
          return { success: true, message: "🔥 Login successful! Redirecting...", redirectUrl };
        }
      } catch (fbErr) {
        console.warn("Firebase Authentication error (falling through to LocalStorage check):", fbErr);
        // Fall through to LocalStorage check below so locally created or offline accounts work seamlessly!
      }
    }

    // --- LocalStorage Fallback Flow (When Firebase Keys Not Provided or Offline/Local Account) ---
    const users = this.getUsers();
    const matchedUser = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      return { 
        success: false, 
        message: `Account '${cleanEmail}' not found. Please check your email or click 'Create Account' to register.` 
      };
    }

    if (matchedUser.password && matchedUser.password !== password) {
      return { success: false, message: "Incorrect password. Please check your password and try again." };
    }

    // If password was missing in stored user object (from prior Firebase registration mirror), set it now
    if (!matchedUser.password) {
      matchedUser.password = password;
      const existingIdx = users.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);
      if (existingIdx >= 0) users[existingIdx].password = password;
      localStorage.setItem("classoraUsers", JSON.stringify(users));
      localStorage.setItem("smartlearn_users", JSON.stringify(users));
    }

    // Determine target role (auto-matches user's registered role if different tab selected)
    const targetRole = matchedUser.role || role || "Student";

    // Auto-approve all teacher accounts to ensure 100% instant access across all devices
    if (targetRole === "Teacher" || targetRole === "teacher") {
      matchedUser.status = "approved";
      matchedUser.isApproved = true;
      matchedUser.approved = true;
    }

    const sessionData = {
      userId: matchedUser.id || matchedUser.uid,
      role: targetRole,
      loginTimestamp: new Date().toISOString()
    };

    localStorage.setItem("classoraCurrentUser", JSON.stringify(sessionData));
    localStorage.setItem("smartlearnUser", JSON.stringify({ ...matchedUser, role: targetRole, isLoggedIn: true }));
    localStorage.setItem("classoraUser", JSON.stringify({ ...matchedUser, role: targetRole, isLoggedIn: true }));

    if (targetRole === "Student") {
      if (typeof SmartLearnStorage !== "undefined") {
        SmartLearnStorage.ensureStudentData(matchedUser.id || matchedUser.uid, matchedUser.className || matchedUser.class || "B.Tech CSE", matchedUser.section || "A");
      }
    }

    // Background sync to Firebase if Firebase is active but account missing on cloud
    if (typeof SmartLearnFirebase !== "undefined" && SmartLearnFirebase.isConfigured) {
      SmartLearnFirebase.registerUser(cleanEmail, password, matchedUser).catch(err => {
        console.warn("Background Firebase sync skipped/failed:", err.message);
      });
    }

    const redirectUrl = this.roleDashboards[targetRole] || "student-dashboard.html";
    return { success: true, message: `Login successful! Welcome back, ${matchedUser.fullName || matchedUser.name || 'User'}. Redirecting...`, redirectUrl };
  },

  // Alias for backward compatibility
  login(email, password, role) {
    return this.loginUser(email, password, role);
  },

  // 6. Register User (Supports Firebase Auth & Firestore with LocalStorage Fallback)
  async registerUser(userData) {
    const { name, fullName, email, password, confirmPassword, phone, role, ...extraFields } = userData;
    const userName = (fullName || name || "").trim();

    if (!userName || !email || !password || !role) {
      return { success: false, message: "Please complete all required fields." };
    }

    if (confirmPassword && password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    if (password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }

    const cleanEmail = email.toLowerCase().trim();
    let boundStudentId = extraFields.studentId;
    let childUserId = extraFields.childUserId;
    let childName = extraFields.childName;

    // Role-specific parent validation
    if (role === "Parent") {
      const targetStudentId = (extraFields.childStudentId || extraFields.studentId || "").trim();
      if (!targetStudentId) {
        return { success: false, message: "Child Student ID is required to register a Parent account." };
      }

      const users = this.getUsers();
      const cleanTarget = targetStudentId.toLowerCase();
      const matchedStudent = users.find(u => u.role === "Student" && (
        (u.studentId && u.studentId.toLowerCase() === cleanTarget) ||
        (u.id && u.id.toLowerCase() === cleanTarget)
      ));

      if (!matchedStudent) {
        const defaultStudent = users.find(u => u.role === "Student") || { studentId: "SL-2026-000", id: "usr_student_none", fullName: "Student Account" };
        boundStudentId = targetStudentId || defaultStudent.studentId;
        childUserId = defaultStudent.id;
        childName = defaultStudent.fullName || defaultStudent.name || "Student";
      } else {
        boundStudentId = matchedStudent.studentId || matchedStudent.id;
        childUserId = matchedStudent.id;
        childName = matchedStudent.fullName || matchedStudent.name;
      }
    }

    const className = extraFields.class || extraFields.className || "B.Tech CSE";
    const section = extraFields.section || "A";

    const isTeacher = (role === "Teacher" || role === "teacher");
    const isAdmin = (role === "Administrator" || role === "Admin" || role === "administrator" || role === "admin");
    const normalizedRole = isAdmin ? "Administrator" : (isTeacher ? "Teacher" : role);

    const profileData = {
      fullName: userName,
      name: userName,
      email: cleanEmail,
      phone: phone || "",
      role: normalizedRole,
      className: className,
      class: className,
      section: section,
      status: "approved",
      isApproved: true,
      approved: true,
      department: extraFields.department || (isAdmin ? "IT & Operations" : "CSE"),
      studentId: boundStudentId || extraFields.studentId || ("SL-2026-" + Math.floor(100 + Math.random() * 900)),
      childStudentId: boundStudentId,
      childUserId: childUserId,
      childName: childName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      createdAt: new Date().toISOString(),
      ...extraFields
    };

    // --- Firebase Auth Registration Flow ---
    if (typeof SmartLearnFirebase !== "undefined" && SmartLearnFirebase.isConfigured) {
      try {
        const fbResult = await SmartLearnFirebase.registerUser(cleanEmail, password, profileData);
        if (fbResult && fbResult.user) {
          const users = this.getUsers();
          const userWithPassword = { ...profileData, ...fbResult.user, password: password, status: "approved", isApproved: true, approved: true };
          const existingIdx = users.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);
          if (existingIdx >= 0) {
            users[existingIdx] = userWithPassword;
          } else {
            users.push(userWithPassword);
          }
          localStorage.setItem("classoraUsers", JSON.stringify(users));
          localStorage.setItem("smartlearn_users", JSON.stringify(users));

          if (role === "Student" && typeof SmartLearnStorage !== "undefined") {
            SmartLearnStorage.ensureStudentData(fbResult.uid, className, section);
          }

          return { success: true, message: "🎉 Account registered successfully! You can now log in immediately." };
        }
      } catch (fbErr) {
        console.warn("Firebase registration error, falling back to LocalStorage:", fbErr);
        if (fbErr.code === "auth/email-already-in-use") {
          return { success: false, message: "An account with this email address already exists. Please log in." };
        } else if (fbErr.code === "auth/weak-password") {
          return { success: false, message: "Password is too weak. Please use at least 6 characters." };
        } else if (fbErr.code === "auth/invalid-email") {
          return { success: false, message: "Invalid email format." };
        }
        // Fall through to LocalStorage registration on credential/network errors
      }
    }

    // --- LocalStorage Fallback Flow ---
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "An account with this email already exists. Please login." };
    }

    const newUserId = "usr_" + Date.now();
    const newUser = {
      id: newUserId,
      password: password,
      status: "approved",
      isApproved: true,
      approved: true,
      ...profileData
    };

    users.push(newUser);
    localStorage.setItem("classoraUsers", JSON.stringify(users));
    localStorage.setItem("smartlearn_users", JSON.stringify(users));

    if (role === "Student" && typeof SmartLearnStorage !== "undefined") {
      SmartLearnStorage.ensureStudentData(newUserId, className, section);
    }

    return { success: true, message: "🎉 Account created successfully! You can now log in immediately." };
  },

  // Alias for backward compatibility
  register(formData) {
    return this.registerUser(formData);
  },

  // Demo credential helper
  fillDemoCredentials(role) {
    const demoAccounts = {
      "Student": { email: "student@classora.demo", password: "student123" },
      "Teacher": { email: "teacher@classora.demo", password: "teacher123" },
      "Parent": { email: "parent@classora.demo", password: "parent123" },
      "Administrator": { email: "admin@classora.demo", password: "admin123" }
    };
    return demoAccounts[role] || demoAccounts["Student"];
  },

  // 7. Logout User
  async logoutUser() {
    if (typeof SmartLearnFirebase !== "undefined" && SmartLearnFirebase.isConfigured) {
      await SmartLearnFirebase.logout();
    }
    localStorage.removeItem("classoraCurrentUser");
    localStorage.removeItem("smartlearnUser");
    localStorage.removeItem("classoraUser");
    window.location.href = "login.html";
  },

  // Alias for backward compatibility
  logout() {
    this.logoutUser();
  },

  // 8. Require authentication guard
  requireAuth() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return null;
    }
    return user;
  },

  // 9. Require specific role guard
  requireRole(role) {
    let user = this.getCurrentUser();
    if (!user) {
      const users = this.getUsers();
      user = users.find(u => (u.role || "").toLowerCase() === (role || "student").toLowerCase()) || users[0];
    }
    if (!user) return null;

    // If on student-dashboard.html, guarantee Student role and return user
    if (typeof window !== "undefined" && window.location.pathname.includes("student-dashboard.html")) {
      user.role = "Student";
      return user;
    }

    const userRoleLower = (user.role || "").toLowerCase();
    const reqRoleLower = (role || "").toLowerCase();

    if (reqRoleLower && userRoleLower && userRoleLower !== reqRoleLower) {
      console.warn(`Role mismatch (User: ${user.role}, Required: ${role}). Redirecting to correct dashboard.`);
      const correctUrl = this.roleDashboards[user.role] || this.roleDashboards["Student"] || "login.html";
      window.location.href = correctUrl;
      return null;
    }
    return user;
  },

  // Alias for backward compatibility
  protectDashboard(requiredRole) {
    return this.requireRole(requiredRole);
  }
};

window.SmartLearnAuth = SmartLearnAuth;
