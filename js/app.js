/**
 * SmartLearn - Core Application UI Controller & Dynamic Dashboard Engine
 * Brand: SmartLearn | Tagline: Smart Learning. Connected Classroom.
 * Handles dynamic data rendering, UI interactivity, assignment submission engine,
 * theme toggling, toast notifications, and AI Study Assistant logic.
 * 
 * TODO: Connect Classora AI to an AI API
 * TODO: Send authenticated student's learning context
 */

// Standalone hoisted helper for department matching between teacher and student
function matchTeacherAndStudentDept(teacher, student) {
  if (!teacher || !student) return false;

  if (teacher.role === "Administrator" || teacher.role === "admin" || teacher.role === "Admin") return true;

  const tDept = ((teacher.department || teacher.dept || "") + " " + (teacher.handledClasses || "") + " " + (teacher.subject || "")).toLowerCase().trim();
  let sDept = (student.department || "").toLowerCase().trim();
  let sClass = (student.className || student.class || "").toLowerCase().trim();

  if (!sDept) {
    if (sClass.includes("ece")) sDept = "ece";
    else if (sClass.includes("mech")) sDept = "mech";
    else if (sClass.includes("it")) sDept = "it";
    else if (sClass.includes("biotech")) sDept = "biotech";
    else if (sClass.includes("eee")) sDept = "eee";
    else sDept = "cse";
  }

  if (sClass.includes("grade 11") || sClass.includes("grade 12")) {
    sClass = "b.tech cse";
  }

  if (!tDept || tDept === "all") return true;

  if (tDept.includes("cse") || tDept.includes("computer science")) {
    if (sDept.includes("cse") || sDept.includes("computer science") || sClass.includes("cse") || sClass.includes("computer")) return true;
  }
  if (tDept.includes("ece") || tDept.includes("electronics")) {
    if (sDept.includes("ece") || sDept.includes("electronics") || sClass.includes("ece")) return true;
  }
  if (tDept.includes("mech") || tDept.includes("mechanical")) {
    if (sDept.includes("mech") || sDept.includes("mechanical") || sClass.includes("mech")) return true;
  }
  if (tDept.includes("it") || tDept.includes("information technology")) {
    if (sDept.includes("it") || sDept.includes("information technology") || sClass.includes("it")) return true;
  }
  if (tDept.includes("biotech") || tDept.includes("bio")) {
    if (sDept.includes("biotech") || sDept.includes("bio") || sClass.includes("biotech")) return true;
  }
  if (tDept.includes("eee") || tDept.includes("electrical")) {
    if (sDept.includes("eee") || sDept.includes("electrical") || sClass.includes("eee")) return true;
  }

  if (sDept && tDept.includes(sDept)) return true;
  if (sClass && tDept.includes(sClass)) return true;

  return false;
}
if (typeof window !== "undefined") {
  window.matchTeacherAndStudentDept = matchTeacherAndStudentDept;
}

// Standalone helper to dispatch notifications to section-specific or all department students
function sendNotificationToSection(classId, section, title, message) {
  const users = SmartLearnAuth.getUsers();
  const secTarget = (section || "ALL").toUpperCase();

  const targetStudents = users.filter(u => {
    if ((u.role || "").toLowerCase() !== "student") return false;
    const matchDept = matchTeacherAndStudentDept({ department: classId }, u);
    const uSec = (u.section || "A").toUpperCase();
    const matchSec = (secTarget === "ALL" || !u.section || uSec === secTarget);
    return matchDept && matchSec;
  });

  const notifications = SmartLearnStorage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
  const nowStr = new Date().toISOString();

  targetStudents.forEach(st => {
    notifications.unshift({
      id: "not_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      userId: st.id,
      studentId: st.id,
      title: title,
      message: message,
      createdAt: nowStr,
      read: false
    });
  });

  SmartLearnStorage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
}
if (typeof window !== "undefined") {
  window.sendNotificationToSection = sendNotificationToSection;
}

const SmartLearnApp = {
  matchTeacherAndStudentDept: matchTeacherAndStudentDept,

  init() {
    if (typeof SmartLearnStorage !== "undefined" && SmartLearnStorage.init) {
      try { SmartLearnStorage.init(); } catch (e) { console.error("Storage init error:", e); }
    }
    this.setupSidebarToggle();
    this.setupThemeToggle();
    this.setupUserProfileDropdown();
    this.setupGlobalModals();
    this.setupAIAssistant();
    this.setupToastContainer();
    this.handleHashNavigation();
    if (typeof SmartLearnNotifications !== "undefined") {
      try { SmartLearnNotifications.init(); } catch (e) { console.warn("Notifications init warning:", e); }
    }
  },

  handleHashNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const navItem = document.querySelector(`.nav-item[href="#${hash}"]`);
      if (navItem) {
        document.querySelectorAll(".nav-item:not(.logout-link)").forEach(i => i.classList.remove("active"));
        navItem.classList.add("active");
      }
      this.switchDashboardTab(hash, hash);
    }
    window.addEventListener("hashchange", () => {
      const h = window.location.hash.substring(1);
      if (h) {
        const item = document.querySelector(`.nav-item[href="#${h}"]`);
        if (item) {
          document.querySelectorAll(".nav-item:not(.logout-link)").forEach(i => i.classList.remove("active"));
          item.classList.add("active");
        }
        this.switchDashboardTab(h, h);
      }
    });
  },

  // Setup toast notification element
  setupToastContainer() {
    if (!document.getElementById("toast-container")) {
      const container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
  },

  // Display toast message
  showToast(message, type = "info", duration = 3500) {
    this.setupToastContainer();
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast toast-${type} animate-fade-in`;

    const icons = {
      success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = `
      ${icons[type] || icons.info}
      <span class="toast-text">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Setup sidebar toggle for mobile / desktop collapse
  setupSidebarToggle() {
    const toggleBtn = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
      });
    }

    if (overlay) {
      overlay.addEventListener("click", () => {
        if (sidebar) sidebar.classList.remove("active");
        overlay.classList.remove("active");
      });
    }

    // Navigation item click active highlight & section switching
    const navItems = document.querySelectorAll(".nav-item:not(.logout-link)");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        const href = item.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          navItems.forEach(i => i.classList.remove("active"));
          item.classList.add("active");
          const targetSectionId = href.substring(1);
          this.switchDashboardTab(targetSectionId, item.innerText.trim());
          if (window.innerWidth <= 1024 && sidebar) {
            sidebar.classList.remove("active");
            if (overlay) overlay.classList.remove("active");
          }
        }
      });
    });
  },

  // Tab switching logic for multi-section dashboard screens
  switchDashboardTab(sectionId, title) {
    const targetId = sectionId || "overview";
    const sections = document.querySelectorAll(".dashboard-tab-content");
    let found = false;

    sections.forEach(sec => {
      if (sec.id === targetId) {
        sec.style.display = "block";
        found = true;
      } else {
        sec.style.display = "none";
      }
    });

    try {
      if (targetId === "assignments") {
        if (typeof SmartLearnAssignments !== "undefined" && SmartLearnAssignments.init) {
          SmartLearnAssignments.init();
        }
        if (typeof SmartLearnTeacherAssignments !== "undefined" && SmartLearnTeacherAssignments.init) {
          SmartLearnTeacherAssignments.init();
        }
      }

      if ((targetId === "study-materials" || targetId === "resources") && typeof SmartLearnStudyMaterials !== "undefined" && SmartLearnStudyMaterials.init) {
        SmartLearnStudyMaterials.init();
      }

      if (targetId === "quizzes" && typeof SmartLearnTeacherQuizzes !== "undefined" && SmartLearnTeacherQuizzes.init) {
        SmartLearnTeacherQuizzes.init();
      }

      if (targetId === "attendance") {
        if (typeof SmartLearnTeacherAttendance !== "undefined" && SmartLearnTeacherAttendance.init) {
          SmartLearnTeacherAttendance.init();
        }
        if (typeof SmartLearnAttendance !== "undefined" && SmartLearnAttendance.renderAttendanceModule) {
          SmartLearnAttendance.renderAttendanceModule();
        }
      }

      if (targetId === "performance") {
        if (typeof SmartLearnPerformanceCharts !== "undefined" && SmartLearnPerformanceCharts.init) {
          setTimeout(() => {
            SmartLearnPerformanceCharts.init();
          }, 100);
        }
        if (typeof SmartLearnTeacherPerformance !== "undefined" && SmartLearnTeacherPerformance.init) {
          SmartLearnTeacherPerformance.init();
        }
      }

      if (targetId === "timetable") {
        if (typeof SmartLearnStudentTimetable !== "undefined") {
          if (SmartLearnStudentTimetable.render5DayWeeklyMatrix) SmartLearnStudentTimetable.render5DayWeeklyMatrix();
          if (SmartLearnStudentTimetable.render8PeriodTimetable) SmartLearnStudentTimetable.render8PeriodTimetable();
        }
        if (typeof SmartLearnTeacherTimetable !== "undefined" && SmartLearnTeacherTimetable.renderEditorTable) {
          SmartLearnTeacherTimetable.renderEditorTable();
        }
      }

      if (targetId === "exam-timetable") {
        if (typeof SmartLearnTeacherExamTimetable !== "undefined" && SmartLearnTeacherExamTimetable.renderExamTable) {
          SmartLearnTeacherExamTimetable.renderExamTable();
        }
        if ((targetId === "exam-timetable" || targetId === "exams") && typeof SmartLearnStudentExamTimetable !== "undefined" && SmartLearnStudentExamTimetable.renderStudentExams) {
          SmartLearnStudentExamTimetable.renderStudentExams();
        }
      }

      if (typeof SmartLearnAdmin !== "undefined" && document.getElementById("admin-students-section-container") && SmartLearnAdmin.init) {
        SmartLearnAdmin.init();
      }

      if ((targetId === "students" || targetId === "overview") && typeof SmartLearnTeacherStudents !== "undefined" && SmartLearnTeacherStudents.init) {
        SmartLearnTeacherStudents.init();
      }

      if (targetId === "profile") {
        const user = SmartLearnAuth.getCurrentUser();
        if (user && (user.role === "Teacher" || user.role === "teacher") && typeof SmartLearnTeacherAssignments !== "undefined" && SmartLearnTeacherAssignments.populateTeacherProfilePage) {
          SmartLearnTeacherAssignments.populateTeacherProfilePage(user);
        } else if (typeof SmartLearnDashboard !== "undefined" && SmartLearnDashboard.populateProfilePage) {
          SmartLearnDashboard.populateProfilePage(user);
        }
      }

      if (targetId === "announcements" || targetId === "overview") {
        if (typeof SmartLearnAnnouncements !== "undefined") {
          SmartLearnAnnouncements.renderStudentAnnouncements();
          SmartLearnAnnouncements.renderTeacherAnnouncements();
          SmartLearnAnnouncements.renderParentAnnouncements();
        }
      }

      if (targetId === "rewards" || targetId === "leaderboard") {
        if (typeof SmartLearnRewards !== "undefined") {
          SmartLearnRewards.initStudentRewards();
          SmartLearnRewards.initTeacherGamification();
        }
      }
    } catch (err) {
      console.warn("Error during tab switch initialization:", err);
    }

    if (!found) {
      if (targetId === "study-materials") {
        window.location.href = "study-materials.html";
        return;
      }
      if (targetId === "quizzes") {
        window.location.href = "quizzes.html";
        return;
      }
      if (targetId === "assignments") {
        window.location.href = "assignments.html";
        return;
      }

      // CRITICAL GUARANTEE: Restore overview section if target section ID is not a separate tab container
      const overviewSec = document.getElementById("overview");
      if (overviewSec) {
        overviewSec.style.display = "block";
      }
      if (title && title !== targetId) {
        this.showToast(`Showing ${title} insights on your Dashboard.`, "info");
      }
    }
  },

  // Dark / Light Theme Toggle
  setupThemeToggle() {
    const themeBtn = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("smartlearn_theme") || "light";

    if (currentTheme === "dark") {
      document.body.classList.add("dark-theme");
    }

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const newTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
        localStorage.setItem("smartlearn_theme", newTheme);
        this.showToast(`Theme switched to ${newTheme} mode`, "info", 2000);
      });
    }
  },

  // User Profile Dropdown
  setupUserProfileDropdown() {
    const profileBtn = document.getElementById("user-profile-btn");
    const dropdown = document.getElementById("user-profile-dropdown");

    if (profileBtn && dropdown) {
      profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("active");
      });

      document.addEventListener("click", () => {
        dropdown.classList.remove("active");
      });
    }
  },

  // Modal dialog management
  setupGlobalModals() {
    document.addEventListener("click", (e) => {
      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        const modal = closeBtn.closest(".modal-overlay");
        if (modal) {
          this.closeModal(modal.id || modal);
        }
      } else if (e.target.classList.contains("modal-overlay")) {
        this.closeModal(e.target.id || e.target);
      }
    });
  },

  openModal(modalId) {
    const modal = (typeof modalId === "string") ? document.getElementById(modalId) : modalId;
    if (modal) {
      modal.style.display = "flex";
      modal.style.opacity = "1";
      modal.style.visibility = "visible";
      modal.classList.add("active");
    } else {
      console.warn(`Modal target '${modalId}' not found.`);
    }
  },

  closeModal(modalId) {
    const modal = (typeof modalId === "string") ? document.getElementById(modalId) : modalId;
    if (modal) {
      modal.classList.remove("active");
      modal.style.opacity = "0";
      modal.style.visibility = "hidden";
      modal.style.display = "none";
    }
  },

  // AI Assistant Interactive Chat Modal
  setupAIAssistant() {
    const askAiBtn = document.getElementById("open-ai-btn");
    if (askAiBtn) {
      askAiBtn.addEventListener("click", () => {
        this.openModal("ai-assistant-modal");
      });
    }
  },

  triggerAiMode(mode) {
    if (typeof SmartLearnAIEngine !== "undefined") {
      SmartLearnAIEngine.triggerMode(mode);
    }
  },

  // Trigger quick prompt response in AI Modal
  sendAiQuery(customPrompt = null, forceMode = "auto") {
    const user = SmartLearnAuth.getCurrentUser();
    const studentName = user ? (user.name || user.fullName) : "Student";

    const inputEl = document.getElementById("ai-prompt-input");
    const chatContainer = document.getElementById("ai-chat-history");
    const query = customPrompt || (inputEl ? inputEl.value.trim() : "");

    if (!query) return;

    // Append user message
    const userMsg = document.createElement("div");
    userMsg.className = "ai-chat-msg user-msg";
    userMsg.innerHTML = `<div class="msg-bubble" style="background: var(--primary); color: #fff; font-weight: 500;">${query}</div>`;
    chatContainer.appendChild(userMsg);
    if (inputEl) inputEl.value = "";

    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Show typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "ai-chat-msg ai-msg typing-msg";
    typingIndicator.innerHTML = `<div class="msg-bubble"><span class="pulse-dots">SmartLearn AI is processing your query...</span></div>`;
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
      typingIndicator.remove();
      let responseText = "";
      if (typeof SmartLearnAIEngine !== "undefined") {
        responseText = SmartLearnAIEngine.generateResponse(query, forceMode, user);
      } else {
        responseText = `Hello ${studentName}! High-performance AI Assistant is connected. Ask me any STEM, Coding, Calculus, or Physics doubt!`;
      }

      const aiMsg = document.createElement("div");
      aiMsg.className = "ai-chat-msg ai-msg";
      aiMsg.innerHTML = `
        <div class="ai-avatar-mini" style="background: linear-gradient(135deg, #4f46e5, #8b5cf6);">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><path d="M12 7v2m0 6v2m-5-5h2m6 0h2"/></svg>
        </div>
        <div class="msg-bubble" style="line-height: 1.5; color: var(--text-main); font-size: 0.85rem;">${responseText}</div>
      `;
      chatContainer.appendChild(aiMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
  },

  contactAtRiskStudent(studentId, studentName) {
    const msg = prompt(`Send academic advisory alert to ${studentName} and parent?`, `Dear ${studentName}, your current test scores in your focus subject require attention. Please join faculty office hours for guidance.`);
    if (msg) {
      SmartLearnStorage.addNotification({
        userId: studentId,
        title: "⚠️ Academic Performance Advisory Alert",
        message: msg,
        category: "attendance",
        type: "danger"
      });
      SmartLearnApp.showToast(`Advisory notice sent to ${studentName} & Parent portal! 📩`, "success");
    }
  },

  // Form submit handler for Quick Action modals
  handleQuickActionSubmit(e, actionName) {
    e.preventDefault();
    this.showToast(`Success! ${actionName} has been processed.`, "success");
    const modal = e.target.closest(".modal-overlay");
    if (modal) modal.classList.remove("active");
    e.target.reset();
  }
};

/**
 * SmartLearn - Dynamic Student Dashboard Controller
 * Reads authenticated user state & calculates metrics dynamically from localStorage.
 */
const SmartLearnDashboard = {
  // Initialize Student Dashboard View
  initStudentDashboard() {
    const user = SmartLearnAuth.requireRole("Student");
    if (!user) return; // Will redirect if unauthenticated or wrong role

    // 0. Guarantee student attendance, grades & coursework records are populated
    if (typeof SmartLearnStorage !== "undefined" && SmartLearnStorage.ensureStudentData) {
      try { SmartLearnStorage.ensureStudentData(user.id, user.className, user.section); } catch (e) { console.warn("Data seed warning:", e); }
    }

    // 1. Render Announcements FIRST to immediately replace any loading placeholders
    try {
      if (typeof SmartLearnAnnouncements !== "undefined") {
        SmartLearnAnnouncements.renderStudentAnnouncements();
      }
    } catch (err) {
      console.error("Error rendering student announcements:", err);
    }

    // 2. Render core student dashboard widgets safely
    try { this.renderHeaderAndProfile(user); } catch (e) { console.error(e); }
    try { this.renderMetricsAndStats(user); } catch (e) { console.error(e); }
    try { this.renderTodaySchedule(user); } catch (e) { console.error(e); }
    try { this.renderAssignments(user); } catch (e) { console.error(e); }
    try { this.renderPerformanceAndInsights(user); } catch (e) { console.error(e); }
    try { this.renderExams(user); } catch (e) { console.error(e); }
    try { this.renderNotifications(user); } catch (e) { console.error(e); }
    try { this.renderStudyMaterials(user); } catch (e) { console.error(e); }
    try { this.renderQuizzes(user); } catch (e) { console.error(e); }
    try { this.populateProfilePage(user); } catch (e) { console.error(e); }

    // 3. Initialize feature modules
    if (typeof SmartLearnAssignments !== "undefined") {
      try { SmartLearnAssignments.init(); } catch (e) { console.error(e); }
    }
    if (typeof SmartLearnStudyMaterials !== "undefined") {
      try { SmartLearnStudyMaterials.init(); } catch (e) { console.error(e); }
    }
    if (typeof SmartLearnAttendance !== "undefined") {
      try { SmartLearnAttendance.initStudentAttendance(); } catch (e) { console.error(e); }
    }
    if (typeof SmartLearnStudentTimetable !== "undefined") {
      try { SmartLearnStudentTimetable.init(); } catch (e) { console.error(e); }
    }
  },

  // 1. Render Header Greeting & Profile Info
  renderHeaderAndProfile(user) {
    const displayName = user.fullName || user.name || "Student";
    const studentId = user.studentId || "SL-2026-894";
    const className = user.className || user.class || "B.Tech CSE";
    const section = user.section || "A";

    // Greeting Title & Subtitle
    const greetingEl = document.getElementById("greeting-text");
    if (greetingEl) greetingEl.innerHTML = `Good Morning, ${displayName} 👋`;

    const greetingSubEl = document.getElementById("greeting-sub");
    if (greetingSubEl) greetingSubEl.innerHTML = `Student ID: <strong class="text-primary">${studentId}</strong> • ${className}-${section}`;

    // Top Bar Profile
    const topNameEl = document.getElementById("user-display-name");
    if (topNameEl) topNameEl.innerText = displayName;

    const topRoleEl = document.getElementById("user-display-role");
    if (topRoleEl) topRoleEl.innerText = `Student • ${className}-${section}`;

    const topAvatarEl = document.getElementById("user-avatar-img");
    if (topAvatarEl && user.avatar) topAvatarEl.src = user.avatar;

    // Profile Modal / Details Section Card
    const profName = document.getElementById("profile-full-name");
    if (profName) profName.innerText = displayName;

    const profEmail = document.getElementById("profile-email");
    if (profEmail) profEmail.innerText = user.email || "";

    const profPhone = document.getElementById("profile-phone");
    if (profPhone) profPhone.innerText = user.phone || "Not set";

    const profId = document.getElementById("profile-student-id");
    if (profId) profId.innerText = studentId;

    const profClass = document.getElementById("profile-class-name");
    if (profClass) profClass.innerText = className;

    const profSec = document.getElementById("profile-section");
    if (profSec) profSec.innerText = section;
  },

  // 2. Render Calculated Metrics Stat Cards
  renderMetricsAndStats(user) {
    // Attendance Calculation: (Present Classes / Total Classes) * 100
    const allAtt = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    let attendanceRecords = allAtt.filter(a => !a.studentId || a.studentId === user.id || a.studentId === "usr_student_01");
    if (attendanceRecords.length === 0) attendanceRecords = allAtt;

    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(a => (a.status || "").toLowerCase() === "present").length;
    const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 92;

    const statAttVal = document.getElementById("stat-attendance-val");
    if (statAttVal) statAttVal.innerText = `${attendancePct}%`;

    const statAttSub = document.getElementById("stat-attendance-sub");
    if (statAttSub) statAttSub.innerText = `${presentClasses} / ${totalClasses} Classes Attended`;

    // Pending Assignments Calculation
    const userClass = (user.className || user.class || "B.Tech CSE").toLowerCase();
    const userSection = (user.section || "A").toUpperCase();
    const allAssignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS) || [];
    let assignments = allAssignments.filter(a => {
      if (a.studentId && (a.studentId === user.id || a.studentId === "usr_student_01")) return true;
      const aClass = (a.className || a.class || "").toLowerCase();
      const aSec = (a.section || "").toUpperCase();
      return !aClass || aClass === userClass || aClass.includes("cse");
    });
    if (assignments.length === 0) assignments = allAssignments;

    const submissions = SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.studentId === user.id);
    const pendingList = assignments.filter(a => (a.status || "pending") === "pending" && !submissions.some(s => s.assignmentId === a.id));

    const statAssignVal = document.getElementById("stat-pending-val");
    if (statAssignVal) statAssignVal.innerText = pendingList.length > 0 ? pendingList.length : assignments.length;

    // Upcoming Exams Calculation
    const allExams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    let exams = allExams.filter(e => {
      const eClass = (e.className || e.class || "").toLowerCase();
      return !eClass || eClass === userClass || eClass.includes("cse");
    });
    if (exams.length === 0) exams = allExams;

    const now = new Date();
    const upcomingExams = exams.filter(e => new Date(e.examDate || Date.now() + 86400000) >= now);

    const statExamVal = document.getElementById("stat-exams-val");
    if (statExamVal) statExamVal.innerText = upcomingExams.length > 0 ? upcomingExams.length : 2;

    // Average Score Calculation from Grades
    const allGrades = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];
    let grades = allGrades.filter(g => !g.studentId || g.studentId === user.id || g.studentId === "usr_student_01");
    if (grades.length === 0) grades = allGrades;

    let avgScorePct = 88;
    if (grades.length > 0) {
      const totalPct = grades.reduce((acc, g) => acc + (Number(g.scoredMarks || 85) / Number(g.maxMarks || 100)) * 100, 0);
      avgScorePct = Math.round(totalPct / grades.length);
    }

    const statScoreVal = document.getElementById("stat-score-val");
    if (statScoreVal) statScoreVal.innerText = `${avgScorePct}%`;
  },

  // 3. Render Home Page Class Timetable (Day-by-Day View, Default Today)
  selectedHomeDayFilter: "today",

  filterHomeTimetable(day, btnEl) {
    this.selectedHomeDayFilter = day;
    const tabs = document.querySelectorAll(".home-tt-tab");
    tabs.forEach(t => {
      t.classList.remove("btn-primary", "active");
      t.classList.add("btn-outline");
    });
    if (btnEl) {
      btnEl.classList.remove("btn-outline");
      btnEl.classList.add("btn-primary", "active");
    }
    const user = SmartLearnAuth.getCurrentUser();
    if (user) this.renderTodaySchedule(user);
  },

  renderTodaySchedule(user) {
    const container = document.getElementById("today-classes-container");
    if (!container) return;

    const allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const userClass = user.className || user.class || "B.Tech CSE";

    // Filter by student class
    let classTt = allTt.filter(t => (!t.className || t.className === userClass || t.className === "B.Tech CSE" || t.className.includes("CSE")));
    if (classTt.length === 0) classTt = allTt;

    const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIndex = new Date().getDay();
    const actualTodayName = daysArr[todayIndex];
    // Weekend fallback to Monday
    const todayName = (actualTodayName === "Sunday" || actualTodayName === "Saturday") ? "Monday" : actualTodayName;

    const activeFilter = this.selectedHomeDayFilter || "today";
    const targetDay = (activeFilter === "today") ? todayName : activeFilter;

    // Update active day badge in header
    const badgeEl = document.getElementById("home-tt-active-day-badge");
    if (badgeEl) {
      badgeEl.innerText = activeFilter === "today" ? `Today (${todayName})` : targetDay;
    }

    let dayTt = classTt.filter(t => t.day === targetDay);
    if (dayTt.length === 0) dayTt = classTt.slice(0, 5);

    if (dayTt.length === 0) {
      container.innerHTML = `
        <div class="empty-state-text" style="padding: 1.5rem 0.5rem; text-align: center;">
          🗓️ No scheduled classes found for <strong>${targetDay}</strong>.
        </div>
      `;
      return;
    }

    const sortedTt = [...dayTt].sort((a, b) => (a.period || 1) - (b.period || 1));
    const isToday = targetDay === todayName;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentMinutesTotal = currentHour * 60 + currentMin;

    container.innerHTML = sortedTt.map(item => {
      const [startH, startM] = (item.startTime || "09:00").split(":").map(Number);
      const [endH, endM] = (item.endTime || "10:00").split(":").map(Number);
      const startMinTotal = startH * 60 + startM;
      const endMinTotal = endH * 60 + endM;

      let statusBadge = `<span class="badge badge-info">Upcoming</span>`;
      let borderStyle = `border-left-color: var(--info);`;

      if (isToday) {
        if (currentMinutesTotal >= startMinTotal && currentMinutesTotal <= endMinTotal) {
          statusBadge = `<span class="badge badge-success">Ongoing</span>`;
          borderStyle = `border-left-color: var(--success);`;
        } else if (currentMinutesTotal > endMinTotal) {
          statusBadge = `<span class="badge badge-secondary">Completed</span>`;
          borderStyle = `border-left-color: var(--slate-400);`;
        }
      } else {
        statusBadge = `<span class="badge badge-outline">${targetDay}</span>`;
        borderStyle = `border-left-color: var(--primary);`;
      }

      return `
        <div class="class-item" style="${borderStyle}">
          <div class="class-time">Period ${item.period || 1}<br><span class="text-xs text-muted">${item.startTime} - ${item.endTime}</span></div>
          <div class="class-details">
            <div class="class-name">${item.subject}</div>
            <div class="class-sub">${item.teacher} • ${item.room}</div>
          </div>
          ${statusBadge}
        </div>
      `;
    }).join("");
  },

  // 4. Render Dynamic Assignments List & Submission Engine
  renderAssignments(user) {
    const container = document.getElementById("pending-assignments-container");
    if (!container) return;

    const allAssignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS) || [];
    const submissions = SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.studentId === user.id);

    const userSection = (user.section || "A").toUpperCase();
    const assignments = allAssignments.filter(a => {
      if (a.studentId && a.studentId === user.id) return true;
      const aClass = a.className || a.classId || a.class || "B.Tech CSE";
      const matchDept = matchTeacherAndStudentDept({ department: aClass }, user);
      const aSec = (a.section || "ALL").toUpperCase();
      const matchSec = (aSec === "ALL" || aSec === userSection || !a.section);
      return matchDept && matchSec;
    });

    if (assignments.length === 0) {
      container.innerHTML = `<div class="empty-state-text">No assignments assigned for your section.</div>`;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    container.innerHTML = assignments.map(item => {
      const isSubmitted = item.status === "submitted" || submissions.some(s => s.assignmentId === item.id);
      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let badgeHtml = "";
      if (isSubmitted) {
        badgeHtml = `<span class="badge badge-success">Submitted</span>`;
      } else if (diffDays < 0) {
        badgeHtml = `<span class="badge badge-danger">Overdue (${Math.abs(diffDays)}d ago)</span>`;
      } else if (diffDays === 0) {
        badgeHtml = `<span class="badge badge-warning">Due Today</span>`;
      } else {
        badgeHtml = `<span class="badge badge-warning">Due in ${diffDays} day${diffDays > 1 ? 's' : ''}</span>`;
      }

      const teacherObj = (item.teacherId ? SmartLearnStorage.getUserById(item.teacherId) : null) || {};
      const facultyName = item.teacherName || item.createdBy || item.teacher || (teacherObj ? (teacherObj.fullName || teacherObj.name) : null) || "Faculty Instructor";

      return `
        <div class="assignment-item" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <div class="badge badge-primary" style="margin-bottom:0.25rem;">${item.subject}</div>
            <div class="font-bold text-sm" style="color:var(--text-main);">${item.title}</div>
            <div class="text-xs text-muted">Faculty: <strong>${facultyName}</strong> • Due: ${item.dueDate} • Target: ${item.className || 'B.Tech CSE'} (Sec ${item.section || 'ALL'})</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            ${badgeHtml}
            ${!isSubmitted ? `
              <button class="btn btn-outline btn-sm" onclick="SmartLearnDashboard.openSubmitModal('${item.id}', '${encodeURIComponent(item.title)}')">
                Submit &rarr;
              </button>
            ` : `<button class="btn btn-outline btn-sm" disabled style="opacity:0.6;">Turned In</button>`}
          </div>
        </div>
      `;
    }).join("");
  },

  // Open Submit Assignment Modal
  openSubmitModal(assignmentId, titleEscaped) {
    const title = decodeURIComponent(titleEscaped);
    document.getElementById("submit-assignment-id").value = assignmentId;
    document.getElementById("submit-assignment-title").innerText = title;
    SmartLearnApp.openModal("submit-assignment-modal");
  },

  // Execute Submission Persistence
  submitAssignment(e) {
    e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const assignmentId = document.getElementById("submit-assignment-id").value;
    const notes = document.getElementById("submit-assignment-notes").value;

    const submissions = SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS);
    const assignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS);

    // Push new submission record
    const newSubmission = {
      id: "sub_" + Date.now(),
      assignmentId: assignmentId,
      studentId: user.id,
      submittedAt: new Date().toISOString(),
      status: "submitted",
      notes: notes || "Submitted via student portal"
    };
    submissions.push(newSubmission);
    SmartLearnStorage.set(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Update assignment status
    const target = assignments.find(a => a.id === assignmentId && a.studentId === user.id);
    if (target) {
      target.status = "submitted";
      SmartLearnStorage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }

    SmartLearnApp.showToast("Assignment submitted successfully!", "success");
    SmartLearnApp.closeModal("submit-assignment-modal");
    document.getElementById("submit-assignment-notes").value = "";

    // Re-render dashboard
    this.initStudentDashboard();
  },

  // 5. Render Subject Performance & Dynamic Learning Insight Recommendation
  renderPerformanceAndInsights(user) {
    const container = document.getElementById("subject-performance-container");
    const recommendationBox = document.getElementById("learning-recommendation-box");

    const grades = SmartLearnStorage.get(STORAGE_KEYS.GRADES).filter(g => g.studentId === user.id);

    // Group grades by subject to compute scores
    const subjectMap = {};
    grades.forEach(g => {
      if (!subjectMap[g.subject]) {
        subjectMap[g.subject] = { totalScored: 0, totalMax: 0 };
      }
      subjectMap[g.subject].totalScored += g.scoredMarks;
      subjectMap[g.subject].totalMax += g.maxMarks;
    });

    const subjectScores = Object.keys(subjectMap).map(subj => {
      const score = Math.round((subjectMap[subj].totalScored / subjectMap[subj].totalMax) * 100);
      let grade = "A";
      if (score >= 90) grade = "A+";
      else if (score >= 80) grade = "A";
      else if (score >= 70) grade = "B+";
      else if (score >= 60) grade = "B";
      else grade = "C";
      return { subject: subj, score, grade };
    });

    // Populate Performance Tab Stat Cards Dynamically
    const gpaEl = document.getElementById("perf-cumulative-gpa");
    if (gpaEl) {
      const overallAvg = subjectScores.length > 0 ? Math.round(subjectScores.reduce((acc, s) => acc + s.score, 0) / subjectScores.length) : 0;
      gpaEl.innerText = `${overallAvg}%`;
    }

    const quizSubs = (SmartLearnStorage.get(STORAGE_KEYS.QUIZ_ATTEMPTS) || []).filter(qs => qs.studentId === user.id);
    const quizAvgEl = document.getElementById("perf-quiz-avg");
    if (quizAvgEl) {
      let qAvg = 0;
      if (quizSubs.length > 0) {
        const totalQ = quizSubs.reduce((acc, q) => acc + (q.percentage || ((q.score / (q.totalQuestions || 10)) * 100)), 0);
        qAvg = Math.round(totalQ / quizSubs.length);
      }
      quizAvgEl.innerText = `${qAvg}%`;
    }

    const userClass = (user.className || user.class || "B.Tech CSE").toLowerCase();
    const userSection = (user.section || "A").toUpperCase();
    const assignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS).filter(a => {
      if (a.studentId && a.studentId === user.id) return true;
      const aClass = (a.className || a.class || "").toLowerCase();
      const aSec = (a.section || "").toUpperCase();
      return aClass === userClass && (!aSec || aSec === userSection);
    });
    const submissions = SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.studentId === user.id);
    const turninEl = document.getElementById("perf-asgn-turnin");
    if (turninEl) {
      turninEl.innerText = `${submissions.length} / ${assignments.length}`;
    }

    if (container) {
      if (subjectScores.length === 0) {
        container.innerHTML = `<div class="empty-state-text" style="padding: 0.75rem; text-align: center;">No test or evaluation records added by teacher yet.</div>`;
      } else {
        container.innerHTML = subjectScores.map(item => `
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 600;">
              <span>${item.subject}</span>
              <span class="text-primary">${item.score}% (${item.grade})</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${item.score}%;"></div>
            </div>
          </div>
        `).join("");
      }
    }

    // Dynamic Learning Recommendation Engine
    if (recommendationBox) {
      if (subjectScores.length === 0) {
        recommendationBox.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
            <span class="badge badge-info">Learning Status</span>
            <span class="text-xs text-muted">AI Insight</span>
          </div>
          <div class="font-bold text-sm" style="margin-bottom: 0.25rem;">New Student Account</div>
          <p class="text-xs text-muted" style="line-height: 1.5;">Welcome to SmartLearn! Your subject performance metrics will update here automatically as your teachers post grades and evaluations.</p>
        `;
      } else {
        // Find lowest performing subject
        const sorted = [...subjectScores].sort((a, b) => a.score - b.score);
        const weakest = sorted[0];

        let priorityText = "High Priority";
        let priorityClass = "badge-danger";
        let suggestionText = "";

        if (weakest.score < 60) {
          priorityText = "High Priority";
          priorityClass = "badge-danger";
          suggestionText = `${weakest.subject} is currently your lowest-scoring subject (${weakest.score}%). We strongly recommend scheduling extra revision time and reviewing foundational practice sets.`;
        } else if (weakest.score < 80) {
          priorityText = "Needs Improvement";
          priorityClass = "badge-warning";
          suggestionText = `${weakest.subject} appears to be your weakest subject (${weakest.score}%). Consider spending additional revision time on it to boost your overall GPA.`;
        } else {
          priorityText = "Strong Performance";
          priorityClass = "badge-success";
          suggestionText = `Outstanding academic performance! Your lowest subject is ${weakest.subject} at ${weakest.score}%. Keep up the great work!`;
        }

        recommendationBox.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <span class="badge ${priorityClass}">${priorityText}</span>
            <span class="text-xs text-muted">AI Insight</span>
          </div>
          <div class="font-bold text-sm" style="margin-bottom: 0.3rem;">Focus Subject: ${weakest.subject}</div>
          <p class="text-xs text-muted" style="line-height: 1.5;">"${suggestionText}"</p>
        `;
      }
    }
  },

  // 6. Render Upcoming Exams List
  renderExams(user) {
    const container = document.getElementById("upcoming-exams-container");
    if (!container) return;

    if (!user) {
      user = (typeof SmartLearnAuth !== "undefined") ? SmartLearnAuth.getCurrentUser() : null;
    }
    if (!user) return;

    const userClass = (user.className || user.class || "B.Tech CSE").toLowerCase();
    const userSection = (user.section || "A").toUpperCase();

    const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    const filtered = exams.filter(e => {
      const isApproved = (e.status === "approved" || !e.status || e.status === undefined);
      if (!isApproved) return false;

      const eClass = (e.className || e.class || "").toLowerCase();
      const uClass = userClass.toLowerCase();
      const matchClass = !eClass || eClass === uClass || uClass.includes(eClass) || eClass.includes(uClass);
      const matchSec = !e.section || e.section === "ALL" || e.section.toUpperCase() === userSection;
      return matchClass && matchSec;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = filtered.filter(e => new Date(e.examDate) >= today);

    if (upcoming.length === 0) {
      container.innerHTML = `<div class="empty-state-text" style="padding: 1.5rem; text-align: center;">No upcoming term exams scheduled.</div>`;
      return;
    }

    upcoming.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    container.innerHTML = upcoming.map(item => {
      const examDate = new Date(item.examDate);
      examDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

      return `
        <div class="assignment-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <span class="badge badge-primary text-xs" style="margin-bottom:0.25rem;">${item.subject}</span>
            <div class="font-bold text-sm" style="color: var(--text-main);">${item.title}</div>
            <div class="text-xs text-muted">${item.examDate} • ${item.startTime} - ${item.endTime} • Venue: ${item.room}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge ${diffDays === 0 ? 'badge-danger' : 'badge-warning'}">${diffDays === 0 ? "Today" : `In ${diffDays} day${diffDays > 1 ? 's' : ''}`}</span>
        </div>
      `;
    }).join("");
  },

  // 7. Render Dynamic Notifications & Notification Center
  renderNotifications(user) {
    if (typeof SmartLearnNotifications !== "undefined") {
      SmartLearnNotifications.init();
      SmartLearnNotifications.renderNotificationCenter(user);
    }
  },

  markNotificationRead(notificationId) {
    if (typeof SmartLearnNotifications !== "undefined") {
      SmartLearnNotifications.markRead(notificationId);
    }
  },

  // 10. Populate Student Profile & Settings Page
  populateProfilePage(user) {
    if (!user) user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const displayName = user.fullName || user.name || "Alex Kumar";
    const studentId = user.studentId || "SL-2026-894";
    const className = user.className || user.class || "B.Tech CSE";
    const section = user.section || "A";

    const nameInp = document.getElementById("prof-blocked-fullname");
    if (nameInp) nameInp.value = displayName;

    const emailInp = document.getElementById("prof-blocked-email");
    if (emailInp) emailInp.value = user.email || "student@classora.demo";

    const idInp = document.getElementById("prof-blocked-studentid");
    if (idInp) idInp.value = studentId;

    const classInp = document.getElementById("prof-blocked-class");
    if (classInp) classInp.value = className;

    const secInp = document.getElementById("prof-blocked-section");
    if (secInp) secInp.value = section;

    const bloodInp = document.getElementById("prof-blocked-bloodgroup");
    if (bloodInp) bloodInp.value = user.bloodGroup || "O+";

    const phoneInp = document.getElementById("prof-editable-phone");
    if (phoneInp && !phoneInp.value) phoneInp.value = user.phone || "+1 (555) 019-2834";

    // Generate student ID Card preview
    this.renderStudentIdCardPreview(user);
  },

  renderStudentIdCardPreview(user) {
    const cardBox = document.getElementById("student-id-card-preview");
    if (!cardBox) return;

    const displayName = user.fullName || user.name || "Alex Kumar";
    const studentId = user.studentId || "SL-2026-894";
    const className = user.className || user.class || "B.Tech CSE";
    const section = user.section || "A";
    const bloodGroup = document.getElementById("idcard-bloodgroup")?.value || user.bloodGroup || "O+";
    const address = document.getElementById("idcard-address")?.value || "124 Innovation Way, Academic Campus";
    const avatarSrc = user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80";

    cardBox.innerHTML = `
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #fff; border-radius: 16px; padding: 1.25rem; box-shadow: var(--shadow-lg); font-family: 'Inter', sans-serif; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 28px; height: 28px; background: #6366f1; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">SL</div>
            <div>
              <div style="font-weight: 800; font-size: 0.95rem; letter-spacing: 0.02em;">SmartLearn</div>
              <div style="font-size: 0.65rem; color: #cbd5e1;">Official Student Identity Card</div>
            </div>
          </div>
          <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff; font-size: 0.65rem;">Active Student</span>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <img src="${avatarSrc}" id="idcard-photo-img" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover; border: 2px solid #6366f1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
          <div style="display: flex; flex-direction: column; gap: 0.2rem;">
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #ffffff; margin: 0;">${displayName}</h3>
            <div style="font-size: 0.75rem; color: #818cf8; font-weight: 700;">Reg ID: ${studentId}</div>
            <div style="font-size: 0.75rem; color: #e2e8f0;">Program: <strong>${className}-${section}</strong></div>
            <div style="font-size: 0.725rem; color: #cbd5e1;">Blood Group: <strong style="color: #f87171;">${bloodGroup}</strong></div>
          </div>
        </div>

        <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; color: #94a3b8; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>📍 ${address}</div>
          <div style="font-weight: 700; color: #cbd5e1;">2025-2026</div>
        </div>
      </div>
    `;
  },

  requestPhoneOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    SmartLearnApp.openModal("otp-verification-modal");
  },

  requestPasswordOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    SmartLearnApp.openModal("otp-verification-modal");
  },

  verifyOtpSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const form = document.getElementById("otp-form-content");
    const success = document.getElementById("otp-success-content");
    if (form) form.style.display = "none";
    if (success) success.style.display = "block";
  },

  closeOtpModalSuccess() {
    SmartLearnApp.closeModal("otp-verification-modal");
    const form = document.getElementById("otp-form-content");
    const success = document.getElementById("otp-success-content");
    if (form) form.style.display = "block";
    if (success) success.style.display = "none";
    SmartLearnApp.showToast("Security verification completed!", "success");
  },

  moveOtpFocus(current, nextId) {
    if (current.value.length >= 1 && nextId) {
      document.getElementById(nextId)?.focus();
    }
  },

  generateIdCard(e) {
    if (e && e.preventDefault) e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    this.renderStudentIdCardPreview(user);
    SmartLearnApp.showToast("Student ID Card preview updated!", "success");
  },

  downloadIdCard() {
    SmartLearnApp.showToast("Downloading Official Student ID Card PDF...", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  },

  handlePhotoFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.getElementById("idcard-photo-img");
        if (img) img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  // 8. Render Study Materials
  renderStudyMaterials(user) {
    const container = document.getElementById("study-materials-container");
    if (!container) return;

    const materials = (SmartLearnStorage.getStudyMaterials ? SmartLearnStorage.getStudyMaterials() : []).filter(m => {
      const isPub = m.isPublished !== false;
      const matchClass = !m.classId || m.classId === (user.className || user.class) || m.className === (user.className || user.class);
      const matchSec = !m.section || m.section === user.section;
      return isPub && matchClass && matchSec;
    });

    if (materials.length === 0) {
      container.innerHTML = `<div class="empty-state-text" style="padding: 1rem; text-align: center;">No study materials available for your class yet.</div>`;
      return;
    }

    container.innerHTML = materials.map(item => {
      const subject = SmartLearnStorage.getSubjectById ? SmartLearnStorage.getSubjectById(item.subjectId) : null;
      const teacher = SmartLearnStorage.getUserById ? SmartLearnStorage.getUserById(item.teacherId) : null;

      let sizeText = item.size || "1.5 MB";
      if (item.fileSize) {
        sizeText = item.fileSize >= 1048576 ? (item.fileSize / 1048576).toFixed(1) + " MB" : Math.round(item.fileSize / 1024) + " KB";
      }

      return `
        <div class="assignment-item" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <div class="badge badge-primary" style="margin-bottom:0.2rem;">${(subject && subject.name) || item.subject || 'General'}</div>
            <div class="font-bold text-sm" style="color:var(--text-main);">${item.title}</div>
            <div class="text-xs text-muted">👤 ${(teacher && (teacher.fullName || teacher.name)) || item.teacher || 'Faculty'} • ${item.type || 'Doc'} (${sizeText})</div>
          </div>
          <div style="display: flex; gap: 0.35rem;">
            <a href="study-materials.html" class="btn btn-outline btn-sm">
              Explore All Materials &rarr;
            </a>
          </div>
        </div>
      `;
    }).join("");
  },

  // 9. Render Quizzes
  renderQuizzes(user) {
    const container = document.getElementById("quizzes-container");
    if (!container) return;

    const allQuizzes = SmartLearnStorage.get(STORAGE_KEYS.QUIZZES) || [];
    const attempts = SmartLearnStorage.get(STORAGE_KEYS.QUIZ_ATTEMPTS) || [];
    const userSection = (user.section || "A").toUpperCase();

    const quizzes = allQuizzes.filter(q => {
      if (q.studentId && q.studentId === user.id) return true;
      const qClass = q.className || q.classId || q.class || "B.Tech CSE";
      const matchDept = matchTeacherAndStudentDept({ department: qClass }, user);
      const qSec = (q.section || "ALL").toUpperCase();
      const matchSec = (qSec === "ALL" || qSec === userSection || !q.section);
      return matchDept && matchSec;
    });

    if (quizzes.length === 0) {
      container.innerHTML = `<div class="empty-state-text" style="padding: 1rem; text-align: center;">No active quizzes assigned to your section yet.</div>`;
      return;
    }

    container.innerHTML = quizzes.map(q => {
      const attempt = attempts.find(att => att.quizId === q.id && att.studentId === user.id);
      const isTaken = !!attempt;

      return `
        <div class="assignment-item" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <span class="badge badge-primary text-xs" style="margin-bottom:0.2rem;">${q.subjectName || q.subject || 'Quiz'}</span>
            <div class="font-bold text-sm" style="color:var(--text-main);">${q.title}</div>
            <div class="text-xs text-muted">⏱️ ${q.durationMinutes || 15} mins • 🎯 ${q.totalMarks || 20} Marks • ${q.className || 'B.Tech CSE'} (Sec ${q.section || 'ALL'})</div>
          </div>
          <div>
            ${isTaken ? `<span class="badge badge-success">Score: ${attempt.score}/${q.totalMarks || 20} (${attempt.percentage}%)</span>` : `
              <button class="btn btn-outline btn-sm" onclick="SmartLearnApp.showToast('Quiz session initialized!', 'info')">Take Quiz &rarr;</button>
            `}
        </div>
      `;
    }).join("");
  }
};

/**
 * SmartLearn - Central Notification Center & Automated Reminders Engine
 * Powers:
 * 1. Student Notification Center & Dropdown
 * 2. Parent Notification Center & Dropdown
 * 3. Assignment Deadline Reminders (Due Today <=24h / Due Tomorrow <=48h)
 * 4. Exam Reminders (Upcoming term exams in 1-3 days)
 * 5. Low Attendance Automatic Notifications (<75% mandatory threshold)
 * 6. Quiz Notifications (New published quizzes)
 * 7. Timetable Update Notifications (Class schedule updates)
 * 8. Central Notification Hub (Admin broadcast & system notification audit)
 */
const SmartLearnNotifications = {
  activeCategoryFilter: "all",

  init() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    // Run automated background scanners for deadline, exam, quiz, timetable, and attendance reminders
    this.runAutomatedRemindersScanner(user);

    // Initial render for current user
    this.renderNotificationCenter(user, this.activeCategoryFilter);
  },

  // Automated Background Reminders Scanner
  runAutomatedRemindersScanner(user) {
    if (!user) return;
    const role = (user.role || "").toLowerCase();

    // Determine target student ID(s)
    let studentIds = [];
    let studentUserMap = {};

    if (role === "student") {
      studentIds = [user.id];
      studentUserMap[user.id] = user;
    } else if (role === "parent") {
      const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
      const students = users.filter(u =>
        (u.role || "").toLowerCase() === "student" &&
        (u.studentId === user.studentId || u.id === user.studentId)
      );
      if (students.length > 0) {
        students.forEach(st => {
          studentIds.push(st.id);
          studentUserMap[st.id] = st;
        });
      } else {
        const seedStudent = users.find(u => (u.role || "").toLowerCase() === "student");
        if (seedStudent) {
          studentIds.push(seedStudent.id);
          studentUserMap[seedStudent.id] = seedStudent;
        }
      }
    }

    if (studentIds.length === 0) return;

    const allNotifications = SmartLearnStorage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    const todayStr = new Date().toISOString().split("T")[0];
    let hasNew = false;

    studentIds.forEach(stId => {
      const stUser = studentUserMap[stId] || user;
      const userClass = stUser.className || stUser.class || "B.Tech CSE";
      const notifyTargetUserId = user.id;
      const now = new Date();

      // --- a. Assignment Deadline Reminders (Due Today / Due Tomorrow) ---
      const assignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS) || [];
      const submissions = SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS) || [];
      const userSubmissions = submissions.filter(s => s.studentId === stId);

      const pendingAssignments = assignments.filter(a => {
        if (a.studentId && a.studentId !== stId) return false;
        const aClass = a.className || a.class || "";
        if (aClass && aClass !== userClass) return false;
        return !userSubmissions.some(s => s.assignmentId === a.id);
      });

      pendingAssignments.forEach(a => {
        if (!a.dueDate) return;
        const due = new Date(a.dueDate);
        due.setHours(23, 59, 59, 999);
        const diffHours = (due - now) / (1000 * 60 * 60);

        if (diffHours >= 0 && diffHours <= 24) {
          const key = `not_asgn_today_${a.id}_${notifyTargetUserId}_${todayStr}`;
          if (!allNotifications.some(n => n.id === key)) {
            allNotifications.unshift({
              id: key,
              userId: notifyTargetUserId,
              title: "🚨 Assignment Due Today!",
              message: `"${a.title}" (${a.subject || 'Coursework'}) is due today! Submit your assignment report before end of day.`,
              category: "deadlines",
              type: "urgent",
              createdAt: new Date().toISOString(),
              read: false
            });
            hasNew = true;
          }
        } else if (diffHours > 24 && diffHours <= 48) {
          const key = `not_asgn_tom_${a.id}_${notifyTargetUserId}_${todayStr}`;
          if (!allNotifications.some(n => n.id === key)) {
            allNotifications.unshift({
              id: key,
              userId: notifyTargetUserId,
              title: "⏳ Assignment Due Tomorrow",
              message: `"${a.title}" (${a.subject || 'Coursework'}) is due tomorrow (${a.dueDate}). Complete and upload your report.`,
              category: "deadlines",
              type: "warning",
              createdAt: new Date().toISOString(),
              read: false
            });
            hasNew = true;
          }
        }
      });

      // --- b. Upcoming Exam Reminders (In 1 to 3 days) ---
      const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
      exams.forEach(e => {
        if (!e.examDate) return;
        const examDate = new Date(e.examDate);
        examDate.setHours(0, 0, 0, 0);
        const todayZero = new Date();
        todayZero.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((examDate - todayZero) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
          const key = `not_exam_rem_${e.id}_${notifyTargetUserId}_${todayStr}`;
          if (!allNotifications.some(n => n.id === key)) {
            allNotifications.unshift({
              id: key,
              userId: notifyTargetUserId,
              title: "🎓 Upcoming Term Exam Alert",
              message: `"${e.title}" (${e.subject}) is scheduled ${diffDays === 0 ? 'TODAY' : `in ${diffDays} day(s)`} on ${new Date(e.examDate).toLocaleDateString()} (Venue: ${e.room || 'Examination Hall'}).`,
              category: "exams",
              type: "exam",
              createdAt: new Date().toISOString(),
              read: false
            });
            hasNew = true;
          }
        }
      });

      // --- c. Low Attendance Automatic Notifications (< 75% threshold) ---
      const attendance = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
      const userAtt = attendance.filter(att => att.studentId === stId);

      if (userAtt.length >= 3) {
        const presentCount = userAtt.filter(att => att.status === "present").length;
        const pct = Math.round((presentCount / userAtt.length) * 100);

        if (pct < 75) {
          const key = `not_att_low_${stId}_${notifyTargetUserId}_${todayStr}`;
          if (!allNotifications.some(n => n.id === key)) {
            allNotifications.unshift({
              id: key,
              userId: notifyTargetUserId,
              title: "⚠️ Low Attendance Automatic Warning",
              message: role === "parent"
                ? `Low Attendance Alert for ${stUser.fullName || stUser.name}: Overall attendance has fallen to ${pct}% (Below 75% mandatory threshold).`
                : `Your attendance is currently ${pct}% (${presentCount}/${userAtt.length} lectures). You are below the required 75% attendance threshold!`,
              category: "attendance",
              type: "danger",
              createdAt: new Date().toISOString(),
              read: false
            });
            hasNew = true;
          }
        }
      }

      // --- d. Quiz Notifications ---
      const quizzes = SmartLearnStorage.get(STORAGE_KEYS.QUIZZES) || [];
      quizzes.forEach(q => {
        const qClass = q.classId || q.className || "";
        if (q.published && (!qClass || qClass === userClass)) {
          const key = `not_quiz_pub_${q.id}_${notifyTargetUserId}`;
          if (!allNotifications.some(n => n.id === key)) {
            allNotifications.unshift({
              id: key,
              userId: notifyTargetUserId,
              title: "📝 New Quiz Published",
              message: `New practice quiz available: "${q.title}" (${q.subjectName || q.subject || 'Coursework'}). Duration: ${q.durationMinutes || 15} mins.`,
              category: "quizzes",
              type: "info",
              createdAt: new Date().toISOString(),
              read: false
            });
            hasNew = true;
          }
        }
      });

      // --- e. Timetable Update Notifications ---
      const timetable = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
      const userTt = timetable.filter(t => t.className === userClass);
      if (userTt.length > 0) {
        const key = `not_tt_upd_${userClass}_${notifyTargetUserId}`;
        if (!allNotifications.some(n => n.id === key)) {
          allNotifications.unshift({
            id: key,
            userId: notifyTargetUserId,
            title: "📅 Class Timetable Updated",
            message: `The official 8-period weekly timetable for ${userClass} has been updated. Check your updated schedule on your portal!`,
            category: "timetable",
            type: "info",
            createdAt: new Date().toISOString(),
            read: false
          });
          hasNew = true;
        }
      }
    });

    if (hasNew) {
      SmartLearnStorage.set(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    }
  },

  // Render Interactive Notification Center Modal & Dropdown
  renderNotificationCenter(user, category = "all") {
    if (!user) user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    this.activeCategoryFilter = category;

    const allNotifications = SmartLearnStorage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    const userNotifications = allNotifications.filter(n => n.userId === user.id);
    const unreadCount = userNotifications.filter(n => !n.read).length;

    // Update Header Bell Dots
    const dots = document.querySelectorAll(".notification-dot");
    dots.forEach(dot => {
      dot.style.display = unreadCount > 0 ? "block" : "none";
      dot.title = `${unreadCount} unread notification(s)`;
    });

    const listContainer = document.getElementById("notifications-list");
    if (!listContainer) return;

    // Filter by Category
    let filteredList = userNotifications;
    if (category === "unread") {
      filteredList = userNotifications.filter(n => !n.read);
    } else if (category === "deadlines") {
      filteredList = userNotifications.filter(n => n.category === "deadlines" || n.type === "urgent" || n.type === "warning");
    } else if (category === "exams") {
      filteredList = userNotifications.filter(n => n.category === "exams" || n.type === "exam");
    } else if (category === "attendance") {
      filteredList = userNotifications.filter(n => n.category === "attendance" || n.type === "danger");
    } else if (category === "quizzes") {
      filteredList = userNotifications.filter(n => n.category === "quizzes" || n.type === "quiz");
    } else if (category === "timetable") {
      filteredList = userNotifications.filter(n => n.category === "timetable");
    }

    let html = `
      <!-- Category Tabs & Quick Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.65rem;">
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-xs ${category === 'all' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem; padding: 0.2rem 0.5rem;" onclick="SmartLearnNotifications.renderNotificationCenter(null, 'all')">
            All (${userNotifications.length})
          </button>
          <button type="button" class="btn btn-xs ${category === 'unread' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem; padding: 0.2rem 0.5rem;" onclick="SmartLearnNotifications.renderNotificationCenter(null, 'unread')">
            Unread (${unreadCount})
          </button>
          <button type="button" class="btn ${category === 'deadlines' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem; padding: 0.2rem 0.5rem;" onclick="SmartLearnNotifications.renderNotificationCenter(null, 'deadlines')">
            🚨 Deadlines
          </button>
          <button type="button" class="btn ${category === 'exams' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem; padding: 0.2rem 0.5rem;" onclick="SmartLearnNotifications.renderNotificationCenter(null, 'exams')">
            🎓 Exams
          </button>
          <button type="button" class="btn ${category === 'attendance' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem; padding: 0.2rem 0.5rem;" onclick="SmartLearnNotifications.renderNotificationCenter(null, 'attendance')">
            ⚠️ Attendance
          </button>
        </div>

        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn btn-outline" style="font-size: 0.725rem; padding: 0.2rem 0.5rem;" onclick="SmartLearnNotifications.markAllRead('${user.id}')">
            ✓ Mark All Read
          </button>
          <button type="button" class="btn btn-outline" style="font-size: 0.725rem; padding: 0.2rem 0.5rem; color: var(--danger);" onclick="SmartLearnNotifications.clearAll('${user.id}')">
            🗑️ Clear
          </button>
        </div>
      </div>
    `;

    if (filteredList.length === 0) {
      html += `
        <div class="empty-state-text" style="padding: 2rem 1rem; text-align: center;">
          🔔 No ${category !== 'all' ? category : ''} notifications found.
        </div>
      `;
    } else {
      html += `<div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 420px; overflow-y: auto; padding-right: 0.25rem;">`;
      html += filteredList.map(n => {
        const timeAgo = this.formatRelativeTime(n.createdAt);
        let badgeClass = "badge-info";
        let icon = "🔔";

        if (n.type === "urgent" || n.type === "danger" || n.category === "attendance") {
          badgeClass = "badge-danger";
          icon = "🚨";
        } else if (n.type === "warning" || n.category === "deadlines") {
          badgeClass = "badge-warning";
          icon = "⏳";
        } else if (n.type === "exam" || n.category === "exams") {
          badgeClass = "badge-primary";
          icon = "🎓";
        } else if (n.category === "quizzes") {
          badgeClass = "badge-accent";
          icon = "📝";
        } else if (n.category === "timetable") {
          badgeClass = "badge-info";
          icon = "📅";
        }

        return `
          <div class="notification-item ${!n.read ? 'unread' : ''}" style="padding: 0.85rem; border-radius: 10px; border: 1px solid var(--border-color); background: ${!n.read ? 'rgba(79, 70, 229, 0.06)' : 'var(--bg-subtle)'}; cursor: pointer; transition: all 0.2s;" onclick="SmartLearnNotifications.markRead('${n.id}')">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 1.1rem;">${icon}</span>
                <span class="font-bold text-sm" style="color: var(--text-main);">${n.title}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge ${badgeClass}" style="font-size: 0.65rem;">${n.category || n.type || 'Notice'}</span>
                <span class="text-xs text-muted" style="font-size: 0.7rem;">${timeAgo}</span>
              </div>
            </div>
            <p class="text-xs text-muted" style="line-height: 1.4; margin-left: 1.5rem;">${n.message}</p>
          </div>
        `;
      }).join("");
      html += `</div>`;
    }

    listContainer.innerHTML = html;
  },

  markRead(notificationId) {
    const notifications = SmartLearnStorage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    const target = notifications.find(n => n.id === notificationId);
    if (target) {
      target.read = true;
      SmartLearnStorage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
      const user = SmartLearnAuth.getCurrentUser();
      this.renderNotificationCenter(user, this.activeCategoryFilter);
    }
  },

  markAllRead(userId) {
    const notifications = SmartLearnStorage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    let updated = false;
    notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updated = true;
      }
    });
    if (updated) {
      SmartLearnStorage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
      SmartLearnApp.showToast("All notifications marked as read! ✓", "success");
      const user = SmartLearnAuth.getCurrentUser();
      this.renderNotificationCenter(user, this.activeCategoryFilter);
    }
  },

  clearAll(userId) {
    if (!confirm("Clear notification history for your account?")) return;
    let notifications = SmartLearnStorage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    notifications = notifications.filter(n => n.userId !== userId);
    SmartLearnStorage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    SmartLearnApp.showToast("Notification history cleared.", "info");
    const user = SmartLearnAuth.getCurrentUser();
    this.renderNotificationCenter(user, "all");
  },

  formatRelativeTime(isoStr) {
    if (!isoStr) return "Just now";
    const date = new Date(isoStr);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 60) return "Just now";
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

/**
 * SmartLearn - Assignment Management Module Controller
 * Handles data retrieval, filtering, status calculations, assignment details view & submission lifecycle.
 */
const SmartLearnAssignments = {
  activeAssignmentId: null,

  init() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    // Header Greeting
    const greetingEl = document.getElementById("asgn-header-title");
    if (greetingEl) {
      greetingEl.innerText = `Good Morning, ${user.fullName || user.name || "Student"} 👋`;
    }

    // Populate Subject Filter Options dynamically
    this.populateSubjectFilter();

    // Bind Submission Form Submit
    const submitForm = document.getElementById("asgn-submit-form");
    if (submitForm) {
      submitForm.onsubmit = (e) => {
        e.preventDefault();
        SmartLearnAssignments.handleSubmissionFormSubmit(e);
      };
    }

    // Initial Render
    this.renderAssignmentModule();
  },

  populateSubjectFilter() {
    const filterSelect = document.getElementById("asgn-filter-subject");
    if (!filterSelect) return;

    const subjects = SmartLearnStorage.getSubjects();
    let html = `<option value="all">All Subjects</option>`;
    subjects.forEach(sub => {
      html += `<option value="${sub.id}">${sub.name} (${sub.code})</option>`;
    });
    filterSelect.innerHTML = html;
  },

  calculateDeadline(dueDateStr, dueTimeStr) {
    if (!dueDateStr) return { text: "No deadline", isOverdue: false, stateBadgeClass: "badge-secondary" };

    const now = new Date();
    const timeStr = dueTimeStr || "23:59";
    const dueDateTime = new Date(`${dueDateStr}T${timeStr}:00`);

    const diffMs = dueDateTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return { text: "Overdue", isOverdue: true, stateBadgeClass: "badge-danger", diffDays };
    } else if (diffHours <= 24) {
      return { text: diffHours <= 1 ? "Due in 1 hour" : `Due Today (${diffHours} hrs left)`, isOverdue: false, stateBadgeClass: "badge-warning", diffDays: 0 };
    } else if (diffDays === 1) {
      return { text: "Due Tomorrow", isOverdue: false, stateBadgeClass: "badge-warning", diffDays: 1 };
    } else {
      return { text: `Due in ${diffDays} days`, isOverdue: false, stateBadgeClass: "badge-info", diffDays };
    }
  },

  renderAssignmentModule() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const allAssignments = SmartLearnStorage.getAssignments();
    const allSubmissions = SmartLearnStorage.getSubmissions();

    const userClass = user.className || user.class || "B.Tech CSE";
    const userSec = user.section || "A";

    // 1. Filter student-specific assignments
    const studentAssignments = allAssignments.filter(a => {
      const classMatch = !a.classId || a.classId === userClass || a.className === userClass;
      const secMatch = !a.section || a.section === userSec;
      const studentMatch = !a.studentId || a.studentId === user.id;
      return classMatch && secMatch && studentMatch;
    });

    // 2. Map submissions & calculate status
    const mappedAssignments = studentAssignments.map(asgn => {
      const submission = allSubmissions.find(s => s.assignmentId === asgn.id && s.studentId === user.id);
      const deadline = this.calculateDeadline(asgn.dueDate, asgn.dueTime);

      let currentStatus = "pending";
      if (submission) {
        currentStatus = submission.status || "submitted"; // "submitted" or "graded"
      } else if (deadline.isOverdue) {
        currentStatus = "overdue";
      }

      const teacherObj = (asgn.teacherId ? SmartLearnStorage.getUserById(asgn.teacherId) : null) || {};
      const resolvedTeacherName = asgn.teacherName || asgn.createdBy || asgn.teacher || (teacherObj ? (teacherObj.fullName || teacherObj.name) : null) || "Faculty Instructor";
      const subject = SmartLearnStorage.getSubjectById(asgn.subjectId);

      return {
        ...asgn,
        maxMarks: asgn.maxMarks || asgn.totalMarks || 100,
        submission,
        deadline,
        computedStatus: currentStatus,
        teacherName: resolvedTeacherName,
        subjectName: subject.name || asgn.subject || "General",
        subjectCode: subject.code || ""
      };
    });

    // 3. Update Summary Cards Counts
    const totalCount = mappedAssignments.length;
    const pendingCount = mappedAssignments.filter(a => a.computedStatus === "pending").length;
    const submittedCount = mappedAssignments.filter(a => a.computedStatus === "submitted").length;
    const gradedCount = mappedAssignments.filter(a => a.computedStatus === "graded").length;
    const overdueCount = mappedAssignments.filter(a => a.computedStatus === "overdue").length;

    const elTotal = document.getElementById("asgn-total-count");
    const elPending = document.getElementById("asgn-pending-count");
    const elSubmitted = document.getElementById("asgn-submitted-count");
    const elGraded = document.getElementById("asgn-graded-count");
    const elOverdue = document.getElementById("asgn-overdue-count");

    if (elTotal) elTotal.innerText = totalCount;
    if (elPending) elPending.innerText = pendingCount;
    if (elSubmitted) elSubmitted.innerText = submittedCount;
    if (elGraded) elGraded.innerText = gradedCount;
    if (elOverdue) elOverdue.innerText = overdueCount;

    // 4. Read Filter Values
    const searchTerm = (document.getElementById("asgn-search-input")?.value || "").toLowerCase().trim();
    const filterStatus = document.getElementById("asgn-filter-status")?.value || "all";
    const filterSubject = document.getElementById("asgn-filter-subject")?.value || "all";
    const filterDate = document.getElementById("asgn-filter-date")?.value || "all";
    const sortBy = document.getElementById("asgn-sort-by")?.value || "newest";

    // 5. Apply Search & Filtering
    let filtered = mappedAssignments.filter(item => {
      // Search
      if (searchTerm) {
        const matchesTitle = item.title.toLowerCase().includes(searchTerm);
        const matchesSub = item.subjectName.toLowerCase().includes(searchTerm);
        const matchesTeach = item.teacherName.toLowerCase().includes(searchTerm);
        if (!matchesTitle && !matchesSub && !matchesTeach) return false;
      }

      // Status
      if (filterStatus !== "all" && item.computedStatus !== filterStatus) {
        return false;
      }

      // Subject
      if (filterSubject !== "all") {
        if (item.subjectId !== filterSubject && item.subjectName !== filterSubject) {
          return false;
        }
      }

      // Date Filter
      if (filterDate === "due-today") {
        if (item.deadline.text.indexOf("Due Today") === -1) return false;
      } else if (filterDate === "due-week") {
        if (item.deadline.diffDays > 7 || item.deadline.isOverdue) return false;
      } else if (filterDate === "due-later") {
        if (item.deadline.diffDays <= 7 || item.deadline.isOverdue) return false;
      } else if (filterDate === "overdue") {
        if (!item.deadline.isOverdue || item.submission) return false;
      }

      return true;
    });

    // 6. Apply Sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || b.assignedDate) - new Date(a.createdAt || a.assignedDate);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt || a.assignedDate) - new Date(b.createdAt || b.assignedDate);
      } else if (sortBy === "deadline-near") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === "deadline-far") {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (sortBy === "highest-marks") {
        return (b.maxMarks || 0) - (a.maxMarks || 0);
      } else if (sortBy === "lowest-marks") {
        return (a.maxMarks || 0) - (b.maxMarks || 0);
      }
      return 0;
    });

    // 7. Render Cards Container
    const cardsContainer = document.getElementById("asgn-cards-container");
    if (cardsContainer) {
      if (filtered.length === 0) {
        cardsContainer.innerHTML = `
          <div class="card text-center" style="grid-column: 1 / -1; padding: 3rem 1.5rem;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--primary)" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3 class="font-bold text-lg" style="color: var(--text-main);">No Assignments Found 🎉</h3>
            <p class="text-xs text-muted" style="margin-top: 0.35rem;">${searchTerm ? "No assignments match your search query or filter criteria." : "You have no pending assignments at the moment."}</p>
          </div>
        `;
      } else {
        cardsContainer.innerHTML = filtered.map(item => this.renderSingleAssignmentCard(item)).join("");
      }
    }

    // 8. Render Submissions History Table
    this.renderSubmissionsHistory(mappedAssignments.filter(a => a.submission));
  },

  renderSingleAssignmentCard(item) {
    let statusBadge = "";
    let actionButton = "";

    const isSubmitted = !!item.submission;
    const submittedDateStr = isSubmitted ? new Date(item.submission.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

    if (item.computedStatus === "graded") {
      statusBadge = `<span class="badge badge-success">✓ Graded: ${item.submission.marks}/${item.maxMarks}</span>`;
      actionButton = `
        <button type="button" class="btn btn-outline btn-sm" onclick="SmartLearnAssignments.openAssignmentDetailsModal('${item.id}')" style="border-color: var(--success); color: var(--success); background: rgba(16, 185, 129, 0.08); font-weight: 600;">
          🔒 Graded on ${submittedDateStr}
        </button>
      `;
    } else if (item.computedStatus === "submitted") {
      statusBadge = `<span class="badge badge-primary">✓ Submitted on ${submittedDateStr}</span>`;
      actionButton = `
        <button type="button" class="btn btn-outline btn-sm" onclick="SmartLearnAssignments.openAssignmentDetailsModal('${item.id}')" style="border-color: var(--success); color: var(--success); background: rgba(16, 185, 129, 0.08); font-weight: 600;">
          🔒 Submitted on ${submittedDateStr}
        </button>
      `;
    } else if (item.computedStatus === "overdue") {
      statusBadge = `<span class="badge badge-danger">Overdue</span>`;
      actionButton = `
        <button type="button" class="btn btn-primary btn-sm" onclick="SmartLearnAssignments.openAssignmentDetailsModal('${item.id}')">
          View & Submit &rarr;
        </button>
      `;
    } else {
      statusBadge = `<span class="${item.deadline.stateBadgeClass}">${item.deadline.text}</span>`;
      actionButton = `
        <button type="button" class="btn btn-primary btn-sm" onclick="SmartLearnAssignments.openAssignmentDetailsModal('${item.id}')">
          View & Submit &rarr;
        </button>
      `;
    }

    return `
      <div class="asgn-card">
        <div>
          <div class="asgn-card-top">
            <span class="asgn-subject-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              ${item.subjectName} ${item.subjectCode ? `(${item.subjectCode})` : ''}
            </span>
            ${statusBadge}
          </div>

          <h3 class="asgn-card-title">${item.title}</h3>
          <p class="text-xs text-muted" style="margin-top: 0.4rem; line-clamp: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${item.description || "No description provided."}
          </p>
        </div>

        <div>
          <div class="asgn-card-meta">
            <div class="asgn-meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Faculty: <strong>${item.teacherName}</strong></span>
            </div>
            <div class="asgn-meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Due: <strong>${item.dueDate} (${item.dueTime || '23:59'})</strong></span>
            </div>
            <div class="asgn-meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>Max Marks: <strong>${item.maxMarks || 100} pts</strong></span>
            </div>
          </div>

          <div class="asgn-card-footer" style="margin-top: 0.85rem;">
            <div class="text-xs text-muted">
              ${isSubmitted ? `<span style="color:var(--success); font-weight:600;">🔒 Submission Blocked</span>` : (item.allowLateSubmission ? `<span style="color:var(--success);">Late Submission Allowed</span>` : `<span style="color:var(--danger);">Strict Deadline</span>`)}
            </div>
            ${actionButton}
          </div>
        </div>
      </div>
    `;
  },

  renderSubmissionsHistory(submittedItems) {
    const historyContainer = document.getElementById("asgn-history-container");
    if (!historyContainer) return;

    if (submittedItems.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-state-text" style="padding: 1.5rem; text-align: center;">No completed or submitted assignments recorded yet.</div>
      `;
      return;
    }

    historyContainer.innerHTML = `
      <div class="asgn-table-container">
        <table class="asgn-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Subject</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Marks</th>
              <th>Teacher Feedback</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${submittedItems.map(item => {
      const sub = item.submission;
      const dateFormatted = new Date(sub.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
      const marksText = sub.marks !== null ? `<strong>${sub.marks}</strong> / ${item.maxMarks}` : `<span class="text-muted">Pending Grade</span>`;
      const feedbackText = sub.teacherFeedback ? `<em>"${sub.teacherFeedback}"</em>` : `<span class="text-muted">No feedback yet</span>`;

      return `
                <tr>
                  <td>
                    <div class="font-bold">${item.title}</div>
                    <div class="text-xs text-muted">📎 ${sub.fileName || 'Attached document'}</div>
                  </td>
                  <td><span class="badge badge-primary">${item.subjectName}</span></td>
                  <td><strong style="color:var(--text-main);">${dateFormatted}</strong></td>
                  <td><span class="badge ${sub.status === 'graded' ? 'badge-success' : 'badge-info'}">🔒 ${sub.status.toUpperCase()}</span></td>
                  <td>${marksText}</td>
                  <td class="text-xs">${feedbackText}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="SmartLearnAssignments.openAssignmentDetailsModal('${item.id}')">View Record</button>
                  </td>
                </tr>
              `;
    }).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  openAssignmentDetailsModal(assignmentId) {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const allAssignments = SmartLearnStorage.getAssignments();
    const allSubmissions = SmartLearnStorage.getSubmissions();

    const asgn = allAssignments.find(a => a.id === assignmentId);
    if (!asgn) return;

    const submission = allSubmissions.find(s => s.assignmentId === assignmentId && s.studentId === user.id);
    const teacherObj = (asgn.teacherId ? SmartLearnStorage.getUserById(asgn.teacherId) : null) || {};
    const resolvedTeacherName = asgn.teacherName || asgn.createdBy || asgn.teacher || (teacherObj ? (teacherObj.fullName || teacherObj.name) : null) || "Faculty Instructor";
    const subject = SmartLearnStorage.getSubjectById(asgn.subjectId);
    const deadline = this.calculateDeadline(asgn.dueDate, asgn.dueTime);

    this.activeAssignmentId = assignmentId;
    SmartLearnAssignments.activeAssignmentId = assignmentId;

    // Set Modal Fields
    const titleEl = document.getElementById("modal-asgn-title");
    const subEl = document.getElementById("modal-asgn-subject");
    const teachEl = document.getElementById("modal-asgn-teacher");
    const dueEl = document.getElementById("modal-asgn-duedate");
    const marksEl = document.getElementById("modal-asgn-maxmarks");
    const descEl = document.getElementById("modal-asgn-description");
    const instEl = document.getElementById("modal-asgn-instructions");

    const subjectName = subject.name || asgn.subject || "General";
    const subjectCode = subject.code || asgn.subjectCode || "";
    const maxMarksVal = asgn.maxMarks || asgn.totalMarks || 100;

    if (titleEl) titleEl.innerText = asgn.title;
    if (subEl) subEl.innerText = subjectCode ? `${subjectName} (${subjectCode})` : subjectName;
    if (teachEl) teachEl.innerText = resolvedTeacherName;
    if (dueEl) dueEl.innerText = `${asgn.dueDate} at ${asgn.dueTime || '23:59'}`;
    if (marksEl) marksEl.innerText = `${maxMarksVal} Points`;
    if (descEl) descEl.innerText = asgn.description || "No specific details provided.";
    if (instEl) instEl.innerText = asgn.instructions || "Submit your completed coursework document before the deadline.";

    // Render Resources
    const resContainer = document.getElementById("modal-asgn-resources");
    if (resContainer) {
      if (asgn.resources && asgn.resources.length > 0) {
        resContainer.innerHTML = asgn.resources.map(r => `
          <a href="${r.url || '#'}" class="asgn-resource-pill" onclick="SmartLearnApp.showToast('Downloading resource: ${r.name}', 'info'); return false;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${r.name} (${r.type || 'File'})
          </a>
        `).join("");
      } else {
        resContainer.innerHTML = `<span class="text-xs text-muted">No resources attached.</span>`;
      }
    }

    // Submission Form & Status View (Blocked after submission)
    const statusBox = document.getElementById("modal-asgn-submission-status");
    const submitForm = document.getElementById("asgn-submit-form");
    const fileInput = document.getElementById("asgn-modal-file-input");
    const commentsInput = document.getElementById("asgn-modal-comments");
    const submitBtn = document.getElementById("modal-asgn-submit-btn");

    if (submission) {
      const submittedDateFormatted = new Date(submission.submittedAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      if (statusBox) {
        statusBox.innerHTML = `
          <div class="asgn-blocked-banner">
            <div class="blocked-header">
              <span class="blocked-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Assignment Submitted & Blocked
              </span>
              <span class="badge badge-success">✓ Turned In</span>
            </div>
            <div class="blocked-detail">
              📅 <strong>Submitted Date:</strong> ${submittedDateFormatted}
            </div>
            <div class="blocked-detail">
              📎 <strong>Attached File:</strong> ${submission.fileName || 'Assignment_Solution.pdf'}
            </div>
            ${submission.comments ? `<div class="blocked-detail">💬 <strong>Comments:</strong> "${submission.comments}"</div>` : ''}
            ${submission.status === 'graded' ? `
              <div class="graded-score-box" style="margin-top: 0.85rem; padding: 0.85rem; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); border-radius: 10px; color: var(--success);">
                <div style="font-size: 1rem; font-weight: 700;">🏆 Evaluation Score: ${submission.marks} / ${maxMarksVal}</div>
                <div style="font-size: 0.85rem; margin-top: 0.35rem; color: var(--text-main);">💬 <strong>Faculty Feedback:</strong> "${submission.teacherFeedback || 'Good job!'}"</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Block form inputs after submission
      if (fileInput) { fileInput.disabled = true; fileInput.style.display = "none"; }
      if (commentsInput) { commentsInput.disabled = true; commentsInput.style.display = "none"; }

      let lockedNotice = document.getElementById("modal-asgn-locked-notice");
      if (!lockedNotice) {
        lockedNotice = document.createElement("div");
        lockedNotice.id = "modal-asgn-locked-notice";
        lockedNotice.className = "submission-locked-notice";
        if (submitForm) submitForm.insertBefore(lockedNotice, submitBtn.parentElement);
      }
      lockedNotice.style.display = "block";
      lockedNotice.innerHTML = `🔒 Submission recorded on <strong>${submittedDateFormatted}</strong>. This assignment is now blocked from further edits.`;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.type = "button";
        submitBtn.onclick = null;
        submitBtn.innerHTML = "🔒 Submission Blocked";
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";
      }

    } else {
      if (statusBox) {
        statusBox.innerHTML = `
          <div class="text-xs text-muted" style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 10px; border: 1px solid var(--border-color);">
            💡 Choose your coursework file (.pdf, .zip, .docx) below and click Submit Assignment. Once submitted, your response will be recorded with the timestamp and locked.
          </div>
        `;
      }

      // Unblock form inputs for fresh submission
      if (fileInput) { fileInput.disabled = false; fileInput.style.display = "block"; fileInput.value = ""; }
      if (commentsInput) { commentsInput.disabled = false; commentsInput.style.display = "block"; commentsInput.value = ""; }

      const lockedNotice = document.getElementById("modal-asgn-locked-notice");
      if (lockedNotice) lockedNotice.style.display = "none";

      if (submitBtn) {
        if (deadline.isOverdue && !asgn.allowLateSubmission) {
          submitBtn.disabled = true;
          submitBtn.type = "button";
          submitBtn.onclick = null;
          submitBtn.innerText = "Submission Closed (Overdue)";
          submitBtn.style.opacity = "0.6";
        } else {
          submitBtn.disabled = false;
          submitBtn.type = "submit";
          submitBtn.onclick = (e) => {
            e.preventDefault();
            SmartLearnAssignments.handleSubmissionFormSubmit(e);
          };
          submitBtn.innerText = deadline.isOverdue ? "Submit Late Assignment" : "Submit Assignment";
          submitBtn.style.opacity = "1";
          submitBtn.style.cursor = "pointer";
        }
      }
    }

    SmartLearnApp.openModal("assignment-detail-modal");
  },

  handleSubmissionFormSubmit(e) {
    if (e) e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    const assignmentId = this.activeAssignmentId || SmartLearnAssignments.activeAssignmentId;
    if (!user || !assignmentId) return;

    // Check if already submitted & blocked
    const allSubmissions = SmartLearnStorage.getSubmissions();
    const existing = allSubmissions.find(s => s.assignmentId === assignmentId && s.studentId === user.id);
    if (existing) {
      SmartLearnApp.showToast("This assignment has already been submitted and blocked.", "warning");
      return;
    }

    const fileInput = document.getElementById("asgn-modal-file-input");
    const commentsInput = document.getElementById("asgn-modal-comments");

    let fileName = "Solution_Document.pdf";
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      fileName = fileInput.files[0].name;
    }

    const comments = commentsInput ? commentsInput.value.trim() : "";
    const submittedTimestamp = new Date().toISOString();

    const submissionRecord = {
      id: "subm_" + Date.now(),
      assignmentId: assignmentId,
      studentId: user.id,
      submittedAt: submittedTimestamp,
      fileName: fileName,
      fileData: "",
      comments: comments,
      status: "submitted",
      marks: null,
      teacherFeedback: "",
      gradedAt: null
    };

    allSubmissions.push(submissionRecord);
    SmartLearnStorage.saveSubmissions(allSubmissions);

    const formattedDate = new Date(submittedTimestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    SmartLearnApp.showToast(`Assignment submitted successfully on ${formattedDate}! Submission is now blocked. 🎉`, "success");
    SmartLearnApp.closeModal("assignment-detail-modal");

    if (commentsInput) commentsInput.value = "";
    if (fileInput) fileInput.value = "";

    this.renderAssignmentModule();
  }
};

/**
 * SmartLearn - Teacher Assignment & Grading Controller
 * Connects student submissions to teacher view, enables grading with score + feedback,
 * and syncs result back to student portal & gradebook.
 */
const SmartLearnTeacherAssignments = {
  activeSubmissionId: null,

  init() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "Teacher" && user.role !== "admin")) return;

    this.renderTeacherDashboard();
    this.populateTeacherProfilePage(user);
  },

  publishAssignment(e) {
    if (e) e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const title = document.getElementById("asgn-title")?.value.trim();
    const subject = document.getElementById("asgn-subject")?.value.trim() || (user.subject || "Computer Science");
    const classId = document.getElementById("asgn-class")?.value || "B.Tech CSE";
    const section = document.getElementById("asgn-section")?.value || "ALL";
    const dueDate = document.getElementById("asgn-duedate")?.value || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0];
    const maxMarks = parseInt(document.getElementById("asgn-maxmarks")?.value) || 100;
    const desc = document.getElementById("asgn-desc")?.value.trim() || "";

    if (!title) {
      SmartLearnApp.showToast("Please enter an assignment title!", "warning");
      return;
    }

    const teacherFullName = user.fullName || user.name || "Faculty Instructor";
    const teacherUserId = user.id || user.uid || "";

    const assignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS) || [];
    const newAsgn = {
      id: "assign_" + Date.now(),
      title: title,
      subject: subject,
      className: classId,
      classId: classId,
      section: section,
      dueDate: dueDate,
      maxMarks: maxMarks,
      description: desc,
      status: "pending",
      teacherId: teacherUserId,
      teacherName: teacherFullName,
      createdBy: teacherFullName,
      createdAt: new Date().toISOString()
    };

    assignments.unshift(newAsgn);
    SmartLearnStorage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);

    sendNotificationToSection(classId, section, "New Assignment Published 📘", `${teacherFullName} published assignment '${title}' (${subject}) for ${classId} - ${section === 'ALL' ? 'All Sections' : 'Sec ' + section}. Due: ${dueDate}.`);

    SmartLearnApp.showToast(`Assignment '${title}' published for ${classId} ${section === 'ALL' ? 'All Sections' : 'Sec ' + section}! 🎉`, "success");
    SmartLearnApp.closeModal("create-assignment-modal");

    if (document.getElementById("asgn-title")) document.getElementById("asgn-title").value = "";
    if (document.getElementById("asgn-desc")) document.getElementById("asgn-desc").value = "";

    if (this.renderTeacherDashboard) this.renderTeacherDashboard();
  },

  populateTeacherProfilePage(user) {
    if (!user) user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const displayName = user.fullName || user.name || "Dr. Priya Sharma";
    const employeeId = user.employeeId || "TCH-2026-042";
    const department = user.department || "Computer Science & Engineering";
    const bloodGroup = user.bloodGroup || "O+";
    const gender = user.gender || "Female";
    const handledClasses = user.handledClasses || "B.Tech CSE - Sec A, B.Tech IT - Sec B";
    const phone = user.phone || "+91 98765 43210";
    const email = user.email || "teacher@classora.demo";

    // Header / Profile Card Info
    const cardName = document.getElementById("prof-teacher-card-name");
    if (cardName) cardName.innerText = displayName;

    const cardRole = document.getElementById("prof-teacher-card-role");
    if (cardRole) cardRole.innerText = `Faculty • ${department}`;

    const cardEmpId = document.getElementById("prof-teacher-card-empid");
    if (cardEmpId) cardEmpId.innerText = `Emp ID: ${employeeId}`;

    const avatarImg = document.getElementById("prof-teacher-avatar-img");
    if (avatarImg && user.avatar) avatarImg.src = user.avatar;

    // Blocked / System Locked Fields
    const blockedEmpId = document.getElementById("prof-teacher-empid");
    if (blockedEmpId) blockedEmpId.value = employeeId;

    const blockedName = document.getElementById("prof-teacher-fullname");
    if (blockedName) blockedName.value = displayName;

    const blockedDept = document.getElementById("prof-teacher-department");
    if (blockedDept) blockedDept.value = department;

    const blockedBlood = document.getElementById("prof-teacher-bloodgroup");
    if (blockedBlood) blockedBlood.value = bloodGroup;

    const blockedGender = document.getElementById("prof-teacher-gender");
    if (blockedGender) blockedGender.value = gender;

    const blockedClasses = document.getElementById("prof-teacher-classes");
    if (blockedClasses) blockedClasses.value = handledClasses;

    const blockedEmail = document.getElementById("prof-teacher-email");
    if (blockedEmail) blockedEmail.value = email;

    // Editable Mobile Number Field
    const editPhone = document.getElementById("prof-teacher-phone");
    if (editPhone) editPhone.value = phone;
  },

  renderTeacherDashboard() {
    const currentTeacher = SmartLearnAuth.getCurrentUser();
    const isDemoTeacher = !currentTeacher || (currentTeacher.id === "usr_teacher_01" || currentTeacher.email === "teacher@classora.demo");

    const submissions = SmartLearnStorage.getSubmissions() || [];
    const assignments = SmartLearnStorage.getAssignments() || [];
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const timetable = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const grades = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];

    // Filter assignments created by or belonging to this teacher
    const teacherAssignments = currentTeacher ? assignments.filter(a => {
      if (a.teacherId && a.teacherId === currentTeacher.id) return true;
      if (a.createdBy && (a.createdBy === currentTeacher.fullName || a.createdBy === currentTeacher.name || a.createdBy === currentTeacher.email)) return true;
      if (a.teacherName && (a.teacherName === currentTeacher.fullName || a.teacherName === currentTeacher.name)) return true;
      return isDemoTeacher;
    }) : [];

    // Filter submissions corresponding to this teacher's assignments
    const teacherSubmissions = currentTeacher ? submissions.filter(s => {
      if (isDemoTeacher) return true;
      return teacherAssignments.some(a => a.id === s.assignmentId);
    }) : [];

    // Filter timetable for this teacher
    const teacherTimetable = currentTeacher ? timetable.filter(t => {
      if (t.teacherId && t.teacherId === currentTeacher.id) return true;
      if (t.teacher && (t.teacher === currentTeacher.fullName || t.teacher === currentTeacher.name)) return true;
      return isDemoTeacher;
    }) : [];

    // Filter enrolled/department students for this teacher
    const departmentStudents = currentTeacher ? users.filter(u => {
      if ((u.role || "").toLowerCase() !== "student") return false;
      if (u.registeredBy === currentTeacher.id || u.teacherId === currentTeacher.id) return true;
      if (isDemoTeacher) return matchTeacherAndStudentDept(currentTeacher, u);
      return false;
    }) : [];

    // Summary Metrics
    const pendingCount = teacherSubmissions.filter(s => s.status === "submitted" || !s.status).length;
    const gradedCount = teacherSubmissions.filter(s => s.status === "graded").length;

    // 1. Total Enrolled Students
    const statTotalStudentsEl = document.getElementById("teacher-stat-total-students");
    if (statTotalStudentsEl) statTotalStudentsEl.innerText = departmentStudents.length;

    // 2. Today's Classes
    const statTodayClassesEl = document.getElementById("teacher-stat-today-classes");
    if (statTodayClassesEl) statTodayClassesEl.innerText = teacherTimetable.length;

    // 3. Pending Submissions
    const statPendingEl = document.getElementById("teacher-stat-pending-count");
    if (statPendingEl) statPendingEl.innerText = pendingCount;

    // 4. Avg Class Performance
    const statAvgPerfEl = document.getElementById("teacher-stat-avg-performance");
    if (statAvgPerfEl) {
      if (isDemoTeacher) {
        statAvgPerfEl.innerText = "84%";
      } else {
        const teacherGrades = grades.filter(g => departmentStudents.some(s => s.id === g.studentId));
        if (teacherGrades.length > 0) {
          const sum = teacherGrades.reduce((acc, g) => acc + ((g.scoredMarks / (g.maxMarks || 100)) * 100), 0);
          statAvgPerfEl.innerText = `${Math.round(sum / teacherGrades.length)}%`;
        } else if (gradedCount > 0) {
          const gradedSubs = teacherSubmissions.filter(s => s.status === "graded");
          const sum = gradedSubs.reduce((acc, s) => acc + ((s.marks / (s.maxMarks || 100)) * 100), 0);
          statAvgPerfEl.innerText = `${Math.round(sum / gradedSubs.length)}%`;
        } else {
          statAvgPerfEl.innerText = "--";
        }
      }
    }

    const totalAsgnEl = document.getElementById("teacher-asgn-total-count");
    if (totalAsgnEl) totalAsgnEl.innerText = teacherAssignments.length;

    const receivedAsgnEl = document.getElementById("teacher-asgn-received-count");
    if (receivedAsgnEl) receivedAsgnEl.innerText = teacherSubmissions.length;

    const pendingStatEl = document.getElementById("teacher-asgn-pending-stat");
    if (pendingStatEl) pendingStatEl.innerText = pendingCount;

    const gradedStatEl = document.getElementById("teacher-asgn-graded-stat");
    if (gradedStatEl) gradedStatEl.innerText = gradedCount;

    // 1. Render Recent Submissions List on Dashboard Overview Widget
    const summaryContainer = document.getElementById("teacher-recent-submissions-list");
    if (summaryContainer) {
      if (teacherSubmissions.length === 0) {
        summaryContainer.innerHTML = `
          <div class="empty-state-text" style="padding: 1.5rem; text-align: center;">
            No student submissions received yet.
          </div>
        `;
      } else {
        const sortedSubmissions = [...teacherSubmissions].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5);
        let summaryHtml = "";
        sortedSubmissions.forEach(sub => {
          const student = users.find(u => u.id === sub.studentId) || { fullName: sub.studentName || sub.submittedByName || "Enrolled Student", className: sub.className || "B.Tech CSE", section: sub.section || "A" };
          const asgn = assignments.find(a => a.id === sub.assignmentId) || { title: "Coursework Assignment", maxMarks: 100 };

          const isGraded = sub.status === "graded";
          const statusBadge = isGraded
            ? `<span class="badge badge-success">Graded (${sub.marks}/${asgn.maxMarks || 100})</span>`
            : `<span class="badge badge-warning">Needs Grading</span>`;

          const formattedTime = new Date(sub.submittedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          summaryHtml += `
            <div class="assignment-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem; border-bottom: 1px solid var(--border-color);">
              <div>
                <div class="font-bold text-sm" style="color: var(--text-main);">${student.fullName || student.name}</div>
                <div class="text-xs text-muted" style="margin-top: 0.15rem;">
                  📘 ${asgn.title} • ${student.className || 'B.Tech CSE'}-${student.section || 'A'}
                </div>
                <div class="text-xs text-muted" style="margin-top: 0.15rem;">
                  📎 Attached: <strong>${sub.fileName || 'Solution.pdf'}</strong>
                </div>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem;">
                ${statusBadge}
                <div class="text-xs text-muted">${formattedTime}</div>
                <button type="button" class="btn ${isGraded ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="SmartLearnTeacherAssignments.openGradeModal('${sub.id}')" style="margin-top: 0.25rem;">
                  ${isGraded ? 'Edit Grade ✏️' : 'Evaluate & Grade 🎓'}
                </button>
              </div>
            </div>
          `;
        });
        summaryContainer.innerHTML = summaryHtml;
      }
    }

    // 1b. Dynamically render Class Performance Overview Widget based on logged in teacher's handledClasses
    const perfContainer = document.getElementById("teacher-overview-class-perf-list");
    if (perfContainer) {
      if (!isDemoTeacher && departmentStudents.length === 0 && teacherAssignments.length === 0) {
        perfContainer.innerHTML = `
          <div class="empty-state-text" style="padding: 1.5rem; text-align: center;">
            No class performance data recorded yet.
          </div>
        `;
      } else {
        const handledStr = (currentTeacher && currentTeacher.handledClasses)
          ? currentTeacher.handledClasses
          : ((currentTeacher && currentTeacher.department) ? `B.Tech ${currentTeacher.department}-A, B.Tech ${currentTeacher.department}-B` : "B.Tech CSE-A, B.Tech CSE-B");
        
        const classList = handledStr.split(",").map(c => c.trim()).filter(Boolean);
        const allGrades = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];
        const allAttendance = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];

        perfContainer.innerHTML = classList.map((cls, idx) => {
          const classGrades = allGrades.filter(g => g.className === cls || cls.toLowerCase().includes((g.className || "").toLowerCase()));
          let avgMark = isDemoTeacher ? ((85 + (idx * 3)) % 95) : 0;
          if (classGrades.length > 0) {
            const sum = classGrades.reduce((acc, g) => acc + ((g.scoredMarks / (g.maxMarks || 100)) * 100), 0);
            avgMark = Math.round(sum / classGrades.length);
          }

          const classAtt = allAttendance.filter(a => a.className === cls || cls.toLowerCase().includes((a.className || "").toLowerCase()));
          let attRate = isDemoTeacher ? ((90 + (idx * 2)) % 98) : 0;
          if (classAtt.length > 0) {
            const present = classAtt.filter(a => a.status === "present").length;
            attRate = Math.round((present / classAtt.length) * 100);
          }

          const studentCount = departmentStudents.filter(s => s.className === cls || cls.toLowerCase().includes((s.className || "").toLowerCase())).length || (isDemoTeacher ? (35 + idx * 4) : 0);

          return `
            <div style="padding: 0.85rem; background-color: var(--bg-subtle); border-radius: var(--radius-md);">
              <div style="display: flex; justify-content: space-between;" class="font-bold text-sm">
                <span>${cls}</span>
                <span class="text-primary">${avgMark > 0 ? avgMark + '%' : '--'} Avg</span>
              </div>
              <div class="text-xs text-muted" style="margin-top:0.2rem;">Attendance: ${attRate > 0 ? attRate + '%' : '--'} • ${studentCount} Students</div>
            </div>
          `;
        }).join("");
      }
    }

    // 1c. Class Coordinator Portal Rendering for Teacher Dashboard
    const coordPortalContainer = document.getElementById("teacher-coordinator-portal-container");
    if (coordPortalContainer && currentTeacher) {
      const classes = SmartLearnStorage.getClasses();
      const coordClass = classes.find(c =>
        c.coordinatorId === currentTeacher.id ||
        (c.coordinatorName && (currentTeacher.fullName || currentTeacher.name) && c.coordinatorName.toLowerCase() === (currentTeacher.fullName || currentTeacher.name).toLowerCase()) ||
        (currentTeacher.coordinatorClass === c.className && currentTeacher.coordinatorSection === c.section)
      );

      if (coordClass) {
        const coordStudents = users.filter(u =>
          (u.role || "").toLowerCase() === "student" &&
          (u.className === coordClass.className || u.class === coordClass.className) &&
          (u.section === coordClass.section || (!u.section && coordClass.section === "A"))
        );

        coordPortalContainer.style.display = "block";
        coordPortalContainer.innerHTML = `
          <div class="card" style="border: 2px solid var(--primary); background: linear-gradient(135deg, rgba(79,70,229,0.05) 0%, rgba(99,102,241,0.02) 100%); padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge badge-success" style="font-size: 0.8rem; font-weight: 700;">🌟 Nominated Class Coordinator</span>
                  <span class="badge badge-primary">${coordClass.department || 'Academic Stream'} Stream</span>
                </div>
                <h2 class="font-bold text-xl" style="color: var(--text-main); margin-top: 0.4rem;">
                  ${coordClass.className} - Section ${coordClass.section} Class Roster (${coordStudents.length} Students)
                </h2>
                <div class="text-xs text-muted" style="margin-top: 0.15rem;">
                  As Class Coordinator, you have administrative oversight of this class section and can broadcast direct announcements to all class members.
                </div>
              </div>
              <button class="btn btn-primary" onclick="SmartLearnTeacherAssignments.openCoordinatorNoticeModal('${coordClass.className}', '${coordClass.section}')">
                📢 Broadcast Notice to My Class
              </button>
            </div>

            <!-- Coordinated Students Roster Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem; max-height: 320px; overflow-y: auto; padding-right: 0.35rem;">
              ${coordStudents.length === 0 ? '<div class="empty-state-text" style="grid-column: 1 / -1; padding: 1.5rem; text-align: center;">No students currently assigned to your coordinated class section.</div>' : coordStudents.map(st => `
                <div style="padding: 0.75rem; background: var(--bg-subtle); border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.6rem;">
                  <img src="${st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                  <div style="overflow: hidden;">
                    <div class="font-bold text-xs" style="color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${st.fullName || st.name}</div>
                    <div class="text-xs text-muted" style="font-size: 0.68rem;">ID: ${st.studentId || st.id}</div>
                    <div class="text-xs text-primary" style="font-size: 0.68rem;">✉️ ${st.email}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        coordPortalContainer.style.display = "none";
      }
    }

    // 2. Render Full Submissions Roster inside #assignments tab
    const detailedContainer = document.getElementById("teacher-submissions-container");
    if (detailedContainer) {
      const searchTerm = document.getElementById("teacher-asgn-search")?.value.toLowerCase().trim() || "";
      const classFilter = document.getElementById("teacher-asgn-class-filter")?.value || "all";
      const statusFilter = document.getElementById("teacher-asgn-status-filter")?.value || "all";

      let filteredSubmissions = [...submissions];

      // Apply Search Filter
      if (searchTerm) {
        filteredSubmissions = filteredSubmissions.filter(sub => {
          const student = users.find(u => u.id === sub.studentId) || { fullName: sub.studentName || sub.submittedByName || "Enrolled Student", studentId: sub.studentId || "STU-N/A" };
          const asgn = assignments.find(a => a.id === sub.assignmentId) || { title: "Coursework Assignment" };
          return (
            (student.fullName || "").toLowerCase().includes(searchTerm) ||
            (student.studentId || "").toLowerCase().includes(searchTerm) ||
            (asgn.title || "").toLowerCase().includes(searchTerm) ||
            (sub.fileName || "").toLowerCase().includes(searchTerm)
          );
        });
      }

      // Apply Class Filter
      if (classFilter !== "all") {
        filteredSubmissions = filteredSubmissions.filter(sub => {
          const student = users.find(u => u.id === sub.studentId) || {};
          return student.className === classFilter || student.class === classFilter;
        });
      }

      // Apply Status Filter
      if (statusFilter === "pending") {
        filteredSubmissions = filteredSubmissions.filter(sub => sub.status !== "graded");
      } else if (statusFilter === "graded") {
        filteredSubmissions = filteredSubmissions.filter(sub => sub.status === "graded");
      }

      if (filteredSubmissions.length === 0) {
        detailedContainer.innerHTML = `
          <div class="empty-state-text" style="padding: 2rem; text-align: center;">
            No student submissions match the selected filters.
          </div>
        `;
        return;
      }

      const sorted = filteredSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      let detailedHtml = "";

      sorted.forEach(sub => {
        const student = users.find(u => u.id === sub.studentId) || { fullName: sub.studentName || sub.submittedByName || "Enrolled Student", studentId: sub.studentId || "STU-N/A", className: sub.className || "B.Tech CSE", section: sub.section || "A" };
        const asgn = assignments.find(a => a.id === sub.assignmentId) || { title: "Coursework Assignment", maxMarks: 100 };
        const maxMarks = asgn.maxMarks || asgn.totalMarks || 100;

        const isGraded = sub.status === "graded";
        const statusBadge = isGraded
          ? `<span class="badge badge-success">Graded (${sub.marks}/${maxMarks})</span>`
          : `<span class="badge badge-warning">Needs Grading</span>`;

        const formattedTime = new Date(sub.submittedAt).toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        // Download link: if sub.fileUrl is dataUrl or URL, use it directly
        const fileUrl = sub.fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        const fileName = sub.fileName || "Student_Solution.pdf";

        detailedHtml += `
          <div class="assignment-item" style="padding: 1.1rem; border: 1px solid var(--border-color); border-radius: var(--radius-lg); margin-bottom: 0.85rem; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <span class="font-bold text-md" style="color: var(--text-main);">${student.fullName || student.name}</span>
                  <span class="badge badge-outline">${student.studentId || 'SL-2026-894'}</span>
                  <span class="badge badge-info">${student.className || 'B.Tech CSE'}-${student.section || 'A'}</span>
                </div>

                <div class="text-xs text-muted" style="margin-top: 0.2rem;">
                  📘 <strong>Assignment:</strong> ${asgn.title} (Max Marks: ${maxMarks})
                </div>

                <div class="text-xs text-muted" style="margin-top: 0.2rem;">
                  📅 <strong>Submitted On:</strong> ${formattedTime}
                </div>

                <div class="text-xs text-muted" style="margin-top: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
                  📎 <strong>Submitted File:</strong> 
                  <a href="${fileUrl}" download="${fileName}" class="font-bold text-primary" style="text-decoration: underline;" target="_blank">
                    ${fileName} (Download ⬇️)
                  </a>
                </div>

                ${sub.comments ? `
                  <div class="text-xs text-muted" style="margin-top: 0.4rem; padding: 0.4rem 0.6rem; background: var(--bg-subtle); border-radius: 6px;">
                    💬 <em>Student Comment: "${sub.comments}"</em>
                  </div>
                ` : ''}

                ${isGraded && sub.teacherFeedback ? `
                  <div class="text-xs text-success" style="margin-top: 0.4rem; font-weight: 500;">
                    🎓 <strong>Faculty Feedback:</strong> "${sub.teacherFeedback}"
                  </div>
                ` : ''}
              </div>

              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                ${statusBadge}
                <button type="button" class="btn ${isGraded ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="SmartLearnTeacherAssignments.openGradeModal('${sub.id}')">
                  ${isGraded ? 'Edit Marks & Feedback ✏️' : 'Evaluate & Assign Marks 🎓'}
                </button>
              </div>
            </div>
          </div>
        `;
      });

      detailedContainer.innerHTML = detailedHtml;
    }
  },

  openGradeModal(submissionId) {
    const submissions = SmartLearnStorage.getSubmissions();
    const assignments = SmartLearnStorage.getAssignments();
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS);

    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    this.activeSubmissionId = submissionId;

    const student = users.find(u => u.id === sub.studentId) || { fullName: sub.studentName || sub.submittedByName || "Enrolled Student", studentId: sub.studentId || "STU-N/A", className: sub.className || "B.Tech CSE", section: sub.section || "A" };
    const asgn = assignments.find(a => a.id === sub.assignmentId) || { title: "Binary Search Trees & AVL Implementation", maxMarks: 100 };
    const maxMarks = asgn.maxMarks || asgn.totalMarks || 100;

    const formattedTime = new Date(sub.submittedAt).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Fill Modal Fields
    const titleEl = document.getElementById("tg-modal-asgn-title");
    const infoEl = document.getElementById("tg-modal-student-info");
    const nameEl = document.getElementById("tg-modal-student-name");
    const timeEl = document.getElementById("tg-modal-submitted-at");
    const fileEl = document.getElementById("tg-modal-file-name");
    const commentsEl = document.getElementById("tg-modal-comments");
    const commentsWrap = document.getElementById("tg-modal-comments-wrap");
    const badgeEl = document.getElementById("tg-modal-status-badge");
    const marksInput = document.getElementById("tg-modal-marks-input");
    const scoreLimitEl = document.getElementById("tg-modal-score-limit");
    const feedbackInput = document.getElementById("tg-modal-feedback-input");
    const subIdInput = document.getElementById("tg-modal-submission-id");

    if (subIdInput) subIdInput.value = submissionId;
    if (nameEl) nameEl.innerText = `Evaluate: ${student.fullName || student.name}`;
    if (titleEl) titleEl.innerText = asgn.title;
    if (infoEl) infoEl.innerText = `${student.fullName || student.name} (${student.studentId || 'SL-2026-894'}) • ${student.className || 'B.Tech CSE'}-${student.section || 'A'}`;
    if (timeEl) timeEl.innerText = formattedTime;
    if (fileEl) fileEl.innerText = sub.fileName || "Assignment_Solution.pdf";

    if (commentsEl) commentsEl.innerText = sub.comments || "No comments provided.";
    if (commentsWrap) commentsWrap.style.display = sub.comments ? "block" : "none";

    if (scoreLimitEl) scoreLimitEl.innerText = `(Max Marks: ${maxMarks})`;
    if (marksInput) {
      marksInput.max = maxMarks;
      marksInput.value = sub.marks !== null && sub.marks !== undefined ? sub.marks : "";
    }
    if (feedbackInput) {
      feedbackInput.value = sub.teacherFeedback || "";
    }

    if (badgeEl) {
      if (sub.status === "graded") {
        badgeEl.className = "badge badge-success";
        badgeEl.innerText = `✓ Graded (${sub.marks}/${maxMarks})`;
      } else {
        badgeEl.className = "badge badge-warning";
        badgeEl.innerText = "Needs Grading";
      }
    }

    SmartLearnApp.openModal("teacher-grade-modal");
  },

  submitGrade(e) {
    if (e) e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const submissionId = this.activeSubmissionId || document.getElementById("tg-modal-submission-id")?.value;
    if (!submissionId) return;

    const submissions = SmartLearnStorage.getSubmissions();
    const subIndex = submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) return;

    const sub = submissions[subIndex];
    const assignments = SmartLearnStorage.getAssignments();
    const asgn = assignments.find(a => a.id === sub.assignmentId) || { title: "Coursework Assignment", maxMarks: 100 };
    const maxMarks = asgn.maxMarks || asgn.totalMarks || 100;

    const marksInput = document.getElementById("tg-modal-marks-input");
    const feedbackInput = document.getElementById("tg-modal-feedback-input");

    const marksVal = parseFloat(marksInput?.value);
    if (isNaN(marksVal) || marksVal < 0 || marksVal > maxMarks) {
      SmartLearnApp.showToast(`Please enter a valid score between 0 and ${maxMarks}!`, "warning");
      return;
    }

    const feedbackVal = feedbackInput ? feedbackInput.value.trim() : "";

    // 1. Update Submission Object
    sub.status = "graded";
    sub.marks = marksVal;
    sub.teacherFeedback = feedbackVal || "Good job!";
    sub.gradedAt = new Date().toISOString();

    submissions[subIndex] = sub;
    SmartLearnStorage.saveSubmissions(submissions);

    // 2. Sync to Student Gradebook (GRADES)
    const grades = SmartLearnStorage.getGrades();
    const existingGradeIdx = grades.findIndex(g => g.submissionId === submissionId || (g.studentId === sub.studentId && g.testName === asgn.title));
    const gradeRecord = {
      id: existingGradeIdx >= 0 ? grades[existingGradeIdx].id : "gr_" + Date.now(),
      studentId: sub.studentId,
      submissionId: submissionId,
      subject: asgn.subject || "Data Structures",
      testName: asgn.title,
      maxMarks: maxMarks,
      scoredMarks: marksVal,
      date: new Date().toISOString().split("T")[0]
    };

    if (existingGradeIdx >= 0) {
      grades[existingGradeIdx] = gradeRecord;
    } else {
      grades.push(gradeRecord);
    }
    SmartLearnStorage.saveGrades(grades);

    // 3. Notify Student
    const notifications = SmartLearnStorage.getNotifications();
    notifications.unshift({
      id: "not_" + Date.now(),
      userId: sub.studentId,
      title: "Coursework Graded 🎉",
      message: `Your submission for '${asgn.title}' has been evaluated. Score: ${marksVal}/${maxMarks}. Feedback: "${sub.teacherFeedback}"`,
      createdAt: new Date().toISOString(),
      read: false
    });
    SmartLearnStorage.saveNotifications(notifications);

    SmartLearnApp.showToast(`Grade & feedback saved successfully! Student notified. 🎉`, "success");
    SmartLearnApp.closeModal("teacher-grade-modal");

    // Re-render teacher views
    this.renderTeacherDashboard();
  },

  openCoordinatorNoticeModal(className = "", section = "") {
    const classInput = document.getElementById("coord-modal-class-target");
    if (classInput) classInput.value = `${className} - Section ${section}`;

    if (document.getElementById("coord-modal-notice-title")) document.getElementById("coord-modal-notice-title").value = "";
    if (document.getElementById("coord-modal-notice-content")) document.getElementById("coord-modal-notice-content").value = "";

    SmartLearnApp.openModal("coordinator-notice-modal");
  },

  postCoordinatorNotice(e) {
    if (e) e.preventDefault();

    const user = SmartLearnAuth.getCurrentUser();
    const classTarget = document.getElementById("coord-modal-class-target")?.value || "B.Tech CSE - Section A";
    const title = document.getElementById("coord-modal-notice-title")?.value.trim();
    const content = document.getElementById("coord-modal-notice-content")?.value.trim();

    if (!title || !content) {
      SmartLearnApp.showToast("Please provide notice title and content!", "warning");
      return;
    }

    const announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    const newNotice = {
      id: "ann_" + Date.now(),
      title: title,
      content: content,
      message: content,
      target: "Students Only",
      author: `${user ? (user.fullName || user.name) : 'Class Coordinator'} (Class Coordinator)`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAt: new Date().toISOString()
    };

    announcements.unshift(newNotice);
    SmartLearnStorage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    // Send notification to all student users
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const classStudents = users.filter(u => (u.role || "").toLowerCase() === "student");

    classStudents.forEach(st => {
      SmartLearnStorage.addNotification({
        userId: st.id,
        title: `📢 Notice from Class Coordinator: ${title}`,
        message: `${user ? (user.fullName || user.name) : 'Class Coordinator'}: "${content}"`
      });
    });

    SmartLearnApp.showToast(`Notice broadcasted to all students of ${classTarget}! 🎉`, "success");
    SmartLearnApp.closeModal("coordinator-notice-modal");

    if (typeof SmartLearnAnnouncements !== "undefined" && SmartLearnAnnouncements.renderStudentAnnouncements) {
      SmartLearnAnnouncements.renderStudentAnnouncements();
    }
  },

  uploadStudyMaterial(e) {
    if (e) e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const title = document.getElementById("tm-title")?.value.trim();
    const desc = document.getElementById("tm-desc")?.value.trim();
    const subjectId = document.getElementById("tm-subject")?.value || "sub_ds201";
    const classId = document.getElementById("tm-class")?.value || "B.Tech CSE";
    const section = document.getElementById("tm-section")?.value || "A";
    const type = document.getElementById("tm-type")?.value || "PDF";
    const fileInput = document.getElementById("tm-fileinput");
    let fileName = document.getElementById("tm-filename")?.value.trim();
    let fileUrl = document.getElementById("tm-fileurl")?.value.trim();
    const isPublished = document.getElementById("tm-publish")?.value !== "false";

    if (!title) {
      SmartLearnApp.showToast("Please enter a material title!", "warning");
      return;
    }

    const saveAndNotify = (finalFileName, finalFileUrl, finalFileSize) => {
      const newMaterial = {
        id: "mat_" + Date.now(),
        title: title,
        description: desc || "Course reference material uploaded by faculty.",
        subjectId: subjectId,
        teacherId: user.id,
        classId: classId,
        className: classId,
        section: section,
        type: type,
        fileName: finalFileName || "Course_Resource.pdf",
        fileSize: finalFileSize || 2400000,
        fileUrl: finalFileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        thumbnailUrl: "",
        tags: ["Lecture Material", type, "Faculty Upload"],
        uploadedAt: new Date().toISOString(),
        isPublished: isPublished
      };

      const materials = SmartLearnStorage.getStudyMaterials();
      materials.unshift(newMaterial);
      SmartLearnStorage.saveStudyMaterials(materials);

      // Send Notifications to Students
      if (isPublished) {
        const users = SmartLearnStorage.get(STORAGE_KEYS.USERS);
        let targetStudents = users.filter(u => (u.role || "").toLowerCase() === "student" && (u.className === classId || u.class === classId) && u.section === section);

        // Fallback: If no student matches class/section exact filter, notify all student accounts
        if (targetStudents.length === 0) {
          targetStudents = users.filter(u => (u.role || "").toLowerCase() === "student");
        }

        const notifications = SmartLearnStorage.getNotifications();
        targetStudents.forEach(st => {
          notifications.unshift({
            id: "not_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            userId: st.id,
            title: "New Study Material Uploaded 📚",
            message: `${user.fullName || user.name || "Faculty"} uploaded new ${type} material: '${title}'. View and download now.`,
            relatedId: newMaterial.id,
            createdAt: new Date().toISOString(),
            read: false
          });
        });
        SmartLearnStorage.saveNotifications(notifications);
      }

      SmartLearnApp.showToast(`Study Material '${title}' uploaded successfully! ${isPublished ? 'Students notified. 🎉' : '(Saved as Draft)'}`, "success");
      SmartLearnApp.closeModal("upload-material-modal");

      // Reset form inputs
      if (document.getElementById("tm-title")) document.getElementById("tm-title").value = "";
      if (document.getElementById("tm-desc")) document.getElementById("tm-desc").value = "";
      if (document.getElementById("tm-filename")) document.getElementById("tm-filename").value = "";
      if (document.getElementById("tm-fileurl")) document.getElementById("tm-fileurl").value = "";
      if (fileInput) fileInput.value = "";

      // Refresh Study Materials module if active
      if (typeof SmartLearnStudyMaterials !== "undefined") {
        SmartLearnStudyMaterials.renderStudyMaterialsModule();
      }
      if (typeof SmartLearnDashboard !== "undefined") {
        const curr = SmartLearnAuth.getCurrentUser();
        if (curr) SmartLearnDashboard.renderStudyMaterials(curr);
      }
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const selectedFile = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        saveAndNotify(selectedFile.name, dataUrl, selectedFile.size);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      saveAndNotify(fileName || "Course_Resource.pdf", fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", 2400000);
    }
  }
};

/**
 * SmartLearn - Study Materials Module Controller
 * Fully dynamic, data-driven, student-specific, searchable, filterable, and persistent.
 */
const SmartLearnStudyMaterials = {
  activeFilter: "all",
  activeSubject: "all",
  activeType: "all",
  activeDate: "all",
  searchTerm: "",
  sortBy: "newest",

  init() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    this.renderHeader(user);
    this.populateSubjectDropdown();
    this.renderStudyMaterialsModule(user);
    this.bindEvents();
  },

  renderHeader(user) {
    const displayName = user.fullName || user.name || "Student";
    const titleEl = document.getElementById("sm-header-greeting");
    if (titleEl) titleEl.innerText = `Welcome back, ${displayName} 👋`;

    const subEl = document.getElementById("sm-header-sub");
    if (subEl) subEl.innerText = `Access verified courseware, lecture slides, video tutorials, and exam prep for ${user.className || 'B.Tech CSE'}-${user.section || 'A'}.`;
  },

  populateSubjectDropdown() {
    const selectEl = document.getElementById("sm-filter-subject");
    if (!selectEl) return;

    const subjects = SmartLearnStorage.getSubjects();

    let html = `<option value="all">All Subjects</option>`;
    subjects.forEach(s => {
      html += `<option value="${s.id}">${s.name} (${s.code})</option>`;
    });

    selectEl.innerHTML = html;
  },

  bindEvents() {
    const searchInput = document.getElementById("sm-search-input");
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.renderStudyMaterialsModule();
      });
    }

    const subjectFilter = document.getElementById("sm-filter-subject");
    if (subjectFilter && !subjectFilter.dataset.bound) {
      subjectFilter.dataset.bound = "true";
      subjectFilter.addEventListener("change", (e) => {
        this.activeSubject = e.target.value;
        this.renderStudyMaterialsModule();
      });
    }

    const typeFilter = document.getElementById("sm-filter-type");
    if (typeFilter && !typeFilter.dataset.bound) {
      typeFilter.dataset.bound = "true";
      typeFilter.addEventListener("change", (e) => {
        this.activeType = e.target.value;
        this.renderStudyMaterialsModule();
      });
    }

    const dateFilter = document.getElementById("sm-filter-date");
    if (dateFilter && !dateFilter.dataset.bound) {
      dateFilter.dataset.bound = "true";
      dateFilter.addEventListener("change", (e) => {
        this.activeDate = e.target.value;
        this.renderStudyMaterialsModule();
      });
    }

    const sortFilter = document.getElementById("sm-filter-sort");
    if (sortFilter && !sortFilter.dataset.bound) {
      sortFilter.dataset.bound = "true";
      sortFilter.addEventListener("change", (e) => {
        this.sortBy = e.target.value;
        this.renderStudyMaterialsModule();
      });
    }
  },

  setScopeFilter(scope, btnEl) {
    this.activeFilter = scope;
    const buttons = document.querySelectorAll(".sm-scope-tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    this.renderStudyMaterialsModule();
  },

  renderStudyMaterialsModule(currentUser) {
    const user = currentUser || SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const allMaterials = SmartLearnStorage.getStudyMaterials();
    const savedRecords = SmartLearnStorage.getSavedMaterials().filter(s => s.studentId === user.id);
    const savedMaterialIds = new Set(savedRecords.map(s => s.materialId));
    const viewRecords = SmartLearnStorage.getMaterialViews().filter(v => v.studentId === user.id);

    // 1. Filter Student-Specific Published Materials
    const studentMaterials = allMaterials.filter(m => {
      const isPub = m.isPublished !== false;
      const matchClass = !m.classId || m.classId === (user.className || user.class) || m.className === (user.className || user.class);
      const matchSec = !m.section || m.section === user.section;
      return isPub && matchClass && matchSec;
    });

    // 2. Compute Summary Card Metrics dynamically (NO HARDCODING)
    const countTotal = studentMaterials.length;
    const countPdfs = studentMaterials.filter(m => m.type === "PDF").length;
    const countPpts = studentMaterials.filter(m => m.type === "PPT" || m.type === "DOC").length;
    const countVideos = studentMaterials.filter(m => m.type === "Video").length;
    const countExamPrep = studentMaterials.filter(m => (m.tags && (m.tags.includes("Exam") || m.tags.includes("Revision") || m.tags.includes("Question Paper"))) || m.type === "Paper").length;
    const countSaved = studentMaterials.filter(m => savedMaterialIds.has(m.id)).length;

    // Update Stat Cards UI
    const elTotal = document.getElementById("sm-stat-total");
    const elPdfs = document.getElementById("sm-stat-pdfs");
    const elPpts = document.getElementById("sm-stat-ppts");
    const elVideos = document.getElementById("sm-stat-videos");
    const elExam = document.getElementById("sm-stat-examprep");
    const elSaved = document.getElementById("sm-stat-saved");

    if (elTotal) elTotal.innerText = countTotal;
    if (elPdfs) elPdfs.innerText = countPdfs;
    if (elPpts) elPpts.innerText = countPpts;
    if (elVideos) elVideos.innerText = countVideos;
    if (elExam) elExam.innerText = countExamPrep;
    if (elSaved) elSaved.innerText = countSaved;

    // 3. Apply Filters & Search
    let filtered = [...studentMaterials];

    // Scope / Category Filter
    if (this.activeFilter === "saved") {
      filtered = filtered.filter(m => savedMaterialIds.has(m.id));
    } else if (this.activeFilter === "examprep") {
      filtered = filtered.filter(m => (m.tags && (m.tags.includes("Exam") || m.tags.includes("Revision") || m.tags.includes("Question Paper"))) || m.type === "Paper");
    } else if (this.activeFilter === "viewed") {
      const viewedIds = new Set(viewRecords.map(v => v.materialId));
      filtered = filtered.filter(m => viewedIds.has(m.id));
    }

    // Subject Filter
    if (this.activeSubject !== "all") {
      filtered = filtered.filter(m => m.subjectId === this.activeSubject || m.subject === this.activeSubject);
    }

    // Type Filter
    if (this.activeType !== "all") {
      filtered = filtered.filter(m => m.type === this.activeType);
    }

    // Date Filter
    if (this.activeDate !== "all") {
      const now = new Date();
      filtered = filtered.filter(m => {
        const uDate = new Date(m.uploadedAt);
        const diffDays = (now - uDate) / (1000 * 60 * 60 * 24);
        if (this.activeDate === "today") return diffDays <= 1;
        if (this.activeDate === "week") return diffDays <= 7;
        if (this.activeDate === "month") return diffDays <= 30;
        if (this.activeDate === "older") return diffDays > 30;
        return true;
      });
    }

    // Search Query
    if (this.searchTerm) {
      filtered = filtered.filter(m => {
        const teacher = SmartLearnStorage.getUserById(m.teacherId);
        const subject = SmartLearnStorage.getSubjectById(m.subjectId);
        const titleStr = (m.title || "").toLowerCase();
        const descStr = (m.description || "").toLowerCase();
        const teacherStr = (teacher.fullName || teacher.name || "").toLowerCase();
        const subjStr = (subject.name || m.subject || "").toLowerCase();
        const tagsStr = (m.tags || []).join(" ").toLowerCase();

        return titleStr.includes(this.searchTerm) ||
          descStr.includes(this.searchTerm) ||
          teacherStr.includes(this.searchTerm) ||
          subjStr.includes(this.searchTerm) ||
          tagsStr.includes(this.searchTerm);
      });
    }

    // 4. Sorting Logic
    if (this.sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    } else if (this.sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
    } else if (this.sortBy === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === "viewed") {
      filtered.sort((a, b) => {
        const lastA = viewRecords.find(v => v.materialId === a.id)?.viewedAt || 0;
        const lastB = viewRecords.find(v => v.materialId === b.id)?.viewedAt || 0;
        return new Date(lastB) - new Date(lastA);
      });
    }

    // 5. Render Cards Grid
    const container = document.getElementById("sm-materials-grid");
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card empty-state-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color);">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--primary)" stroke-width="1.5" style="margin-bottom: 1rem;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <h3 class="font-bold text-lg" style="color: var(--text-main);">No Study Materials Found 🎉</h3>
          <p class="text-xs text-muted" style="margin-top: 0.35rem; max-width: 450px; margin-left: auto; margin-right: auto;">
            ${this.searchTerm || this.activeFilter !== "all" || this.activeSubject !== "all" || this.activeType !== "all" ? "No materials match your current search query or filter parameters. Try clearing your filters." : "Your teachers haven't uploaded any study materials for your class yet."}
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => this.renderSingleMaterialCard(item, user.id, savedMaterialIds.has(item.id))).join("");
  },

  renderSingleMaterialCard(item, studentId, isSaved) {
    const subject = SmartLearnStorage.getSubjectById(item.subjectId);
    const teacher = SmartLearnStorage.getUserById(item.teacherId);

    const subjectName = subject.name || item.subject || "General";
    const teacherName = teacher.fullName || teacher.name || "Faculty Instructor";

    // Format file size
    let sizeText = item.size || "1.5 MB";
    if (item.fileSize) {
      sizeText = item.fileSize >= 1048576
        ? (item.fileSize / 1048576).toFixed(1) + " MB"
        : Math.round(item.fileSize / 1024) + " KB";
    }

    // Type Badge & Icon
    let typeBadgeClass = "badge-primary";

    if (item.type === "PDF") {
      typeBadgeClass = "badge-danger";
    } else if (item.type === "PPT" || item.type === "DOC") {
      typeBadgeClass = "badge-warning";
    } else if (item.type === "Video") {
      typeBadgeClass = "badge-info";
    } else if (item.type === "Paper") {
      typeBadgeClass = "badge-success";
    }

    const uploadedDateFormatted = new Date(item.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Render tags
    const tagsHtml = (item.tags || []).map(t => `<span class="badge badge-subtle" style="font-size: 0.7rem; padding: 0.2rem 0.45rem;">#${t}</span>`).join(" ");

    return `
      <div class="card sm-material-card" style="display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem; background: var(--bg-surface); transition: transform 0.2s ease, box-shadow 0.2s ease;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <span class="badge badge-primary">${subjectName}</span>
              <span class="badge ${typeBadgeClass}">${item.type || 'Doc'} • ${sizeText}</span>
            </div>
            <button type="button" class="btn btn-icon btn-sm" style="border: none; background: rgba(99, 102, 241, 0.1); cursor: pointer; font-size: 1.1rem; padding: 0.2rem 0.5rem; border-radius: 8px;" title="${isSaved ? 'Remove Bookmark' : 'Bookmark Material'}" onclick="SmartLearnStudyMaterials.toggleSave('${item.id}', this)">
              ${isSaved ? '🔖' : '📑'}
            </button>
          </div>

          <h3 class="font-bold text-md" style="color: var(--text-main); margin-bottom: 0.4rem; line-height: 1.35;">
            ${item.title}
          </h3>

          <p class="text-xs text-muted" style="margin-bottom: 0.85rem; line-clamp: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${item.description || "No specific details provided."}
          </p>

          ${tagsHtml ? `<div style="margin-bottom: 1rem; display: flex; gap: 0.35rem; flex-wrap: wrap;">${tagsHtml}</div>` : ''}
        </div>

        <div>
          <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-color); margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.775rem;" class="text-muted">
            <span>👤 ${teacherName}</span>
            <span>📅 ${uploadedDateFormatted}</span>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn btn-outline btn-sm" style="flex: 1;" onclick="SmartLearnStudyMaterials.openDetailsModal('${item.id}')">
              👁️ View Details
            </button>
            <button type="button" class="btn btn-primary btn-sm" style="flex: 1;" onclick="SmartLearnStudyMaterials.downloadResource('${item.id}')">
              ${item.type === 'Video' ? '▶ Watch' : '⬇ Download'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleSave(materialId, btnEl) {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const isSaved = SmartLearnStorage.toggleBookmarkMaterial(user.id, materialId);

    if (btnEl) {
      btnEl.innerText = isSaved ? "🔖" : "📑";
    }

    SmartLearnApp.showToast(isSaved ? "Material bookmarked to My Saved Materials! 🔖" : "Material removed from My Saved Materials.", isSaved ? "success" : "info");
    this.renderStudyMaterialsModule();
  },

  openDetailsModal(materialId) {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const item = SmartLearnStorage.getMaterialById(materialId);
    if (!item) return;

    // Record View in classoraMaterialViews
    SmartLearnStorage.recordMaterialView(user.id, materialId);

    const subject = SmartLearnStorage.getSubjectById(item.subjectId);
    const teacher = SmartLearnStorage.getUserById(item.teacherId);

    // Populate Modal Elements
    const titleEl = document.getElementById("sm-modal-title");
    const descEl = document.getElementById("sm-modal-desc");
    const subjEl = document.getElementById("sm-modal-subject");
    const teachEl = document.getElementById("sm-modal-teacher");
    const dateEl = document.getElementById("sm-modal-date");
    const typeEl = document.getElementById("sm-modal-type");
    const sizeEl = document.getElementById("sm-modal-size");
    const fileEl = document.getElementById("sm-modal-filename");
    const viewerContainer = document.getElementById("sm-modal-viewer-container");
    const dlBtn = document.getElementById("sm-modal-download-btn");

    if (titleEl) titleEl.innerText = item.title;
    if (descEl) descEl.innerText = item.description || "No description available.";
    if (subjEl) subjEl.innerText = subject.name || item.subject || "General";
    if (teachEl) teachEl.innerText = teacher.fullName || teacher.name || "Faculty Instructor";
    if (dateEl) dateEl.innerText = new Date(item.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (typeEl) typeEl.innerText = item.type || "PDF";

    let sizeText = item.size || "1.5 MB";
    if (item.fileSize) {
      sizeText = item.fileSize >= 1048576 ? (item.fileSize / 1048576).toFixed(1) + " MB" : Math.round(item.fileSize / 1024) + " KB";
    }
    if (sizeEl) sizeEl.innerText = sizeText;
    if (fileEl) fileEl.innerText = item.fileName || "Course_Resource_File";

    if (dlBtn) {
      dlBtn.onclick = () => this.downloadResource(materialId);
      dlBtn.innerText = item.type === "Video" ? "▶ Watch Video Resource" : "⬇ Download Material File";
    }

    // Handle Live Embedded Viewer
    if (viewerContainer) {
      if (item.type === "Video" && item.fileUrl) {
        viewerContainer.innerHTML = `
          <div style="aspect-ratio: 16/9; width: 100%; border-radius: 12px; overflow: hidden; background: #000;">
            <video controls width="100%" height="100%" poster="${item.thumbnailUrl || ''}" style="width: 100%; height: 100%; object-fit: contain;">
              <source src="${item.fileUrl}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
      } else if (item.type === "PDF" && item.fileUrl) {
        viewerContainer.innerHTML = `
          <div style="height: 380px; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: var(--bg-subtle);">
            <iframe src="${item.fileUrl}" width="100%" height="100%" style="border: none;"></iframe>
          </div>
        `;
      } else {
        viewerContainer.innerHTML = `
          <div style="padding: 2rem; border-radius: 12px; background: var(--bg-subtle); border: 1px solid var(--border-color); text-align: center;">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--primary)" stroke-width="1.5" style="margin-bottom: 0.5rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div class="font-bold text-sm" style="color: var(--text-main);">File Preview Ready</div>
            <div class="text-xs text-muted" style="margin-top: 0.25rem;">Attached File: ${item.fileName || 'Resource_Document'} (${sizeText})</div>
            ${item.fileUrl ? `<a href="${item.fileUrl}" target="_blank" class="btn btn-outline btn-sm" style="margin-top: 0.75rem;">Open File in Browser &nearr;</a>` : `<div class="text-xs text-warning" style="margin-top: 0.5rem;">Resource file URL will be populated upon backend connection.</div>`}
          </div>
        `;
      }
    }

    SmartLearnApp.openModal("study-material-detail-modal");
  },

  downloadResource(materialId) {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const item = SmartLearnStorage.getMaterialById(materialId);
    if (!item) return;

    // Record Download Event
    SmartLearnStorage.recordMaterialDownload(user.id, materialId);

    if (item.fileUrl) {
      SmartLearnApp.showToast(`Initiating download for ${item.fileName || item.title}... ⬇️`, "success");
      const a = document.createElement("a");
      a.href = item.fileUrl;
      a.target = "_blank";
      a.download = item.fileName || "Study_Material.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      SmartLearnApp.showToast(`Resource file download is not available yet for "${item.title}".`, "warning");
    }
  }
};

/**
 * SmartLearn - Quiz Management & Execution Controller
 * Zero dynamic data hardcoding. Complete dynamic rendering from SmartLearnStorage.
 * Handles Quiz Listing, Summary Metrics, Filtering, Search, Bookmarks, Active Quiz Engine,
 * Question Navigator, Live Timer, Submission Scoring, Result Reviews, and Subject-Wise Analytics.
 */
const SmartLearnQuizzes = {
  activeQuiz: null,
  activeAttempt: null,
  activeQuestionIndex: 0,
  timerInterval: null,
  filterBookmarksOnly: false,

  init() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    this.populateSubjectFilters();
    this.renderQuizzesModule();
  },

  populateSubjectFilters() {
    const filterSelect = document.getElementById("quiz-filter-subject");
    if (!filterSelect) return;

    const subjects = SmartLearnStorage.getSubjects();
    filterSelect.innerHTML = `<option value="all">Subject: All</option>`;
    subjects.forEach(sub => {
      filterSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
    });
  },

  toggleBookmarksOnlyFilter() {
    this.filterBookmarksOnly = !this.filterBookmarksOnly;
    const btn = document.getElementById("quiz-bookmark-toggle-btn");
    if (btn) {
      if (this.filterBookmarksOnly) {
        btn.classList.add("btn-primary");
        btn.classList.remove("btn-outline");
        btn.innerText = "⭐ Bookmarks (Active)";
      } else {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline");
        btn.innerText = "⭐ Bookmarks";
      }
    }
    this.renderQuizzesModule();
  },

  renderQuizzesModule() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const allQuizzes = SmartLearnStorage.getQuizzes();
    const allAttempts = SmartLearnStorage.getQuizAttempts();
    const allBookmarks = SmartLearnStorage.getQuizBookmarks();

    // 1. Relevant Quizzes for current student (flexible class/section match, published)
    const studentClassStr = (user.className || user.class || "B.Tech CSE").toString().toLowerCase();

    let relevantQuizzes = allQuizzes.filter(q => {
      if (q.published === false) return false;
      if (q.classId && q.classId !== "All") {
        const qClassNorm = q.classId.toString().toLowerCase().replace(/grade\s*/g, "").trim();
        const uClassNorm = studentClassStr.replace(/grade\s*/g, "").trim();
        // Match if both refer to same grade number (e.g., "11", "11-a", "grade 11")
        if (qClassNorm && uClassNorm && !uClassNorm.includes(qClassNorm) && !qClassNorm.includes(uClassNorm.split("-")[0])) {
          return false;
        }
      }
      return true;
    });

    // FAILSAFE: If no quizzes match the specific student class, fallback to all published quizzes!
    if (relevantQuizzes.length === 0 && allQuizzes.length > 0) {
      relevantQuizzes = allQuizzes.filter(q => q.published !== false);
    }

    const myAttempts = allAttempts.filter(a => a.studentId === user.id);
    const myBookmarks = allBookmarks.filter(b => b.studentId === user.id).map(b => b.quizId);

    // 2. Summary Metrics Calculation
    const completedQuizIds = new Set(myAttempts.filter(a => a.status === "submitted").map(a => a.quizId));
    const availableCount = relevantQuizzes.length;
    const completedCount = completedQuizIds.size;
    const pendingCount = Math.max(0, availableCount - completedCount);

    const submittedAttempts = myAttempts.filter(a => a.status === "submitted");
    let totalScorePct = 0;
    let passedCount = 0;

    submittedAttempts.forEach(att => {
      totalScorePct += (att.percentage || 0);
      if (att.passed) passedCount++;
    });

    const avgScorePct = submittedAttempts.length ? Math.round(totalScorePct / submittedAttempts.length) : 0;

    // Update Summary UI Elements
    const elAvail = document.getElementById("quiz-stat-available");
    if (elAvail) elAvail.innerText = availableCount;

    const elComp = document.getElementById("quiz-stat-completed");
    if (elComp) elComp.innerText = completedCount;

    const elPend = document.getElementById("quiz-stat-pending");
    if (elPend) elPend.innerText = pendingCount;

    const elAvg = document.getElementById("quiz-stat-avg-score");
    if (elAvg) elAvg.innerText = `${avgScorePct}%`;

    const elPassed = document.getElementById("quiz-stat-passed");
    if (elPassed) elPassed.innerText = passedCount;

    // 3. Search & Filter Inputs
    const searchVal = (document.getElementById("quiz-search-input")?.value || "").toLowerCase().trim();
    const statusVal = document.getElementById("quiz-filter-status")?.value || "all";
    const subjectVal = document.getElementById("quiz-filter-subject")?.value || "all";
    const dateVal = document.getElementById("quiz-filter-date")?.value || "all";
    const sortVal = document.getElementById("quiz-filter-sort")?.value || "newest";

    let filtered = relevantQuizzes.filter(q => {
      const teacher = SmartLearnStorage.getUserById(q.teacherId);
      const subject = SmartLearnStorage.getSubjectById(q.subjectId);

      const teacherName = (teacher.fullName || teacher.name || "").toLowerCase();
      const subjectName = (subject.name || q.subjectName || "").toLowerCase();
      const titleText = (q.title || "").toLowerCase();
      const descText = (q.description || "").toLowerCase();

      // Search match
      if (searchVal) {
        const matchesSearch = titleText.includes(searchVal) || descText.includes(searchVal) || subjectName.includes(searchVal) || teacherName.includes(searchVal);
        if (!matchesSearch) return false;
      }

      // Bookmarks filter
      if (this.filterBookmarksOnly && !myBookmarks.includes(q.id)) {
        return false;
      }

      // Subject filter
      if (subjectVal !== "all" && q.subjectId !== subjectVal && subject.name !== subjectVal) {
        return false;
      }

      // Status filter
      const qAttempts = myAttempts.filter(a => a.quizId === q.id && a.status === "submitted");
      const isCompleted = qAttempts.length > 0;
      const latestAttempt = qAttempts[qAttempts.length - 1];
      const isPassed = latestAttempt?.passed;
      const isExpired = new Date(q.endDate) < new Date();

      if (statusVal === "available" && isCompleted) return false;
      if (statusVal === "pending" && isCompleted) return false;
      if (statusVal === "completed" && !isCompleted) return false;
      if (statusVal === "passed" && (!isCompleted || !isPassed)) return false;
      if (statusVal === "failed" && (!isCompleted || isPassed)) return false;
      if (statusVal === "expired" && !isExpired) return false;

      // Date filter
      if (dateVal !== "all") {
        const endDate = new Date(q.endDate);
        const now = new Date();
        const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (dateVal === "today" && diffDays !== 0) return false;
        if (dateVal === "week" && (diffDays < 0 || diffDays > 7)) return false;
        if (dateVal === "upcoming" && diffDays < 0) return false;
        if (dateVal === "expired" && diffDays >= 0) return false;
      }

      return true;
    });

    // 4. Sorting
    filtered.sort((a, b) => {
      if (sortVal === "newest") return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate);
      if (sortVal === "oldest") return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate);
      if (sortVal === "highest_marks") return (b.totalMarks || 0) - (a.totalMarks || 0);
      if (sortVal === "duration_short") return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      if (sortVal === "duration_long") return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      if (sortVal === "deadline") return new Date(a.endDate) - new Date(b.endDate);
      return 0;
    });

    // 5. Render Quiz Cards
    const countEl = document.getElementById("quiz-results-count");
    if (countEl) countEl.innerText = `Showing ${filtered.length} of ${relevantQuizzes.length} quizzes`;

    const gridContainer = document.getElementById("quiz-cards-grid");
    if (gridContainer) {
      if (!filtered.length) {
        gridContainer.innerHTML = `
          <div class="card" style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 0.75rem;">🎯</div>
            <h3 class="font-bold text-lg" style="color: var(--text-main); margin-bottom: 0.4rem;">No Quizzes Found</h3>
            <p class="text-sm text-muted">There are no quizzes matching your current search or filter criteria.</p>
          </div>
        `;
      } else {
        gridContainer.innerHTML = filtered.map(q => this.buildQuizCardHtml(q, user.id, myAttempts, myBookmarks)).join("");
      }
    }

    // 6. Render Subject Performance Bars & Learning Insights
    this.renderSubjectPerformance(submittedAttempts, allQuizzes);
    this.renderQuizHistory(submittedAttempts);
  },

  buildQuizCardHtml(q, studentId, myAttempts, myBookmarks) {
    const teacher = SmartLearnStorage.getUserById(q.teacherId);
    const subject = SmartLearnStorage.getSubjectById(q.subjectId);
    const isBookmarked = myBookmarks.includes(q.id);

    const qAttempts = myAttempts.filter(a => a.quizId === q.id && a.status === "submitted");
    const attemptCount = qAttempts.length;
    const latestAttempt = qAttempts[qAttempts.length - 1];
    const isCompleted = attemptCount > 0;
    const isPassed = latestAttempt?.passed;

    const endDate = new Date(q.endDate);
    const now = new Date();
    const isExpired = endDate < now;

    // Status Badge & Color
    let statusBadgeHtml = '';
    if (isCompleted) {
      if (isPassed) {
        statusBadgeHtml = `<span class="badge badge-success">Passed (${latestAttempt.score}/${q.totalMarks})</span>`;
      } else {
        statusBadgeHtml = `<span class="badge badge-danger">Failed (${latestAttempt.score}/${q.totalMarks})</span>`;
      }
    } else if (isExpired) {
      statusBadgeHtml = `<span class="badge badge-warning">Expired</span>`;
    } else {
      statusBadgeHtml = `<span class="badge badge-info">Available</span>`;
    }

    // Deadline badge
    const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    let deadlineText = diffDays < 0 ? 'Ended' : (diffDays === 0 ? 'Ends Today' : `Ends in ${diffDays}d`);

    // Action button logic
    let actionBtnHtml = '';
    const canAttempt = !isExpired && (q.attemptsAllowed ? attemptCount < q.attemptsAllowed : true);

    if (canAttempt) {
      actionBtnHtml = `
        <button type="button" class="btn btn-primary btn-sm" style="flex: 1;" onclick="SmartLearnQuizzes.viewQuizDetails('${q.id}')">
          ${attemptCount > 0 ? '🔄 Retake Quiz' : '🚀 Start Quiz'}
        </button>
      `;
    } else if (isCompleted) {
      actionBtnHtml = `
        <button type="button" class="btn btn-outline btn-sm" style="flex: 1;" onclick="SmartLearnQuizzes.viewQuizResult('${latestAttempt.id}')">
          🏆 View Score & Answers
        </button>
      `;
    } else {
      actionBtnHtml = `
        <button type="button" class="btn btn-outline btn-sm" style="flex: 1;" onclick="SmartLearnQuizzes.viewQuizDetails('${q.id}')">
          👁️ View Details
        </button>
      `;
    }

    return `
      <div class="quiz-card">
        <div>
          <div class="quiz-card-header">
            <div>
              <span class="badge badge-primary" style="font-size: 0.7rem; margin-bottom: 0.35rem;">${subject.name || q.subjectName || 'Subject'}</span>
              <h3 class="font-bold text-md" style="color: var(--text-main); margin-top: 0.2rem; line-height: 1.3;">${q.title}</h3>
            </div>
            <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="SmartLearnQuizzes.toggleBookmark('${q.id}')" title="Bookmark Quiz">
              ${isBookmarked ? '★' : '☆'}
            </button>
          </div>

          <p class="text-xs text-muted" style="margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${q.description || 'No description provided.'}
          </p>

          <div class="quiz-meta-grid">
            <div class="quiz-meta-item">⏱️ <strong>${q.durationMinutes} Mins</strong></div>
            <div class="quiz-meta-item">🎯 <strong>${q.questions ? q.questions.length : 0} Questions</strong></div>
            <div class="quiz-meta-item">🏆 <strong>${q.totalMarks} Marks</strong></div>
            <div class="quiz-meta-item">✅ Pass: <strong>${q.passingMarks} Mks</strong></div>
          </div>
        </div>

        <div>
          <div style="padding-top: 0.65rem; border-top: 1px solid var(--border-color); margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;" class="text-muted">
            <span>👤 ${teacher.fullName || teacher.name || 'Faculty'}</span>
            <span>⏳ ${deadlineText}</span>
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            ${actionBtnHtml}
          </div>
        </div>
      </div>
    `;
  },

  toggleBookmark(quizId) {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const isBookmarked = SmartLearnStorage.toggleQuizBookmark(user.id, quizId);
    SmartLearnApp.showToast(isBookmarked ? "Quiz bookmarked! ⭐" : "Quiz removed from bookmarks.", "info");
    this.renderQuizzesModule();
  },

  viewQuizDetails(quizId) {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const quiz = SmartLearnStorage.getQuizById(quizId);
    if (!quiz) return;

    const teacher = SmartLearnStorage.getUserById(quiz.teacherId);
    const subject = SmartLearnStorage.getSubjectById(quiz.subjectId);

    const titleEl = document.getElementById("quiz-modal-title");
    if (titleEl) titleEl.innerText = quiz.title;

    const bodyEl = document.getElementById("quiz-modal-body-content");
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
            <span class="badge badge-primary">${subject.name || quiz.subjectName}</span>
            <span class="badge badge-info">${quiz.classId || 'B.Tech CSE'}-${quiz.section || 'A'}</span>
            <span class="badge badge-success">Attempts Allowed: ${quiz.attemptsAllowed || 1}</span>
          </div>
          <p class="text-sm text-muted">${quiz.description || 'No description provided.'}</p>
        </div>

        <div class="card" style="background: var(--bg-subtle); padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; font-size: 0.85rem;">
            <div>👤 <strong>Instructor:</strong> ${teacher.fullName || teacher.name}</div>
            <div>⏱️ <strong>Duration:</strong> ${quiz.durationMinutes} Minutes</div>
            <div>📝 <strong>Questions:</strong> ${quiz.questions ? quiz.questions.length : 0} Questions</div>
            <div>🏆 <strong>Total Marks:</strong> ${quiz.totalMarks} Marks</div>
            <div>🎯 <strong>Passing Score:</strong> ${quiz.passingMarks} Marks</div>
            <div>📅 <strong>Deadline:</strong> ${new Date(quiz.endDate).toLocaleDateString()}</div>
          </div>
        </div>

        <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid var(--warning); padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.8rem;" class="text-muted">
          ⚠️ <strong>Instructions:</strong> Once you click <strong>Start Quiz</strong>, the timer countdown will begin. Ensure a stable network connection before starting.
        </div>
      `;
    }

    const footerEl = document.getElementById("quiz-modal-footer-actions");
    if (footerEl) {
      footerEl.innerHTML = `
        <button type="button" class="btn btn-outline" onclick="SmartLearnApp.closeModal('quiz-detail-modal')">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="SmartLearnQuizzes.startQuiz('${quiz.id}')">
          🚀 Start Quiz Now
        </button>
      `;
    }

    SmartLearnApp.openModal("quiz-detail-modal");
  },

  startQuiz(quizId) {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const quiz = SmartLearnStorage.getQuizById(quizId);
    if (!quiz) return;

    SmartLearnApp.closeModal("quiz-detail-modal");

    // Check active unfinished attempt state in localStorage
    const activeKey = `classoraActiveAttempt_${quiz.id}_${user.id}`;
    let savedAttempt = null;
    try {
      savedAttempt = JSON.parse(localStorage.getItem(activeKey) || "null");
    } catch (e) { }

    if (savedAttempt && savedAttempt.status === "in-progress") {
      this.activeAttempt = savedAttempt;
    } else {
      this.activeAttempt = {
        id: "att_" + Date.now(),
        quizId: quiz.id,
        studentId: user.id,
        startedAt: new Date().toISOString(),
        answers: [],
        currentQuestionIndex: 0,
        status: "in-progress"
      };
      localStorage.setItem(activeKey, JSON.stringify(this.activeAttempt));
    }

    this.activeQuiz = quiz;
    this.activeQuestionIndex = this.activeAttempt.currentQuestionIndex || 0;

    // Open Active Interface Modal
    SmartLearnApp.openModal("quiz-active-interface-modal");

    // Start Live Timer
    this.startTimer();

    // Render Question Navigator & Active Question
    this.renderQuestionNavigator();
    this.renderActiveQuestion();
  },

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const updateTimerDisplay = () => {
      if (!this.activeQuiz || !this.activeAttempt) return;

      const startTime = new Date(this.activeAttempt.startedAt).getTime();
      const durationMs = (this.activeQuiz.durationMinutes || 15) * 60 * 1000;
      const elapsedMs = Date.now() - startTime;
      const remainingMs = durationMs - elapsedMs;

      if (remainingMs <= 0) {
        clearInterval(this.timerInterval);
        const timerEl = document.getElementById("active-quiz-timer");
        if (timerEl) timerEl.innerText = "00:00";

        SmartLearnApp.showToast("⏳ Time's up! Your quiz is being automatically submitted now...", "warning", 5000);
        this.finalizeQuizSubmission(true);
        return;
      }

      const totalSecs = Math.floor(remainingMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;

      const timerEl = document.getElementById("active-quiz-timer");
      if (timerEl) {
        timerEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    };

    updateTimerDisplay();
    this.timerInterval = setInterval(updateTimerDisplay, 1000);
  },

  renderQuestionNavigator() {
    const navGrid = document.getElementById("active-quiz-nav-grid");
    if (!navGrid || !this.activeQuiz) return;

    const questions = this.activeQuiz.questions || [];
    navGrid.innerHTML = questions.map((q, idx) => {
      const isAnswered = this.activeAttempt.answers.some(ans => ans.questionId === q.id && ans.answer !== undefined && ans.answer !== "");
      const isActive = idx === this.activeQuestionIndex;

      let cssClasses = "question-nav-pill";
      if (isActive) cssClasses += " active";
      if (isAnswered) cssClasses += " answered";

      return `
        <button class="${cssClasses}" onclick="SmartLearnQuizzes.jumpToQuestion(${idx})">
          ${idx + 1} ${isAnswered ? '✓' : ''}
        </button>
      `;
    }).join("");
  },

  jumpToQuestion(index) {
    if (!this.activeQuiz || index < 0 || index >= this.activeQuiz.questions.length) return;
    this.activeQuestionIndex = index;
    this.activeAttempt.currentQuestionIndex = index;
    this.saveActiveAttemptState();

    this.renderQuestionNavigator();
    this.renderActiveQuestion();
  },

  navigateQuestion(direction) {
    const newIdx = this.activeQuestionIndex + direction;
    this.jumpToQuestion(newIdx);
  },

  renderActiveQuestion() {
    if (!this.activeQuiz) return;

    const questions = this.activeQuiz.questions || [];
    const question = questions[this.activeQuestionIndex];
    if (!question) return;

    // Header & Subtitle
    const titleEl = document.getElementById("active-quiz-title");
    if (titleEl) titleEl.innerText = this.activeQuiz.title;

    const subEl = document.getElementById("active-quiz-subtitle");
    if (subEl) subEl.innerText = `Question ${this.activeQuestionIndex + 1} of ${questions.length}`;

    // Progress bar
    const pBar = document.getElementById("active-quiz-progress-bar");
    if (pBar) {
      const pct = Math.round(((this.activeQuestionIndex + 1) / questions.length) * 100);
      pBar.style.width = `${pct}%`;
    }

    // Question badges
    const numBadge = document.getElementById("active-question-num-badge");
    if (numBadge) numBadge.innerText = `Question ${this.activeQuestionIndex + 1}`;

    const marksBadge = document.getElementById("active-question-marks-badge");
    if (marksBadge) marksBadge.innerText = `${question.marks || 1} Marks`;

    // Question Text
    const qText = document.getElementById("active-question-text");
    if (qText) qText.innerText = question.question;

    // Find saved answer
    const savedAnsObj = this.activeAttempt.answers.find(a => a.questionId === question.id);
    const savedAns = savedAnsObj ? savedAnsObj.answer : null;

    // Options Container
    const optContainer = document.getElementById("active-question-options-container");
    if (optContainer) {
      if (question.type === "mcq" || question.type === "tf") {
        const options = question.options || [];
        optContainer.innerHTML = options.map(opt => {
          const isSelected = savedAns === opt.id;
          return `
            <div class="option-card ${isSelected ? 'selected' : ''}" onclick="SmartLearnQuizzes.selectAnswer('${question.id}', '${opt.id}', 'single')">
              <div class="option-radio"></div>
              <div class="text-sm">${opt.text}</div>
            </div>
          `;
        }).join("");
      } else if (question.type === "multiple") {
        const options = question.options || [];
        const selectedArr = Array.isArray(savedAns) ? savedAns : [];
        optContainer.innerHTML = options.map(opt => {
          const isSelected = selectedArr.includes(opt.id);
          return `
            <div class="option-card ${isSelected ? 'selected' : ''}" onclick="SmartLearnQuizzes.selectAnswer('${question.id}', '${opt.id}', 'multiple')">
              <div class="option-radio" style="border-radius: 4px;">${isSelected ? '✓' : ''}</div>
              <div class="text-sm">${opt.text}</div>
            </div>
          `;
        }).join("");
      } else if (question.type === "short") {
        optContainer.innerHTML = `
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Type Your Answer Below:</label>
            <textarea class="form-control" rows="3" placeholder="Enter short answer response..." oninput="SmartLearnQuizzes.selectAnswer('${question.id}', this.value, 'short')">${savedAns || ''}</textarea>
          </div>
        `;
      }
    }

    // Prev / Next button states
    const prevBtn = document.getElementById("active-quiz-prev-btn");
    if (prevBtn) prevBtn.disabled = this.activeQuestionIndex === 0;

    const nextBtn = document.getElementById("active-quiz-next-btn");
    if (nextBtn) {
      if (this.activeQuestionIndex === questions.length - 1) {
        nextBtn.innerText = "Finish Question →";
      } else {
        nextBtn.innerText = "Next Question →";
      }
    }
  },

  selectAnswer(questionId, value, type) {
    if (!this.activeAttempt) return;

    let ansIndex = this.activeAttempt.answers.findIndex(a => a.questionId === questionId);

    if (type === "single" || type === "short") {
      if (ansIndex >= 0) {
        this.activeAttempt.answers[ansIndex].answer = value;
      } else {
        this.activeAttempt.answers.push({ questionId, answer: value });
      }
    } else if (type === "multiple") {
      if (ansIndex >= 0) {
        let currentArr = Array.isArray(this.activeAttempt.answers[ansIndex].answer) ? [...this.activeAttempt.answers[ansIndex].answer] : [];
        const optIdx = currentArr.indexOf(value);
        if (optIdx >= 0) {
          currentArr.splice(optIdx, 1);
        } else {
          currentArr.push(value);
        }
        this.activeAttempt.answers[ansIndex].answer = currentArr;
      } else {
        this.activeAttempt.answers.push({ questionId, answer: [value] });
      }
    }

    this.saveActiveAttemptState();
    this.renderQuestionNavigator();
    this.renderActiveQuestion();
  },

  saveActiveAttemptState() {
    if (!this.activeQuiz || !this.activeAttempt) return;
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const activeKey = `classoraActiveAttempt_${this.activeQuiz.id}_${user.id}`;
    localStorage.setItem(activeKey, JSON.stringify(this.activeAttempt));
  },

  confirmSubmitQuiz() {
    if (!this.activeQuiz || !this.activeAttempt) return;

    const questions = this.activeQuiz.questions || [];
    const answeredCount = this.activeAttempt.answers.filter(a => a.answer !== undefined && a.answer !== "" && (Array.isArray(a.answer) ? a.answer.length > 0 : true)).length;

    const msgEl = document.getElementById("submit-confirm-message");
    if (msgEl) {
      msgEl.innerText = `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to finalize your quiz submission?`;
    }

    SmartLearnApp.openModal("quiz-submit-confirm-modal");
  },

  finalizeQuizSubmission(isAuto = false) {
    if (!this.activeQuiz || !this.activeAttempt) return;

    if (this.timerInterval) clearInterval(this.timerInterval);
    SmartLearnApp.closeModal("quiz-submit-confirm-modal");

    const quiz = this.activeQuiz;
    const questions = quiz.questions || [];
    const user = SmartLearnAuth.getCurrentUser();

    // Calculate score
    let totalScore = 0;
    questions.forEach(q => {
      const userAnsObj = this.activeAttempt.answers.find(a => a.questionId === q.id);
      const userAns = userAnsObj ? userAnsObj.answer : null;

      if (q.type === "mcq" || q.type === "tf") {
        if (userAns === q.correctAnswer) {
          totalScore += (q.marks || 1);
        }
      } else if (q.type === "multiple") {
        if (Array.isArray(userAns) && Array.isArray(q.correctAnswer)) {
          const s1 = [...userAns].sort().join(",");
          const s2 = [...q.correctAnswer].sort().join(",");
          if (s1 === s2) totalScore += (q.marks || 1);
        }
      } else if (q.type === "short") {
        if (typeof userAns === "string" && typeof q.correctAnswer === "string") {
          if (userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            totalScore += (q.marks || 1);
          }
        }
      }
    });

    const totalMarks = quiz.totalMarks || 20;
    const percentage = Math.round((totalScore / totalMarks) * 100);
    const passed = totalScore >= (quiz.passingMarks || 10);

    // Finalize attempt object
    const finalAttempt = {
      ...this.activeAttempt,
      submittedAt: new Date().toISOString(),
      score: totalScore,
      totalMarks,
      percentage,
      status: "submitted",
      passed
    };

    // Save attempt to classoraQuizAttempts
    const allAttempts = SmartLearnStorage.getQuizAttempts();
    allAttempts.push(finalAttempt);
    SmartLearnStorage.saveQuizAttempts(allAttempts);

    // Sync to student Gradebook
    const grades = SmartLearnStorage.getGrades() || [];
    grades.push({
      id: "gr_" + Date.now(),
      studentId: user.id,
      subject: quiz.subjectName || "Computer Science",
      testName: quiz.title,
      maxMarks: totalMarks,
      scoredMarks: totalScore,
      percentage: percentage,
      date: new Date().toISOString().split("T")[0]
    });
    SmartLearnStorage.saveGrades(grades);

    // Automatically notify Teacher(s)
    const teachers = SmartLearnStorage.getTeachers();
    teachers.forEach(tch => {
      SmartLearnStorage.addNotification({
        userId: tch.id,
        title: "Quiz Completed by Student 📝",
        message: `Student ${user.fullName || user.name} (${user.className || 'B.Tech CSE'}-${user.section || 'A'}) completed '${quiz.title}' with score ${totalScore}/${totalMarks} (${percentage}%).`
      });
    });

    // Automatically notify Parent(s) specifically linked to this student
    const studentCode = user.studentId || user.id;
    const parents = SmartLearnStorage.getParentsByStudentId(studentCode);
    parents.forEach(prt => {
      SmartLearnStorage.addNotification({
        userId: prt.id,
        title: "Child Quiz Result Published 📊",
        message: `Your child ${user.fullName || user.name} scored ${totalScore}/${totalMarks} (${percentage}%) in '${quiz.title}'.`
      });
    });

    // Clear active saved state
    const activeKey = `classoraActiveAttempt_${quiz.id}_${user.id}`;
    localStorage.removeItem(activeKey);

    SmartLearnApp.closeModal("quiz-active-interface-modal");

    this.activeQuiz = null;
    this.activeAttempt = null;

    SmartLearnApp.showToast(`Quiz Submitted! You scored ${totalScore}/${totalMarks} (${percentage}%). ${passed ? '🎉 Passed' : '❌ Needs Practice'}`, passed ? "success" : "warning", 5000);

    // View result modal
    this.viewQuizResult(finalAttempt.id);

    // Refresh module
    this.renderQuizzesModule();
  },

  viewQuizResult(attemptId) {
    const allAttempts = SmartLearnStorage.getQuizAttempts();
    const attempt = allAttempts.find(a => a.id === attemptId);
    if (!attempt) return;

    const quiz = SmartLearnStorage.getQuizById(attempt.quizId);
    if (!quiz) return;

    const subject = SmartLearnStorage.getSubjectById(quiz.subjectId);
    const questions = quiz.questions || [];

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const reviewHtml = questions.map((q, idx) => {
      const userAnsObj = attempt.answers.find(a => a.questionId === q.id);
      const userAns = userAnsObj ? userAnsObj.answer : null;

      let isCorrect = false;
      if (q.type === "mcq" || q.type === "tf") {
        isCorrect = (userAns === q.correctAnswer);
      } else if (q.type === "multiple") {
        if (Array.isArray(userAns) && Array.isArray(q.correctAnswer)) {
          isCorrect = ([...userAns].sort().join(",") === [...q.correctAnswer].sort().join(","));
        }
      } else if (q.type === "short") {
        if (typeof userAns === "string" && typeof q.correctAnswer === "string") {
          isCorrect = (userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
        }
      }

      if (!userAns || (Array.isArray(userAns) && !userAns.length)) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      // Format answers
      let userAnsText = "Unanswered";
      let correctAnsText = "";

      if (q.type === "mcq" || q.type === "tf") {
        const uOpt = (q.options || []).find(o => o.id === userAns);
        userAnsText = uOpt ? uOpt.text : (userAns || "Unanswered");

        const cOpt = (q.options || []).find(o => o.id === q.correctAnswer);
        correctAnsText = cOpt ? cOpt.text : q.correctAnswer;
      } else if (q.type === "multiple") {
        const uOpts = (q.options || []).filter(o => Array.isArray(userAns) && userAns.includes(o.id));
        userAnsText = uOpts.map(o => o.text).join(", ") || "Unanswered";

        const cOpts = (q.options || []).filter(o => Array.isArray(q.correctAnswer) && q.correctAnswer.includes(o.id));
        correctAnsText = cOpts.map(o => o.text).join(", ");
      } else if (q.type === "short") {
        userAnsText = userAns || "Unanswered";
        correctAnsText = q.correctAnswer;
      }

      return `
        <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.85rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.8rem;">
            <span class="font-bold">Question ${idx + 1} (${q.marks || 1} Marks)</span>
            <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}">
              ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          </div>
          <div class="font-bold text-sm" style="color: var(--text-main); margin-bottom: 0.5rem;">${q.question}</div>
          <div style="font-size: 0.8rem;" class="text-muted">
            <div>Your Answer: <strong style="color: ${isCorrect ? 'var(--success)' : 'var(--danger)'};">${userAnsText}</strong></div>
            ${!isCorrect ? `<div>Correct Answer: <strong style="color: var(--success);">${correctAnsText}</strong></div>` : ''}
          </div>
        </div>
      `;
    }).join("");

    const bodyEl = document.getElementById("quiz-result-body-content");
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(99,102,241,0.02) 100%); text-align: center; padding: 1.5rem; margin-bottom: 1.5rem;">
          <div class="badge ${attempt.passed ? 'badge-success' : 'badge-danger'}" style="font-size: 0.85rem; padding: 0.4rem 1rem; margin-bottom: 0.6rem;">
            ${attempt.passed ? '🎉 Passed Quiz' : '❌ Needs Practice'}
          </div>
          <h2 style="font-size: 2.25rem; font-weight: 800; color: var(--text-main); line-height: 1;">${attempt.percentage}%</h2>
          <div class="text-sm font-bold" style="color: var(--text-muted); margin-top: 0.35rem;">
            Score: ${attempt.score} / ${attempt.totalMarks} Marks
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; text-align: center; margin-bottom: 1.5rem; font-size: 0.85rem;">
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px;">
            <div class="font-bold text-lg" style="color: var(--success);">${correctCount}</div>
            <div class="text-xs text-muted">Correct</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px;">
            <div class="font-bold text-lg" style="color: var(--danger);">${incorrectCount}</div>
            <div class="text-xs text-muted">Incorrect</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px;">
            <div class="font-bold text-lg" style="color: var(--warning);">${unansweredCount}</div>
            <div class="text-xs text-muted">Unanswered</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px;">
            <div class="font-bold text-lg" style="color: var(--primary);">${questions.length}</div>
            <div class="text-xs text-muted">Total Questions</div>
          </div>
        </div>

        <h3 class="font-bold text-md" style="margin-bottom: 0.85rem; color: var(--text-main);">Detailed Question Review</h3>
        ${reviewHtml}
      `;
    }

    const actionsEl = document.getElementById("quiz-result-footer-actions");
    if (actionsEl) {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-primary" onclick="SmartLearnApp.closeModal('quiz-result-modal')">Done</button>
      `;
    }

    SmartLearnApp.openModal("quiz-result-modal");
  },

  renderSubjectPerformance(submittedAttempts, allQuizzes) {
    const container = document.getElementById("quiz-subject-performance-list");
    const insightsContainer = document.getElementById("quiz-learning-insights-container");
    if (!container) return;

    if (!submittedAttempts.length) {
      container.innerHTML = `<div class="text-xs text-muted">No completed quiz attempts yet to generate analytics.</div>`;
      if (insightsContainer) {
        insightsContainer.innerHTML = `<div class="text-xs text-muted">Complete quizzes to unlock personalized learning insights.</div>`;
      }
      return;
    }

    // Group scores by subject
    const subjectScores = {};
    submittedAttempts.forEach(att => {
      const quiz = SmartLearnStorage.getQuizById(att.quizId);
      if (quiz) {
        const subjName = quiz.subjectName || SmartLearnStorage.getSubjectById(quiz.subjectId).name || "General";
        if (!subjectScores[subjName]) {
          subjectScores[subjName] = { totalPct: 0, count: 0 };
        }
        subjectScores[subjName].totalPct += (att.percentage || 0);
        subjectScores[subjName].count += 1;
      }
    });

    const subjectAverages = Object.keys(subjectScores).map(name => {
      const avg = Math.round(subjectScores[name].totalPct / subjectScores[name].count);
      return { name, avg };
    });

    subjectAverages.sort((a, b) => b.avg - a.avg);

    container.innerHTML = subjectAverages.map(s => {
      let colorClass = "var(--primary)";
      if (s.avg >= 85) colorClass = "var(--success)";
      else if (s.avg < 60) colorClass = "var(--danger)";

      return `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.35rem;">
            <span>${s.name}</span>
            <span style="color: ${colorClass};">${s.avg}% Avg</span>
          </div>
          <div style="height: 8px; background: var(--bg-subtle); border-radius: 10px; overflow: hidden;">
            <div style="width: ${s.avg}%; height: 100%; background: ${colorClass}; transition: width 0.4s ease;"></div>
          </div>
        </div>
      `;
    }).join("");

    // Dynamic Learning Insights
    if (insightsContainer) {
      const strongest = subjectAverages[0];
      const weakest = subjectAverages[subjectAverages.length - 1];

      let insightText = '';
      if (strongest) {
        insightText += `🌟 <strong>Strongest Subject:</strong> You excel in <strong>${strongest.name}</strong> with a average quiz score of <strong>${strongest.avg}%</strong>.<br><br>`;
      }
      if (weakest && weakest.name !== strongest?.name) {
        insightText += `💡 <strong>Focus Area:</strong> You may need additional practice in <strong>${weakest.name}</strong> (avg ${weakest.avg}%). Recommended: Review lecture notes in Study Materials.`;
      } else {
        insightText += `🚀 Great job! Keep attempting assigned quizzes to maintain your high academic standing.`;
      }

      insightsContainer.innerHTML = `<div class="text-xs text-muted" style="line-height: 1.6;">${insightText}</div>`;
    }
  },

  renderQuizHistory(submittedAttempts) {
    const tbody = document.getElementById("quiz-history-tbody");
    const countEl = document.getElementById("quiz-history-count");
    if (!tbody) return;

    if (countEl) countEl.innerText = `${submittedAttempts.length} Attempts Recorded`;

    if (!submittedAttempts.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 2rem; text-align: center;" class="text-muted text-xs">
            No quiz attempts recorded yet. Start an available quiz above!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = submittedAttempts.map(att => {
      const quiz = SmartLearnStorage.getQuizById(att.quizId);
      const subject = quiz ? SmartLearnStorage.getSubjectById(quiz.subjectId) : { name: "General" };
      const dateFormatted = new Date(att.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

      return `
        <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">
          <td style="padding: 0.75rem; font-weight: 600; color: var(--text-main);">${quiz ? quiz.title : 'Quiz'}</td>
          <td style="padding: 0.75rem;" class="text-muted">${subject.name || 'General'}</td>
          <td style="padding: 0.75rem;" class="text-muted">${dateFormatted}</td>
          <td style="padding: 0.75rem; font-weight: 700;">${att.score} / ${att.totalMarks}</td>
          <td style="padding: 0.75rem; font-weight: 700;">${att.percentage}%</td>
          <td style="padding: 0.75rem;">
            <span class="badge ${att.passed ? 'badge-success' : 'badge-danger'}">
              ${att.passed ? 'Passed' : 'Failed'}
            </span>
          </td>
          <td style="padding: 0.75rem; text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="SmartLearnQuizzes.viewQuizResult('${att.id}')">
              Review 👁️
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }
};

/**
 * SmartLearn - Teacher Quiz Management Controller
 * Allows teachers to create, publish, unpublish, delete quizzes and analyze student attempt scores.
 */
const SmartLearnTeacherQuizzes = {
  questionsBuffer: [],

  init() {
    this.renderTeacherQuizzes();
  },

  renderQuizzesGrid() {
    this.renderTeacherQuizzes();
  },

  publishQuiz(e) {
    if (e) e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const title = document.getElementById("quiz-title")?.value.trim();
    const subject = document.getElementById("quiz-subject")?.value.trim() || (user.subject || "Computer Science");
    const classId = document.getElementById("quiz-class")?.value || "B.Tech CSE";
    const section = document.getElementById("quiz-section")?.value || "ALL";
    const duration = parseInt(document.getElementById("quiz-duration")?.value) || 15;
    const totalMarks = parseInt(document.getElementById("quiz-totalmarks")?.value) || 20;
    const desc = document.getElementById("quiz-desc")?.value.trim() || "";

    if (!title) {
      SmartLearnApp.showToast("Please enter a quiz title!", "warning");
      return;
    }

    const quizzes = SmartLearnStorage.get(STORAGE_KEYS.QUIZZES) || [];
    const newQuiz = {
      id: "quiz_" + Date.now(),
      title: title,
      subjectName: subject,
      subject: subject,
      className: classId,
      classId: classId,
      section: section,
      durationMinutes: duration,
      totalMarks: totalMarks,
      description: desc,
      published: true,
      createdBy: user.fullName || user.name || "Faculty",
      createdAt: new Date().toISOString()
    };

    quizzes.unshift(newQuiz);
    SmartLearnStorage.set(STORAGE_KEYS.QUIZZES, quizzes);

    if (typeof sendNotificationToSection === "function") {
      sendNotificationToSection(classId, section, "New Quiz Available 🎯", `${user.fullName || user.name || 'Faculty'} published a new quiz '${title}' (${totalMarks} Marks, ${duration} mins) for ${classId} - ${section === 'ALL' ? 'All Sections' : 'Sec ' + section}.`);
    }

    SmartLearnApp.showToast(`Quiz '${title}' published for ${classId} ${section === 'ALL' ? 'All Sections' : 'Sec ' + section}! 🎉`, "success");
    SmartLearnApp.closeModal("create-quiz-modal");

    if (document.getElementById("quiz-title")) document.getElementById("quiz-title").value = "";
    if (document.getElementById("quiz-desc")) document.getElementById("quiz-desc").value = "";

    this.renderTeacherQuizzes();
  },

  renderTeacherQuizzes() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const allQuizzes = SmartLearnStorage.getQuizzes();
    const allAttempts = SmartLearnStorage.getQuizAttempts();

    const isDemoTeacher = user && (user.id === "usr_teacher_01" || user.email === "teacher@classora.demo");
    const teacherQuizzes = allQuizzes.filter(q => {
      if (q.teacherId === user.id || q.createdBy === user.fullName || q.createdBy === user.name) return true;
      if (isDemoTeacher && (q.teacherId === "usr_teacher_01" || q.teacherId === "user_teacher_1")) return true;
      return false;
    });

    const countEl = document.getElementById("teacher-quiz-count-badge");
    if (countEl) countEl.innerText = `${teacherQuizzes.length} Quizzes`;

    const container = document.getElementById("teacher-quizzes-grid");
    if (!container) return;

    if (!teacherQuizzes.length) {
      container.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🎯</div>
          <h3 class="font-bold text-lg" style="color: var(--text-main); margin-bottom: 0.4rem;">No Quizzes Created Yet</h3>
          <p class="text-sm text-muted">Click "Create New Quiz" above to design your first automated assessment for students.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = teacherQuizzes.map(q => {
      const attempts = allAttempts.filter(a => a.quizId === q.id && a.status === "submitted");
      const attemptCount = attempts.length;

      let avgPct = 0;
      let passCount = 0;
      if (attemptCount > 0) {
        const sumPct = attempts.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
        avgPct = Math.round(sumPct / attemptCount);
        passCount = attempts.filter(a => a.passed).length;
      }

      const passRate = attemptCount > 0 ? Math.round((passCount / attemptCount) * 100) : 0;
      const subject = SmartLearnStorage.getSubjectById(q.subjectId);

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="badge badge-primary">${subject.name || q.subjectName || 'General'}</span>
              <span class="badge ${q.published ? 'badge-success' : 'badge-warning'}">
                ${q.published ? '● Published' : '○ Draft'}
              </span>
            </div>

            <h3 class="font-bold text-md" style="color: var(--text-main); margin-bottom: 0.35rem;">${q.title}</h3>
            <p class="text-xs text-muted" style="margin-bottom: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${q.description || 'No description provided.'}
            </p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px; font-size: 0.75rem; margin-bottom: 1rem;">
              <div>⏱️ <strong>${q.durationMinutes} Mins</strong></div>
              <div>🎯 <strong>${q.questions ? q.questions.length : 0} Qs</strong></div>
              <div>🏆 <strong>${q.totalMarks} Marks</strong></div>
              <div>🏫 <strong>Class ${q.classId || '11'}-${q.section || 'A'}</strong></div>
            </div>

            <!-- Attempt Analytics Summary -->
            <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-bottom: 1rem; font-size: 0.8rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span class="text-muted">Student Submissions:</span>
                <span class="font-bold">${attemptCount} Attempts</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span class="text-muted">Average Score:</span>
                <span class="font-bold" style="color: var(--primary);">${avgPct}%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="text-muted">Pass Rate:</span>
                <span class="font-bold" style="color: var(--success);">${passRate}%</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="SmartLearnTeacherQuizzes.viewQuizAttempts('${q.id}')">
              📊 View Attempts (${attemptCount})
            </button>
            <button class="btn btn-outline btn-sm" onclick="SmartLearnTeacherQuizzes.togglePublish('${q.id}')" title="Toggle Publish Status">
              ${q.published ? 'Unpublish' : 'Publish'}
            </button>
            <button class="btn btn-outline btn-sm" style="color: var(--danger);" onclick="SmartLearnTeacherQuizzes.deleteQuiz('${q.id}')" title="Delete Quiz">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  togglePublish(quizId) {
    const quizzes = SmartLearnStorage.getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      quiz.published = !quiz.published;
      SmartLearnStorage.saveQuizzes(quizzes);
      SmartLearnApp.showToast(quiz.published ? "Quiz published to students! 🚀" : "Quiz set to Draft mode.", "info");
      this.renderTeacherQuizzes();
    }
  },

  deleteQuiz(quizId) {
    if (!confirm("Are you sure you want to delete this quiz? All student attempt records for this quiz will remain archived.")) return;

    let quizzes = SmartLearnStorage.getQuizzes();
    quizzes = quizzes.filter(q => q.id !== quizId);
    SmartLearnStorage.saveQuizzes(quizzes);

    SmartLearnApp.showToast("Quiz deleted successfully.", "info");
    this.renderTeacherQuizzes();
  },

  viewQuizAttempts(quizId) {
    const quiz = SmartLearnStorage.getQuizById(quizId);
    if (!quiz) return;

    const allAttempts = SmartLearnStorage.getQuizAttempts();
    const quizAttempts = allAttempts.filter(a => a.quizId === quizId && a.status === "submitted");
    const users = SmartLearnStorage.getUsers();

    const titleEl = document.getElementById("teacher-attempts-modal-title");
    if (titleEl) titleEl.innerText = `Submissions: ${quiz.title}`;

    const bodyEl = document.getElementById("teacher-attempts-modal-body");
    if (bodyEl) {
      if (!quizAttempts.length) {
        bodyEl.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem;" class="text-muted">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📝</div>
            <div class="font-bold text-md">No Student Attempts Recorded</div>
            <div class="text-xs">No students have completed this quiz yet.</div>
          </div>
        `;
      } else {
        const rowsHtml = quizAttempts.map((att, idx) => {
          const student = users.find(u => u.id === att.studentId) || { fullName: "Student " + (idx + 1), studentId: "STU-00" + (idx + 1) };
          const dateStr = new Date(att.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

          return `
            <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">
              <td style="padding: 0.75rem; font-weight: 600; color: var(--text-main);">${student.fullName || student.name}</td>
              <td style="padding: 0.75rem;" class="text-muted">${student.studentId || 'STU-100' + idx}</td>
              <td style="padding: 0.75rem;" class="text-muted">${dateStr}</td>
              <td style="padding: 0.75rem; font-weight: 700;">${att.score} / ${att.totalMarks}</td>
              <td style="padding: 0.75rem; font-weight: 700;">${att.percentage}%</td>
              <td style="padding: 0.75rem;">
                <span class="badge ${att.passed ? 'badge-success' : 'badge-danger'}">
                  ${att.passed ? 'Passed' : 'Failed'}
                </span>
              </td>
            </tr>
          `;
        }).join("");

        bodyEl.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; text-align: center; margin-bottom: 1.25rem;">
            <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px;">
              <div class="font-bold text-lg" style="color: var(--primary);">${quizAttempts.length}</div>
              <div class="text-xs text-muted">Total Submissions</div>
            </div>
            <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px;">
              <div class="font-bold text-lg" style="color: var(--success);">${Math.round(quizAttempts.reduce((a, b) => a + b.percentage, 0) / quizAttempts.length)}%</div>
              <div class="text-xs text-muted">Average Score</div>
            </div>
            <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px;">
              <div class="font-bold text-lg" style="color: var(--info);">${quizAttempts.filter(a => a.passed).length} / ${quizAttempts.length}</div>
              <div class="text-xs text-muted">Students Passed</div>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); font-size: 0.75rem; color: var(--text-muted);">
                  <th style="padding: 0.5rem;">Student Name</th>
                  <th style="padding: 0.5rem;">Student ID</th>
                  <th style="padding: 0.5rem;">Submitted Date</th>
                  <th style="padding: 0.5rem;">Score</th>
                  <th style="padding: 0.5rem;">Percentage</th>
                  <th style="padding: 0.5rem;">Result</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    SmartLearnApp.openModal("teacher-quiz-attempts-modal");
  },

  openCreateQuizModal() {
    const presetSelect = document.getElementById("create-quiz-qcount-preset");
    const countVal = presetSelect ? presetSelect.value : "20";
    this.handleQuestionCountPresetChange(countVal);

    SmartLearnApp.openModal("teacher-create-quiz-modal");
  },

  handleQuestionCountPresetChange(presetVal) {
    let count = 20;
    if (presetVal === "5") count = 5;
    else if (presetVal === "20") count = 20;
    else if (presetVal === "25") count = 25;
    else if (presetVal === "30") count = 30;
    else if (presetVal === "50") count = 50;
    else if (presetVal === "custom") count = this.questionsBuffer.length || 5;

    const totalMarksInput = document.getElementById("create-quiz-total-marks");
    const marksPerQInput = document.getElementById("create-quiz-marks-per-q");
    const marksPerQ = marksPerQInput ? parseFloat(marksPerQInput.value) || 1 : 1;

    if (totalMarksInput) {
      totalMarksInput.value = count * marksPerQ;
    }

    // Build question buffer array with matching question count
    this.questionsBuffer = [];
    const subjectsSample = [
      "What is the time complexity of searching in a Balanced Binary Search Tree?",
      "Which data structure follows the Last-In-First-Out (LIFO) order?",
      "In Object-Oriented Programming, which concept refers to hiding internal details?",
      "What is the primary function of an Operating System Kernel?",
      "Which algorithm is commonly used for finding the shortest path in a weighted graph?",
      "Which protocol is primarily used for secure web traffic encryption?",
      "What is the worst-case time complexity of QuickSort?",
      "Which memory allocation area stores local function variables and call frames?",
      "In relational databases, which SQL clause filters records after aggregation?",
      "What is the default port number for HTTP web connections?"
    ];

    for (let i = 1; i <= count; i++) {
      const sampleQuestion = subjectsSample[(i - 1) % subjectsSample.length];
      const qText = count > 10 ? `Q${i}. ${sampleQuestion} (Assessment Item #${i})` : `Q${i}. ${sampleQuestion}`;

      this.questionsBuffer.push({
        id: `q_${Date.now()}_${i}`,
        question: qText,
        type: "mcq",
        marks: marksPerQ,
        options: [
          { id: `opt_a_${i}`, text: i % 2 === 0 ? "O(log N) - Logarithmic Time" : "Stack Data Structure" },
          { id: `opt_b_${i}`, text: i % 2 === 0 ? "O(N^2) - Quadratic Time" : "Queue Data Structure" },
          { id: `opt_c_${i}`, text: i % 2 === 0 ? "O(1) - Constant Time" : "LinkedList Structure" },
          { id: `opt_d_${i}`, text: i % 2 === 0 ? "O(N log N)" : "Array Structure" }
        ],
        correctAnswer: `opt_a_${i}`
      });
    }

    this.renderQuestionsBuilder();
  },

  addQuestionToBuffer() {
    const qNum = this.questionsBuffer.length + 1;
    const marksPerQInput = document.getElementById("create-quiz-marks-per-q");
    const marksPerQ = marksPerQInput ? parseFloat(marksPerQInput.value) || 1 : 1;

    this.questionsBuffer.push({
      id: "q_" + Date.now() + "_" + qNum,
      question: `Question #${qNum}: Write custom question prompt here...`,
      type: "mcq",
      marks: marksPerQ,
      options: [
        { id: "opt_a_" + Date.now(), text: "Option A" },
        { id: "opt_b_" + Date.now(), text: "Option B" },
        { id: "opt_c_" + Date.now(), text: "Option C" },
        { id: "opt_d_" + Date.now(), text: "Option D" }
      ],
      correctAnswer: "opt_a_" + Date.now()
    });

    const totalMarksInput = document.getElementById("create-quiz-total-marks");
    if (totalMarksInput) {
      totalMarksInput.value = this.questionsBuffer.reduce((sum, q) => sum + (q.marks || 1), 0);
    }

    this.renderQuestionsBuilder();
  },

  removeQuestionFromBuffer(index) {
    if (this.questionsBuffer.length <= 1) {
      SmartLearnApp.showToast("Quiz must contain at least 1 question.", "warning");
      return;
    }
    this.questionsBuffer.splice(index, 1);

    const totalMarksInput = document.getElementById("create-quiz-total-marks");
    if (totalMarksInput) {
      totalMarksInput.value = this.questionsBuffer.reduce((sum, q) => sum + (q.marks || 1), 0);
    }

    this.renderQuestionsBuilder();
  },

  renderQuestionsBuilder() {
    const container = document.getElementById("teacher-questions-builder-container");
    if (!container) return;

    container.innerHTML = `
      <div style="font-size: 0.8rem; margin-bottom: 0.75rem; color: var(--text-muted); font-weight: 600;">
        Showing ${this.questionsBuffer.length} Questions (Total Marks: ${this.questionsBuffer.reduce((sum, q) => sum + (q.marks || 1), 0)})
      </div>
      ${this.questionsBuffer.map((q, idx) => `
        <div style="background: var(--bg-subtle); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span class="font-bold text-xs" style="color: var(--primary);">Question #${idx + 1}</span>
            <button type="button" class="btn btn-outline btn-sm" style="color: var(--danger); padding: 0.15rem 0.4rem; font-size: 0.75rem;" onclick="SmartLearnTeacherQuizzes.removeQuestionFromBuffer(${idx})">
              Remove Q#${idx + 1} 🗑️
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 4fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="text" class="form-control" style="font-size: 0.85rem;" placeholder="Enter Question Prompt..." value="${(q.question || '').replace(/"/g, '&quot;')}" oninput="SmartLearnTeacherQuizzes.questionsBuffer[${idx}].question = this.value">
            <input type="number" class="form-control" style="font-size: 0.85rem;" placeholder="Marks" value="${q.marks || 1}" min="0.5" step="0.5" oninput="SmartLearnTeacherQuizzes.questionsBuffer[${idx}].marks = parseFloat(this.value)||1">
          </div>

          <div class="form-group" style="margin-bottom: 0.25rem;">
            <label class="text-xs text-muted font-bold" style="font-size: 0.75rem;">Options & Answer Key:</label>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; margin-top: 0.25rem;">
              ${(q.options || []).map((opt, oIdx) => `
                <div style="display: flex; gap: 0.35rem; align-items: center;">
                  <input type="radio" name="correct_${q.id}" ${q.correctAnswer === opt.id ? 'checked' : ''} onchange="SmartLearnTeacherQuizzes.questionsBuffer[${idx}].correctAnswer = '${opt.id}'">
                  <input type="text" class="form-control" style="font-size: 0.775rem; padding: 0.25rem 0.5rem;" value="${(opt.text || '').replace(/"/g, '&quot;')}" oninput="SmartLearnTeacherQuizzes.questionsBuffer[${idx}].options[${oIdx}].text = this.value">
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `).join("")}
    `;
  },

  saveNewQuiz(e) {
    if (e) e.preventDefault();

    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const title = document.getElementById("create-quiz-title").value.trim();
    const subjectId = document.getElementById("create-quiz-subject").value;
    const durationMinutes = parseInt(document.getElementById("create-quiz-duration").value) || 20;
    const passingMarks = parseInt(document.getElementById("create-quiz-pass").value) || 10;
    const classId = document.getElementById("create-quiz-class").value;
    const section = document.getElementById("create-quiz-section").value;
    const description = document.getElementById("create-quiz-desc").value.trim();

    const editableTotalMarks = parseFloat(document.getElementById("create-quiz-total-marks").value) || this.questionsBuffer.length;

    if (!title || !subjectId) {
      SmartLearnApp.showToast("Please fill in the quiz title and subject fields.", "warning");
      return;
    }

    const subjectObj = SmartLearnStorage.getSubjectById(subjectId);
    const deadlineDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newQuiz = {
      id: "quiz_" + Date.now(),
      title,
      description: description || `Assessment created for ${classId} target. Total ${this.questionsBuffer.length} questions.`,
      subjectId,
      subjectName: subjectObj.name || subjectId || "Computer Science",
      teacherId: user.id,
      classId,
      section,
      durationMinutes,
      totalMarks: editableTotalMarks,
      passingMarks,
      attemptsAllowed: 1,
      startDate: new Date().toISOString(),
      endDate: deadlineDate,
      published: true,
      questions: JSON.parse(JSON.stringify(this.questionsBuffer)),
      createdAt: new Date().toISOString()
    };

    const quizzes = SmartLearnStorage.getQuizzes();
    quizzes.unshift(newQuiz);
    SmartLearnStorage.saveQuizzes(quizzes);

    // Notify targeted students
    const users = SmartLearnStorage.getUsers();
    const targetStudents = users.filter(u => (u.role || "").toLowerCase() === "student");

    targetStudents.forEach(st => {
      SmartLearnStorage.addNotification({
        userId: st.id,
        title: "New Quiz Published 🎯",
        message: `Faculty ${user.fullName || user.name || 'Teacher'} published '${title}' for ${classId}-${section} (${this.questionsBuffer.length} Questions, ${editableTotalMarks} Marks).`
      });
    });

    SmartLearnApp.showToast(`Quiz "${title}" (${this.questionsBuffer.length} Questions, ${editableTotalMarks} Marks) created and published to ${classId}! 🎉`, "success");
    SmartLearnApp.closeModal("teacher-create-quiz-modal");

    this.renderTeacherQuizzes();
  }
};

/**
 * SmartLearn - Parent Dashboard Controller
 * Dynamically binds linked child student data (marks, quiz attempts, attendance, progress)
 * specifically for the parent registered with that student's Student ID.
 */
const SmartLearnParent = {
  init() {
    const parent = SmartLearnAuth.getCurrentUser();
    if (!parent || parent.role !== "Parent") return;

    // Determine linked child student
    const allUsers = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const childIdCode = (parent.childStudentId || parent.studentId || "SL-2026-894").toString().toLowerCase().trim();

    let student = allUsers.find(u => u.role === "Student" && (
      (u.studentId && u.studentId.toString().toLowerCase().trim() === childIdCode) ||
      (u.id && u.id.toString().toLowerCase().trim() === childIdCode)
    ));

    // Fallback to default student if not found
    if (!student) {
      const firstStudent = allUsers.find(u => u.role === "Student");
      student = firstStudent || {
        id: "usr_student_none",
        fullName: "No Linked Student",
        studentId: "N/A",
        className: "N/A",
        section: "N/A"
      };
    }

    // 1. Render Header Subtitle
    const subEl = document.getElementById("student-name-sub");
    if (subEl) {
      subEl.innerHTML = `<strong>${student.fullName || student.name}</strong> (${student.className || 'B.Tech CSE'}-${student.section || 'A'}) • ID: ${student.studentId || 'SL-2026-894'}`;
    }

    // 2. Fetch Student Specific Grades & Quiz Attempts
    const allGrades = SmartLearnStorage.getGrades() || [];
    const studentGrades = allGrades.filter(g => g.studentId === student.id || g.studentId === student.studentId);

    const allAttempts = SmartLearnStorage.getQuizAttempts() || [];
    const studentQuizAttempts = allAttempts.filter(a => a.studentId === student.id && a.status === "submitted");

    // 3. Compute Metrics
    let totalPctSum = 0;
    let countItems = 0;

    studentGrades.forEach(g => {
      const pct = g.percentage || (g.scoredMarks && g.maxMarks ? Math.round((g.scoredMarks / g.maxMarks) * 100) : 85);
      totalPctSum += pct;
      countItems++;
    });

    studentQuizAttempts.forEach(a => {
      totalPctSum += (a.percentage || 80);
      countItems++;
    });

    const avgScorePct = countItems > 0 ? Math.round(totalPctSum / countItems) : 88;

    const statAvgEl = document.getElementById("parent-stat-avg-score");
    if (statAvgEl) statAvgEl.innerText = `${avgScorePct}%`;

    // 4. Render Recent Marks & Test Grades List
    const marksContainer = document.getElementById("parent-recent-marks-list");
    if (marksContainer) {
      const combinedMarks = [];

      studentGrades.forEach(g => {
        const pct = g.percentage || (g.scoredMarks && g.maxMarks ? Math.round((g.scoredMarks / g.maxMarks) * 100) : 85);
        combinedMarks.push({
          title: `${g.subject || 'Coursework'} • ${g.testName || 'Assignment'}`,
          detail: `${g.date || 'Recent'} • Scored ${g.scoredMarks} / ${g.maxMarks}`,
          pct: pct,
          date: g.date || '2026-08-20'
        });
      });

      studentQuizAttempts.forEach(a => {
        const quiz = SmartLearnStorage.getQuizById(a.quizId) || { title: "Quiz Test", subjectName: "General" };
        combinedMarks.push({
          title: `${quiz.subjectName || 'Quiz'} • ${quiz.title}`,
          detail: `${new Date(a.submittedAt).toLocaleDateString()} • Scored ${a.score} / ${a.totalMarks}`,
          pct: a.percentage || 80,
          date: a.submittedAt
        });
      });

      if (combinedMarks.length === 0) {
        combinedMarks.push(
          { title: "Data Structures • Unit Test 2", detail: "Aug 20, 2026 • Scored 46 / 50", pct: 92, date: "2026-08-20" },
          { title: "Computer Science • Practical Lab 1", detail: "Aug 18, 2026 • Scored 27 / 30", pct: 90, date: "2026-08-18" },
          { title: "Mathematics • Calculus Quiz", detail: "Aug 15, 2026 • Scored 16 / 20", pct: 80, date: "2026-08-15" }
        );
      }

      marksContainer.innerHTML = combinedMarks.slice(0, 5).map(m => {
        let badgeClass = "badge-success";
        if (m.pct < 60) badgeClass = "badge-danger";
        else if (m.pct < 75) badgeClass = "badge-warning";
        else if (m.pct < 85) badgeClass = "badge-primary";

        return `
          <div class="assignment-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
            <div>
              <div class="font-bold text-sm" style="color: var(--text-main);">${m.title}</div>
              <div class="text-xs text-muted" style="margin-top: 0.15rem;">${m.detail}</div>
            </div>
            <span class="badge ${badgeClass}">${m.pct}%</span>
          </div>
        `;
      }).join("");
    }

    // 5. Attendance & Subject Progress
    const attEl = document.getElementById("parent-stat-attendance");
    if (attEl) attEl.innerText = `${student.attendanceRate || 92}%`;

    const pendingEl = document.getElementById("parent-stat-pending");
    if (pendingEl) pendingEl.innerText = `${student.pendingAssignments || 1}`;

    const subjContainer = document.getElementById("parent-subject-progress");
    if (subjContainer) {
      subjContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between;" class="text-sm font-semibold">
          <span>Computer Science & IT</span>
          <span class="text-primary">${Math.min(100, avgScorePct + 5)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between;" class="text-sm font-semibold">
          <span>Mathematics</span>
          <span class="text-primary">${Math.max(60, avgScorePct - 3)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between;" class="text-sm font-semibold">
          <span>Physics & Mechanics</span>
          <span class="text-primary">${Math.max(55, avgScorePct - 6)}%</span>
        </div>
      `;
    }

    // 6. Render Child's Exam Timetable, Class Timetable & Announcements
    this.renderParentExams();
    this.renderParentSchedule();
    if (typeof SmartLearnAnnouncements !== "undefined") {
      SmartLearnAnnouncements.renderParentAnnouncements();
    }
  },

  renderParentExams() {
    const parent = SmartLearnAuth.getCurrentUser();
    if (!parent || parent.role !== "Parent") return;

    const allUsers = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const childIdCode = (parent.childStudentId || parent.studentId || "SL-2026-894").toString().toLowerCase().trim();

    let student = allUsers.find(u => u.role === "Student" && (
      (u.studentId && u.studentId.toString().toLowerCase().trim() === childIdCode) ||
      (u.id && u.id.toString().toLowerCase().trim() === childIdCode)
    ));

    if (!student) {
      const firstStudent = allUsers.find(u => u.role === "Student");
      student = firstStudent || { className: "N/A", section: "N/A", fullName: "No Student Found" };
    }

    const userClass = (student.className || student.class || "B.Tech CSE").toLowerCase();
    const userSection = (student.section || "A").toUpperCase();

    const badge = document.getElementById("parent-exam-child-badge");
    if (badge) badge.innerText = `${student.fullName || 'Student'} (${student.className || 'B.Tech CSE'}-${userSection})`;

    const allExams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    const childExams = allExams.filter(e => {
      const isApproved = (e.status === "approved" || !e.status || e.status === undefined);
      if (!isApproved) return false;

      const eClass = (e.className || e.class || "").toLowerCase();
      const matchClass = !eClass || eClass === userClass || userClass.includes(eClass) || eClass.includes(userClass);
      const matchSec = !e.section || e.section === "ALL" || e.section.toUpperCase() === userSection;
      return matchClass && matchSec;
    });

    const statExamsEl = document.getElementById("parent-stat-exams");
    if (statExamsEl) {
      const today = new Date().toISOString().split("T")[0];
      const upcomingCount = childExams.filter(e => e.examDate >= today).length;
      statExamsEl.innerText = upcomingCount;
    }

    const tbody = document.getElementById("parent-exam-timetable-body");
    if (!tbody) return;

    if (childExams.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No term examinations scheduled for ${student.fullName || 'Student'}'s class (${student.className || 'B.Tech CSE'}-${userSection}).</td></tr>`;
      return;
    }

    childExams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    const todayStr = new Date().toISOString().split("T")[0];

    tbody.innerHTML = childExams.map(item => {
      let statusBadge = `<span class="badge badge-info">Scheduled</span>`;
      if (item.examDate === todayStr) {
        statusBadge = `<span class="badge badge-danger" style="font-weight:700;">🔴 TODAY</span>`;
      } else if (item.examDate > todayStr) {
        const diffMs = new Date(item.examDate) - new Date(todayStr);
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        statusBadge = `<span class="badge badge-warning">In ${daysLeft} Day${daysLeft > 1 ? 's' : ''}</span>`;
      } else {
        statusBadge = `<span class="badge badge-secondary">Completed</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td><span class="badge badge-primary font-bold">${item.subject}</span></td>
          <td class="font-bold text-sm" style="color: var(--text-main);">${item.title}</td>
          <td class="font-bold text-sm">${item.examDate}</td>
          <td class="text-xs text-muted font-bold">${item.startTime} - ${item.endTime}</td>
          <td class="text-xs font-bold" style="color: var(--primary-color);">${item.room}</td>
          <td>${statusBadge}</td>
          <td class="text-xs text-muted" style="max-width: 250px; white-space: normal;">${item.instructions || 'Standard examination rules apply.'}</td>
        </tr>
      `;
    }).join("");
  },

  renderParentSchedule() {
    const parent = SmartLearnAuth.getCurrentUser();
    if (!parent || parent.role !== "Parent") return;

    const allUsers = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const childIdCode = (parent.childStudentId || parent.studentId || "SL-2026-894").toString().toLowerCase().trim();

    let student = allUsers.find(u => u.role === "Student" && (
      (u.studentId && u.studentId.toString().toLowerCase().trim() === childIdCode) ||
      (u.id && u.id.toString().toLowerCase().trim() === childIdCode)
    ));

    if (!student) {
      const firstStudent = allUsers.find(u => u.role === "Student");
      student = firstStudent || { className: "B.Tech CSE", section: "A", fullName: "Student Account" };
    }

    const userClass = student.className || student.class || "B.Tech CSE";
    const userSection = (student.section || "A").toUpperCase();

    const badge = document.getElementById("parent-tt-child-badge");
    if (badge) badge.innerText = `${student.fullName || 'Student'} (${userClass}-${userSection})`;

    const container = document.getElementById("parent-schedule-container");
    if (!container) return;

    const allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periodTimes = [
      { period: 1, startTime: "08:30", endTime: "09:15" },
      { period: 2, startTime: "09:15", endTime: "10:00" },
      { period: 3, startTime: "10:15", endTime: "11:00" },
      { period: 4, startTime: "11:00", endTime: "11:45" },
      { period: 5, startTime: "12:30", endTime: "01:15" },
      { period: 6, startTime: "01:15", endTime: "02:00" },
      { period: 7, startTime: "02:15", endTime: "03:00" },
      { period: 8, startTime: "03:00", endTime: "03:45" }
    ];

    let matrixHtml = `
      <table class="table" style="width: 100%; font-size: 0.825rem; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border-color); background: var(--bg-subtle);">
            <th style="padding: 0.6rem 0.75rem; width: 100px; text-align: center;">Period / Time</th>
            ${days.map(d => `<th style="padding: 0.6rem 0.75rem; width: 18%; text-align: left;">${d}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
    `;

    periodTimes.forEach(pt => {
      matrixHtml += `<tr style="border-bottom: 1px solid var(--border-color);">`;
      matrixHtml += `
        <td style="padding: 0.65rem 0.5rem; text-align: center; font-weight: 700; background: var(--bg-subtle);">
          Period ${pt.period}
          <div class="text-xs text-muted" style="font-weight: 400; margin-top: 0.15rem;">${pt.startTime} - ${pt.endTime}</div>
        </td>
      `;

      days.forEach(dayName => {
        const slot = allTt.find(t =>
          (t.className === userClass || t.class === userClass) &&
          (t.section ? t.section.toUpperCase() === userSection : true) &&
          (t.day && t.day.toLowerCase() === dayName.toLowerCase()) &&
          (t.period === pt.period || String(t.period) === String(pt.period)) &&
          (t.status === "approved" || !t.status)
        );

        const subj = slot ? slot.subject : "Self Study";
        const teacher = slot ? (slot.teacher || slot.instructor || "Faculty Instructor") : "Faculty Instructor";
        const room = slot ? (slot.room || slot.roomNo || "Main Hall") : "Main Hall";

        matrixHtml += `
          <td style="padding: 0.6rem 0.75rem; vertical-align: top;">
            <div style="font-weight: 700; color: var(--primary-color); font-size: 0.85rem;">${subj}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">${teacher}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem;">📍 ${room}</div>
          </td>
        `;
      });

      matrixHtml += `</tr>`;
    });

    matrixHtml += `
        </tbody>
      </table>
    `;

    container.innerHTML = matrixHtml;
  }
};

/**
 * SmartLearn - Role-Based Announcement Engine
 * Filters and renders broadcast announcements for Students, Teachers, Parents, and Admins.
 */
const SmartLearnAnnouncements = {
  isForRole(targetAudience, userRole) {
    if (!targetAudience || targetAudience === "All Users" || targetAudience.includes("All")) return true;

    const target = targetAudience.toLowerCase().trim();
    const role = userRole.toLowerCase().trim();

    if (role === "student") {
      return target.includes("student") || target.includes("both");
    }
    if (role === "parent") {
      return target.includes("parent") || target.includes("both");
    }
    if (role === "teacher" || role === "faculty") {
      return target.includes("teacher") || target.includes("faculty");
    }
    if (role === "administrator" || role === "admin") {
      return true;
    }
    return false;
  },

  getBadgeClass(target) {
    if (!target || target.includes("All")) return "badge-info";
    if (target.includes("Student") && target.includes("Parent")) return "badge-warning";
    if (target.includes("Student")) return "badge-primary";
    if (target.includes("Teacher")) return "badge-success";
    if (target.includes("Parent")) return "badge-secondary";
    return "badge-info";
  },

  renderStudentAnnouncements() {
    const container1 = document.getElementById("student-announcements-container");
    const container2 = document.getElementById("student-announcements-list");
    if (!container1 && !container2) return;

    const announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    const studentAnnouncements = announcements.filter(a => this.isForRole(a.target, "Student"));

    const html = studentAnnouncements.length === 0
      ? `<div class="empty-state-text" style="padding: 1rem;">No active announcements for students.</div>`
      : studentAnnouncements.slice().reverse().map(ann => `
        <div style="padding: 0.85rem; background: var(--bg-subtle); border-radius: 8px; border-left: 3px solid var(--primary-color); margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <div class="font-bold text-sm" style="color: var(--text-main);">${ann.title}</div>
            <span class="badge ${this.getBadgeClass(ann.target)}" style="font-size:0.65rem;">${ann.target || 'All Users'}</span>
          </div>
          <div class="text-xs text-muted" style="margin-top: 0.2rem;">By ${ann.author || 'Administration'} • ${ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : (ann.date || 'Today')}</div>
          <p class="text-xs" style="margin-top: 0.4rem; color: var(--text-main); line-height: 1.4;">${ann.content || ann.message}</p>
        </div>
      `).join("");

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
  },

  renderTeacherAnnouncements() {
    const container1 = document.getElementById("teacher-recent-announcements");
    const container2 = document.getElementById("teacher-announcements-list");
    if (!container1 && !container2) return;

    const announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    const teacherAnnouncements = announcements.filter(a => this.isForRole(a.target, "Teacher"));

    const html = teacherAnnouncements.length === 0
      ? `<div class="empty-state-text" style="padding: 1rem;">No faculty announcements published.</div>`
      : teacherAnnouncements.slice().reverse().map(ann => `
        <div style="padding: 1rem; background: var(--bg-subtle); border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <div class="font-bold text-sm" style="color: var(--text-main);">${ann.title}</div>
            <span class="badge ${this.getBadgeClass(ann.target)}" style="font-size:0.65rem;">${ann.target || 'Teachers Only'}</span>
          </div>
          <div class="text-xs text-muted" style="margin-top: 0.2rem;">By ${ann.author || 'Administration'} • ${ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : (ann.date || 'Today')}</div>
          <p class="text-xs" style="margin-top: 0.4rem; color: var(--text-main); line-height: 1.4;">${ann.content || ann.message}</p>
        </div>
      `).join("");

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
  },

  renderParentAnnouncements() {
    const container1 = document.getElementById("parent-announcements-container");
    const container2 = document.getElementById("parent-announcements-list");
    if (!container1 && !container2) return;

    const announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    const parentAnnouncements = announcements.filter(a => this.isForRole(a.target, "Parent"));

    const html = parentAnnouncements.length === 0
      ? `<div class="empty-state-text" style="padding: 1rem;">No announcements published for parents.</div>`
      : parentAnnouncements.slice().reverse().map(ann => `
        <div style="padding: 0.85rem; background: var(--bg-subtle); border-radius: 8px; border-left: 3px solid #8b5cf6; margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <div class="font-bold text-sm" style="color: var(--text-main);">${ann.title}</div>
            <span class="badge ${this.getBadgeClass(ann.target)}" style="font-size:0.65rem;">${ann.target || 'Parents Only'}</span>
          </div>
          <div class="text-xs text-muted" style="margin-top: 0.2rem;">By ${ann.author || 'Administration'} • ${ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : (ann.date || 'Today')}</div>
          <p class="text-xs" style="margin-top: 0.4rem; color: var(--text-main); line-height: 1.4;">${ann.content || ann.message}</p>
        </div>
      `).join("");

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
  }
};

/**
 * SmartLearnAttendance Engine
 * Strict real-data calculated attendance tracking, dynamic history, monthly calendar & QR check-in
 */
const SmartLearnAttendance = {
  ATTENDANCE_THRESHOLD: 75,
  calendarCurrentMonth: new Date().getMonth(),
  calendarCurrentYear: new Date().getFullYear(),

  initStudentAttendance() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const role = (user.role || "").toLowerCase();
    if (role !== "student") {
      if (role === "teacher" || role === "faculty") {
        window.location.href = "teacher-dashboard.html";
        return;
      } else if (role === "parent") {
        window.location.href = "parent-dashboard.html";
        return;
      } else if (role === "administrator" || role === "admin") {
        window.location.href = "admin-dashboard.html";
        return;
      }
    }

    const headerGreeting = document.getElementById("att-header-title");
    if (headerGreeting) {
      headerGreeting.innerText = `Student Attendance 📅 • ${user.fullName || user.name}`;
    }

    const headerSub = document.getElementById("att-header-sub");
    if (headerSub) {
      headerSub.innerText = `Attendance Portal for ${user.className || 'B.Tech CSE'}-${user.section || 'A'} • Roll No: ${user.studentId || user.id}`;
    }

    const personalQrIdEl = document.getElementById("student-personal-qr-id");
    if (personalQrIdEl) {
      personalQrIdEl.innerText = user.studentId || user.id;
    }

    this.renderAttendanceModule();
  },

  renderAttendanceModule() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    // Retrieve attendance records filtered by studentId with fallback matching
    const allAttendance = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    let studentRecords = allAttendance.filter(a => a.studentId === user.id || a.studentId === user.studentId || a.studentId === "usr_student_01");

    if (studentRecords.length === 0 && typeof SmartLearnStorage !== "undefined" && SmartLearnStorage.ensureStudentData) {
      SmartLearnStorage.ensureStudentData(user.id, user.className, user.section);
      studentRecords = (SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || []).filter(a => a.studentId === user.id || a.studentId === user.studentId || a.studentId === "usr_student_01");
    }

    // Dynamic Calculations
    const totalClasses = studentRecords.length;
    const presentCount = studentRecords.filter(a => a.status === "present").length;
    const absentCount = studentRecords.filter(a => a.status === "absent").length;
    const lateCount = studentRecords.filter(a => a.status === "late" || a.status === "excused").length;

    const overallPct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    // Update Summary Metric Cards
    const overallPctEl = document.getElementById("att-stat-overall-pct");
    if (overallPctEl) overallPctEl.innerText = totalClasses > 0 ? `${overallPct}%` : "0%";

    const overallSubEl = document.getElementById("att-stat-overall-sub");
    if (overallSubEl) {
      overallSubEl.innerText = totalClasses > 0 ? `${presentCount} / ${totalClasses} Classes Attended` : "No records available";
    }

    const totalClassesEl = document.getElementById("att-stat-total-classes");
    if (totalClassesEl) totalClassesEl.innerText = totalClasses;

    const presentEl = document.getElementById("att-stat-present");
    if (presentEl) presentEl.innerText = presentCount;

    const absentEl = document.getElementById("att-stat-absent");
    if (absentEl) absentEl.innerText = absentCount;

    const lateEl = document.getElementById("att-stat-late");
    if (lateEl) lateEl.innerText = lateCount;

    // Low Attendance Warning Banner
    const warningBanner = document.getElementById("att-warning-banner");
    const warningPctEl = document.getElementById("att-warning-pct");
    const warningThreshEl = document.getElementById("att-warning-threshold");

    if (totalClasses > 0 && overallPct < this.ATTENDANCE_THRESHOLD) {
      if (warningBanner) warningBanner.style.display = "block";
      if (warningPctEl) warningPctEl.innerText = `${overallPct}%`;
      if (warningThreshEl) warningThreshEl.innerText = `${this.ATTENDANCE_THRESHOLD}%`;
    } else {
      if (warningBanner) warningBanner.style.display = "none";
    }

    // Populate Today's Attendance Status
    this.renderTodayAttendanceStatus(studentRecords);

    // Populate Subject-wise Attendance Breakdown
    this.renderSubjectBreakdown(studentRecords);

    // Populate Attendance History Log Table
    this.renderHistoryTable(studentRecords);

    // Populate Monthly Attendance Calendar
    this.renderCalendar(studentRecords);

    // Populate Attendance Rate Trend Graph
    this.renderAttendanceGraph(studentRecords);
  },

  renderTodayAttendanceStatus(studentRecords) {
    const container = document.getElementById("att-today-status-container");
    if (!container) return;

    const todayDateStr = new Date().toISOString().split("T")[0];
    const todayRecords = studentRecords.filter(a => a.date === todayDateStr);

    const dateBadge = document.getElementById("att-today-date-badge");
    if (dateBadge) {
      dateBadge.innerText = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (todayRecords.length === 0) {
      container.innerHTML = `
        <div class="empty-state-text" style="padding: 1.25rem; text-align: center; color: var(--text-muted);">
          No attendance records for today.
        </div>
      `;
      return;
    }

    container.innerHTML = todayRecords.map(r => {
      const subjectObj = SmartLearnStorage.getSubjectById(r.subjectId) || { name: r.subject || r.subjectId || "Subject" };
      const teacherObj = SmartLearnStorage.getUserById(r.teacherId) || { fullName: r.teacherName || "Faculty Instructor" };

      let badgeClass = "badge-success";
      if (r.status === "absent") badgeClass = "badge-danger";
      else if (r.status === "late") badgeClass = "badge-warning";

      const formattedTime = r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Class Session";
      const checkinMethod = r.method === "qr" ? "📷 QR Check-in" : "📋 Roll Call";

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem; background: var(--bg-subtle); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.5rem;">
          <div>
            <div class="font-bold text-sm" style="color: var(--text-main);">${subjectObj.name}</div>
            <div class="text-xs text-muted" style="margin-top: 0.15rem;">Faculty: ${teacherObj.fullName || teacherObj.name} • ${checkinMethod} (${formattedTime})</div>
          </div>
          <span class="badge ${badgeClass}" style="text-transform: capitalize;">${r.status}</span>
        </div>
      `;
    }).join("");
  },

  renderSubjectBreakdown(studentRecords) {
    const container = document.getElementById("att-subject-breakdown-container");
    if (!container) return;

    const subjects = SmartLearnStorage.getSubjects() || [];

    // Group records by subject
    const subjectMap = {};

    studentRecords.forEach(r => {
      const subKey = r.subjectId || r.subject || "General";
      if (!subjectMap[subKey]) {
        subjectMap[subKey] = [];
      }
      subjectMap[subKey].push(r);
    });

    const subjectKeys = Object.keys(subjectMap);

    // Populate history filter dropdown as well
    const historySubSelect = document.getElementById("att-history-filter-subject");
    if (historySubSelect) {
      const currVal = historySubSelect.value;
      historySubSelect.innerHTML = `<option value="all">All Subjects</option>` + subjectKeys.map(k => {
        const sObj = subjects.find(s => s.id === k) || { name: k };
        return `<option value="${k}" ${currVal === k ? 'selected' : ''}>${sObj.name}</option>`;
      }).join("");
    }

    if (studentRecords.length === 0 || subjectKeys.length === 0) {
      container.innerHTML = `
        <div class="empty-state-text" style="padding: 1.5rem; text-align: center;">
          No attendance records available.
        </div>
      `;
      return;
    }

    container.innerHTML = subjectKeys.map(subKey => {
      const subObj = subjects.find(s => s.id === subKey) || { name: subKey };
      const subRecords = subjectMap[subKey];
      const total = subRecords.length;
      const present = subRecords.filter(r => r.status === "present").length;
      const absent = subRecords.filter(r => r.status === "absent").length;
      const late = subRecords.filter(r => r.status === "late").length;

      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      let badgeClass = "badge-success";
      if (pct < 75) badgeClass = "badge-danger";
      else if (pct < 85) badgeClass = "badge-warning";

      return `
        <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div>
              <span class="font-bold text-sm" style="color: var(--text-main);">${subObj.name}</span>
              <span class="text-xs text-muted" style="margin-left: 0.5rem;">(${present} Present / ${total} Total)</span>
            </div>
            <span class="badge ${badgeClass}">${pct}%</span>
          </div>

          <div class="progress-bar-wrap" style="height: 6px; margin-bottom: 0.5rem;">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${pct >= 75 ? 'var(--success)' : 'var(--danger)'};"></div>
          </div>

          <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: var(--text-muted);">
            <span>Present: <strong style="color: var(--success);">${present}</strong></span>
            <span>Absent: <strong style="color: var(--danger);">${absent}</strong></span>
            <span>Late: <strong style="color: var(--warning);">${late}</strong></span>
          </div>
        </div>
      `;
    }).join("");
  },

  renderHistoryTable(studentRecords) {
    const container = document.getElementById("att-history-table-container");
    if (!container) return;

    const subFilter = document.getElementById("att-history-filter-subject") ? document.getElementById("att-history-filter-subject").value : "all";
    const statusFilter = document.getElementById("att-history-filter-status") ? document.getElementById("att-history-filter-status").value : "all";

    let filtered = [...studentRecords];

    if (subFilter !== "all") {
      filtered = filtered.filter(r => (r.subjectId === subFilter || r.subject === subFilter));
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Sort newest date first
    filtered.sort((a, b) => new Date(b.date || b.markedAt) - new Date(a.date || a.markedAt));

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-text" style="padding: 1.5rem; text-align: center;">
          No attendance records found matching filters.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
            <th style="padding: 0.75rem 0.5rem;">Date</th>
            <th style="padding: 0.75rem 0.5rem;">Subject</th>
            <th style="padding: 0.75rem 0.5rem;">Faculty Instructor</th>
            <th style="padding: 0.75rem 0.5rem;">Status</th>
            <th style="padding: 0.75rem 0.5rem;">Check-in Method</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(r => {
      const subjectObj = SmartLearnStorage.getSubjectById(r.subjectId) || { name: r.subject || r.subjectId || "Subject" };
      const teacherObj = SmartLearnStorage.getUserById(r.teacherId) || { fullName: r.teacherName || "Faculty Instructor" };

      let badgeClass = "badge-success";
      if (r.status === "absent") badgeClass = "badge-danger";
      else if (r.status === "late") badgeClass = "badge-warning";

      const formattedDate = new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const methodLabel = r.method === "qr" ? "📷 QR Code" : "📋 Roll Call";

      return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem 0.5rem; font-weight: 600;">${formattedDate}</td>
                <td style="padding: 0.75rem 0.5rem; color: var(--primary); font-weight: 600;">${subjectObj.name}</td>
                <td style="padding: 0.75rem 0.5rem;">${teacherObj.fullName || teacherObj.name}</td>
                <td style="padding: 0.75rem 0.5rem;">
                  <span class="badge ${badgeClass}" style="text-transform: capitalize;">${r.status}</span>
                </td>
                <td style="padding: 0.75rem 0.5rem; color: var(--text-muted);">${methodLabel}</td>
              </tr>
            `;
    }).join("")}
        </tbody>
      </table>
    `;
  },

  renderCalendar(studentRecords) {
    const container = document.getElementById("att-calendar-grid-container");
    if (!container) return;

    const monthYearHeader = document.getElementById("att-calendar-month-year");
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = this.calendarCurrentYear;
    const month = this.calendarCurrentMonth;

    if (monthYearHeader) {
      monthYearHeader.innerText = `${monthNames[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.35rem; text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.35rem; text-align: center; font-size: 0.8rem;">
    `;

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += `<div></div>`;
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRecords = studentRecords.filter(r => r.date === dayStr);

      let dayStyle = "padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface);";
      let dotColor = null;

      if (dayRecords.length > 0) {
        if (dayRecords.some(r => r.status === "present")) dotColor = "var(--success)";
        else if (dayRecords.some(r => r.status === "absent")) dotColor = "var(--danger)";
        else if (dayRecords.some(r => r.status === "late")) dotColor = "var(--warning)";

        if (dotColor) {
          dayStyle = `padding: 0.4rem; border-radius: 6px; border: 1px solid ${dotColor}; background: var(--bg-subtle); font-weight: 700;`;
        }
      }

      html += `
        <div style="${dayStyle} position: relative;">
          ${d}
          ${dotColor ? `<span style="position: absolute; bottom: 2px; right: 50%; transform: translateX(50%); width: 4px; height: 4px; border-radius: 50%; background-color: ${dotColor};"></span>` : ''}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  changeCalendarMonth(delta) {
    this.calendarCurrentMonth += delta;
    if (this.calendarCurrentMonth > 11) {
      this.calendarCurrentMonth = 0;
      this.calendarCurrentYear += 1;
    } else if (this.calendarCurrentMonth < 0) {
      this.calendarCurrentMonth = 11;
      this.calendarCurrentYear -= 1;
    }
    const user = SmartLearnAuth.getCurrentUser();
    if (user) {
      const allAttendance = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
      const studentRecords = allAttendance.filter(a => a.studentId === user.id);
      this.renderCalendar(studentRecords);
    }
  },

  renderAttendanceGraph(studentRecords) {
    const container = document.getElementById("att-graph-container");
    if (!container) return;

    if (studentRecords.length < 2) {
      container.innerHTML = `
        <div class="empty-state-text" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
          Not enough attendance data available.
        </div>
      `;
      return;
    }

    // Group records by month to calculate trend points
    const monthGroup = {};
    studentRecords.forEach(r => {
      const dateObj = new Date(r.date || r.markedAt);
      const mKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      if (!monthGroup[mKey]) monthGroup[mKey] = [];
      monthGroup[mKey].push(r);
    });

    const mKeys = Object.keys(monthGroup).sort();
    const trendPoints = mKeys.map(k => {
      const recs = monthGroup[k];
      const present = recs.filter(r => r.status === "present").length;
      const pct = Math.round((present / recs.length) * 100);
      const label = new Date(k + "-01").toLocaleDateString(undefined, { month: 'short' });
      return { label, pct };
    });

    container.innerHTML = `
      <div style="width: 100%; display: flex; flex-direction: column; gap: 0.85rem;">
        ${trendPoints.map(pt => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.775rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">
              <span>${pt.label} Rate</span>
              <span class="text-primary">${pt.pct}%</span>
            </div>
            <div class="progress-bar-wrap" style="height: 8px;">
              <div class="progress-bar-fill" style="width: ${pt.pct}%; background: ${pt.pct >= 75 ? 'var(--primary)' : 'var(--warning)'};"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  openQrScanModal() {
    this.switchQrTab("scanner");
    const errBox = document.getElementById("qr-error-feedback");
    const succBox = document.getElementById("qr-success-feedback");
    if (errBox) errBox.style.display = "none";
    if (succBox) succBox.style.display = "none";

    SmartLearnApp.openModal("qr-attendance-modal");
  },

  switchQrTab(tabName) {
    const scannerView = document.getElementById("qr-scanner-view");
    const tokenView = document.getElementById("qr-token-view");
    const scannerBtn = document.getElementById("qr-tab-scanner-btn");
    const tokenBtn = document.getElementById("qr-tab-token-btn");

    if (tabName === "scanner") {
      if (scannerView) scannerView.style.display = "flex";
      if (tokenView) tokenView.style.display = "none";
      if (scannerBtn) { scannerBtn.className = "btn btn-sm btn-primary"; }
      if (tokenBtn) { tokenBtn.className = "btn btn-sm btn-outline"; }
    } else {
      if (scannerView) scannerView.style.display = "none";
      if (tokenView) tokenView.style.display = "flex";
      if (scannerBtn) { scannerBtn.className = "btn btn-sm btn-outline"; }
      if (tokenBtn) { tokenBtn.className = "btn btn-sm btn-primary"; }
    }
  },

  handleTokenCheckIn(e) {
    if (e) e.preventDefault();

    const errBox = document.getElementById("qr-error-feedback");
    const succBox = document.getElementById("qr-success-feedback");
    if (errBox) errBox.style.display = "none";
    if (succBox) succBox.style.display = "none";

    const tokenInput = document.getElementById("qr-session-token-input");
    const tokenVal = tokenInput ? tokenInput.value.trim().toUpperCase() : "";

    if (!tokenVal) {
      if (errBox) {
        errBox.innerText = "Please enter a valid session code / token.";
        errBox.style.display = "block";
      }
      return;
    }

    // Retrieve active attendance sessions
    const sessions = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
    const session = sessions.find(s => {
      const fullId = (s.sessionId || s.id || "").toUpperCase();
      const rawCode = fullId.replace("SESS-", "");
      return fullId === tokenVal || rawCode === tokenVal || ("SESS-" + tokenVal) === fullId;
    });

    // Validation 1: Session Exists
    if (!session) {
      if (errBox) {
        errBox.innerText = "Invalid QR Session Code or Token. Please verify with your instructor.";
        errBox.style.display = "block";
      }
      return;
    }

    // Validation 2: Session Active
    if (!session.active) {
      if (errBox) {
        errBox.innerText = "This QR attendance session is closed or inactive.";
        errBox.style.display = "block";
      }
      return;
    }

    // Validation 3: Expiration
    const expiresAtMs = new Date(session.expiresAt).getTime();
    if (Date.now() > expiresAtMs) {
      session.active = false;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, JSON.stringify(sessions));
      if (errBox) {
        errBox.innerText = `QR Session Expired. Session ended at ${new Date(session.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        errBox.style.display = "block";
      }
      return;
    }

    // Validation 4: Authenticated Student Identity (NEVER accept studentId from QR code!)
    const currentUser = SmartLearnAuth.getCurrentUser();
    if (!currentUser) {
      SmartLearnApp.showToast("User session expired. Please log in.", "warning");
      window.location.href = "login.html";
      return;
    }

    // Validation 5: Duplicate Attendance Check
    const allAttendance = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const existingAtt = allAttendance.find(a =>
      a.studentId === currentUser.id &&
      (a.sessionId === session.sessionId || a.sessionId === session.id)
    );

    if (existingAtt) {
      if (errBox) {
        errBox.innerText = "Attendance Already Marked for this session.";
        errBox.style.display = "block";
      }
      return;
    }

    // Create Real Attendance Record
    const subjectObj = SmartLearnStorage.getSubjectById(session.subjectId) || { name: session.subjectName || session.subjectId || "Subject" };
    const teacherObj = SmartLearnStorage.getUserById(session.teacherId) || { fullName: session.teacherName || "Faculty Instructor" };

    const newRecord = {
      id: "att_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      studentId: currentUser.id,
      classId: currentUser.className || currentUser.classId || session.classId || "B.Tech CSE",
      section: currentUser.section || session.section || "A",
      subjectId: session.subjectId,
      teacherId: session.teacherId,
      date: new Date().toISOString().split("T")[0],
      sessionId: session.sessionId || session.id,
      status: "present",
      markedAt: new Date().toISOString(),
      method: "qr"
    };

    allAttendance.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allAttendance));

    // Save Notification for Student
    SmartLearnStorage.addNotification({
      userId: currentUser.id,
      title: "Attendance Marked 📷",
      message: `Marked Present via QR for ${subjectObj.name} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    });

    // Render Real Success Feedback Box
    const succDetailsList = document.getElementById("qr-success-details-list");
    if (succDetailsList) {
      succDetailsList.innerHTML = `
        <div>👤 <strong>Student:</strong> ${currentUser.fullName || currentUser.name} (ID: ${currentUser.studentId || currentUser.id})</div>
        <div>📘 <strong>Subject:</strong> ${subjectObj.name}</div>
        <div>👨‍🏫 <strong>Instructor:</strong> ${teacherObj.fullName || teacherObj.name}</div>
        <div>📅 <strong>Date:</strong> ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div>⏰ <strong>Time:</strong> ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div>✅ <strong>Status:</strong> <span style="font-weight:700; color: #10b981;">Present</span></div>
        <div>📷 <strong>Check-in Method:</strong> Classroom QR Code</div>
      `;
    }

    if (succBox) succBox.style.display = "block";
    if (tokenInput) tokenInput.value = "";

    SmartLearnApp.showToast(`Attendance marked Present for ${subjectObj.name}! 🎉`, "success");

    // Re-render student attendance calculations in real time
    this.renderAttendanceModule();
    if (typeof SmartLearnTeacherAttendance !== "undefined" && SmartLearnTeacherAttendance.renderLiveSessionRoster) {
      SmartLearnTeacherAttendance.renderLiveSessionRoster();
    }
  }
};

/**
 * SmartLearnTeacherAttendance Engine
 * Faculty Live 5-Min QR Session Creator, Student QR Scanner & Manual Register Manager
 */
const SmartLearnTeacherAttendance = {
  activeTimerInterval: null,
  currentManualState: {},

  init() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    // Default manual date picker to today
    const dateInput = document.getElementById("teacher-manual-date");
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    this.checkAndRenderActiveSession();
    this.renderManualAttendanceTable();
    this.renderTeacherAttendanceOverview();
  },

  openTeacherQrModal() {
    SmartLearnApp.openModal("teacher-qr-session-modal");
  },

  startQrSession(e) {
    if (e) e.preventDefault();

    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const classId = document.getElementById("teacher-qr-class") ? document.getElementById("teacher-qr-class").value : "B.Tech CSE";
    const section = document.getElementById("teacher-qr-section") ? document.getElementById("teacher-qr-section").value : "A";
    const subjectId = document.getElementById("teacher-qr-subject") ? document.getElementById("teacher-qr-subject").value : "sub_cs";
    const durationMins = parseInt(document.getElementById("teacher-qr-duration") ? document.getElementById("teacher-qr-duration").value : "5") || 5;

    const subjectObj = SmartLearnStorage.getSubjectById(subjectId) || { name: "Computer Science" };
    const generatedSessionId = "SESS-" + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    const newSession = {
      id: "sess_" + Date.now(),
      sessionId: generatedSessionId,
      teacherId: user.id,
      teacherName: user.fullName || user.name || "Faculty Instructor",
      classId,
      section,
      subjectId,
      subjectName: subjectObj.name,
      createdAt,
      expiresAt,
      active: true
    };

    const sessions = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
    // Deactivate previous sessions for same class/subject
    sessions.forEach(s => {
      if (s.classId === classId && s.subjectId === subjectId) s.active = false;
    });
    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, JSON.stringify(sessions));

    // Render Modal QR Preview Box
    const sessionTokenDisplay = document.getElementById("teacher-session-token-display");
    if (sessionTokenDisplay) sessionTokenDisplay.innerText = generatedSessionId;

    const displaySubject = document.getElementById("teacher-session-subject-display");
    if (displaySubject) displaySubject.innerText = `${subjectObj.name} (${classId}-${section})`;

    const qrBox = document.getElementById("teacher-active-qr-box");
    if (qrBox) qrBox.style.display = "flex";

    this.checkAndRenderActiveSession();
    SmartLearnApp.showToast(`Live 5-Min Session ${generatedSessionId} active! Students can submit now.`, "success");
  },

  checkAndRenderActiveSession() {
    const sessions = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
    const activeSession = sessions.find(s => s.active && new Date(s.expiresAt).getTime() > Date.now());
    const banner = document.getElementById("teacher-live-session-banner");

    if (!activeSession) {
      if (banner) banner.style.display = "none";
      if (this.activeTimerInterval) clearInterval(this.activeTimerInterval);
      return;
    }

    if (banner) banner.style.display = "block";
    const titleEl = document.getElementById("live-banner-title");
    if (titleEl) titleEl.innerText = `${activeSession.classId}-${activeSession.section} • ${activeSession.subjectName}`;

    const codeEl = document.getElementById("live-banner-code");
    if (codeEl) codeEl.innerText = activeSession.sessionId;

    if (this.activeTimerInterval) clearInterval(this.activeTimerInterval);

    const updateTimer = () => {
      const remainingMs = new Date(activeSession.expiresAt).getTime() - Date.now();
      const timerEl = document.getElementById("live-banner-timer");
      const modalTimerEl = document.getElementById("teacher-session-timer-display");

      if (remainingMs <= 0) {
        clearInterval(this.activeTimerInterval);
        this.finalizeSession(activeSession.sessionId, true);
      } else {
        const secs = Math.floor((remainingMs / 1000) % 60);
        const mins = Math.floor(remainingMs / (1000 * 60));
        const timeStr = `Expires in: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (timerEl) timerEl.innerText = timeStr;
        if (modalTimerEl) modalTimerEl.innerText = timeStr;
      }
    };

    updateTimer();
    this.activeTimerInterval = setInterval(updateTimer, 1000);
    this.renderLiveSessionRoster(activeSession);
  },

  renderLiveSessionRoster(activeSession) {
    if (!activeSession) {
      const sessions = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
      activeSession = sessions.find(s => s.active && new Date(s.expiresAt).getTime() > Date.now());
    }

    if (!activeSession) return;

    const allUsers = SmartLearnAuth.getUsers();
    let classStudents = allUsers.filter(u => u.role === "Student" && (u.className === activeSession.classId || u.class === activeSession.classId) && (u.section === activeSession.section || !u.section));

    if (classStudents.length === 0) {
      classStudents = allUsers.filter(u => u.role === "Student");
    }

    const attendanceRecords = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const todayStr = new Date().toISOString().split("T")[0];

    let presentCount = 0;

    const rosterRowsHtml = classStudents.map(student => {
      const rec = attendanceRecords.find(r =>
        r.studentId === student.id &&
        (r.sessionId === activeSession.sessionId || (r.date === todayStr && r.subjectId === activeSession.subjectId))
      );

      let statusBadgeHtml = `<span class="badge badge-warning" style="font-size:0.7rem; color:#fff;">🟡 UNSUBMITTED</span>`;
      let timeText = "Waiting for student code...";

      if (rec) {
        if (rec.status === "present") {
          presentCount++;
          statusBadgeHtml = `<span class="badge badge-success" style="font-size:0.7rem; font-weight:700;">🟢 PRESENT</span>`;
          timeText = rec.markedAt ? (new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })) : "Submitted";
        } else if (rec.status === "absent") {
          statusBadgeHtml = `<span class="badge badge-danger" style="font-size:0.7rem;">🔴 ABSENT</span>`;
          timeText = "Session Expired";
        }
      }

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <img src="${student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.id}" style="width:28px; height:28px; border-radius:50%; border: 1px solid rgba(255,255,255,0.2);">
              <div>
                <div class="font-bold text-xs" style="color:#f8fafc;">${student.fullName || student.name}</div>
                <div class="text-xs" style="color:#94a3b8; font-size:0.68rem;">ID: ${student.studentId || student.id} • ${student.className || activeSession.classId}-${student.section || activeSession.section}</div>
              </div>
            </div>
          </td>
          <td style="text-align:center; padding: 0.5rem;">
            ${statusBadgeHtml}
          </td>
          <td style="text-align:right; padding: 0.5rem;" class="text-xs text-muted">
            ${timeText}
          </td>
        </tr>
      `;
    }).join("");

    // Update Banner Roster
    const counterEl = document.getElementById("live-session-counter");
    if (counterEl) counterEl.innerText = `${presentCount} / ${classStudents.length} Present`;

    const bodyEl = document.getElementById("live-session-roster-body");
    if (bodyEl) bodyEl.innerHTML = rosterRowsHtml;

    // Update Modal Roster
    const modalCounterEl = document.getElementById("modal-live-session-counter");
    if (modalCounterEl) modalCounterEl.innerText = `${presentCount} / ${classStudents.length} Present`;

    const modalBodyEl = document.getElementById("modal-live-session-roster-body");
    if (modalBodyEl) modalBodyEl.innerHTML = rosterRowsHtml;
  },

  finalizeCurrentSession() {
    const sessions = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
    const activeSession = sessions.find(s => s.active && new Date(s.expiresAt).getTime() > Date.now());
    if (activeSession) {
      this.finalizeSession(activeSession.sessionId, false);
    } else {
      SmartLearnApp.showToast("No active session to finalize.", "info");
    }
  },

  finalizeSession(sessionId, isAutoExpired = false) {
    const sessions = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
    const session = sessions.find(s => s.sessionId === sessionId || s.id === sessionId);
    if (!session) return;

    session.active = false;
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, JSON.stringify(sessions));

    if (this.activeTimerInterval) clearInterval(this.activeTimerInterval);
    const banner = document.getElementById("teacher-live-session-banner");
    if (banner) banner.style.display = "none";

    // Auto-mark unsubmitted students in class as ABSENT
    const allUsers = SmartLearnAuth.getUsers();
    const classStudents = allUsers.filter(u => u.role === "Student" && (u.className === session.classId || u.class === session.classId) && (u.section === session.section || !u.section));

    // Ensure default student usr_student_01 is included if empty
    if (classStudents.length === 0) {
      const defStudent = allUsers.find(u => u.id === "usr_student_01");
      if (defStudent) classStudents.push(defStudent);
    }

    const attendanceRecords = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const todayStr = new Date().toISOString().split("T")[0];
    let absentCount = 0;

    classStudents.forEach(student => {
      const alreadyMarked = attendanceRecords.some(a =>
        a.studentId === student.id &&
        (a.sessionId === session.sessionId || (a.date === todayStr && a.subjectId === session.subjectId))
      );

      if (!alreadyMarked) {
        attendanceRecords.unshift({
          id: "att_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          studentId: student.id,
          classId: session.classId,
          section: session.section,
          subjectId: session.subjectId,
          subject: session.subjectName,
          teacherId: session.teacherId,
          date: todayStr,
          sessionId: session.sessionId,
          status: "absent",
          markedAt: new Date().toISOString(),
          method: "session_timeout"
        });
        absentCount++;
      }
    });

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));

    const msg = isAutoExpired
      ? `QR Session expired! ${absentCount} unsubmitted student(s) marked Absent.`
      : `Session finalized! ${absentCount} student(s) marked Absent.`;

    SmartLearnApp.showToast(msg, "warning");
    this.renderManualAttendanceTable();
    this.renderTeacherAttendanceOverview();
  },

  openScanStudentQrModal() {
    const selectEl = document.getElementById("teacher-scan-student-select");
    if (selectEl) {
      const users = SmartLearnAuth.getUsers().filter(u => u.role === "Student");
      selectEl.innerHTML = users.map(u => `
        <option value="${u.id}">${u.fullName || u.name} (${u.studentId || u.id}) • ${u.className || 'B.Tech CSE'}-${u.section || 'A'}</option>
      `).join("");
    }
    SmartLearnApp.openModal("teacher-scan-student-qr-modal");
  },

  processStudentScanSubmit() {
    const studentSelect = document.getElementById("teacher-scan-student-select");
    const subjectSelect = document.getElementById("teacher-scan-subject-select");
    if (!studentSelect || !subjectSelect) return;

    const studentId = studentSelect.value;
    const subjectId = subjectSelect.value;
    const student = SmartLearnAuth.getUserById(studentId);
    const subjectObj = SmartLearnStorage.getSubjectById(subjectId) || { name: "Computer Science" };
    const teacher = SmartLearnAuth.getCurrentUser();
    const todayStr = new Date().toISOString().split("T")[0];

    const records = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const existingIdx = records.findIndex(r => r.studentId === studentId && r.date === todayStr && r.subjectId === subjectId);

    const newRecord = {
      id: "att_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      studentId: studentId,
      classId: student ? (student.className || student.class) : "B.Tech CSE",
      section: student ? student.section : "A",
      subjectId: subjectId,
      subject: subjectObj.name,
      teacherId: teacher ? teacher.id : "usr_teacher_01",
      date: todayStr,
      status: "present",
      markedAt: new Date().toISOString(),
      method: "student_qr_scan"
    };

    if (existingIdx >= 0) {
      records[existingIdx] = newRecord;
    } else {
      records.unshift(newRecord);
    }

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    SmartLearnApp.closeModal("teacher-scan-student-qr-modal");
    SmartLearnApp.showToast(`Marked Present via Student QR for ${student ? student.fullName : 'Student'}!`, "success");

    this.renderManualAttendanceTable();
    this.renderTeacherAttendanceOverview();
  },

  renderManualAttendanceTable() {
    const bodyContainer = document.getElementById("teacher-manual-register-body");
    if (!bodyContainer) return;

    const classId = document.getElementById("teacher-manual-class") ? document.getElementById("teacher-manual-class").value : "B.Tech CSE";
    const section = document.getElementById("teacher-manual-section") ? document.getElementById("teacher-manual-section").value : "A";
    const subjectId = document.getElementById("teacher-manual-subject") ? document.getElementById("teacher-manual-subject").value : "sub_cs";
    const dateStr = document.getElementById("teacher-manual-date") ? document.getElementById("teacher-manual-date").value : new Date().toISOString().split("T")[0];

    const allUsers = SmartLearnAuth.getUsers();
    let classStudents = allUsers.filter(u => u.role === "Student" && (u.className === classId || u.class === classId) && (u.section === section || !u.section));

    if (classStudents.length === 0) {
      classStudents = allUsers.filter(u => u.role === "Student");
    }

    const attendanceRecords = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];

    this.currentManualState = {};

    bodyContainer.innerHTML = classStudents.map(student => {
      const existing = attendanceRecords.find(r => r.studentId === student.id && r.date === dateStr && r.subjectId === subjectId);
      const currentStatus = existing ? existing.status : "present";
      this.currentManualState[student.id] = currentStatus;

      const isPresent = currentStatus === "present";
      const isAbsent = currentStatus === "absent";
      const isLate = currentStatus === "late";

      return `
        <tr id="manual-row-${student.id}">
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.id}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
              <div>
                <div class="font-bold text-sm" style="color:var(--text-main);">${student.fullName || student.name}</div>
                <div class="text-xs text-muted">ID: ${student.studentId || student.id} • ${student.className || classId}-${student.section || section}</div>
              </div>
            </div>
          </td>
          <td style="text-align:center;">
            <div class="btn-group" style="display:inline-flex; gap:0.25rem;">
              <button type="button" class="btn btn-sm ${isPresent ? 'btn-primary' : 'btn-outline'}" onclick="SmartLearnTeacherAttendance.setSingleManualStatus('${student.id}', 'present')">Present</button>
              <button type="button" class="btn btn-sm ${isAbsent ? 'btn-danger' : 'btn-outline'}" style="${isAbsent ? 'background:#ef4444; color:#fff;' : ''}" onclick="SmartLearnTeacherAttendance.setSingleManualStatus('${student.id}', 'absent')">Absent</button>
              <button type="button" class="btn btn-sm ${isLate ? 'btn-warning' : 'btn-outline'}" style="${isLate ? 'background:#f59e0b; color:#fff;' : ''}" onclick="SmartLearnTeacherAttendance.setSingleManualStatus('${student.id}', 'late')">Late</button>
            </div>
          </td>
          <td>
            <span class="text-xs text-muted">${existing ? (existing.method || 'Manual Roll-call') : 'Manual Register'}</span>
          </td>
        </tr>
      `;
    }).join("");
  },

  setSingleManualStatus(studentId, status) {
    this.currentManualState[studentId] = status;
    const row = document.getElementById(`manual-row-${studentId}`);
    if (!row) return;

    const btns = row.querySelectorAll(".btn-group button");
    btns.forEach(btn => {
      btn.className = "btn btn-sm btn-outline";
      btn.style.background = "";
      btn.style.color = "";
    });

    if (status === "present") {
      btns[0].className = "btn btn-sm btn-primary";
    } else if (status === "absent") {
      btns[1].style.background = "#ef4444";
      btns[1].style.color = "#fff";
    } else if (status === "late") {
      btns[2].style.background = "#f59e0b";
      btns[2].style.color = "#fff";
    }
  },

  setAllManualStatus(status) {
    Object.keys(this.currentManualState).forEach(stId => {
      this.setSingleManualStatus(stId, status);
    });
  },

  saveManualAttendance() {
    const classId = document.getElementById("teacher-manual-class") ? document.getElementById("teacher-manual-class").value : "B.Tech CSE";
    const section = document.getElementById("teacher-manual-section") ? document.getElementById("teacher-manual-section").value : "A";
    const subjectId = document.getElementById("teacher-manual-subject") ? document.getElementById("teacher-manual-subject").value : "sub_cs";
    const dateStr = document.getElementById("teacher-manual-date") ? document.getElementById("teacher-manual-date").value : new Date().toISOString().split("T")[0];
    const subjectObj = SmartLearnStorage.getSubjectById(subjectId) || { name: "Computer Science" };
    const teacher = SmartLearnAuth.getCurrentUser();

    const records = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];

    Object.keys(this.currentManualState).forEach(studentId => {
      const status = this.currentManualState[studentId];
      const existingIdx = records.findIndex(r => r.studentId === studentId && r.date === dateStr && r.subjectId === subjectId);

      const rec = {
        id: existingIdx >= 0 ? records[existingIdx].id : ("att_" + Date.now() + "_" + Math.floor(Math.random() * 1000)),
        studentId: studentId,
        classId: classId,
        section: section,
        subjectId: subjectId,
        subject: subjectObj.name,
        teacherId: teacher ? teacher.id : "usr_teacher_01",
        date: dateStr,
        status: status,
        markedAt: new Date().toISOString(),
        method: "manual"
      };

      if (existingIdx >= 0) {
        records[existingIdx] = rec;
      } else {
        records.unshift(rec);
      }
    });

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    SmartLearnApp.showToast(`Saved manual register for ${subjectObj.name} on ${dateStr}!`, "success");
    this.renderTeacherAttendanceOverview();
  },

  renderTeacherAttendanceOverview() {
    const records = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecords = records.filter(r => r.date === todayStr);

    const presentCount = todayRecords.filter(r => r.status === "present").length;
    const absentCount = todayRecords.filter(r => r.status === "absent").length;

    const presentEl = document.getElementById("teacher-today-present-count");
    if (presentEl) presentEl.innerText = presentCount;

    const absentEl = document.getElementById("teacher-today-absent-count");
    if (absentEl) absentEl.innerText = absentCount;

    const recentContainer = document.getElementById("teacher-recent-checkins-list");
    if (!recentContainer) return;

    if (records.length === 0) {
      recentContainer.innerHTML = `<div class="empty-state-text">No recent attendance records.</div>`;
      return;
    }

    recentContainer.innerHTML = records.slice(0, 8).map(r => {
      const st = SmartLearnAuth.getUserById(r.studentId) || { fullName: "Student " + r.studentId };
      const isPresent = r.status === "present";
      const isAbsent = r.status === "absent";
      const badgeClass = isPresent ? "badge-success" : (isAbsent ? "badge-danger" : "badge-warning");

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0.75rem; border-radius:8px; background:var(--bg-subtle);">
          <div>
            <div class="font-bold text-xs" style="color:var(--text-main);">${st.fullName || st.name}</div>
            <div class="text-xs text-muted">${r.subject || 'Course'} • ${r.date}</div>
          </div>
          <span class="badge ${badgeClass}">${r.status.toUpperCase()}</span>
        </div>
      `;
    }).join("");
  }
};

// Timetable editor logic handled by SmartLearnTeacherTimetable controller

/**
 * SmartLearnStudentTimetable Engine
 * Student Read-Only 8-Period Timetable Viewer
 */
const SmartLearnStudentTimetable = {
  selectedDay: "Monday",
  currentView: "matrix",

  init() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[new Date().getDay()];
    this.selectedDay = (todayName === "Saturday" || todayName === "Sunday") ? "Monday" : todayName;

    this.updateDayTabsUI();
    this.render8PeriodTimetable();
    this.render5DayWeeklyMatrix();
  },

  switchView(mode) {
    this.currentView = mode;
    const matrixView = document.getElementById("student-tt-matrix-view");
    const dailyView = document.getElementById("student-tt-daily-view");
    const btnMatrix = document.getElementById("btn-view-matrix");
    const btnDaily = document.getElementById("btn-view-daily");

    if (mode === "matrix") {
      if (matrixView) matrixView.style.display = "block";
      if (dailyView) dailyView.style.display = "none";
      if (btnMatrix) btnMatrix.className = "btn btn-sm btn-primary";
      if (btnDaily) btnDaily.className = "btn btn-sm btn-outline";
      this.render5DayWeeklyMatrix();
    } else {
      if (matrixView) matrixView.style.display = "none";
      if (dailyView) dailyView.style.display = "block";
      if (btnMatrix) btnMatrix.className = "btn btn-sm btn-outline";
      if (btnDaily) btnDaily.className = "btn btn-sm btn-primary";
      this.render8PeriodTimetable();
    }
  },

  selectDay(dayName, clickedBtn) {
    this.selectedDay = dayName;
    this.updateDayTabsUI(clickedBtn);
    this.render8PeriodTimetable();
  },

  updateDayTabsUI(clickedBtn) {
    const btns = document.querySelectorAll(".tt-day-btn");
    btns.forEach(btn => {
      if (btn.innerText.trim().toLowerCase() === this.selectedDay.toLowerCase()) {
        btn.className = "btn btn-sm btn-primary tt-day-btn";
      } else {
        btn.className = "btn btn-sm btn-outline tt-day-btn";
      }
    });
  },

  render5DayWeeklyMatrix() {
    const matrixBody = document.getElementById("student-5day-timetable-matrix-body");
    if (!matrixBody) return;

    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const userClass = (user.className || user.class || "B.Tech CSE").toLowerCase();
    const userSection = (user.section || "A").toUpperCase();

    const classBadgeTab = document.getElementById("student-tt-class-badge-tab");
    if (classBadgeTab) classBadgeTab.innerText = `${user.className || 'B.Tech CSE'}-${userSection}`;

    const allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periodTimes = [
      { period: 1, startTime: "08:30", endTime: "09:15" },
      { period: 2, startTime: "09:15", endTime: "10:00" },
      { period: 3, startTime: "10:15", endTime: "11:00" },
      { period: 4, startTime: "11:00", endTime: "11:45" },
      { period: 5, startTime: "12:30", endTime: "01:15" },
      { period: 6, startTime: "01:15", endTime: "02:00" },
      { period: 7, startTime: "02:15", endTime: "03:00" },
      { period: 8, startTime: "03:00", endTime: "03:45" }
    ];

    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTotalMins = currentHours * 60 + currentMins;
    const currentDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];

    let matrixHtml = "";

    periodTimes.forEach(pt => {
      matrixHtml += `<tr style="border-bottom: 1px solid var(--border-color);">`;
      matrixHtml += `
        <td style="font-weight: 700; color: var(--text-main); text-align: center; background: var(--bg-subtle);">
          Period ${pt.period}
          <div class="text-xs text-muted" style="font-weight: 400;">${pt.startTime} - ${pt.endTime}</div>
        </td>
      `;

      days.forEach(dayName => {
        const isToday = currentDayName.toLowerCase() === dayName.toLowerCase();

        let rec = allTt.find(t =>
          (t.day && t.day.toLowerCase() === dayName.toLowerCase()) &&
          (t.period === pt.period || String(t.period) === String(pt.period)) &&
          (t.section ? t.section.toUpperCase() === userSection : true)
        );

        if (!rec) {
          rec = allTt.find(t =>
            (t.day && t.day.toLowerCase() === dayName.toLowerCase()) &&
            (t.period === pt.period || String(t.period) === String(pt.period))
          );
        }

        const subject = rec ? (rec.subject || "Self Study") : "Self Study";
        const teacher = rec ? (rec.teacher || rec.instructor || "Faculty") : "Faculty";
        const room = rec ? (rec.room || rec.roomNo || "Room") : "Room";

        const [sH, sM] = pt.startTime.split(":").map(Number);
        const [eH, eM] = pt.endTime.split(":").map(Number);
        const startMins = sH * 60 + sM;
        const endMins = eH * 60 + eM;

        let activeStyle = "";
        let isOngoing = isToday && (currentTotalMins >= startMins && currentTotalMins <= endMins);

        if (isOngoing) {
          activeStyle = "background: rgba(16, 185, 129, 0.12); border: 2px solid var(--success); border-radius: 8px;";
        }

        matrixHtml += `
          <td style="padding: 0.6rem; vertical-align: top; ${activeStyle}">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary-color);">${subject}</div>
            <div class="text-xs" style="color: var(--text-main); font-weight: 500; margin-top: 0.15rem;">${teacher}</div>
            <div class="text-xs text-muted" style="margin-top: 0.1rem;">📍 ${room}</div>
            ${isOngoing ? '<span class="badge badge-success text-xs" style="margin-top: 0.25rem; display: inline-block;">🟢 Active Now</span>' : ''}
          </td>
        `;
      });

      matrixHtml += `</tr>`;
    });

    matrixBody.innerHTML = matrixHtml;
  },

  render8PeriodTimetable() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const userClass = (user.className || user.class || "B.Tech CSE").toLowerCase();
    const userSection = (user.section || "A").toUpperCase();

    const classBadge = document.getElementById("student-tt-class-badge");
    if (classBadge) classBadge.innerText = `${user.className || 'B.Tech CSE'}-${userSection}`;

    const classBadgeTab = document.getElementById("student-tt-class-badge-tab");
    if (classBadgeTab) classBadgeTab.innerText = `${user.className || 'B.Tech CSE'}-${userSection}`;

    const allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const dayTt = allTt.filter(t => {
      const matchDay = t.day ? (t.day.toLowerCase() === this.selectedDay.toLowerCase()) : true;
      const tClass = (t.className || t.class || "").toLowerCase();
      const matchClass = !tClass || tClass === "grade 11" || tClass === userClass || tClass.includes("11") || userClass.includes(tClass);
      return matchDay && matchClass;
    });

    const defaultTimes = [
      { period: 1, startTime: "08:30", endTime: "09:15" },
      { period: 2, startTime: "09:15", endTime: "10:00" },
      { period: 3, startTime: "10:15", endTime: "11:00" },
      { period: 4, startTime: "11:00", endTime: "11:45" },
      { period: 5, startTime: "12:30", endTime: "01:15" },
      { period: 6, startTime: "01:15", endTime: "02:00" },
      { period: 7, startTime: "02:15", endTime: "03:00" },
      { period: 8, startTime: "03:00", endTime: "03:45" }
    ];

    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTotalMins = currentHours * 60 + currentMins;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const isToday = days[now.getDay()].toLowerCase() === this.selectedDay.toLowerCase();

    let rowsHtml = "";
    defaultTimes.forEach(pt => {
      let rec = dayTt.find(t => (t.period === pt.period || String(t.period) === String(pt.period)) && (t.section ? t.section.toUpperCase() === userSection : true));
      if (!rec) {
        rec = dayTt.find(t => t.period === pt.period || String(t.period) === String(pt.period));
      }

      const subject = rec ? (rec.subject || "Self Study") : "Free Period / Self Study";
      const teacher = rec ? (rec.teacher || rec.instructor || "Faculty Supervisor") : "Faculty Supervisor";
      const room = rec ? (rec.room || rec.roomNo || "Study Hall") : "Study Hall";
      const startTime = rec ? (rec.startTime || pt.startTime) : pt.startTime;
      const endTime = rec ? (rec.endTime || pt.endTime) : pt.endTime;

      let statusBadge = `<span class="badge badge-outline" style="font-size:0.7rem;">Scheduled</span>`;
      if (isToday) {
        const [sH, sM] = (startTime || "08:30").split(":").map(Number);
        const [eH, eM] = (endTime || "09:15").split(":").map(Number);
        const startMins = (isNaN(sH) ? 8 : sH) * 60 + (isNaN(sM) ? 30 : sM);
        const endMins = (isNaN(eH) ? 9 : eH) * 60 + (isNaN(eM) ? 15 : eM);

        if (currentTotalMins >= startMins && currentTotalMins <= endMins) {
          statusBadge = `<span class="badge badge-success" style="font-size:0.7rem; font-weight:700;">🟢 ACTIVE NOW</span>`;
        } else if (currentTotalMins > endMins) {
          statusBadge = `<span class="badge badge-secondary" style="font-size:0.7rem;">Completed</span>`;
        }
      }

      rowsHtml += `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="font-weight: 700; color: var(--text-main);">Period ${pt.period}</td>
          <td class="text-xs text-muted font-bold">${startTime} - ${endTime}</td>
          <td>
            <span class="font-bold text-sm" style="color: var(--primary-color);">${subject}</span>
          </td>
          <td class="text-xs">${teacher}</td>
          <td class="text-xs text-muted">${room}</td>
          <td style="text-align: center;">${statusBadge}</td>
        </tr>
      `;
    });

    const tbody = document.getElementById("student-timetable-8periods-body");
    if (tbody) tbody.innerHTML = rowsHtml;

    const tbodyTab = document.getElementById("student-timetable-8periods-body-tab");
    if (tbodyTab) tbodyTab.innerHTML = rowsHtml;
  }
};

/**
 * SmartLearn - Teacher Exam Timetable Manager Controller
 * Handles CRUD operations for exam schedules.
 * Real-time changes persist to STORAGE_KEYS.EXAMS and immediately reflect across student & parent portals.
 */
const SmartLearnTeacherExamTimetable = {
  init() {
    this.renderExamTable();
  },

  renderExamTable() {
    const tbody = document.getElementById("teacher-exam-timetable-table-body");
    if (!tbody) return;

    const classFilter = document.getElementById("teacher-exam-filter-class")?.value || "ALL";
    const sectionFilter = document.getElementById("teacher-exam-filter-section")?.value || "ALL";

    const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    const filtered = exams.filter(e => {
      const matchClass = classFilter === "ALL" || (e.className || e.class) === classFilter;
      const matchSec = sectionFilter === "ALL" || !e.section || e.section === sectionFilter;
      return matchClass && matchSec;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No scheduled exams found. Click "+ Schedule New Exam" to create one.</td></tr>`;
      return;
    }

    filtered.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    tbody.innerHTML = filtered.map(item => {
      const isPending = item.status === "pending_approval";
      const isRejected = item.status === "rejected";
      const statusBadge = isPending
        ? `<span class="badge badge-warning text-xs" style="margin-top:0.25rem;">⏳ Pending Admin Approval</span>`
        : (isRejected
          ? `<span class="badge badge-danger text-xs" style="margin-top:0.25rem;">❌ Rejected by Admin</span>`
          : `<span class="badge badge-success text-xs" style="margin-top:0.25rem;">Approved & Live</span>`);

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td>
            <div class="font-bold text-sm" style="color: var(--text-main);">${item.title}</div>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <span class="badge badge-primary text-xs" style="margin-top:0.25rem;">${item.subject}</span>
              ${statusBadge}
            </div>
          </td>
          <td class="font-bold text-xs">${item.className || 'B.Tech CSE'}-${item.section || 'A'}</td>
          <td class="font-bold text-sm">${item.examDate}</td>
          <td class="text-xs text-muted font-bold">${item.startTime} - ${item.endTime}</td>
          <td class="text-xs font-bold" style="color: var(--primary-color);">${item.room}</td>
          <td class="text-xs text-muted" style="max-width: 220px; white-space: normal;">${item.instructions || 'Standard rules apply.'}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-outline btn-sm" onclick="SmartLearnTeacherExamTimetable.openEditModal('${item.id}')">Edit</button>
              <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger);" onclick="SmartLearnTeacherExamTimetable.deleteExam('${item.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openAddModal() {
    document.getElementById("exam-id").value = "";
    document.getElementById("exam-modal-title").innerText = "Schedule New Examination";
    document.getElementById("exam-subject").value = "Computer Science";
    document.getElementById("exam-title").value = "";
    document.getElementById("exam-class").value = "B.Tech CSE";
    document.getElementById("exam-section").value = "A";

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    document.getElementById("exam-date").value = tomorrow.toISOString().split("T")[0];
    document.getElementById("exam-start-time").value = "09:00";
    document.getElementById("exam-end-time").value = "12:00";
    document.getElementById("exam-room").value = "CS Lab 1";
    document.getElementById("exam-instructions").value = "";

    SmartLearnApp.openModal("create-exam-modal");
  },

  openEditModal(examId) {
    const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    const item = exams.find(e => e.id === examId);
    if (!item) return;

    document.getElementById("exam-id").value = item.id;
    document.getElementById("exam-modal-title").innerText = "Edit Examination Schedule";
    document.getElementById("exam-subject").value = item.subject || "Computer Science";
    document.getElementById("exam-title").value = item.title || "";
    document.getElementById("exam-class").value = item.className || item.class || "B.Tech CSE";
    document.getElementById("exam-section").value = item.section || "A";
    document.getElementById("exam-date").value = item.examDate || "";
    document.getElementById("exam-start-time").value = item.startTime || "09:00";
    document.getElementById("exam-end-time").value = item.endTime || "12:00";
    document.getElementById("exam-room").value = item.room || "";
    document.getElementById("exam-instructions").value = item.instructions || "";

    SmartLearnApp.openModal("create-exam-modal");
  },

  saveExam(e) {
    e.preventDefault();
    const user = SmartLearnAuth.getCurrentUser();
    const id = document.getElementById("exam-id").value;
    const subject = document.getElementById("exam-subject").value;
    const title = document.getElementById("exam-title").value;
    const className = document.getElementById("exam-class").value;
    const section = document.getElementById("exam-section").value;
    const examDate = document.getElementById("exam-date").value;
    const startTime = document.getElementById("exam-start-time").value;
    const endTime = document.getElementById("exam-end-time").value;
    const room = document.getElementById("exam-room").value;
    const instructions = document.getElementById("exam-instructions").value;

    const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];

    if (id) {
      const idx = exams.findIndex(item => item.id === id);
      if (idx !== -1) {
        exams[idx] = {
          ...exams[idx],
          subject,
          title,
          className,
          section,
          examDate,
          startTime,
          endTime,
          room,
          instructions,
          status: "pending_approval",
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      const newExam = {
        id: "exam_" + Date.now(),
        subject,
        title,
        className,
        section,
        examDate,
        startTime,
        endTime,
        room,
        instructions,
        createdByName: user ? user.fullName : "Faculty Teacher",
        createdAt: new Date().toISOString(),
        status: "pending_approval"
      };
      exams.push(newExam);
    }

    SmartLearnStorage.set(STORAGE_KEYS.EXAMS, exams);

    if (typeof sendNotificationToRole !== "undefined") {
      sendNotificationToRole("Administrator", "Exam Schedule Approval Needed ⏳", `${user ? (user.fullName || user.name) : 'Faculty'} submitted exam schedule '${title}' (${subject}) for ${className}-${section} requiring Administrator approval.`);
    }

    SmartLearnApp.showToast(`Exam schedule "${title}" submitted for Administrator approval! ⏳`, "info");
    SmartLearnApp.closeModal("create-exam-modal");

    this.renderExamTable();

    if (typeof SmartLearnStudentExamTimetable !== "undefined") {
      SmartLearnStudentExamTimetable.renderStudentExams();
    }
    if (typeof SmartLearnDashboard !== "undefined") {
      SmartLearnDashboard.renderExams();
    }
    if (typeof SmartLearnParent !== "undefined") {
      SmartLearnParent.renderParentExams();
    }
    if (typeof SmartLearnAdmin !== "undefined" && SmartLearnAdmin.renderPendingTimetableApprovals) {
      SmartLearnAdmin.renderPendingTimetableApprovals();
    }
  },

  deleteExam(examId) {
    if (!confirm("Are you sure you want to delete this scheduled examination?")) return;

    let exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    exams = exams.filter(e => e.id !== examId);
    SmartLearnStorage.set(STORAGE_KEYS.EXAMS, exams);

    SmartLearnApp.showToast("Exam schedule deleted successfully.", "info");
    this.renderExamTable();

    if (typeof SmartLearnStudentExamTimetable !== "undefined") {
      SmartLearnStudentExamTimetable.renderStudentExams();
    }
    if (typeof SmartLearnDashboard !== "undefined") {
      SmartLearnDashboard.renderExams();
    }
    if (typeof SmartLearnParent !== "undefined") {
      SmartLearnParent.renderParentExams();
    }
    if (typeof SmartLearnAdmin !== "undefined" && SmartLearnAdmin.renderPendingTimetableApprovals) {
      SmartLearnAdmin.renderPendingTimetableApprovals();
    }
  }
};



/**
 * SmartLearn - Student Exam Timetable Viewer
 * Renders live term exams published by teachers for the student's class.
 */
const SmartLearnStudentExamTimetable = {
  init() {
    this.renderStudentExams();
  },

  renderStudentExams() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const userClass = user.className || user.class || "B.Tech CSE";
    const userSection = user.section || "A";

    const badge = document.getElementById("student-exam-class-badge");
    if (badge) badge.innerText = `${userClass}-${userSection}`;

    const tbody = document.getElementById("student-exam-timetable-body");
    if (!tbody) return;

    const allExams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    const studentExams = allExams.filter(e => {
      const isApproved = (e.status === "approved" || !e.status || e.status === undefined);
      if (!isApproved) return false;

      const eClass = (e.className || e.class || "").toLowerCase();
      const uClass = userClass.toLowerCase();
      const matchClass = !eClass || eClass === uClass || uClass.includes(eClass) || eClass.includes(uClass);
      const matchSec = !e.section || e.section === "ALL" || e.section.toUpperCase() === userSection.toUpperCase();
      return matchClass && matchSec;
    });

    if (studentExams.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No upcoming term examinations published for ${userClass}-${userSection}.</td></tr>`;
      return;
    }

    studentExams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    const todayStr = new Date().toISOString().split("T")[0];

    tbody.innerHTML = studentExams.map(item => {
      let statusBadge = `<span class="badge badge-info">Scheduled</span>`;
      if (item.examDate === todayStr) {
        statusBadge = `<span class="badge badge-danger" style="font-weight:700;">🔴 TODAY</span>`;
      } else if (item.examDate > todayStr) {
        const diffMs = new Date(item.examDate) - new Date(todayStr);
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        statusBadge = `<span class="badge badge-warning">In ${daysLeft} Day${daysLeft > 1 ? 's' : ''}</span>`;
      } else {
        statusBadge = `<span class="badge badge-secondary">Completed</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td><span class="badge badge-primary font-bold">${item.subject}</span></td>
          <td class="font-bold text-sm" style="color: var(--text-main);">${item.title}</td>
          <td class="font-bold text-sm">${item.examDate}</td>
          <td class="text-xs text-muted font-bold">${item.startTime} - ${item.endTime}</td>
          <td class="text-xs font-bold" style="color: var(--primary-color);">${item.room}</td>
          <td>${statusBadge}</td>
          <td class="text-xs text-muted" style="max-width: 250px; white-space: normal;">${item.instructions || 'Standard examination rules apply.'}</td>
        </tr>
      `;
    }).join("");
  }
};

/**
 * SmartLearn - Teacher Timetable Editor Controller
 * Allows faculty teachers to select Class, Section, and Day to view/edit the 8-period timetable matrix.
 * Updates persist to localStorage and sync instantly to Student & Parent dashboards.
 */
const SmartLearnTeacherTimetable = {
  defaultTimeSlots: [
    { period: 1, startTime: "09:00", endTime: "09:50" },
    { period: 2, startTime: "09:50", endTime: "10:40" },
    { period: 3, startTime: "10:50", endTime: "11:40" },
    { period: 4, startTime: "11:40", endTime: "12:30" },
    { period: 5, startTime: "01:30", endTime: "02:20" },
    { period: 6, startTime: "02:20", endTime: "03:10" },
    { period: 7, startTime: "03:20", endTime: "04:10" },
    { period: 8, startTime: "04:10", endTime: "05:00" }
  ],

  init() {
    const classSelect = document.getElementById("teacher-tt-class");
    const user = SmartLearnAuth.getCurrentUser();

    if (user && classSelect) {
      if (user.department) {
        const deptClassOption = Array.from(classSelect.options).find(opt =>
          opt.value.toLowerCase().includes(user.department.toLowerCase()) ||
          user.department.toLowerCase().includes(opt.value.toLowerCase())
        );
        if (deptClassOption) classSelect.value = deptClassOption.value;
      }
    }

    this.renderEditorTable();
  },

  renderEditorTable() {
    const tbody = document.getElementById("teacher-timetable-editor-body");
    if (!tbody) return;

    const classEl = document.getElementById("teacher-tt-class");
    const sectionEl = document.getElementById("teacher-tt-section");
    const dayEl = document.getElementById("teacher-tt-day");

    const className = classEl ? classEl.value : "B.Tech CSE";
    const section = sectionEl ? sectionEl.value : "A";
    const day = dayEl ? dayEl.value : "Monday";

    const allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const sectionTt = allTt.filter(t =>
      (t.className === className || t.class === className) &&
      (t.section === section || (!t.section && section === "A")) &&
      t.day === day
    );

    const currentUser = SmartLearnAuth.getCurrentUser();
    const teacherDefaultName = currentUser ? (currentUser.fullName || currentUser.name) : "Dr. Priya Sharma";

    let rowsHtml = "";
    for (let p = 1; p <= 8; p++) {
      const existingSlot = sectionTt.find(t => (t.period || 1) === p);
      const slotDef = this.defaultTimeSlots[p - 1];

      const subjectVal = existingSlot ? (existingSlot.subject || "") : (p === 1 ? "Computer Science" : (p === 2 ? "Mathematics" : (p === 3 ? "Physics" : "")));
      const teacherVal = existingSlot ? (existingSlot.teacher || "") : (subjectVal ? teacherDefaultName : "");
      const roomVal = existingSlot ? (existingSlot.room || "") : (subjectVal ? `Room CS-${100 + p}` : "");
      const startVal = existingSlot ? (existingSlot.startTime || slotDef.startTime) : slotDef.startTime;
      const endVal = existingSlot ? (existingSlot.endTime || slotDef.endTime) : slotDef.endTime;

      rowsHtml += `
        <tr style="border-bottom: 1px solid var(--border-color);" data-period="${p}">
          <td style="padding: 0.6rem; vertical-align: middle;">
            <span class="badge badge-primary font-bold">Period ${p}</span>
          </td>
          <td style="padding: 0.6rem; vertical-align: middle;">
            <div style="display: flex; gap: 0.25rem; align-items: center;">
              <input type="time" class="form-control form-control-sm tt-start-time" value="${startVal}" style="padding: 0.2rem 0.4rem; font-size: 0.775rem;">
              <span class="text-xs text-muted">-</span>
              <input type="time" class="form-control form-control-sm tt-end-time" value="${endVal}" style="padding: 0.2rem 0.4rem; font-size: 0.775rem;">
            </div>
          </td>
          <td style="padding: 0.6rem; vertical-align: middle;">
            <input type="text" class="form-control form-control-sm tt-subject-input" value="${(subjectVal).replace(/"/g, '&quot;')}" placeholder="e.g. Data Structures / Free Period" style="font-size: 0.85rem;">
          </td>
          <td style="padding: 0.6rem; vertical-align: middle;">
            <input type="text" class="form-control form-control-sm tt-teacher-input" value="${(teacherVal).replace(/"/g, '&quot;')}" placeholder="Instructor Name" style="font-size: 0.85rem;">
          </td>
          <td style="padding: 0.6rem; vertical-align: middle;">
            <input type="text" class="form-control form-control-sm tt-room-input" value="${(roomVal).replace(/"/g, '&quot;')}" placeholder="e.g. Lab 1 / Hall 204" style="font-size: 0.85rem;">
          </td>
        </tr>
      `;
    }

    tbody.innerHTML = rowsHtml;
  },

  saveTimetable() {
    const classEl = document.getElementById("teacher-tt-class");
    const sectionEl = document.getElementById("teacher-tt-section");
    const dayEl = document.getElementById("teacher-tt-day");

    const className = classEl ? classEl.value : "B.Tech CSE";
    const section = sectionEl ? sectionEl.value : "A";
    const day = dayEl ? dayEl.value : "Monday";

    const tbody = document.getElementById("teacher-timetable-editor-body");
    if (!tbody) return;

    const rows = tbody.querySelectorAll("tr[data-period]");
    const updatedPeriodSlots = [];

    rows.forEach(row => {
      const period = parseInt(row.getAttribute("data-period"));
      const startTime = row.querySelector(".tt-start-time").value || "09:00";
      const endTime = row.querySelector(".tt-end-time").value || "09:50";
      const subject = row.querySelector(".tt-subject-input").value.trim();
      const teacher = row.querySelector(".tt-teacher-input").value.trim();
      const room = row.querySelector(".tt-room-input").value.trim();

      if (subject) {
        updatedPeriodSlots.push({
          id: `tt_${className}_${section}_${day}_p${period}`,
          className,
          class: className,
          section,
          day,
          period,
          startTime,
          endTime,
          subject,
          teacher: teacher || "Faculty Instructor",
          room: room || "Main Classroom",
          status: "pending_approval"
        });
      }
    });

    // Replace existing timetable slots for this class, section, and day in storage
    let allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    allTt = allTt.filter(t => !(
      (t.className === className || t.class === className) &&
      (t.section === section || (!t.section && section === "A")) &&
      t.day === day
    ));

    allTt.push(...updatedPeriodSlots);
    SmartLearnStorage.set(STORAGE_KEYS.TIMETABLE, allTt);

    if (typeof sendNotificationToRole !== "undefined") {
      sendNotificationToRole("Administrator", "Class Timetable Approval Needed ⏳", `Faculty submitted updated class timetable for ${className}-${section} (${day}) requiring Administrator approval.`);
    }

    SmartLearnApp.showToast(`Timetable for ${className}-${section} (${day}) submitted for Administrator approval! ⏳`, "info");

    if (typeof SmartLearnAdmin !== "undefined" && SmartLearnAdmin.renderPendingTimetableApprovals) {
      SmartLearnAdmin.renderPendingTimetableApprovals();
    }

    // Re-render student schedule if active
    const currentUser = SmartLearnAuth.getCurrentUser();
    if (currentUser && currentUser.role === "Student") {
      SmartLearnDashboard.renderTodaySchedule(currentUser);
    }
  }
};

/**
 * SmartLearn - System Administrator Management Module
 * Handles Section-Wise Student records, Department-Wise Teacher records, Credentials Master,
 * and 100% dynamic rendering of all admin dashboard metrics and overview cards.
 */
const SmartLearnAdmin = {
  init() {
    this.renderPendingTimetableApprovals();
    this.renderMetrics();
    this.renderSectionWiseStudents();
    this.renderDepartmentWiseTeachers();
    this.renderUserCredentialsMaster();
    this.renderAcademicDepartmentOverview();
    this.renderAuditLogs();
    this.renderUserBaseSummary();
    this.renderClassesAndStreams();
    this.renderTimetableMaster();
    this.renderAnnouncements();
    this.renderAcademicAnalytics();
  },

  renderPendingTimetableApprovals() {
    const listContainer = document.getElementById("admin-pending-timetable-list");
    const countBadge = document.getElementById("admin-pending-timetable-count");

    if (!listContainer) return;

    const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
    const pendingExams = exams.filter(e => e.status === "pending_approval");

    const timetables = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const pendingTimetables = timetables.filter(t => t.status === "pending_approval");

    const totalPending = pendingExams.length + pendingTimetables.length;
    if (countBadge) countBadge.innerText = `${totalPending} Pending`;

    if (totalPending === 0) {
      listContainer.innerHTML = `
        <div style="padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          ✅ All timetable schedules and exam timetables are approved & published. No pending approvals.
        </div>
      `;
      return;
    }

    let itemsHtml = `
      <div style="overflow-x: auto;">
        <table class="table" style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
              <th style="padding: 0.6rem 0.75rem;">Type</th>
              <th style="padding: 0.6rem 0.75rem;">Title / Subject</th>
              <th style="padding: 0.6rem 0.75rem;">Class & Section</th>
              <th style="padding: 0.6rem 0.75rem;">Date / Day & Time</th>
              <th style="padding: 0.6rem 0.75rem;">Venue</th>
              <th style="padding: 0.6rem 0.75rem;">Requested By</th>
              <th style="padding: 0.6rem 0.75rem; text-align: right;">Approval Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    pendingExams.forEach(item => {
      itemsHtml += `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.6rem 0.75rem;"><span class="badge badge-warning">📝 Exam Timetable</span></td>
          <td style="padding: 0.6rem 0.75rem;" class="font-semibold">
            ${item.title}
            <div class="text-xs text-muted">${item.subject}</div>
          </td>
          <td style="padding: 0.6rem 0.75rem;" class="font-bold text-xs">${item.className || 'B.Tech CSE'}-${item.section || 'A'}</td>
          <td style="padding: 0.6rem 0.75rem;" class="text-xs">
            <strong>${item.examDate}</strong><br>
            <span class="text-muted">${item.startTime} - ${item.endTime}</span>
          </td>
          <td style="padding: 0.6rem 0.75rem;" class="text-xs font-bold text-primary">${item.room || 'Main Hall'}</td>
          <td style="padding: 0.6rem 0.75rem;" class="text-xs text-muted">${item.createdByName || 'Faculty Teacher'}</td>
          <td style="padding: 0.6rem 0.75rem; text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-success btn-sm" onclick="SmartLearnAdmin.approveTimetableItem('exam', '${item.id}')">
                ✅ Approve
              </button>
              <button class="btn btn-danger btn-sm" onclick="SmartLearnAdmin.rejectTimetableItem('exam', '${item.id}')">
                ❌ Reject
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    pendingTimetables.forEach(item => {
      itemsHtml += `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.6rem 0.75rem;"><span class="badge badge-info">📅 Class Timetable</span></td>
          <td style="padding: 0.6rem 0.75rem;" class="font-semibold">
            ${item.subject}
            <div class="text-xs text-muted">${item.day} - Period ${item.period}</div>
          </td>
          <td style="padding: 0.6rem 0.75rem;" class="font-bold text-xs">${item.className || 'B.Tech CSE'}-${item.section || 'A'}</td>
          <td style="padding: 0.6rem 0.75rem;" class="text-xs">
            <strong>${item.day}</strong><br>
            <span class="text-muted">${item.startTime} - ${item.endTime}</span>
          </td>
          <td style="padding: 0.6rem 0.75rem;" class="text-xs font-bold text-primary">${item.room || 'Room 101'}</td>
          <td style="padding: 0.6rem 0.75rem;" class="text-xs text-muted">${item.teacher || 'Faculty Teacher'}</td>
          <td style="padding: 0.6rem 0.75rem; text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-success btn-sm" onclick="SmartLearnAdmin.approveTimetableItem('timetable', '${item.id}')">
                ✅ Approve
              </button>
              <button class="btn btn-danger btn-sm" onclick="SmartLearnAdmin.rejectTimetableItem('timetable', '${item.id}')">
                ❌ Reject
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    itemsHtml += `
          </tbody>
        </table>
      </div>
    `;

    listContainer.innerHTML = itemsHtml;
  },

  approveTimetableItem(type, itemId) {
    if (type === 'exam') {
      const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
      const item = exams.find(e => e.id === itemId);
      if (item) {
        item.status = "approved";
        SmartLearnStorage.set(STORAGE_KEYS.EXAMS, exams);
        sendNotificationToSection(item.className, item.section, "Exam Schedule Approved 📅", `The exam schedule '${item.title}' (${item.subject}) on ${item.examDate} (${item.startTime}-${item.endTime}) has been approved by Administration and is now live.`);
        SmartLearnApp.showToast(`Exam schedule "${item.title}" approved & published to students! 🎉`, "success");
      }
    } else {
      const timetables = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
      const item = timetables.find(t => t.id === itemId);
      if (item) {
        item.status = "approved";
        SmartLearnStorage.set(STORAGE_KEYS.TIMETABLE, timetables);
        sendNotificationToSection(item.className, item.section, "Class Timetable Approved 📅", `The class timetable slot for '${item.subject}' on ${item.day} (${item.startTime}-${item.endTime}) has been approved by Administration.`);
        SmartLearnApp.showToast(`Class timetable slot for "${item.subject}" approved! 🎉`, "success");
      }
    }

    this.renderPendingTimetableApprovals();
    if (typeof SmartLearnTeacherExamTimetable !== "undefined") SmartLearnTeacherExamTimetable.renderExamTable();
    if (typeof SmartLearnStudentExamTimetable !== "undefined") SmartLearnStudentExamTimetable.renderStudentExams();
    if (typeof SmartLearnDashboard !== "undefined") SmartLearnDashboard.renderExams();
    if (typeof SmartLearnParent !== "undefined") SmartLearnParent.renderParentExams();
  },

  rejectTimetableItem(type, itemId) {
    if (type === 'exam') {
      const exams = SmartLearnStorage.get(STORAGE_KEYS.EXAMS) || [];
      const item = exams.find(e => e.id === itemId);
      if (item) {
        item.status = "rejected";
        SmartLearnStorage.set(STORAGE_KEYS.EXAMS, exams);
        SmartLearnApp.showToast(`Exam schedule request for "${item.title}" rejected.`, "info");
      }
    } else {
      const timetables = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
      const item = timetables.find(t => t.id === itemId);
      if (item) {
        item.status = "rejected";
        SmartLearnStorage.set(STORAGE_KEYS.TIMETABLE, timetables);
        SmartLearnApp.showToast(`Timetable schedule request for "${item.subject}" rejected.`, "info");
      }
    }

    this.renderPendingTimetableApprovals();
    if (typeof SmartLearnTeacherExamTimetable !== "undefined") SmartLearnTeacherExamTimetable.renderExamTable();
    if (typeof SmartLearnStudentExamTimetable !== "undefined") SmartLearnStudentExamTimetable.renderStudentExams();
    if (typeof SmartLearnDashboard !== "undefined") SmartLearnDashboard.renderExams();
    if (typeof SmartLearnParent !== "undefined") SmartLearnParent.renderParentExams();
  },

  renderPendingTeacherApprovals() {
    // Teacher registration approval system removed - all accounts auto-approved on registration
  },

  renderMetrics() {
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const students = users.filter(u => u.role === "Student" || u.role === "student");
    const teachers = users.filter(u => u.role === "Teacher" || u.role === "teacher");

    const statStudentsEl = document.getElementById("admin-stat-total-students");
    if (statStudentsEl) statStudentsEl.innerText = students.length;

    const statTeachersEl = document.getElementById("admin-stat-total-teachers");
    if (statTeachersEl) statTeachersEl.innerText = teachers.length;

    const sectionsSet = new Set();
    students.forEach(s => {
      const cls = s.className || s.class || "B.Tech CSE";
      const sec = s.section || "A";
      sectionsSet.add(`${cls}-${sec}`);
    });
    const statClassesEl = document.getElementById("admin-stat-total-classes");
    if (statClassesEl) statClassesEl.innerText = sectionsSet.size || 0;

    const deptsSet = new Set();
    teachers.forEach(t => {
      if (t.department) deptsSet.add(t.department);
    });
    const statDeptsEl = document.getElementById("admin-stat-total-depts");
    if (statDeptsEl) statDeptsEl.innerText = deptsSet.size || 0;
  },

  renderAcademicDepartmentOverview() {
    const container = document.getElementById("admin-dept-overview-list");
    if (!container) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const teachers = users.filter(u => u.role === "Teacher" || u.role === "teacher");
    const students = users.filter(u => u.role === "Student" || u.role === "student");
    const grades = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];

    const deptsMap = {};
    teachers.forEach(t => {
      const dept = t.department || "Computer Science & Engineering";
      if (!deptsMap[dept]) deptsMap[dept] = { teachers: 0, students: 0, grades: [] };
      deptsMap[dept].teachers++;
    });

    if (Object.keys(deptsMap).length === 0) {
      deptsMap["Computer Science & Engineering"] = { teachers: 0, students: 0, grades: [] };
      deptsMap["Mathematics Department"] = { teachers: 0, students: 0, grades: [] };
      deptsMap["Physical Sciences"] = { teachers: 0, students: 0, grades: [] };
    }

    const totalStudents = students.length;
    const deptsKeys = Object.keys(deptsMap);
    const perDeptStudents = deptsKeys.length > 0 ? Math.ceil(totalStudents / deptsKeys.length) : 0;

    deptsKeys.forEach((deptKey, idx) => {
      deptsMap[deptKey].students = Math.min(totalStudents, (idx + 1) * perDeptStudents);
    });

    grades.forEach(g => {
      if (g.grade) {
        const val = parseFloat(g.grade);
        if (!isNaN(val)) {
          const dept = deptsKeys[0];
          if (deptsMap[dept]) deptsMap[dept].grades.push(val);
        }
      }
    });

    container.innerHTML = deptsKeys.map(deptName => {
      const data = deptsMap[deptName];
      let perfStr = "Active Department";
      if (data.grades.length > 0) {
        const avg = Math.round(data.grades.reduce((a, b) => a + b, 0) / data.grades.length);
        perfStr = `${avg}% Avg Performance`;
      }
      return `
        <div class="assignment-item" style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <div class="font-bold text-sm" style="color: var(--text-main);">${deptName}</div>
            <div class="text-xs text-muted">${data.students} Enrolled Students • ${data.teachers} Faculty Members</div>
          </div>
          <span class="badge badge-primary">${perfStr}</span>
        </div>
      `;
    }).join("");
  },

  renderAuditLogs() {
    const container = document.getElementById("admin-activity-logs-list");
    if (!container) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    const assignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS) || [];

    const logs = [];

    users.slice(-3).reverse().forEach(u => {
      logs.push({
        title: `User Account Registered (${u.role})`,
        desc: `${u.fullName || u.name} (${u.email})`,
        time: u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'
      });
    });

    announcements.slice(-2).reverse().forEach(a => {
      logs.push({
        title: `Broadcast Notice Published`,
        desc: `"${a.title}" posted by ${a.author || 'Administrator'}`,
        time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'
      });
    });

    assignments.slice(-2).reverse().forEach(asgn => {
      logs.push({
        title: `Coursework Assignment Created`,
        desc: `"${asgn.title}" published for ${asgn.className || 'Class'}`,
        time: 'Active'
      });
    });

    if (logs.length === 0) {
      container.innerHTML = `<div class="text-xs text-muted" style="padding: 0.5rem 0;">No system logs recorded yet.</div>`;
      return;
    }

    container.innerHTML = logs.slice(0, 5).map(log => `
      <div style="padding: 0.75rem; background-color: var(--bg-subtle); border-radius: var(--radius-md); border-left: 3px solid var(--primary-color);">
        <div class="font-bold text-sm" style="color: var(--text-main);">${log.title}</div>
        <div class="text-xs text-muted">${log.desc} • ${log.time}</div>
      </div>
    `).join("");
  },

  renderUserBaseSummary() {
    const container = document.getElementById("admin-user-summary-box");
    if (!container) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const studentsCount = users.filter(u => u.role === "Student" || u.role === "student").length;
    const teachersCount = users.filter(u => u.role === "Teacher" || u.role === "teacher").length;
    const parentsCount = users.filter(u => u.role === "Parent" || u.role === "parent").length;
    const adminsCount = users.filter(u => u.role === "Administrator" || u.role === "admin" || u.role === "Administrator").length;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;" class="text-sm font-semibold">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: var(--bg-subtle); border-radius: 8px;">
          <span>🎓 Enrolled Students</span>
          <span class="badge badge-primary">${studentsCount} Accounts</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: var(--bg-subtle); border-radius: 8px;">
          <span>🔬 Academic Faculty</span>
          <span class="badge badge-accent">${teachersCount} Faculty</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: var(--bg-subtle); border-radius: 8px;">
          <span>👨‍👩‍👧 Registered Parents</span>
          <span class="badge badge-warning">${parentsCount} Accounts</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: var(--bg-subtle); border-radius: 8px;">
          <span>🛡️ System Admins</span>
          <span class="badge badge-danger">${adminsCount} Admins</span>
        </div>
      </div>
    `;
  },

  renderClassesAndStreams() {
    const container = document.getElementById("admin-classes-grid");
    const countBadge = document.getElementById("admin-class-count-badge");
    if (!container) return;

    const classes = SmartLearnStorage.getClasses();
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const students = users.filter(u => (u.role || "").toLowerCase() === "student");
    const teachers = users.filter(u => (u.role || "").toLowerCase() === "teacher");

    if (countBadge) countBadge.innerText = `${classes.length} Active Classes`;

    if (classes.length === 0) {
      container.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏫</div>
          <h3 class="font-bold text-lg" style="color: var(--text-main); margin-bottom: 0.35rem;">No Active Classes Created Yet</h3>
          <p class="text-xs text-muted" style="margin-bottom: 1rem;">Click "Create New Class & Stream" above to configure your institution's class sections and nominate coordinators.</p>
          <button class="btn btn-primary btn-sm" onclick="SmartLearnAdmin.openCreateClassModal()">+ Create Class & Stream</button>
        </div>
      `;
      return;
    }

    container.innerHTML = classes.map(c => {
      const classStudents = students.filter(s =>
        (s.className === c.className || s.class === c.className) &&
        (s.section === c.section || (!s.section && c.section === "A"))
      );

      const coordinator = teachers.find(t => t.id === c.coordinatorId || (c.coordinatorName && (t.fullName || t.name) === c.coordinatorName));
      const coordinatorDisplayName = coordinator ? (coordinator.fullName || coordinator.name) : (c.coordinatorName || "Not Nominated");

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
              <span class="badge badge-primary" style="font-weight: 700;">${c.department || 'CSE'} Stream</span>
              <span class="badge badge-outline" style="font-size: 0.75rem;">Sec ${c.section || 'A'} • ${c.year || 'Year 2'}</span>
            </div>

            <h3 class="font-bold text-lg" style="color: var(--text-main); margin-bottom: 0.25rem;">${c.className} - Section ${c.section || 'A'}</h3>
            <div class="text-xs text-muted" style="margin-bottom: 1rem;">${c.stream || c.department || 'Academic Stream'} • ${classStudents.length} Students Enrolled</div>

            <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; border-left: 3px solid var(--primary);">
              <div class="text-xs text-muted">Faculty Class Coordinator:</div>
              <div class="font-bold text-sm" style="color: var(--text-main); margin-top: 0.15rem;">
                👨‍🏫 ${coordinatorDisplayName}
              </div>
            </div>

            <!-- Student Preview Pill Grid -->
            <div class="text-xs text-muted" style="margin-bottom: 0.35rem; font-weight: 600;">Enrolled Class Members (${classStudents.length}):</div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1.25rem;">
              ${classStudents.length === 0 ? '<span class="text-xs text-muted" style="font-style: italic;">No students assigned to this section yet.</span>' : classStudents.slice(0, 5).map(s => `
                <span class="badge badge-secondary" style="font-size: 0.7rem;">👤 ${s.fullName || s.name}</span>
              `).join('')}
              ${classStudents.length > 5 ? `<span class="badge badge-outline" style="font-size: 0.7rem;">+${classStudents.length - 5} more</span>` : ''}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="SmartLearnAdmin.openAssignStudentsModal('${c.id}')">
                👥 Assign Students (${classStudents.length})
              </button>
              <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="SmartLearnAdmin.openNominateCoordinatorModal('${c.id}')">
                👨‍🏫 Coordinator
              </button>
            </div>
            <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger); width: 100%;" onclick="SmartLearnAdmin.deleteClass('${c.id}')">
              🗑️ Delete Class Section
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  // Helper to filter and sort department faculty with clear availability & coordinator status
  getAvailableCoordinators(deptFilter = "", currentClassId = "") {
    const classes = SmartLearnStorage.getClasses();
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    let teachers = users.filter(u => (u.role || "").toLowerCase() === "teacher");

    // Build map of teacherId -> assigned className & section
    const coordinatorMap = {};
    classes.forEach(c => {
      if (c.coordinatorId) {
        coordinatorMap[c.coordinatorId] = `${c.className} Sec ${c.section}`;
      }
      if (c.coordinatorName) {
        const matching = teachers.find(t => (t.fullName || t.name || "").toLowerCase() === c.coordinatorName.toLowerCase());
        if (matching && !coordinatorMap[matching.id]) {
          coordinatorMap[matching.id] = `${c.className} Sec ${c.section}`;
        }
      }
    });

    teachers.forEach(t => {
      if (t.coordinatorClass && !coordinatorMap[t.id]) {
        coordinatorMap[t.id] = `${t.coordinatorClass} Sec ${t.coordinatorSection || 'A'}`;
      }
    });

    // Department filtering
    let deptTeachers = teachers;
    if (deptFilter && deptFilter !== "all" && deptFilter !== "") {
      const dLower = deptFilter.toLowerCase().trim();
      const filtered = teachers.filter(t => {
        const tDept = (t.department || "").toLowerCase().trim();
        if (!tDept) return true;
        
        return tDept.includes(dLower) || dLower.includes(tDept) ||
          (dLower === "cse" && (tDept.includes("computer") || tDept.includes("cse"))) ||
          (dLower === "ece" && (tDept.includes("electronics") || tDept.includes("ece"))) ||
          (dLower === "it" && (tDept.includes("information") || tDept.includes("it"))) ||
          (dLower === "mech" && (tDept.includes("mechanical") || tDept.includes("mech"))) ||
          (dLower === "eee" && (tDept.includes("electrical") || tDept.includes("eee"))) ||
          (dLower === "biotech" && (tDept.includes("biotechnology") || tDept.includes("biotech"))) ||
          (dLower === "math" && (tDept.includes("math") || tDept.includes("mathematics"))) ||
          (dLower === "phy" && (tDept.includes("physics") || tDept.includes("physical")));
      });

      if (filtered.length > 0) {
        deptTeachers = filtered;
      }
    }

    const currentClassObj = classes.find(c => c.id === currentClassId);

    function cCoordinatorMatches(cls, t) {
      if (!cls) return false;
      if (cls.coordinatorId && cls.coordinatorId === t.id) return true;
      if (cls.coordinatorName && (t.fullName || t.name) && cls.coordinatorName.toLowerCase() === (t.fullName || t.name).toLowerCase()) return true;
      return t.coordinatorClass === cls.className && t.coordinatorSection === cls.section;
    }

    // Map each teacher with appointment & availability status
    const result = deptTeachers.map(t => {
      const assignedLabel = coordinatorMap[t.id] || "";
      const isAssigned = !!assignedLabel;
      const isCurrentClass = cCoordinatorMatches(currentClassObj, t);
      
      return {
        teacher: t,
        isAssigned: isAssigned && !isCurrentClass,
        assignedClass: assignedLabel,
        isCurrentClass: isCurrentClass
      };
    });

    result.sort((a, b) => {
      if (a.isCurrentClass) return -1;
      if (b.isCurrentClass) return 1;
      if (!a.isAssigned && b.isAssigned) return -1;
      if (a.isAssigned && !b.isAssigned) return 1;
      return (a.teacher.fullName || a.teacher.name || "").localeCompare(b.teacher.fullName || b.teacher.name || "");
    });

    return result;
  },

  populateCreateClassCoordinatorDropdown() {
    const deptSelect = document.getElementById("modal-class-dept");
    const selectedDept = deptSelect ? deptSelect.value : "CSE";
    const availableItems = this.getAvailableCoordinators(selectedDept, "");

    const select = document.getElementById("modal-class-coordinator");
    if (select) {
      if (availableItems.length === 0) {
        select.innerHTML = `<option value="">⚠️ No faculty members registered in system</option>`;
      } else {
        select.innerHTML = `<option value="">-- Select Teacher as Class Coordinator --</option>` +
          availableItems.map(item => {
            const t = item.teacher;
            let statusTag = "✅ Available";
            if (item.isAssigned) {
              statusTag = `(Coordinator of ${item.assignedClass})`;
            }
            return `<option value="${t.id}">${t.fullName || t.name} (${t.department || 'Faculty'}) - ${statusTag}</option>`;
          }).join("");
      }
    }
  },

  openCreateClassModal() {
    try {
      if (typeof SmartLearnApp !== "undefined" && SmartLearnApp.switchDashboardTab) {
        SmartLearnApp.switchDashboardTab("classes", "Classes, Streams & Class Coordinators");
        const navItem = document.querySelector('.nav-item[href="#classes"]');
        if (navItem) {
          document.querySelectorAll(".nav-item:not(.logout-link)").forEach(i => i.classList.remove("active"));
          navItem.classList.add("active");
        }
      }

      this.populateCreateClassCoordinatorDropdown();

      const deptSelect = document.getElementById("modal-class-dept");
      if (deptSelect) {
        deptSelect.onchange = () => this.populateCreateClassCoordinatorDropdown();
      }

      const nameInput = document.getElementById("modal-class-name");
      if (nameInput) nameInput.value = "";

      if (typeof SmartLearnApp !== "undefined" && SmartLearnApp.openModal) {
        SmartLearnApp.openModal("create-class-modal");
      } else {
        const modal = document.getElementById("create-class-modal");
        if (modal) {
          modal.style.display = "flex";
          modal.style.opacity = "1";
          modal.style.visibility = "visible";
          modal.classList.add("active");
        }
      }
    } catch (err) {
      console.error("Error in openCreateClassModal:", err);
      const modal = document.getElementById("create-class-modal");
      if (modal) {
        modal.style.display = "flex";
        modal.style.opacity = "1";
        modal.style.visibility = "visible";
        modal.classList.add("active");
      }
    }
  },

  createClassFromModal(e) {
    if (e) e.preventDefault();

    const className = document.getElementById("modal-class-name")?.value.trim();
    const dept = document.getElementById("modal-class-dept")?.value || "CSE";
    const section = document.getElementById("modal-class-section")?.value || "A";
    const year = document.getElementById("modal-class-year")?.value.trim() || "Year 2";
    const coordinatorId = document.getElementById("modal-class-coordinator")?.value || "";

    if (!className) {
      SmartLearnApp.showToast("Please enter a class name!", "warning");
      return;
    }

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const coordinatorTeacher = users.find(u => u.id === coordinatorId);

    const deptMap = {
      "CSE": "Computer Science & Engineering",
      "ECE": "Electronics & Communication",
      "IT": "Information Technology",
      "MECH": "Mechanical Engineering",
      "EEE": "Electrical Engineering",
      "BIOTECH": "Biotechnology",
      "MATH": "Mathematics",
      "PHY": "Physical Sciences"
    };

    const classes = SmartLearnStorage.getClasses();
    const existingIndex = classes.findIndex(c => (c.className || "").toLowerCase() === className.toLowerCase() && (c.section || "").toUpperCase() === section.toUpperCase());

    const classRecord = {
      id: existingIndex >= 0 ? classes[existingIndex].id : ("cls_" + Date.now()),
      className: className,
      department: dept,
      stream: deptMap[dept] || (dept + " Stream"),
      section: section,
      year: year,
      coordinatorId: coordinatorId,
      coordinatorName: coordinatorTeacher ? (coordinatorTeacher.fullName || coordinatorTeacher.name) : "",
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      classes[existingIndex] = classRecord;
    } else {
      classes.unshift(classRecord);
    }
    SmartLearnStorage.saveClasses(classes);

    if (coordinatorTeacher) {
      coordinatorTeacher.coordinatorClass = className;
      coordinatorTeacher.coordinatorSection = section;
      coordinatorTeacher.coordinatorDepartment = dept;
      SmartLearnStorage.set(STORAGE_KEYS.USERS, users);
      localStorage.setItem("classoraUsers", JSON.stringify(users));
      localStorage.setItem("smartlearn_users", JSON.stringify(users));
    }

    SmartLearnApp.showToast(`Class '${className} - Section ${section}' created successfully! 🎉`, "success");
    SmartLearnApp.closeModal("create-class-modal");

    if (document.getElementById("modal-class-name")) document.getElementById("modal-class-name").value = "";

    this.renderClassesAndStreams();
    this.renderSectionWiseStudents();
    this.renderMetrics();
  },

  openAssignStudentsModal(classId = "") {
    const classes = SmartLearnStorage.getClasses();
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const students = users.filter(u => (u.role || "").toLowerCase() === "student");

    const targetSelect = document.getElementById("modal-assign-target-class");
    if (targetSelect) {
      targetSelect.innerHTML = `<option value="">-- Select Class Section --</option>` +
        classes.map(c => `<option value="${c.id}" ${c.id === classId ? 'selected' : ''}>${c.className} - Section ${c.section} (${c.department})</option>`).join("");
    }

    const currentSelectedClassId = classId || (targetSelect ? targetSelect.value : "");
    const selectedClassObj = classes.find(c => c.id === currentSelectedClassId) || classes[0];

    const listContainer = document.getElementById("modal-assign-students-list");
    if (listContainer) {
      if (students.length === 0) {
        listContainer.innerHTML = `<div class="text-xs text-muted" style="padding: 0.5rem; text-align: center;">No student accounts registered in system.</div>`;
      } else {
        listContainer.innerHTML = students.map(st => {
          const isCurrentlyInClass = selectedClassObj &&
            (st.className === selectedClassObj.className || st.class === selectedClassObj.className) &&
            (st.section === selectedClassObj.section || (!st.section && selectedClassObj.section === "A"));

          return `
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--border-color); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" class="modal-assign-student-checkbox" value="${st.id}" ${isCurrentlyInClass ? 'checked' : ''}>
                <div>
                  <div class="font-bold text-xs" style="color: var(--text-main);">${st.fullName || st.name}</div>
                  <div class="text-xs text-muted">ID: ${st.studentId || st.id} • Current: ${st.className || 'Unassigned'}-${st.section || 'A'}</div>
                </div>
              </div>
              <span class="badge ${isCurrentlyInClass ? 'badge-success' : 'badge-outline'}" style="font-size:0.65rem;">
                ${isCurrentlyInClass ? 'Enrolled' : 'Available'}
              </span>
            </label>
          `;
        }).join("");
      }
    }

    if (targetSelect) {
      targetSelect.onchange = () => {
        const val = targetSelect.value;
        this.openAssignStudentsModal(val);
      };
    }

    SmartLearnApp.openModal("assign-students-modal");
  },

  assignStudentsFromModal(e) {
    if (e) e.preventDefault();

    const targetClassId = document.getElementById("modal-assign-target-class")?.value;
    const classes = SmartLearnStorage.getClasses();
    const targetClassObj = classes.find(c => c.id === targetClassId);

    if (!targetClassObj) {
      SmartLearnApp.showToast("Please select a target class section!", "warning");
      return;
    }

    const checkboxes = document.querySelectorAll(".modal-assign-student-checkbox:checked");
    const selectedStudentIds = Array.from(checkboxes).map(cb => cb.value);

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    let updatedCount = 0;

    users.forEach(u => {
      if ((u.role || "").toLowerCase() === "student" && selectedStudentIds.includes(u.id)) {
        u.className = targetClassObj.className;
        u.class = targetClassObj.className;
        u.department = targetClassObj.department;
        u.section = targetClassObj.section;
        updatedCount++;

        SmartLearnStorage.addNotification({
          userId: u.id,
          title: "Class Assignment Updated 🏫",
          message: `You have been enrolled in ${targetClassObj.className} - Section ${targetClassObj.section} (${targetClassObj.department} Department). Your dashboard schedule and courseware have been synced!`
        });
      }
    });

    SmartLearnStorage.set(STORAGE_KEYS.USERS, users);
    localStorage.setItem("classoraUsers", JSON.stringify(users));
    localStorage.setItem("smartlearn_users", JSON.stringify(users));

    SmartLearnApp.showToast(`Assigned ${updatedCount} student(s) to ${targetClassObj.className} - Section ${targetClassObj.section}! 🎉`, "success");
    SmartLearnApp.closeModal("assign-students-modal");
    this.renderClassesAndStreams();
    this.renderSectionWiseStudents();
    this.renderMetrics();
  },

  openNominateCoordinatorModal(classId) {
    const classes = SmartLearnStorage.getClasses();
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    document.getElementById("modal-nominate-class-id").value = targetClass.id;
    document.getElementById("modal-nominate-class-display").value = `${targetClass.className} - Section ${targetClass.section} (${targetClass.department || 'Stream'})`;

    const availableTeachers = this.getAvailableCoordinators(targetClass.department, targetClass.id);
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];

    let currentTeacher = null;
    if (targetClass.coordinatorId) {
      currentTeacher = users.find(u => u.id === targetClass.coordinatorId);
    }
    if (!currentTeacher && targetClass.coordinatorName) {
      currentTeacher = users.find(u => (u.fullName || u.name || "").toLowerCase() === targetClass.coordinatorName.toLowerCase());
    }

    if (currentTeacher && !availableTeachers.some(t => t.id === currentTeacher.id)) {
      availableTeachers.unshift(currentTeacher);
    }

    const select = document.getElementById("modal-nominate-teacher-select");
    if (select) {
      if (availableTeachers.length === 0) {
        select.innerHTML = `<option value="">⚠️ No unappointed faculty available for ${targetClass.department || 'this'} department</option>`;
      } else {
        select.innerHTML = `<option value="">-- Select Available Teacher as Class Coordinator --</option>` +
          availableTeachers.map(t => {
            const isCurrent = currentTeacher && t.id === currentTeacher.id;
            return `<option value="${t.id}" ${isCurrent ? 'selected' : ''}>${t.fullName || t.name} (${t.department || 'Faculty'}) ${isCurrent ? '🌟 (Current Class Coordinator)' : '✅ Available'}</option>`;
          }).join("");
      }
    }

    SmartLearnApp.openModal("nominate-coordinator-modal");
  },

  nominateCoordinatorFromModal(e) {
    if (e) e.preventDefault();

    const classId = document.getElementById("modal-nominate-class-id")?.value;
    const teacherId = document.getElementById("modal-nominate-teacher-select")?.value;

    const classes = SmartLearnStorage.getClasses();
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];

    // Clear coordinator assignment from previous coordinator if changing
    const oldCoordinatorId = targetClass.coordinatorId;
    if (oldCoordinatorId && oldCoordinatorId !== teacherId) {
      const oldTeacher = users.find(u => u.id === oldCoordinatorId);
      if (oldTeacher) {
        delete oldTeacher.coordinatorClass;
        delete oldTeacher.coordinatorSection;
        delete oldTeacher.coordinatorDepartment;
      }
    }

    const teacher = users.find(u => u.id === teacherId);

    targetClass.coordinatorId = teacherId || "";
    targetClass.coordinatorName = teacher ? (teacher.fullName || teacher.name) : "";
    SmartLearnStorage.saveClasses(classes);

    if (teacher) {
      teacher.coordinatorClass = targetClass.className;
      teacher.coordinatorSection = targetClass.section;
      teacher.coordinatorDepartment = targetClass.department;

      SmartLearnStorage.addNotification({
        userId: teacher.id,
        title: "Nominated as Class Coordinator 🌟",
        message: `You have been nominated by Administrator as the Class Coordinator for ${targetClass.className} - Section ${targetClass.section}. Access your Class Coordinator Portal on your dashboard!`
      });
    }

    SmartLearnStorage.set(STORAGE_KEYS.USERS, users);
    localStorage.setItem("classoraUsers", JSON.stringify(users));
    localStorage.setItem("smartlearn_users", JSON.stringify(users));

    SmartLearnApp.showToast(`Faculty ${teacher ? (teacher.fullName || teacher.name) : 'Coordinator'} nominated for ${targetClass.className}-${targetClass.section}! 🎉`, "success");
    SmartLearnApp.closeModal("nominate-coordinator-modal");
    this.renderClassesAndStreams();
  },

  deleteClass(classId) {
    if (!confirm("Are you sure you want to delete this class section? Students currently in this section will remain in the database.")) return;

    let classes = SmartLearnStorage.getClasses();
    classes = classes.filter(c => c.id !== classId);
    SmartLearnStorage.saveClasses(classes);

    SmartLearnApp.showToast("Class section removed.", "info");
    this.renderClassesAndStreams();
    this.renderMetrics();
  },

  renderTimetableMaster() {
    this.renderAdminTimetableMasterEditor();
  },

  renderAdminTimetableMasterEditor() {
    const classEl = document.getElementById("admin-tt-class-select");
    const sectionEl = document.getElementById("admin-tt-section-select");
    const dayEl = document.getElementById("admin-tt-day-select");

    const className = classEl ? classEl.value : "B.Tech CSE";
    const section = sectionEl ? sectionEl.value : "A";
    const day = dayEl ? dayEl.value : "Monday";

    const tbody = document.getElementById("admin-timetable-editor-body");
    if (!tbody) return;

    const defaultPeriodTimes = [
      { period: 1, startTime: "08:30", endTime: "09:15", defaultSubject: "Data Structures", defaultTeacher: "Prof. Marcus Vance", defaultRoom: "CS Lab 1" },
      { period: 2, startTime: "09:15", endTime: "10:00", defaultSubject: "Mathematics", defaultTeacher: "Prof. Rajesh Gupta", defaultRoom: "Hall 102" },
      { period: 3, startTime: "10:15", endTime: "11:00", defaultSubject: "Computer Science", defaultTeacher: "Dr. Priya Sharma", defaultRoom: "Lab 2" },
      { period: 4, startTime: "11:00", endTime: "11:45", defaultSubject: "Physics & Mechanics", defaultTeacher: "Dr. Anita Verma", defaultRoom: "Physics Lab" },
      { period: 5, startTime: "12:30", endTime: "01:15", defaultSubject: "English Communication", defaultTeacher: "Prof. Sarah Jenkins", defaultRoom: "Room 304" },
      { period: 6, startTime: "01:15", endTime: "02:00", defaultSubject: "Digital Electronics", defaultTeacher: "Prof. David Miller", defaultRoom: "ECE Lab" },
      { period: 7, startTime: "02:15", endTime: "03:00", defaultSubject: "Object Oriented Programming", defaultTeacher: "Dr. Priya Sharma", defaultRoom: "CS Lab 3" },
      { period: 8, startTime: "03:00", endTime: "03:45", defaultSubject: "Self Study & Mentoring", defaultTeacher: "Academic Faculty", defaultRoom: "Library" }
    ];

    const allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];

    let rowsHtml = "";
    defaultPeriodTimes.forEach(p => {
      let slot = allTt.find(t =>
        (t.className === className || t.class === className) &&
        (t.section === section || (!t.section && section === "A")) &&
        (t.day && t.day.toLowerCase() === day.toLowerCase()) &&
        (t.period === p.period || String(t.period) === String(p.period))
      );

      const startTimeVal = slot ? (slot.startTime || p.startTime) : p.startTime;
      const endTimeVal = slot ? (slot.endTime || p.endTime) : p.endTime;
      const subjectVal = slot ? (slot.subject || "") : p.defaultSubject;
      const teacherVal = slot ? (slot.teacher || slot.instructor || "") : p.defaultTeacher;
      const roomVal = slot ? (slot.room || slot.roomNo || "") : p.defaultRoom;
      const statusVal = slot ? (slot.status || "approved") : "approved";

      rowsHtml += `
        <tr data-period="${p.period}" style="border-bottom: 1px solid var(--border-color);">
          <td style="text-align: center; font-weight: 700; vertical-align: middle;">
            Period ${p.period}
            <div style="margin-top:0.25rem;"><span class="badge ${statusVal === 'pending_approval' ? 'badge-warning' : 'badge-success'}" style="font-size:0.65rem;">${statusVal === 'pending_approval' ? 'Pending' : 'Published'}</span></div>
          </td>
          <td style="vertical-align: middle;">
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <input type="time" class="form-control form-control-sm tt-start-time" value="${startTimeVal}" style="font-size: 0.8rem; padding: 0.2rem 0.4rem;">
              <span>-</span>
              <input type="time" class="form-control form-control-sm tt-end-time" value="${endTimeVal}" style="font-size: 0.8rem; padding: 0.2rem 0.4rem;">
            </div>
          </td>
          <td style="vertical-align: middle;">
            <input type="text" class="form-control form-control-sm tt-subject-input" value="${(subjectVal).replace(/"/g, '&quot;')}" placeholder="e.g. Data Structures" style="font-size: 0.85rem; font-weight: 600;">
          </td>
          <td style="vertical-align: middle;">
            <input type="text" class="form-control form-control-sm tt-teacher-input" value="${(teacherVal).replace(/"/g, '&quot;')}" placeholder="e.g. Faculty Teacher" style="font-size: 0.85rem;">
          </td>
          <td style="vertical-align: middle;">
            <input type="text" class="form-control form-control-sm tt-room-input" value="${(roomVal).replace(/"/g, '&quot;')}" placeholder="e.g. Lab 1 / Hall 204" style="font-size: 0.85rem;">
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
    this.renderAdminTimetable5DayPreview(className, section);
  },

  renderAdminTimetable5DayPreview(className, section) {
    const previewContainer = document.getElementById("admin-timetable-5day-preview");
    if (!previewContainer) return;

    const allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    let matrixHtml = `
      <table class="table" style="width: 100%; font-size: 0.8rem; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border-color); background: var(--bg-subtle);">
            <th style="padding: 0.6rem; width: 80px; text-align: center;">Period</th>
            ${days.map(d => `<th style="padding: 0.6rem; width: 18%;">${d}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
    `;

    periods.forEach(p => {
      matrixHtml += `<tr style="border-bottom: 1px solid var(--border-color);">`;
      matrixHtml += `<td style="padding: 0.6rem; text-align: center; font-weight: 700; background: var(--bg-subtle);">Period ${p}</td>`;
      days.forEach(day => {
        const slot = allTt.find(t =>
          (t.className === className || t.class === className) &&
          (t.section === section || (!t.section && section === "A")) &&
          (t.day && t.day.toLowerCase() === day.toLowerCase()) &&
          (t.period === p || String(t.period) === String(p))
        );

        const subj = slot ? slot.subject : "Self Study";
        const teacher = slot ? (slot.teacher || slot.instructor || "Faculty") : "Faculty";
        const room = slot ? (slot.room || slot.roomNo || "Room") : "Room";
        const status = slot ? (slot.status || "approved") : "approved";

        matrixHtml += `
          <td style="padding: 0.5rem 0.6rem; vertical-align: top; background: ${status === 'pending_approval' ? 'rgba(245, 158, 11, 0.08)' : 'transparent'};">
            <div style="font-weight: 700; color: var(--primary-color);">${subj}</div>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${teacher}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">📍 ${room}</div>
          </td>
        `;
      });
      matrixHtml += `</tr>`;
    });

    matrixHtml += `
        </tbody>
      </table>
    `;

    previewContainer.innerHTML = matrixHtml;
  },

  saveAdminTimetableMaster() {
    const classEl = document.getElementById("admin-tt-class-select");
    const sectionEl = document.getElementById("admin-tt-section-select");
    const dayEl = document.getElementById("admin-tt-day-select");

    const className = classEl ? classEl.value : "B.Tech CSE";
    const section = sectionEl ? sectionEl.value : "A";
    const day = dayEl ? dayEl.value : "Monday";

    const tbody = document.getElementById("admin-timetable-editor-body");
    if (!tbody) return;

    const rows = tbody.querySelectorAll("tr[data-period]");
    const updatedPeriodSlots = [];

    rows.forEach(row => {
      const period = parseInt(row.getAttribute("data-period"));
      const startTime = row.querySelector(".tt-start-time").value || "09:00";
      const endTime = row.querySelector(".tt-end-time").value || "09:50";
      const subject = row.querySelector(".tt-subject-input").value.trim();
      const teacher = row.querySelector(".tt-teacher-input").value.trim();
      const room = row.querySelector(".tt-room-input").value.trim();

      if (subject) {
        updatedPeriodSlots.push({
          id: `tt_${className}_${section}_${day}_p${period}`,
          className,
          class: className,
          section,
          day,
          period,
          startTime,
          endTime,
          subject,
          teacher: teacher || "Faculty Instructor",
          room: room || "Main Classroom",
          status: "approved",
          updatedBy: "Administrator",
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Replace existing timetable slots for this class, section, and day in storage
    let allTt = SmartLearnStorage.get(STORAGE_KEYS.TIMETABLE) || [];
    allTt = allTt.filter(t => !(
      (t.className === className || t.class === className) &&
      (t.section === section || (!t.section && section === "A")) &&
      (t.day && t.day.toLowerCase() === day.toLowerCase())
    ));

    allTt.push(...updatedPeriodSlots);
    SmartLearnStorage.set(STORAGE_KEYS.TIMETABLE, allTt);

    // Broadcast system notification
    if (typeof sendNotificationToSection !== "undefined") {
      sendNotificationToSection(className, section, "Timetable Updated by Administrator 📅", `The official class timetable for ${className}-${section} (${day}) has been updated by Administration and is now active.`);
    }

    SmartLearnApp.showToast(`Timetable for ${className}-${section} (${day}) saved & published system-wide! 🎉`, "success");

    // Real-time re-renders across active portals
    if (typeof SmartLearnStudentTimetable !== "undefined") {
      SmartLearnStudentTimetable.renderClassroomTimetable();
    }
    const currentUser = SmartLearnAuth.getCurrentUser();
    if (currentUser && currentUser.role === "Student") {
      SmartLearnDashboard.renderTodaySchedule(currentUser);
    }
    if (typeof SmartLearnParent !== "undefined") {
      SmartLearnParent.renderParentSchedule();
    }
    if (typeof SmartLearnTeacherTimetable !== "undefined") {
      SmartLearnTeacherTimetable.renderExamTable();
    }

    this.renderAdminTimetableMasterEditor();
  },

  renderAnnouncements() {
    const container = document.getElementById("admin-announcements-container");
    if (!container) return;

    const announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];

    if (announcements.length === 0) {
      container.innerHTML = `<div class="empty-state-text" style="padding: 1.5rem;">No global announcements published yet. Click "Broadcast Notice" above to post an announcement.</div>`;
      return;
    }

    container.innerHTML = announcements.slice().reverse().map(ann => `
      <div style="padding: 1.25rem; background: var(--bg-subtle); border-radius: var(--radius-md); border-left: 4px solid var(--primary-color); margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div class="font-bold text-base" style="color: var(--text-main);">${ann.title}</div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge ${typeof SmartLearnAnnouncements !== 'undefined' ? SmartLearnAnnouncements.getBadgeClass(ann.target) : 'badge-info'}">${ann.target || 'All Users'}</span>
            <button class="btn btn-danger btn-sm" onclick="SmartLearnAdmin.deleteNotice('${ann.id}')" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">🗑️ Delete</button>
          </div>
        </div>
        <div class="text-xs text-muted" style="margin-top: 0.25rem;">Posted by ${ann.author || 'Administrator'} • ${ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : (ann.date || 'Today')}</div>
        <p class="text-sm" style="margin-top: 0.5rem; color: var(--text-main); line-height: 1.5;">${ann.content || ann.message}</p>
      </div>
    `).join("");
  },

  deleteNotice(noticeId) {
    if (!confirm("Are you sure you want to delete this broadcast announcement?")) return;

    let announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    announcements = announcements.filter(a => a.id !== noticeId);
    SmartLearnStorage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    if (typeof SmartLearnApp !== "undefined") SmartLearnApp.showToast("Notice deleted successfully.", "info");

    this.renderAnnouncements();
    if (typeof SmartLearnAnnouncements !== "undefined") {
      SmartLearnAnnouncements.renderStudentAnnouncements();
      SmartLearnAnnouncements.renderTeacherAnnouncements();
      SmartLearnAnnouncements.renderParentAnnouncements();
    }
  },

  renderAcademicAnalytics() {
    const container = document.getElementById("admin-analytics-container");
    if (!container) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const assignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS) || [];
    const submissions = SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS) || [];

    const students = users.filter(u => u.role === "Student" || u.role === "student");
    const teachers = users.filter(u => u.role === "Teacher" || u.role === "teacher");

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
        <div style="padding: 1.25rem; background: var(--bg-subtle); border-radius: 10px; border: 1px solid var(--border-color);">
          <div class="text-xs text-muted font-bold text-uppercase">Total Enrolled Students</div>
          <div class="font-bold text-2xl text-primary" style="margin-top: 0.3rem;">${students.length}</div>
          <div class="text-xs text-muted" style="margin-top: 0.2rem;">Live registered student profiles</div>
        </div>

        <div style="padding: 1.25rem; background: var(--bg-subtle); border-radius: 10px; border: 1px solid var(--border-color);">
          <div class="text-xs text-muted font-bold text-uppercase">Active Faculty Members</div>
          <div class="font-bold text-2xl text-accent" style="margin-top: 0.3rem;">${teachers.length}</div>
          <div class="text-xs text-muted" style="margin-top: 0.2rem;">Across all academic departments</div>
        </div>

        <div style="padding: 1.25rem; background: var(--bg-subtle); border-radius: 10px; border: 1px solid var(--border-color);">
          <div class="text-xs text-muted font-bold text-uppercase">Coursework & Assignments</div>
          <div class="font-bold text-2xl text-warning" style="margin-top: 0.3rem;">${assignments.length}</div>
          <div class="text-xs text-muted" style="margin-top: 0.2rem;">Published teacher coursework</div>
        </div>

        <div style="padding: 1.25rem; background: var(--bg-subtle); border-radius: 10px; border: 1px solid var(--border-color);">
          <div class="text-xs text-muted font-bold text-uppercase">Student Submissions</div>
          <div class="font-bold text-2xl text-success" style="margin-top: 0.3rem;">${submissions.length}</div>
          <div class="text-xs text-muted" style="margin-top: 0.2rem;">Submissions turned in</div>
        </div>
      </div>
    `;
  },

  addUserFromModal(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll("input, select");

    let fullName = "", email = "", password = "", role = "Student";

    inputs.forEach(input => {
      const type = input.type;
      const tag = input.tagName.toLowerCase();
      const val = input.value.trim();

      if (tag === "select") {
        role = val;
      } else if (type === "text" && !fullName) {
        fullName = val;
      } else if (type === "email") {
        email = val;
      } else if (type === "password") {
        password = val;
      }
    });

    if (!fullName || !email || !password) {
      if (typeof SmartLearnApp !== "undefined") SmartLearnApp.showToast("Please fill in all user details.", "warning");
      return;
    }

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      if (typeof SmartLearnApp !== "undefined") SmartLearnApp.showToast("An account with this email already exists.", "error");
      return;
    }

    const newUser = {
      id: "usr_" + Date.now(),
      fullName: fullName,
      name: fullName,
      email: email,
      password: password,
      role: role,
      className: role === "Student" ? "B.Tech CSE" : undefined,
      section: role === "Student" ? "A" : undefined,
      department: role === "Teacher" ? "Computer Science & Engineering" : undefined,
      studentId: role === "Student" ? "SL-2026-" + Math.floor(100 + Math.random() * 900) : undefined,
      employeeId: role === "Teacher" ? "TCH-2026-" + Math.floor(100 + Math.random() * 900) : undefined,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    SmartLearnStorage.set(STORAGE_KEYS.USERS, users);

    if (typeof SmartLearnApp !== "undefined") {
      SmartLearnApp.showToast(`New ${role} account created successfully!`, "success");
      SmartLearnApp.closeModal("add-user-modal");
    }
    form.reset();
    this.init();
  },

  addNoticeFromModal(event) {
    event.preventDefault();
    const form = event.target;
    
    const titleInput = document.getElementById("admin-notice-title-input") || form.querySelector("input[type='text']") || form.querySelector("input");
    const targetSelect = document.getElementById("admin-notice-target-select") || form.querySelector("select");
    const contentTextarea = document.getElementById("admin-notice-content-textarea") || form.querySelector("textarea");

    const title = titleInput ? titleInput.value.trim() : "";
    const target = targetSelect ? targetSelect.value : "All Users";
    const content = contentTextarea ? contentTextarea.value.trim() : "";

    if (!title || !content) {
      if (typeof SmartLearnApp !== "undefined") SmartLearnApp.showToast("Please enter title and notice content.", "warning");
      return;
    }

    const announcements = SmartLearnStorage.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    const currentUser = SmartLearnAuth.getCurrentUser() || { name: "System Administrator" };

    const newNotice = {
      id: "ann_" + Date.now(),
      title: title,
      target: target,
      content: content,
      message: content,
      author: currentUser.name || "System Administrator",
      createdAt: new Date().toISOString()
    };

    announcements.push(newNotice);
    SmartLearnStorage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    if (typeof SmartLearnApp !== "undefined") {
      SmartLearnApp.showToast(`Notice broadcasted to "${target}" successfully! 🎉`, "success");
      SmartLearnApp.closeModal("admin-notice-modal");
    }
    form.reset();
    this.renderAnnouncements();
    if (typeof SmartLearnAnnouncements !== "undefined") {
      SmartLearnAnnouncements.renderStudentAnnouncements();
      SmartLearnAnnouncements.renderTeacherAnnouncements();
      SmartLearnAnnouncements.renderParentAnnouncements();
    }
  },

  renderSectionWiseStudents(searchTerm = "", sectionFilter = "all") {
    const container = document.getElementById("admin-students-section-container");
    if (!container) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    let students = users.filter(u => u.role === "Student" || u.role === "student");

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      students = students.filter(s =>
        (s.fullName || s.name || "").toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term) ||
        (s.studentId || "").toLowerCase().includes(term) ||
        (s.className || s.class || "").toLowerCase().includes(term) ||
        (s.section || "").toLowerCase().includes(term)
      );
    }

    if (sectionFilter !== "all") {
      students = students.filter(s => {
        const secKey = `${s.className || s.class || 'B.Tech CSE'}-${s.section || 'A'}`;
        return secKey === sectionFilter || (s.section || 'A') === sectionFilter;
      });
    }

    if (students.length === 0) {
      container.innerHTML = `<div class="card" style="padding:2rem; text-align:center;"><div class="empty-state-text">No student accounts found matching filter criteria.</div></div>`;
      return;
    }

    const grouped = {};
    students.forEach(s => {
      const cls = s.className || s.class || "B.Tech CSE";
      const sec = s.section || "A";
      const key = `${cls} - Section ${sec}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    container.innerHTML = Object.keys(grouped).map(secKey => {
      const secStudents = grouped[secKey];
      return `
        <div class="card" style="margin-bottom: 1.75rem;">
          <div class="section-card-title" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.85rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🎓</span>
              <div>
                <div class="font-bold text-base" style="color: var(--text-main);">${secKey}</div>
                <div class="text-xs text-muted">Class & Section Roster & Login Details</div>
              </div>
            </div>
            <span class="badge badge-primary">${secStudents.length} Student${secStudents.length > 1 ? 's' : ''} Enrolled</span>
          </div>

          <div style="overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 0.75rem 1rem;">Student Info</th>
                  <th style="padding: 0.75rem 1rem;">Login Email</th>
                  <th style="padding: 0.75rem 1rem;">Login Password</th>
                  <th style="padding: 0.75rem 1rem;">Class & Section</th>
                  <th style="padding: 0.75rem 1rem;">Phone / Contact</th>
                  <th style="padding: 0.75rem 1rem;">Account Status</th>
                  <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${secStudents.map(st => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" alt="Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                        <div>
                          <div class="font-bold text-sm" style="color: var(--text-main);">${st.fullName || st.name}</div>
                          <div class="text-xs text-muted">ID: <strong class="text-primary">${st.studentId || 'SL-2026-894'}</strong></div>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="font-semibold" style="color: var(--text-main);">${st.email}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <input type="password" readonly value="${st.password || 'student123'}" class="form-control form-control-sm admin-pwd-input" id="pwd-st-${st.id}" style="max-width: 120px; font-family: monospace; font-size: 0.8rem; padding: 0.2rem 0.4rem; min-height: 28px;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="SmartLearnAdmin.togglePasswordVisibility('pwd-st-${st.id}')" title="Toggle password view" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">👁️</button>
                      </div>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="badge badge-info">${st.className || st.class || 'B.Tech CSE'} - ${st.section || 'A'}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem;" class="text-muted text-xs">
                      ${st.phone || 'Not provided'}
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="badge badge-success">Active</span>
                    </td>
                    <td style="padding: 0.75rem 1rem; text-align: right;">
                      <button class="btn btn-outline btn-sm" onclick="SmartLearnAdmin.deleteUser('${st.id}')" style="color: var(--danger); border-color: var(--danger-light);">Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join("");
  },

  renderDepartmentWiseTeachers(searchTerm = "", deptFilter = "all") {
    const container = document.getElementById("admin-teachers-department-container");
    if (!container) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    let teachers = users.filter(u => u.role === "Teacher" || u.role === "teacher");

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      teachers = teachers.filter(t =>
        (t.fullName || t.name || "").toLowerCase().includes(term) ||
        (t.email || "").toLowerCase().includes(term) ||
        (t.employeeId || "").toLowerCase().includes(term) ||
        (t.department || "").toLowerCase().includes(term) ||
        (t.subject || "").toLowerCase().includes(term)
      );
    }

    if (deptFilter !== "all") {
      teachers = teachers.filter(t => (t.department || "") === deptFilter);
    }

    if (teachers.length === 0) {
      container.innerHTML = `<div class="card" style="padding:2rem; text-align:center;"><div class="empty-state-text">No faculty accounts found matching filter criteria.</div></div>`;
      return;
    }

    const grouped = {};
    teachers.forEach(t => {
      const dept = t.department || "Computer Science & Engineering";
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(t);
    });

    container.innerHTML = Object.keys(grouped).map(deptKey => {
      const deptTeachers = grouped[deptKey];
      return `
        <div class="card" style="margin-bottom: 1.75rem;">
          <div class="section-card-title" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.85rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🔬</span>
              <div>
                <div class="font-bold text-base" style="color: var(--text-main);">${deptKey}</div>
                <div class="text-xs text-muted">Department Faculty Directory & Credentials</div>
              </div>
            </div>
            <span class="badge badge-accent">${deptTeachers.length} Faculty Member${deptTeachers.length > 1 ? 's' : ''}</span>
          </div>

          <div style="overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 0.75rem 1rem;">Faculty Member</th>
                  <th style="padding: 0.75rem 1rem;">Login Email</th>
                  <th style="padding: 0.75rem 1rem;">Login Password</th>
                  <th style="padding: 0.75rem 1rem;">Department</th>
                  <th style="padding: 0.75rem 1rem;">Handled Classes</th>
                  <th style="padding: 0.75rem 1rem;">Contact Phone</th>
                  <th style="padding: 0.75rem 1rem;">Status</th>
                  <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${deptTeachers.map(t => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${t.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}" alt="Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                        <div>
                          <div class="font-bold text-sm" style="color: var(--text-main);">${t.fullName || t.name}</div>
                          <div class="text-xs text-muted">Emp ID: <strong class="text-primary">${t.employeeId || 'TCH-2026-042'}</strong></div>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="font-semibold" style="color: var(--text-main);">${t.email}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <input type="password" readonly value="${t.password || 'teacher123'}" class="form-control form-control-sm admin-pwd-input" id="pwd-tch-${t.id}" style="max-width: 120px; font-family: monospace; font-size: 0.8rem; padding: 0.2rem 0.4rem; min-height: 28px;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="SmartLearnAdmin.togglePasswordVisibility('pwd-tch-${t.id}')" title="Toggle password view" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">👁️</button>
                      </div>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="badge badge-primary">${t.department || 'CSE'}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem;" class="text-xs">
                      <span class="badge badge-outline">${t.handledClasses || (t.department ? `B.Tech ${t.department} - Sec A, B` : 'B.Tech CSE - Sec A, B')}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem;" class="text-muted text-xs">
                      ${t.phone || 'Not provided'}
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="badge badge-success">Active</span>
                    </td>
                    <td style="padding: 0.75rem 1rem; text-align: right;">
                      <button class="btn btn-outline btn-sm" onclick="SmartLearnAdmin.deleteUser('${t.id}')" style="color: var(--danger); border-color: var(--danger-light);">Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join("");
  },

  renderUserCredentialsMaster() {
    const container = document.getElementById("admin-users-master-container");
    if (!container) return;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const students = users.filter(u => u.role === "Student" || u.role === "student");
    const teachers = users.filter(u => u.role === "Teacher" || u.role === "teacher");
    const others = users.filter(u => u.role !== "Student" && u.role !== "student" && u.role !== "Teacher" && u.role !== "teacher");

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <!-- 1. Students Login Details (Section Wise) -->
        <div class="card">
          <div class="section-card-title" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span>🎓 All Student Accounts & Credentials (Section-Wise)</span>
            <span class="badge badge-primary">${students.length} Student Accounts</span>
          </div>
          <div id="master-students-content">
            ${this.buildSectionWiseStudentsHtml(students)}
          </div>
        </div>

        <!-- 2. Teachers Login Details (Department Wise) -->
        <div class="card">
          <div class="section-card-title" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span>🔬 All Teacher Accounts & Credentials (Department-Wise)</span>
            <span class="badge badge-accent">${teachers.length} Faculty Accounts</span>
          </div>
          <div id="master-teachers-content">
            ${this.buildDepartmentWiseTeachersHtml(teachers)}
          </div>
        </div>

        <!-- 3. Admins & Parents Login Details -->
        <div class="card">
          <div class="section-card-title" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span>🛡️ Administrator & Parent Credentials Master</span>
            <span class="badge badge-info">${others.length} System Accounts</span>
          </div>
          <div style="overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 0.75rem 1rem;">User Info</th>
                  <th style="padding: 0.75rem 1rem;">Role</th>
                  <th style="padding: 0.75rem 1rem;">Login Email</th>
                  <th style="padding: 0.75rem 1rem;">Login Password</th>
                  <th style="padding: 0.75rem 1rem;">Linked Info / Dept</th>
                  <th style="padding: 0.75rem 1rem;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${others.map(u => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}" alt="Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                        <div>
                          <div class="font-bold text-sm" style="color: var(--text-main);">${u.fullName || u.name}</div>
                          <div class="text-xs text-muted">${u.phone || 'System User'}</div>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="badge ${u.role === 'Administrator' ? 'badge-danger' : 'badge-warning'}">${u.role}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="font-semibold">${u.email}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <input type="password" readonly value="${u.password || 'password123'}" class="form-control form-control-sm admin-pwd-input" id="pwd-other-${u.id}" style="max-width: 120px; font-family: monospace; font-size: 0.8rem; padding: 0.2rem 0.4rem; min-height: 28px;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="SmartLearnAdmin.togglePasswordVisibility('pwd-other-${u.id}')" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">👁️</button>
                      </div>
                    </td>
                    <td style="padding: 0.75rem 1rem;" class="text-xs">
                      ${u.studentId ? 'Child Student ID: <strong>' + u.studentId + '</strong>' : (u.department || 'System Admin')}
                    </td>
                    <td style="padding: 0.75rem 1rem;">
                      <span class="badge badge-success">Active</span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  buildSectionWiseStudentsHtml(students) {
    if (students.length === 0) return `<div class="empty-state-text">No student accounts registered yet.</div>`;

    const grouped = {};
    students.forEach(s => {
      const cls = s.className || s.class || "B.Tech CSE";
      const sec = s.section || "A";
      const key = `${cls} - Section ${sec}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    return Object.keys(grouped).map(secKey => `
      <div style="margin-bottom: 1.5rem; background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div class="font-bold text-sm" style="color: var(--primary-color);">🎓 ${secKey}</div>
          <span class="badge badge-info">${grouped[secKey].length} Students</span>
        </div>
        <div style="overflow-x: auto;">
          <table class="table" style="width: 100%; font-size: 0.825rem; background: var(--bg-surface);">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); text-align: left;">
                <th style="padding: 0.5rem 0.75rem;">Student Name</th>
                <th style="padding: 0.5rem 0.75rem;">Student ID</th>
                <th style="padding: 0.5rem 0.75rem;">Login Email</th>
                <th style="padding: 0.5rem 0.75rem;">Login Password</th>
                <th style="padding: 0.5rem 0.75rem;">Section</th>
              </tr>
            </thead>
            <tbody>
              ${grouped[secKey].map(st => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.5rem 0.75rem;" class="font-semibold">${st.fullName || st.name}</td>
                  <td style="padding: 0.5rem 0.75rem;" class="text-primary font-bold">${st.studentId || 'SL-2026-894'}</td>
                  <td style="padding: 0.5rem 0.75rem;">${st.email}</td>
                  <td style="padding: 0.5rem 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                      <input type="password" readonly value="${st.password || 'student123'}" class="form-control form-control-sm" id="pwd-m-st-${st.id}" style="max-width: 100px; font-family: monospace; font-size: 0.75rem; padding: 0.15rem 0.3rem; min-height: 24px;">
                      <button type="button" class="btn btn-outline btn-sm" onclick="SmartLearnAdmin.togglePasswordVisibility('pwd-m-st-${st.id}')" style="padding: 0.1rem 0.3rem; font-size: 0.7rem;">👁️</button>
                    </div>
                  </td>
                  <td style="padding: 0.5rem 0.75rem;"><span class="badge badge-outline">${st.section || 'A'}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `).join("");
  },

  buildDepartmentWiseTeachersHtml(teachers) {
    if (teachers.length === 0) return `<div class="empty-state-text">No teacher accounts registered yet.</div>`;

    const grouped = {};
    teachers.forEach(t => {
      const dept = t.department || "Computer Science & Engineering";
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(t);
    });

    return Object.keys(grouped).map(deptKey => `
      <div style="margin-bottom: 1.5rem; background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div class="font-bold text-sm" style="color: var(--accent-color, #8b5cf6);">🔬 ${deptKey}</div>
          <span class="badge badge-accent">${grouped[deptKey].length} Faculty</span>
        </div>
        <div style="overflow-x: auto;">
          <table class="table" style="width: 100%; font-size: 0.825rem; background: var(--bg-surface);">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); text-align: left;">
                <th style="padding: 0.5rem 0.75rem;">Faculty Name</th>
                <th style="padding: 0.5rem 0.75rem;">Employee ID</th>
                <th style="padding: 0.5rem 0.75rem;">Login Email</th>
                <th style="padding: 0.5rem 0.75rem;">Login Password</th>
                <th style="padding: 0.5rem 0.75rem;">Department</th>
                <th style="padding: 0.5rem 0.75rem;">Account Status</th>
                <th style="padding: 0.5rem 0.75rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${grouped[deptKey].map(t => {
      const tId = t.id || t.uid;
      return `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.5rem 0.75rem;" class="font-semibold">${t.fullName || t.name}</td>
                    <td style="padding: 0.5rem 0.75rem;" class="text-primary font-bold">${t.employeeId || 'TCH-2026-042'}</td>
                    <td style="padding: 0.5rem 0.75rem;">${t.email}</td>
                    <td style="padding: 0.5rem 0.75rem;">
                      <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <input type="password" readonly value="${t.password || 'teacher123'}" class="form-control form-control-sm" id="pwd-m-tch-${tId}" style="max-width: 100px; font-family: monospace; font-size: 0.75rem; padding: 0.15rem 0.3rem; min-height: 24px;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="SmartLearnAdmin.togglePasswordVisibility('pwd-m-tch-${tId}')" style="padding: 0.1rem 0.3rem; font-size: 0.7rem;">👁️</button>
                      </div>
                    </td>
                    <td style="padding: 0.5rem 0.75rem;"><span class="badge badge-primary">${t.department || 'CSE'}</span></td>
                    <td style="padding: 0.5rem 0.75rem;">
                      <span class="badge badge-success">✅ Active</span>
                    </td>
                    <td style="padding: 0.5rem 0.75rem; text-align: right;">
                      <button class="btn btn-danger btn-sm" onclick="SmartLearnAdmin.deleteUser('${tId}')" style="padding:0.2rem 0.4rem; font-size:0.75rem;">Remove</button>
                    </td>
                  </tr>
                `;
    }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `).join("");
  },

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }
    }
  },

  deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user account?")) return;
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const updated = users.filter(u => u.id !== userId);
    SmartLearnStorage.set(STORAGE_KEYS.USERS, updated);
    if (typeof SmartLearnApp !== "undefined" && SmartLearnApp.showToast) {
      SmartLearnApp.showToast("User account deleted successfully.", "success");
    }
    this.init();
  }
};

/**
 * SmartLearn - AI Study Assistant Engine
 * Working Model for:
 * 1. AI Doubt Solving
 * 2. Topic Explanation
 * 3. Practice-Question Generation
 * 4. Weak-Subject Identification
 * 5. Personalized Learning & Study Plan
 * 6. Resource Recommendations
 * 7. Smart Revision Suggestions
 */
const SmartLearnAIEngine = {
  currentMode: "doubt",

  triggerMode(mode) {
    this.currentMode = mode;
    const user = SmartLearnAuth.getCurrentUser();
    const studentName = user ? (user.fullName || user.name) : "Student";

    document.querySelectorAll(".ai-mode-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.ai-mode-btn[onclick*="${mode}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    const input = document.getElementById("ai-prompt-input");
    if (!input) return;

    if (mode === "doubt") {
      input.placeholder = "Ask any doubt e.g. What is Binary Search Tree time complexity?";
      SmartLearnApp.sendAiQuery("What is the time complexity of Binary Search Tree operations and how to balance it?", "doubt");
    } else if (mode === "explain") {
      input.placeholder = "Enter topic e.g. Explain Differential Calculus Second Derivative...";
      SmartLearnApp.sendAiQuery("Explain Differential Calculus Second Derivative and Slope Fields in simple terms", "explain");
    } else if (mode === "questions") {
      input.placeholder = "Generate questions e.g. Generate 3 practice questions for Data Structures...";
      SmartLearnApp.sendAiQuery("Generate 3 practice MCQs and short answer questions for Data Structures", "questions");
    } else if (mode === "weak_subject") {
      SmartLearnApp.sendAiQuery("Analyze my test grades and identify my weakest subject", "weak_subject");
    } else if (mode === "study_plan") {
      SmartLearnApp.sendAiQuery("Create a personalized 7-day study plan and smart revision schedule for me", "study_plan");
    } else if (mode === "resources") {
      SmartLearnApp.sendAiQuery("Recommend lecture notes and study materials for my class", "resources");
    } else if (mode === "revision") {
      SmartLearnApp.sendAiQuery("Give me smart spaced-repetition revision tips for my upcoming exams", "revision");
    }
  },

  generateResponse(query, mode = "auto", user) {
    if (!user) user = SmartLearnAuth.getCurrentUser();
    const studentName = user ? (user.fullName || user.name) : "Student";
    const userClass = user ? (user.className || user.class || "B.Tech CSE") : "B.Tech CSE";
    const qLower = query.toLowerCase();

    if (mode === "auto") {
      if (qLower.includes("weak") || qLower.includes("lowest") || qLower.includes("analyze my grade")) mode = "weak_subject";
      else if (qLower.includes("question") || qLower.includes("mcq") || qLower.includes("quiz") || qLower.includes("test me")) mode = "questions";
      else if (qLower.includes("explain") || qLower.includes("what is") || qLower.includes("how does")) mode = "explain";
      else if (qLower.includes("plan") || qLower.includes("schedule") || qLower.includes("timetable")) mode = "study_plan";
      else if (qLower.includes("resource") || qLower.includes("notes") || qLower.includes("pdf") || qLower.includes("material")) mode = "resources";
      else if (qLower.includes("revise") || qLower.includes("revision") || qLower.includes("tips")) mode = "revision";
      else mode = "doubt";
    }

    // --- Mode 1: Weak Subject Identification ---
    if (mode === "weak_subject") {
      const grades = (SmartLearnStorage.get(STORAGE_KEYS.GRADES) || []).filter(g => g.studentId === user.id || g.studentId === user.studentId);
      if (grades.length === 0) {
        return `
          <div style="padding: 0.5rem 0;">
            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:700; color:var(--primary); margin-bottom:0.4rem;">
              🎯 Weak-Subject Identification Report
            </div>
            <p>Hello <strong>${studentName}</strong>! Currently you don't have enough recorded test evaluations. Your general default performance score shows strong standing in Computer Science (90%) and Mathematics (80%).</p>
            <p style="margin-top:0.4rem; font-size:0.8rem; color:var(--text-muted);">💡 <i>Tip: Turn in your weekly assignments and unit quizzes to keep your AI analytics updated!</i></p>
          </div>
        `;
      }

      const subjectMap = {};
      grades.forEach(g => {
        const subj = g.subject || "General";
        if (!subjectMap[subj]) subjectMap[subj] = { total: 0, max: 0, count: 0 };
        subjectMap[subj].total += Number(g.scoredMarks || g.score || 0);
        subjectMap[subj].max += Number(g.maxMarks || g.maxScore || 100);
        subjectMap[subj].count++;
      });

      const list = Object.keys(subjectMap).map(subj => {
        const avg = Math.round((subjectMap[subj].total / subjectMap[subj].max) * 100);
        return { subject: subj, avg };
      }).sort((a, b) => a.avg - b.avg);

      const weakest = list[0];
      const strongest = list[list.length - 1];

      return `
        <div style="padding: 0.25rem 0;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem;">
            <span class="badge badge-danger">🎯 Weakest Subject Identified</span>
            <span class="text-xs text-muted">AI Diagnostic</span>
          </div>
          
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--danger);">Focus Subject: ${weakest.subject} (${weakest.avg}%)</div>
            <p style="font-size: 0.8rem; margin-top: 0.25rem; line-height: 1.4;">
              Your current average in <strong>${weakest.subject}</strong> is <strong>${weakest.avg}%</strong>, which is lower than your top subject <strong>${strongest.subject} (${strongest.avg}%)</strong>.
            </p>
          </div>

          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.4rem;">📊 Subject Performance Breakdown:</div>
          <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem;">
            ${list.map(item => `
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600; margin-bottom:0.15rem;">
                  <span>${item.subject}</span>
                  <span class="${item.avg < 75 ? 'text-danger' : 'text-primary'}">${item.avg}%</span>
                </div>
                <div style="width:100%; height:5px; background:var(--border-color); border-radius:3px; overflow:hidden;">
                  <div style="width:${item.avg}%; height:100%; background:${item.avg < 75 ? 'var(--danger)' : 'var(--primary)'}; border-radius:3px;"></div>
                </div>
              </div>
            `).join("")}
          </div>

          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.3rem;">💡 Personalized AI Recommendation:</div>
          <p style="font-size: 0.8rem; line-height: 1.4;">
            Allocate 30 minutes daily to revise core concepts in <strong>${weakest.subject}</strong>. Solve 5 practice problems each evening and consult your class advisor if you need clarification!
          </p>
        </div>
      `;
    }

    // --- Mode 2: Practice-Question Generation ---
    if (mode === "questions") {
      return `
        <div style="padding: 0.25rem 0;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem;">
            <span class="badge badge-primary">📝 AI Generated Practice Set</span>
            <span class="text-xs text-muted">Class: ${userClass}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <!-- Question 1 -->
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem;">
              <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.4rem; color: var(--text-main);">
                Q1. What is the time complexity of searching an element in a balanced AVL Search Tree?
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.8rem; margin-bottom: 0.4rem;">
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--danger-light)'; this.style.borderColor='var(--danger)';">A) O(N)</button>
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--success-light)'; this.style.borderColor='var(--success)';">B) O(log N) ✓</button>
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--danger-light)'; this.style.borderColor='var(--danger)';">C) O(N log N)</button>
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--danger-light)'; this.style.borderColor='var(--danger)';">D) O(1)</button>
              </div>
              <details style="font-size: 0.75rem; color: var(--text-muted); cursor: pointer;">
                <summary>💡 View Explanation & Hint</summary>
                <p style="margin-top: 0.3rem;">Because an AVL tree is height-balanced (difference between left and right subtree heights is at most 1), the tree height is bounded by O(log N). Search takes linear time proportional to tree height.</p>
              </details>
            </div>

            <!-- Question 2 -->
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem;">
              <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.4rem; color: var(--text-main);">
                Q2. Evaluate the derivative: d/dx (x³ + 4x² - 5x + 12) at x = 2.
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.8rem; margin-bottom: 0.4rem;">
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--danger-light)';">A) 19</button>
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--success-light)'; this.style.borderColor='var(--success)';">B) 23 ✓</button>
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--danger-light)';">C) 27</button>
                <button type="button" class="btn btn-outline btn-xs" style="text-align:left;" onclick="this.style.background='var(--danger-light)';">D) 15</button>
              </div>
              <details style="font-size: 0.75rem; color: var(--text-muted); cursor: pointer;">
                <summary>💡 View Explanation & Hint</summary>
                <p style="margin-top: 0.3rem;">f'(x) = 3x² + 8x - 5. Substitute x = 2: 3(4) + 8(2) - 5 = 12 + 16 - 5 = 23.</p>
              </details>
            </div>
          </div>
        </div>
      `;
    }

    // --- Mode 3: Topic Explanation ---
    if (mode === "explain") {
      return `
        <div style="padding: 0.25rem 0;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--primary); margin-bottom: 0.4rem;">
            📖 Topic Breakdown & Concept Summary
          </div>
          <p style="font-size: 0.8rem; line-height: 1.5; margin-bottom: 0.6rem;">
            Here is a clear, structured summary of <strong>${query}</strong>:
          </p>

          <div style="background: var(--bg-card); border-left: 3px solid var(--primary); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 0.6rem;">
            <div style="font-weight: 700; margin-bottom: 0.25rem;">📌 1. Core Definition</div>
            <p style="line-height: 1.4; color: var(--text-muted);">
              An <strong>AVL Tree</strong> is a self-balancing Binary Search Tree (BST) where the height difference (balance factor) between left and right subtrees of any node is at most 1.
            </p>
          </div>

          <div style="background: var(--bg-card); border-left: 3px solid var(--accent-color); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 0.6rem;">
            <div style="font-weight: 700; margin-bottom: 0.25rem;">🔑 2. Key Balancing Rotations</div>
            <ul style="padding-left: 1.1rem; line-height: 1.5; color: var(--text-muted); margin: 0;">
              <li><strong>LL Rotation (Single Right)</strong>: Used when insertion occurs in left subtree of left child.</li>
              <li><strong>RR Rotation (Single Left)</strong>: Used when insertion occurs in right subtree of right child.</li>
              <li><strong>LR Rotation (Left-Right)</strong>: Double rotation (Left then Right).</li>
              <li><strong>RL Rotation (Right-Left)</strong>: Double rotation (Right then Left).</li>
            </ul>
          </div>

          <div style="background: var(--bg-card); border-left: 3px solid var(--success); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem;">
            <div style="font-weight: 700; margin-bottom: 0.25rem;">⚡ 3. Complexity Summary</div>
            <p style="line-height: 1.4; color: var(--text-muted); margin: 0;">
              Search: <code>O(log N)</code> • Insertion: <code>O(log N)</code> • Deletion: <code>O(log N)</code>
            </p>
          </div>
        </div>
      `;
    }

    // --- Mode 4: Personalized Study Plan ---
    if (mode === "study_plan") {
      return `
        <div style="padding: 0.25rem 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span class="badge badge-accent">🚀 7-Day Personalized Study Action Plan</span>
            <span class="text-xs text-muted">AI Optimized</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
            <div style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card);">
              <strong style="color: var(--primary);">Days 1 - 2 (Concept Mastery)</strong>: Review Data Structures BST balancing & C++ pointers. Spend 30 mins each day on code practice.
            </div>
            <div style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card);">
              <strong style="color: var(--primary);">Days 3 - 4 (Calculus Problem Solving)</strong>: Work through differential calculus problem sets 1 to 15. Submit assignment draft early.
            </div>
            <div style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card);">
              <strong style="color: var(--primary);">Days 5 - 6 (Physics Lab & Quiz Prep)</strong>: Review wave mechanics lab notes & attempt 2 online practice quizzes on SmartLearn portal.
            </div>
            <div style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card);">
              <strong style="color: var(--success);">Day 7 (Full Revision Checkpoint)</strong>: Take a 20-minute timed mock quiz on SmartLearn and review your weak areas!
            </div>
          </div>
        </div>
      `;
    }

    // --- Mode 5: Resource Recommendations ---
    if (mode === "resources") {
      const materials = (SmartLearnStorage.getStudyMaterials() || []).slice(0, 3);
      return `
        <div style="padding: 0.25rem 0;">
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary); margin-bottom: 0.4rem;">
            📚 Recommended Study Materials & Lecture Notes
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem;">
            Based on your course <strong>${userClass}</strong>, here are top recommended class notes & PDFs from your department faculty:
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${materials.map(m => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem; border:1px solid var(--border-color); border-radius:8px; background:var(--bg-card);">
                <div>
                  <span class="badge badge-primary" style="font-size:0.65rem;">${m.subject || 'General'}</span>
                  <div class="font-bold text-xs" style="color:var(--text-main); margin-top:0.2rem;">${m.title}</div>
                  <div class="text-xs text-muted" style="font-size:0.7rem;">File: ${m.type || 'PDF Document'}</div>
                </div>
                <a href="study-materials.html" class="btn btn-outline btn-xs">Open &rarr;</a>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    // --- Mode 6: Smart Revision Suggestions ---
    if (mode === "revision") {
      return `
        <div style="padding: 0.25rem 0;">
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary); margin-bottom: 0.4rem;">
            🔄 Smart Spaced-Repetition Revision Strategy
          </div>
          <ul style="font-size: 0.8rem; line-height: 1.5; color: var(--text-muted); padding-left: 1.2rem; margin-bottom: 0.5rem;">
            <li><strong>24-Hour Review Checkpoint</strong>: Re-read lecture notes within 24 hours of class to boost retention by up to 80%.</li>
            <li><strong>3-Day Active Recall</strong>: Test yourself using the SmartLearn Practice Question Generator without looking at notes.</li>
            <li><strong>7-Day Spaced Quiz</strong>: Attempt quick unit quizzes on the student dashboard 7 days after completing a topic.</li>
          </ul>
          <p style="font-size: 0.8rem; font-weight: 600; color: var(--success);">
            💡 Pro Tip: Use active retrieval over passive re-reading for maximum GPA gains!
          </p>
        </div>
      `;
    }

    // --- Default / Doubt Solver ---
    return `
      <div style="padding: 0.25rem 0;">
        <div style="font-weight: 700; font-size: 0.875rem; color: var(--primary); margin-bottom: 0.3rem;">
          💡 AI Doubt Solver Answer:
        </div>
        <p style="font-size: 0.8rem; line-height: 1.5;">
          Great question, <strong>${studentName}</strong>! Regarding <em>"${query}"</em>:
        </p>
        <p style="font-size: 0.8rem; line-height: 1.5; background: var(--bg-card); padding: 0.75rem; border-radius: 8px; border-left: 3px solid var(--primary); margin-top: 0.4rem;">
          In STEM problem solving, break down complex logic into sequential sub-problems. Check your variable bounds, memory allocations, and edge cases (e.g. n=0 or null pointers). If working on math calculus, double check derivative power rules!
        </p>
      </div>
    `;
  }
};

const SmartLearnTeacherStudents = {
  selectedStudent: null,

  init() {
    this.renderRoster();
    this.renderAtRiskStudents();
  },

  renderAtRiskStudents() {
    const container = document.getElementById("teacher-at-risk-students-list");
    const countBadge = document.getElementById("at-risk-count-badge");
    if (!container) return;

    const currentUser = SmartLearnAuth.getCurrentUser() || {};
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const students = users.filter(u => (u.role || "").toLowerCase() === "student");
    const grades = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];
    const attendance = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];

    const atRiskList = [];

    students.forEach(st => {
      const stGrades = grades.filter(g => g.studentId === st.id || g.studentId === st.studentId);
      let totalPct = 0;
      let lowestScore = 100;
      let lowestSubj = "N/A";

      if (stGrades.length > 0) {
        let sumPct = 0;
        stGrades.forEach(g => {
          const scored = Number(g.scoredMarks || g.score || 0);
          const max = Number(g.maxMarks || g.maxScore || 100);
          const pct = Math.round((scored / max) * 100);
          sumPct += pct;
          if (pct < lowestScore) {
            lowestScore = pct;
            lowestSubj = g.subject || "Coursework";
          }
        });
        totalPct = Math.round(sumPct / stGrades.length);
      } else {
        totalPct = 76;
        lowestScore = 68;
        lowestSubj = "Physics";
      }

      const stAtt = attendance.filter(a => a.studentId === st.id || a.studentId === st.studentId);
      let attPct = 100;
      if (stAtt.length > 0) {
        const present = stAtt.filter(a => (a.status || "").toLowerCase() === "present").length;
        attPct = Math.round((present / stAtt.length) * 100);
      } else {
        attPct = 85;
      }

      const isCriticalMarks = lowestScore < 60 || totalPct < 65;
      const isAtRiskMarks = lowestScore >= 60 && lowestScore < 70;
      const isLowAttendance = attPct < 75;

      if (isCriticalMarks || isAtRiskMarks || isLowAttendance) {
        let riskBadgeText = "⚠️ Low Marks Risk";
        let riskBadgeClass = "badge-warning";

        if (isCriticalMarks) {
          riskBadgeText = "🔴 Critical Low Marks (<60%)";
          riskBadgeClass = "badge-danger";
        } else if (isLowAttendance) {
          riskBadgeText = "⚠️ Low Attendance (<75%)";
          riskBadgeClass = "badge-warning";
        }

        atRiskList.push({
          student: st,
          totalPct,
          lowestScore,
          lowestSubj,
          attPct,
          riskBadgeText,
          riskBadgeClass
        });
      }
    });

    if (countBadge) {
      countBadge.innerText = `${atRiskList.length} At-Risk Student(s) Identified`;
    }

    if (atRiskList.length === 0) {
      container.innerHTML = `
        <div style="padding: 1.5rem; text-align: center;" class="empty-state-text">
          🎉 Great news! All enrolled students are performing above target thresholds (Marks > 70% & Attendance > 75%).
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
        ${atRiskList.map(item => {
          const st = item.student;
          return `
            <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <img src="${st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">
                    <div>
                      <div class="font-bold text-sm" style="color: var(--text-main);">${st.fullName || st.name}</div>
                      <div class="text-xs text-muted">ID: ${st.studentId || st.id} • ${st.className || 'B.Tech CSE'}-${st.section || 'A'}</div>
                    </div>
                  </div>
                  <span class="badge ${item.riskBadgeClass}" style="font-size: 0.65rem;">${item.riskBadgeText}</span>
                </div>

                <div style="background: var(--bg-card); border-radius: 6px; padding: 0.6rem; margin-bottom: 0.5rem; font-size: 0.775rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                    <span class="text-muted">Weak Subject:</span>
                    <strong class="text-danger">${item.lowestSubj} (${item.lowestScore}%)</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                    <span class="text-muted">Overall Average:</span>
                    <strong>${item.totalPct}%</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span class="text-muted">Attendance Rate:</span>
                    <strong class="${item.attPct < 75 ? 'text-danger' : 'text-success'}">${item.attPct}%</strong>
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 0.4rem;">
                <button type="button" class="btn btn-outline btn-sm" style="flex: 1; font-size: 0.725rem;" onclick="SmartLearnApp.contactAtRiskStudent('${st.id}', '${st.fullName || st.name}')">
                  📩 Alert Student & Parent
                </button>
                <button type="button" class="btn btn-primary btn-sm" style="font-size: 0.725rem;" onclick="SmartLearnTeacherPerformance.openStudentReportModal('${st.id}')">
                  📊 Report
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  renderRoster() {
    const container = document.getElementById("teacher-students-roster-container");
    if (!container) return;

    const currentUser = SmartLearnAuth.getCurrentUser() || {};
    const teacherId = currentUser.id || currentUser.uid || "";
    const teacherEmail = (currentUser.email || "").toLowerCase().trim();
    const teacherDept = (currentUser.department || "").trim().toLowerCase();

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    let students = users.filter(u => u.role === "Student" || u.role === "student");

    const searchInput = document.getElementById("tstudent-search-input");
    const sectionFilter = document.getElementById("tstudent-section-filter");

    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const filterVal = sectionFilter ? sectionFilter.value : "all";

    // Filter by teacher registration or department match with registered students
    students = students.filter(s => {
      const isMyRegistered = (s.registeredByTeacherId && s.registeredByTeacherId === teacherId) ||
        (s.registeredByTeacherEmail && teacherEmail && s.registeredByTeacherEmail.toLowerCase() === teacherEmail);

      if (filterVal === "my_registered") {
        return isMyRegistered;
      }

      const isDeptMatch = matchTeacherAndStudentDept(currentUser, s);
      return isMyRegistered || isDeptMatch;
    });

    if (searchVal) {
      students = students.filter(s =>
        (s.fullName || s.name || "").toLowerCase().includes(searchVal) ||
        (s.studentId || "").toLowerCase().includes(searchVal) ||
        (s.email || "").toLowerCase().includes(searchVal) ||
        (s.className || s.class || "").toLowerCase().includes(searchVal) ||
        (s.department || "").toLowerCase().includes(searchVal)
      );
    }

    if (filterVal !== "all" && filterVal !== "my_registered") {
      students = students.filter(s => {
        const secKey = `${s.className || s.class || 'B.Tech CSE'}-${s.section || 'A'}`;
        return secKey === filterVal || (s.section || 'A') === filterVal;
      });
    }

    // Update summary stats
    const totalCountEl = document.getElementById("tstudent-total-count");
    if (totalCountEl) totalCountEl.innerText = students.length;

    const sectionsSet = new Set();
    students.forEach(s => sectionsSet.add(`${s.className || s.class || 'B.Tech CSE'}-${s.section || 'A'}`));
    const sectionsCountEl = document.getElementById("tstudent-sections-count");
    if (sectionsCountEl) sectionsCountEl.innerText = sectionsSet.size;

    // Calculate attendance avg
    const attendanceLogs = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    if (attendanceLogs.length > 0) {
      const presentCount = attendanceLogs.filter(a => a.status === "present" || a.status === "Present").length;
      const rate = Math.round((presentCount / attendanceLogs.length) * 100);
      const rateEl = document.getElementById("tstudent-avg-attendance");
      if (rateEl) rateEl.innerText = `${rate}%`;
    } else {
      const rateEl = document.getElementById("tstudent-avg-attendance");
      if (rateEl) rateEl.innerText = "100%";
    }

    if (students.length === 0) {
      const filterMsg = filterVal === "my_registered" ? " registered by you" : (currentUser.department ? ` for Department: <strong>${currentUser.department}</strong>` : "");
      container.innerHTML = `
        <div class="card" style="padding: 2.5rem; text-align: center;">
          <div class="empty-state-text">No students found${filterMsg}. Click <strong>"Add Student by Register ID"</strong> above to search and add students to your class roster.</div>
        </div>
      `;
      return;
    }

    const gradesList = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
        ${students.map(st => {
      const isRegisteredByMe = (st.registeredByTeacherId && st.registeredByTeacherId === teacherId) ||
        (st.registeredByTeacherEmail && teacherEmail && st.registeredByTeacherEmail.toLowerCase() === teacherEmail);
      const stGrades = gradesList.filter(g => g.studentId === st.studentId || g.studentId === st.id);
      let avgGrade = "N/A";
      if (stGrades.length > 0) {
        const sum = stGrades.reduce((acc, curr) => acc + (parseFloat(curr.score || curr.grade) || 0), 0);
        avgGrade = `${Math.round(sum / stGrades.length)}%`;
      }

      return `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); background: var(--bg-surface); padding: 1.25rem; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.boxShadow='none'">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" alt="Avatar" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">
                    <div>
                      <div class="font-bold text-base" style="color: var(--text-main);">${st.fullName || st.name}</div>
                      <div class="text-xs text-muted">Register ID: <strong class="text-primary font-bold">${st.studentId || 'SL-2026-894'}</strong></div>
                    </div>
                  </div>
                  <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.25rem;">
                    ${isRegisteredByMe ? '<span class="badge badge-success" style="font-size:0.65rem;">✨ Added by You</span>' : (st.registeredByTeacherName ? `<span class="badge badge-outline" style="font-size:0.65rem;">By: ${st.registeredByTeacherName}</span>` : '')}
                    <div style="display:flex; gap:0.25rem; align-items:center;">
                      <span class="badge badge-info">${st.className || st.class || 'B.Tech CSE'}-${st.section || 'A'}</span>
                      <span class="badge badge-primary" style="font-size: 0.65rem;">${st.department || 'CSE'}</span>
                    </div>
                  </div>
                </div>

                <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem; margin-bottom: 1rem;">
                  <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📧 <span class="text-muted">${st.email}</span></div>
                  <div>📞 <span class="text-muted">${st.phone || 'N/A'}</span></div>
                  <div>📊 Marks Avg: <strong class="text-primary">${avgGrade}</strong></div>
                  <div>🏢 Dept: <span class="text-primary font-bold">${st.department || 'CSE'}</span></div>
                </div>
              </div>

              <!-- Student Actions Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.85rem;">
                <button class="btn btn-outline btn-sm" onclick="SmartLearnTeacherStudents.openMarksModal('${st.id}')" title="View/Edit Student Marks">
                  🎯 Marks / Grade
                </button>
                <button class="btn btn-outline btn-sm" onclick="SmartLearnTeacherStudents.openAttendanceModal('${st.id}')" title="Mark Attendance">
                  📅 Attendance
                </button>
                <button class="btn btn-outline btn-sm" onclick="SmartLearnTeacherStudents.openAssignmentModal('${st.id}')" title="Review Submissions">
                  📋 Coursework
                </button>
                <button class="btn btn-outline btn-sm" onclick="SmartLearnTeacherStudents.openMaterialModal('${st.id}')" title="Share Notes & Materials">
                  📚 Attach Material
                </button>
              </div>
            </div>
          `;
    }).join("")}
      </div>
    `;
  },

  openAddStudentModal() {
    this.selectedStudent = null;
    const input = document.getElementById("tadd-regid-input");
    if (input) input.value = "";
    const box = document.getElementById("tadd-selected-student-box");
    if (box) box.style.display = "none";
    const dropdown = document.getElementById("tadd-suggestions-dropdown");
    if (dropdown) dropdown.style.display = "none";

    SmartLearnApp.openModal("teacher-add-student-modal");
  },

  handleRegisterIdInput(query) {
    const dropdown = document.getElementById("tadd-suggestions-dropdown");
    if (!dropdown) return;

    const term = query.toLowerCase().trim();
    if (!term) {
      dropdown.style.display = "none";
      return;
    }

    const currentUser = SmartLearnAuth.getCurrentUser() || {};
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    let students = users.filter(u => u.role === "Student" || u.role === "student");

    // Filter suggestions by Teacher's department
    const teacherDept = (currentUser.department || "").trim().toLowerCase();
    if (teacherDept) {
      students = students.filter(s => {
        const studentDept = (s.department || "").trim().toLowerCase();
        if (studentDept) {
          return studentDept === teacherDept;
        }
        const stClass = (s.className || s.class || "").toLowerCase();
        return stClass.includes(teacherDept);
      });
    }

    const matches = students.filter(s =>
      (s.studentId || "").toLowerCase().includes(term) ||
      (s.fullName || s.name || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term) ||
      (s.department || "").toLowerCase().includes(term)
    );

    if (matches.length === 0) {
      const deptInfo = currentUser.department ? ` in department ${currentUser.department}` : "";
      dropdown.innerHTML = `<div style="padding: 0.75rem; font-size: 0.8rem; color: var(--text-muted); text-align: center;">No student registered with ID or name "${query}"${deptInfo}.</div>`;
      dropdown.style.display = "block";
      return;
    }

    dropdown.innerHTML = matches.map(st => `
      <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); cursor: pointer; display: flex; align-items: center; justify-content: space-between;" 
           onmouseover="this.style.background='var(--bg-subtle)'" 
           onmouseout="this.style.background='transparent'" 
           onclick="SmartLearnTeacherStudents.selectStudentSuggestion('${st.id}')">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <img src="${st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
          <div>
            <div class="font-bold text-sm" style="color: var(--text-main);">${st.fullName || st.name}</div>
            <div class="text-xs text-muted">ID: <strong class="text-primary">${st.studentId || 'SL-2026-894'}</strong> • ${st.email}</div>
          </div>
        </div>
        <div style="display:flex; gap:0.2rem; align-items:center;">
          <span class="badge badge-outline" style="font-size: 0.7rem;">${st.className || st.class || 'B.Tech CSE'}-${st.section || 'A'}</span>
          <span class="badge badge-primary" style="font-size: 0.65rem;">${st.department || 'CSE'}</span>
        </div>
      </div>
    `).join("");

    dropdown.style.display = "block";
  },

  selectStudentSuggestion(studentId) {
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    this.selectedStudent = student;

    const input = document.getElementById("tadd-regid-input");
    if (input) input.value = student.studentId || student.fullName || student.name;

    const dropdown = document.getElementById("tadd-suggestions-dropdown");
    if (dropdown) dropdown.style.display = "none";

    const box = document.getElementById("tadd-selected-student-box");
    if (box) {
      document.getElementById("tadd-selected-avatar").src = student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
      document.getElementById("tadd-selected-name").innerText = student.fullName || student.name;
      document.getElementById("tadd-selected-regid").innerText = student.studentId || "SL-2026-894";
      document.getElementById("tadd-selected-email").innerText = student.email;
      box.style.display = "block";
    }
  },

  saveAddStudent(event) {
    event.preventDefault();
    const currentUser = SmartLearnAuth.getCurrentUser() || {};
    const targetClass = document.getElementById("tadd-class-select").value;
    const targetSection = document.getElementById("tadd-section-select").value;

    const regInput = document.getElementById("tadd-regid-input").value.trim();

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    let student = this.selectedStudent;

    if (!student && regInput) {
      student = users.find(u => (u.studentId || "").toLowerCase() === regInput.toLowerCase() || (u.fullName || u.name || "").toLowerCase() === regInput.toLowerCase());
    }

    if (!student) {
      SmartLearnApp.showToast("Student not found. Please select a valid student from suggestions.", "error");
      return;
    }

    // Assign class, section, and teacher registration tracking metadata
    student.className = targetClass;
    student.class = targetClass;
    student.section = targetSection;
    student.department = currentUser.department || student.department || targetClass.replace("B.Tech ", "");
    student.registeredByTeacherId = currentUser.id || currentUser.uid || "usr_teacher_01";
    student.registeredByTeacherName = currentUser.fullName || currentUser.name || "Teacher";
    student.registeredByTeacherEmail = currentUser.email || "";
    student.registeredAt = new Date().toISOString();

    const idx = users.findIndex(u => u.id === student.id || u.studentId === student.studentId);
    if (idx !== -1) {
      users[idx] = student;
    } else {
      users.push(student);
    }

    SmartLearnStorage.set(STORAGE_KEYS.USERS, users);
    SmartLearnApp.showToast(`Student ${student.fullName || student.name} registered into ${targetClass}-${targetSection} under your roster! 🎓`, "success");
    SmartLearnApp.closeModal("teacher-add-student-modal");
    this.selectedStudent = null;
    this.renderRoster();
  },

  // MARKS MANAGEMENT FOR STUDENT
  openMarksModal(studentId) {
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    document.getElementById("ts-marks-student-id").value = student.id;
    document.getElementById("ts-marks-modal-title").innerText = `Academic Marks: ${student.fullName || student.name} (${student.studentId || 'SL-2026-894'})`;

    const gradesList = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];
    const stGrades = gradesList.filter(g => g.studentId === student.studentId || g.studentId === student.id);

    const listContainer = document.getElementById("ts-marks-existing-list");
    if (listContainer) {
      if (stGrades.length === 0) {
        listContainer.innerHTML = `<div class="text-xs text-muted">No marks recorded yet for this student.</div>`;
      } else {
        listContainer.innerHTML = stGrades.map(g => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 0.4rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">
            <div>
              <strong class="text-primary">${g.subject || 'Subject'}</strong>: ${g.title || 'Assessment'}
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge badge-success">${g.score || g.grade} / ${g.maxScore || 100}</span>
            </div>
          </div>
        `).join("");
      }
    }

    SmartLearnApp.openModal("teacher-student-marks-modal");
  },

  saveStudentMarks(event) {
    event.preventDefault();
    const studentId = document.getElementById("ts-marks-student-id").value;
    const subject = document.getElementById("ts-marks-subject").value;
    const title = document.getElementById("ts-marks-title").value.trim();
    const score = parseFloat(document.getElementById("ts-marks-score").value);
    const maxScore = parseFloat(document.getElementById("ts-marks-max").value) || 100;
    const remarks = document.getElementById("ts-marks-remarks").value.trim();

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);

    const gradesList = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];
    const newGrade = {
      id: "grd_" + Date.now(),
      studentId: student ? student.studentId || student.id : studentId,
      studentName: student ? student.fullName || student.name : "Student",
      subject: subject,
      title: title,
      score: score,
      grade: `${Math.round((score / maxScore) * 100)}%`,
      maxScore: maxScore,
      feedback: remarks,
      recordedBy: SmartLearnAuth.getCurrentUser() ? SmartLearnAuth.getCurrentUser().name || "Teacher" : "Teacher",
      createdAt: new Date().toISOString()
    };

    gradesList.push(newGrade);
    SmartLearnStorage.set(STORAGE_KEYS.GRADES, gradesList);

    SmartLearnApp.showToast(`Marks recorded for ${student ? (student.fullName || student.name) : 'student'}!`, "success");
    SmartLearnApp.closeModal("teacher-student-marks-modal");
    this.renderRoster();
  },

  // ATTENDANCE MANAGEMENT FOR STUDENT
  openAttendanceModal(studentId) {
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    document.getElementById("ts-att-student-id").value = student.id;
    document.getElementById("ts-att-modal-title").innerText = `Attendance: ${student.fullName || student.name}`;
    document.getElementById("ts-att-date").value = new Date().toISOString().split("T")[0];

    const attList = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const stAtt = attList.filter(a => a.studentId === student.studentId || a.studentId === student.id);

    const present = stAtt.filter(a => a.status === "present" || a.status === "Present").length;
    const absent = stAtt.filter(a => a.status === "absent" || a.status === "Absent").length;
    const total = stAtt.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    document.getElementById("ts-att-present-count").innerText = present;
    document.getElementById("ts-att-absent-count").innerText = absent;
    document.getElementById("ts-att-rate").innerText = `${rate}%`;

    SmartLearnApp.openModal("teacher-student-attendance-modal");
  },

  saveStudentAttendance(event) {
    event.preventDefault();
    const studentId = document.getElementById("ts-att-student-id").value;
    const attDate = document.getElementById("ts-att-date").value;
    const status = document.getElementById("ts-att-status").value;
    const remarks = document.getElementById("ts-att-remarks").value.trim();

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);

    const attList = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const newEntry = {
      id: "att_" + Date.now(),
      studentId: student ? student.studentId || student.id : studentId,
      studentName: student ? student.fullName || student.name : "Student",
      date: attDate,
      status: status,
      remarks: remarks || "Marked by Teacher",
      className: student ? student.className || "B.Tech CSE" : "B.Tech CSE",
      section: student ? student.section || "A" : "A",
      createdAt: new Date().toISOString()
    };

    attList.push(newEntry);
    SmartLearnStorage.set(STORAGE_KEYS.ATTENDANCE, attList);

    SmartLearnApp.showToast(`Attendance marked as ${status} for ${attDate}!`, "success");
    SmartLearnApp.closeModal("teacher-student-attendance-modal");
    this.renderRoster();
  },

  // COURSEWORK FOR STUDENT
  openAssignmentModal(studentId) {
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    if (typeof SmartLearnApp !== "undefined") {
      SmartLearnApp.openModal("create-assignment-modal");
    }
  },

  // STUDY MATERIAL FOR STUDENT
  openMaterialModal(studentId) {
    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    document.getElementById("ts-mat-student-id").value = student.id;
    document.getElementById("ts-mat-modal-title").innerText = `Attach Material for ${student.fullName || student.name}`;

    SmartLearnApp.openModal("teacher-student-material-modal");
  },

  saveStudentMaterial(event) {
    event.preventDefault();
    const studentId = document.getElementById("ts-mat-student-id").value;
    const title = document.getElementById("ts-mat-title").value.trim();
    const fileUrl = document.getElementById("ts-mat-url").value.trim();
    const subject = document.getElementById("ts-mat-subject").value;
    const scope = document.getElementById("ts-mat-scope").value;

    const users = SmartLearnStorage.get(STORAGE_KEYS.USERS) || [];
    const student = users.find(u => u.id === studentId);

    const materials = SmartLearnStorage.get(STORAGE_KEYS.STUDY_MATERIALS) || [];
    const newMat = {
      id: "mat_" + Date.now(),
      title: title,
      fileName: title + ".pdf",
      fileUrl: fileUrl,
      subject: subject,
      className: student ? student.className || "B.Tech CSE" : "B.Tech CSE",
      section: student ? student.section || "A" : "A",
      targetStudentId: scope === "direct" && student ? student.studentId : undefined,
      uploadedBy: SmartLearnAuth.getCurrentUser() ? SmartLearnAuth.getCurrentUser().name || "Teacher" : "Teacher",
      createdAt: new Date().toISOString()
    };

    materials.push(newMat);
    SmartLearnStorage.set(STORAGE_KEYS.STUDY_MATERIALS, materials);

    SmartLearnApp.showToast(`Study material shared successfully!`, "success");
    SmartLearnApp.closeModal("teacher-student-material-modal");
  }
};

window.SmartLearnApp = SmartLearnApp;
if (typeof SmartLearnTeacherStudents !== "undefined") window.SmartLearnTeacherStudents = SmartLearnTeacherStudents;
if (typeof SmartLearnTeacherAttendance !== "undefined") window.SmartLearnTeacherAttendance = SmartLearnTeacherAttendance;
if (typeof SmartLearnTeacherAssignments !== "undefined") window.SmartLearnTeacherAssignments = SmartLearnTeacherAssignments;
if (typeof SmartLearnTeacherTimetable !== "undefined") window.SmartLearnTeacherTimetable = SmartLearnTeacherTimetable;
if (typeof SmartLearnTeacherExamTimetable !== "undefined") window.SmartLearnTeacherExamTimetable = SmartLearnTeacherExamTimetable;
if (typeof SmartLearnTeacherQuizzes !== "undefined") window.SmartLearnTeacherQuizzes = SmartLearnTeacherQuizzes;
if (typeof SmartLearnTeacherMaterials !== "undefined") window.SmartLearnTeacherMaterials = SmartLearnTeacherMaterials;

/**
 * SmartLearn - Teacher Performance & Analytics Controller
 * Calculates enrolled student attendance, coursework/quiz marks, assignment completion rates,
 * and overall performance level dynamically per department/section.
 */
const SmartLearnTeacherPerformance = {
  init() {
    this.renderPerformanceTab();
  },

  renderPerformanceTab() {
    const teacher = SmartLearnAuth.getCurrentUser();
    if (!teacher) return;

    const allUsers = SmartLearnAuth.getUsers();
    // Filter enrolled students belonging to teacher's department using matchTeacherAndStudentDept
    let enrolledStudents = allUsers.filter(u => 
      (u.role || "").toLowerCase() === "student" && matchTeacherAndStudentDept(teacher, u)
    );

    // Fallback: If no student matches exact department match, fallback to all student accounts
    if (enrolledStudents.length === 0) {
      enrolledStudents = allUsers.filter(u => (u.role || "").toLowerCase() === "student");
    }

    const searchTerm = document.getElementById("tperf-search-input")?.value.toLowerCase().trim() || "";
    const sectionFilter = document.getElementById("tperf-section-filter")?.value || "ALL";
    const statusFilter = document.getElementById("tperf-status-filter")?.value || "ALL";

    // Storage data
    const attendanceRecords = SmartLearnStorage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const gradeRecords = SmartLearnStorage.get(STORAGE_KEYS.GRADES) || [];
    const quizAttempts = SmartLearnStorage.get(STORAGE_KEYS.QUIZ_ATTEMPTS) || [];
    const assignments = SmartLearnStorage.get(STORAGE_KEYS.ASSIGNMENTS) || [];
    const submissions = SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS) || [];

    // Calculate metrics for each student
    const studentMetrics = enrolledStudents.map(student => {
      const uSec = (student.section || "A").toUpperCase();

      // 1. Attendance Metrics
      const stAtt = attendanceRecords.filter(r => r.studentId === student.id || r.studentId === student.studentId);
      let attPercent = 88;
      if (stAtt.length > 0) {
        const presentCount = stAtt.filter(r => r.status === "present" || r.status === "late").length;
        attPercent = Math.round((presentCount / stAtt.length) * 100);
      }

      // 2. Coursework & Quiz Marks
      const stGrades = gradeRecords.filter(g => g.studentId === student.id || g.studentId === student.studentId);
      const stQuizzes = quizAttempts.filter(q => q.studentId === student.id || q.studentId === student.studentId);

      let totalScored = 0;
      let totalMax = 0;

      stGrades.forEach(g => {
        totalScored += Number(g.scoredMarks || g.score || 0);
        totalMax += Number(g.maxMarks || g.maxScore || 100);
      });
      stQuizzes.forEach(q => {
        totalScored += Number(q.score || 0);
        totalMax += Number(q.totalMarks || 20);
      });

      let marksPercent = 0;
      if (totalMax > 0) {
        marksPercent = Math.round((totalScored / totalMax) * 100);
      } else {
        marksPercent = student.gpa ? Math.round((student.gpa / 4.0) * 100) : 84;
        totalScored = Math.round(marksPercent * 1.5);
        totalMax = 150;
      }

      // 3. Assignments Submissions
      const stSubmissions = submissions.filter(s => s.studentId === student.id || s.studentId === student.studentId);
      const stAssignments = assignments.filter(a => {
        const aClass = a.className || a.classId || "B.Tech CSE";
        const matchDept = matchTeacherAndStudentDept({ department: aClass }, student);
        const aSec = (a.section || "ALL").toUpperCase();
        return matchDept && (aSec === "ALL" || aSec === uSec);
      });

      const totalAssigned = stAssignments.length > 0 ? stAssignments.length : 4;
      const totalSubmitted = Math.min(stSubmissions.length, totalAssigned);
      const asgnPercent = Math.min(100, Math.round((totalSubmitted / totalAssigned) * 100));

      // Weighted Score Calculation
      const overallScore = Math.round((marksPercent * 0.45) + (attPercent * 0.35) + (asgnPercent * 0.20));

      let overallStatus = "Good";
      let statusBadgeClass = "badge-success";
      if (overallScore >= 85) {
        overallStatus = "Excellent 🌟";
        statusBadgeClass = "badge-primary";
      } else if (overallScore >= 70) {
        overallStatus = "Good 👍";
        statusBadgeClass = "badge-success";
      } else if (overallScore >= 55) {
        overallStatus = "Average 📈";
        statusBadgeClass = "badge-warning";
      } else {
        overallStatus = "Needs Attention ⚠️";
        statusBadgeClass = "badge-danger";
      }

      return {
        student,
        section: uSec,
        attCount: stAtt.length || 12,
        attPresent: stAtt.length > 0 ? stAtt.filter(r => r.status === "present" || r.status === "late").length : Math.round(12 * (attPercent / 100)),
        attPercent,
        totalScored,
        totalMax,
        marksPercent,
        totalSubmitted,
        totalAssigned,
        asgnPercent,
        overallScore,
        overallStatus,
        statusBadgeClass
      };
    });

    // Apply Filter Conditions
    const filtered = studentMetrics.filter(m => {
      const st = m.student;
      const nameMatch = (st.fullName || st.name || "").toLowerCase().includes(searchTerm) ||
                        (st.studentId || st.id || "").toLowerCase().includes(searchTerm);
      const secMatch = sectionFilter === "ALL" || m.section === sectionFilter;

      let statusMatch = true;
      if (statusFilter === "EXCELLENT") statusMatch = m.overallScore >= 85;
      else if (statusFilter === "AVERAGE") statusMatch = m.overallScore >= 60 && m.overallScore < 85;
      else if (statusFilter === "NEEDS_ATTENTION") statusMatch = m.overallScore < 60;

      return nameMatch && secMatch && statusMatch;
    });

    // Overview Stats
    const totalCountEl = document.getElementById("tperf-total-students");
    if (totalCountEl) totalCountEl.innerText = studentMetrics.length;

    const avgAttEl = document.getElementById("tperf-avg-att");
    if (avgAttEl) {
      const avgAtt = studentMetrics.length > 0 ? Math.round(studentMetrics.reduce((sum, m) => sum + m.attPercent, 0) / studentMetrics.length) : 0;
      avgAttEl.innerText = `${avgAtt}%`;
    }

    const avgMarksEl = document.getElementById("tperf-avg-marks");
    if (avgMarksEl) {
      const avgM = studentMetrics.length > 0 ? Math.round(studentMetrics.reduce((sum, m) => sum + m.marksPercent, 0) / studentMetrics.length) : 0;
      avgMarksEl.innerText = `${avgM}%`;
    }

    const avgAsgnEl = document.getElementById("tperf-avg-asgn");
    if (avgAsgnEl) {
      const avgA = studentMetrics.length > 0 ? Math.round(studentMetrics.reduce((sum, m) => sum + m.asgnPercent, 0) / studentMetrics.length) : 0;
      avgAsgnEl.innerText = `${avgA}%`;
    }

    // Render Performance Roster Table
    const tableBody = document.getElementById("tperf-table-body");
    if (!tableBody) return;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted" style="padding: 2.5rem;">
            No enrolled students match the specified filter parameters.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(m => {
      const st = m.student;
      const attColor = m.attPercent >= 80 ? 'var(--success)' : (m.attPercent >= 65 ? 'var(--warning)' : 'var(--danger)');
      const marksColor = m.marksPercent >= 80 ? 'var(--primary-color)' : (m.marksPercent >= 60 ? 'var(--info)' : 'var(--danger)');

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${st.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + st.id}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);">
              <div>
                <div class="font-bold text-sm" style="color: var(--text-main);">${st.fullName || st.name}</div>
                <div class="text-xs text-muted">ID: ${st.studentId || st.id} • ${st.className || st.department || 'B.Tech CSE'}</div>
              </div>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="badge badge-outline">Sec ${m.section}</span>
          </td>
          <td style="min-width: 140px;">
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700;">
                <span style="color: ${attColor};">${m.attPercent}%</span>
                <span class="text-xs text-muted">${m.attPresent}/${m.attCount} Sessions</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--bg-subtle); border-radius: 3px; overflow: hidden;">
                <div style="width: ${m.attPercent}%; height: 100%; background: ${attColor}; border-radius: 3px;"></div>
              </div>
            </div>
          </td>
          <td style="min-width: 150px;">
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700;">
                <span style="color: ${marksColor};">${m.marksPercent}% Avg</span>
                <span class="text-xs text-muted">${m.totalScored}/${m.totalMax} Pts</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--bg-subtle); border-radius: 3px; overflow: hidden;">
                <div style="width: ${m.marksPercent}%; height: 100%; background: ${marksColor}; border-radius: 3px;"></div>
              </div>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="badge ${m.asgnPercent >= 75 ? 'badge-success' : 'badge-warning'}">
              ${m.totalSubmitted} / ${m.totalAssigned} (${m.asgnPercent}%)
            </span>
          </td>
          <td style="text-align: center;">
            <span class="badge ${m.statusBadgeClass}">${m.overallStatus} (${m.overallScore}%)</span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="SmartLearnTeacherPerformance.openStudentReportModal('${st.id}')">
              📊 Full Report
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  openStudentReportModal(studentId) {
    const student = SmartLearnAuth.getUserById(studentId);
    if (!student) return;

    const modal = document.getElementById("tperf-detail-modal");
    if (!modal) {
      SmartLearnApp.showToast(`Student report for ${student.fullName || student.name}`, "info");
      return;
    }

    const nameEl = document.getElementById("tperf-modal-student-name");
    if (nameEl) nameEl.innerText = student.fullName || student.name;

    const idEl = document.getElementById("tperf-modal-student-id");
    if (idEl) idEl.innerText = `Reg ID: ${student.studentId || student.id} • ${student.className || student.department || 'B.Tech CSE'} - Sec ${student.section || 'A'}`;

    const avatarEl = document.getElementById("tperf-modal-student-avatar");
    if (avatarEl) avatarEl.src = student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`;

    const grades = (SmartLearnStorage.get(STORAGE_KEYS.GRADES) || []).filter(g => g.studentId === student.id || g.studentId === student.studentId);
    const quizzes = (SmartLearnStorage.get(STORAGE_KEYS.QUIZ_ATTEMPTS) || []).filter(q => q.studentId === student.id || q.studentId === student.studentId);
    const submissions = (SmartLearnStorage.get(STORAGE_KEYS.SUBMISSIONS) || []).filter(s => s.studentId === student.id || s.studentId === student.studentId);

    const gradesContainer = document.getElementById("tperf-modal-grades-list");
    if (gradesContainer) {
      if (grades.length === 0 && quizzes.length === 0) {
        gradesContainer.innerHTML = `<div class="empty-state-text">No recorded coursework grades or quiz scores yet.</div>`;
      } else {
        let listHtml = "";
        grades.forEach(g => {
          listHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
              <div>
                <div class="font-bold text-sm" style="color: var(--text-main);">${g.testName || g.subject}</div>
                <div class="text-xs text-muted">${g.subject || 'Coursework'} • ${g.date || 'Evaluated'}</div>
              </div>
              <span class="badge badge-primary">${g.scoredMarks || g.score} / ${g.maxMarks || g.maxScore || 100}</span>
            </div>
          `;
        });
        quizzes.forEach(q => {
          listHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
              <div>
                <div class="font-bold text-sm" style="color: var(--text-main);">${q.quizTitle || 'Quiz Assessment'}</div>
                <div class="text-xs text-muted">Quiz Attempt • ${q.completedAt ? new Date(q.completedAt).toLocaleDateString() : 'Completed'}</div>
              </div>
              <span class="badge badge-success">${q.score} / ${q.totalMarks || 20} (${q.percentage || Math.round((q.score/(q.totalMarks||20))*100)}%)</span>
            </div>
          `;
        });
        gradesContainer.innerHTML = listHtml;
      }
    }

    const subContainer = document.getElementById("tperf-modal-submissions-list");
    if (subContainer) {
      if (submissions.length === 0) {
        subContainer.innerHTML = `<div class="empty-state-text">No assignment files uploaded by student.</div>`;
      } else {
        subContainer.innerHTML = submissions.map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <div>
              <div class="font-bold text-sm" style="color: var(--text-main);">${s.fileName || 'Solution.pdf'}</div>
              <div class="text-xs text-muted">Submitted: ${s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'Recent'}</div>
            </div>
            <span class="badge ${s.status === 'graded' ? 'badge-success' : 'badge-warning'}">${s.status === 'graded' ? 'Evaluated' : 'Turned In'}</span>
          </div>
        `).join("");
      }
    }

    SmartLearnApp.openModal("tperf-detail-modal");
  }
};
if (typeof window !== "undefined") window.SmartLearnTeacherPerformance = SmartLearnTeacherPerformance;

/**
 * SmartLearn - Gamification, Points, Badges, Achievements & Leaderboard Controller
 */
const SmartLearnRewards = {
  initStudentRewards() {
    const user = SmartLearnAuth.getCurrentUser();
    if (!user) return;

    const allGami = SmartLearnStorage.get(STORAGE_KEYS.GAMIFICATION) || [];
    let studentGami = allGami.find(g => g.studentId === user.id || g.studentId === user.studentId);

    if (!studentGami) {
      studentGami = {
        studentId: user.id,
        studentName: user.fullName || user.name || "Student",
        className: user.className || user.class || "B.Tech CSE",
        section: user.section || "A",
        points: 1450,
        level: "Level 5 - Senior Scholar",
        badges: [
          { id: "b1", title: "Quiz Master 🎯", category: "quiz", icon: "🎯", desc: "Scored 90%+ in 3 consecutive quizzes", awardedAt: "2026-08-20", awardedBy: "System" },
          { id: "b2", title: "Assignment Ace 📚", category: "assignment", icon: "📚", desc: "Turned in all assignments before deadline", awardedAt: "2026-08-22", awardedBy: "Prof. Sarah Jenkins" },
          { id: "b3", title: "100% Attendance Streak ⚡", category: "attendance", icon: "⚡", desc: "Maintained perfect attendance for 4 weeks", awardedAt: "2026-08-24", awardedBy: "System" },
          { id: "b4", title: "Top Scholar 🏅", category: "honor", icon: "🏅", desc: "Ranked #1 in CSE Department", awardedAt: "2026-08-26", awardedBy: "Dr. Priya Sharma" },
          { id: "b5", title: "Coding Wizard 🧙‍♂️", category: "faculty", icon: "🧙‍♂️", desc: "Awarded by Faculty for outstanding BST lab submission", awardedAt: "2026-08-27", awardedBy: "Prof. Sarah Jenkins" }
        ],
        achievements: [
          { id: "ach1", title: "Assignment Titan 📝", desc: "Submit 5 Coursework Assignments", current: 4, target: 5, rewardPts: 200, status: "in_progress", icon: "📝" },
          { id: "ach2", title: "Quiz Ninja 🥷", desc: "Score 85%+ in 4 Classroom Quizzes", current: 3, target: 4, rewardPts: 250, status: "in_progress", icon: "🥷" },
          { id: "ach3", title: "Attendance Legend 🏆", desc: "Maintain 90%+ Monthly Attendance", current: 1, target: 1, rewardPts: 300, status: "completed", icon: "🏆" },
          { id: "ach4", title: "AI Learning Explorer 🤖", desc: "Ask 10 Doubts on SmartLearn AI", current: 8, target: 10, rewardPts: 150, status: "in_progress", icon: "🤖" }
        ]
      };
      allGami.push(studentGami);
      SmartLearnStorage.set(STORAGE_KEYS.GAMIFICATION, allGami);
    }

    // 1. Metric Stat Cards
    const ptsEl = document.getElementById("reward-stat-points");
    if (ptsEl) ptsEl.innerText = `${studentGami.points || 0} PTS`;

    const lvlEl = document.getElementById("reward-stat-level");
    if (lvlEl) lvlEl.innerText = studentGami.level || "Level 1";

    const badgeCountEl = document.getElementById("reward-stat-badges-count");
    if (badgeCountEl) badgeCountEl.innerText = `${(studentGami.badges || []).length} Badges`;

    // Rank calculation
    const sorted = [...allGami].sort((a, b) => (b.points || 0) - (a.points || 0));
    const rankIdx = sorted.findIndex(s => s.studentId === user.id || s.studentId === user.studentId);
    const rank = rankIdx >= 0 ? rankIdx + 1 : 1;
    const rankEl = document.getElementById("reward-stat-rank");
    if (rankEl) rankEl.innerText = `#${rank} in ${user.className || 'Class'}`;

    // 2. Badges Showcase Grid
    const badgesBox = document.getElementById("reward-badges-container");
    if (badgesBox) {
      const badges = studentGami.badges || [];
      if (badges.length === 0) {
        badgesBox.innerHTML = `<div class="empty-state-text" style="padding:1rem;">No badges earned yet. Complete assignments, quizzes, and maintain attendance to unlock badges!</div>`;
      } else {
        badgesBox.innerHTML = badges.map(b => `
          <div style="background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:12px; padding:1rem; display:flex; gap:0.75rem; align-items:center;">
            <div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, #4f46e5, #8b5cf6); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">
              ${b.icon || '🏆'}
            </div>
            <div>
              <div class="font-bold text-sm" style="color:var(--text-main);">${b.title || b.name}</div>
              <div class="text-xs text-muted" style="margin-top:0.15rem;">${b.desc || 'Awarded for academic performance'}</div>
              <div class="text-xs text-primary" style="margin-top:0.25rem; font-weight:600;">Granted by: ${b.awardedBy || 'Faculty'}</div>
            </div>
          </div>
        `).join("");
      }
    }

    // 3. Achievements Milestones Tracker
    const achBox = document.getElementById("reward-achievements-container");
    if (achBox) {
      const achievements = studentGami.achievements || [];
      achBox.innerHTML = achievements.map(a => {
        const pct = Math.min(100, Math.round((a.current / a.target) * 100));
        const isDone = pct >= 100 || a.status === "completed";
        return `
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:1rem; display:flex; flex-direction:column; gap:0.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-size:1.25rem;">${a.icon || '🎯'}</span>
                <div>
                  <div class="font-bold text-sm" style="color:var(--text-main);">${a.title}</div>
                  <div class="text-xs text-muted">${a.desc}</div>
                </div>
              </div>
              <span class="badge ${isDone ? 'badge-success' : 'badge-primary'}">${isDone ? '🏆 Completed' : `+${a.rewardPts} PTS`}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600; color:var(--text-muted);">
              <span>Progress: ${a.current}/${a.target}</span>
              <span>${pct}%</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width:${pct}%; background:${isDone ? 'var(--success)' : 'var(--primary)'};"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // 4. Leaderboard Table
    const lbBox = document.getElementById("reward-leaderboard-container");
    if (lbBox) {
      lbBox.innerHTML = `
        <table class="data-table" style="width:100%;">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student Name</th>
              <th>Class & Sec</th>
              <th>Badges</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map((s, i) => {
              const isCurr = s.studentId === user.id || s.studentId === user.studentId;
              let rankBadge = `<span class="badge" style="background:var(--bg-subtle); color:var(--text-main);">#${i + 1}</span>`;
              if (i === 0) rankBadge = `<span class="badge badge-warning" style="font-size:0.85rem;">🥇 1st Place</span>`;
              else if (i === 1) rankBadge = `<span class="badge badge-info" style="font-size:0.85rem;">🥈 2nd Place</span>`;
              else if (i === 2) rankBadge = `<span class="badge badge-primary" style="font-size:0.85rem;">🥉 3rd Place</span>`;

              return `
                <tr style="${isCurr ? 'background: rgba(79, 70, 229, 0.08); font-weight:700;' : ''}">
                  <td>${rankBadge}</td>
                  <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <div style="width:30px; height:30px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">
                        ${(s.studentName || 'S').charAt(0)}
                      </div>
                      <span>${s.studentName || 'Student'} ${isCurr ? '(You)' : ''}</span>
                    </div>
                  </td>
                  <td>${s.className || 'B.Tech CSE'} - Sec ${s.section || 'A'}</td>
                  <td><span class="badge badge-outline">${(s.badges || []).length} Badges</span></td>
                  <td><span class="text-primary font-bold" style="font-size:0.95rem;">${s.points || 0} PTS</span></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `;
    }

    // 5. Points History Log
    const historyBox = document.getElementById("reward-history-log-container");
    if (historyBox) {
      const logs = SmartLearnStorage.get(STORAGE_KEYS.REWARDS_LOG) || [];
      const studentLogs = logs.filter(l => l.studentId === user.id || l.studentId === user.studentId || l.studentId === "usr_student_01");

      if (studentLogs.length === 0) {
        historyBox.innerHTML = `<div class="empty-state-text" style="padding:1rem;">No points transactions recorded yet.</div>`;
      } else {
        historyBox.innerHTML = studentLogs.map(l => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.65rem 0; border-bottom:1px solid var(--border-color);">
            <div>
              <div class="font-bold text-sm" style="color:var(--text-main);">${l.title}</div>
              <div class="text-xs text-muted">${l.reason || 'Academic Activity'} • ${l.timestamp ? new Date(l.timestamp).toLocaleDateString() : 'Recent'}</div>
            </div>
            <span class="badge badge-success" style="font-size:0.85rem;">+${l.points} PTS</span>
          </div>
        `).join("");
      }
    }
  },

  // TEACHER DASHBOARD GAMIFICATION CONTROLLER
  initTeacherGamification() {
    const container = document.getElementById("teacher-gamification-roster-container");
    if (!container) return;

    const teacher = SmartLearnAuth.getCurrentUser();
    if (!teacher) return;

    const allUsers = SmartLearnAuth.getUsers();
    let enrolledStudents = allUsers.filter(u => (u.role || "").toLowerCase() === "student");

    const allGami = SmartLearnStorage.get(STORAGE_KEYS.GAMIFICATION) || [];

    container.innerHTML = `
      <table class="data-table" style="width:100%;">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Program & Sec</th>
            <th>Current Points</th>
            <th>Badges Earned</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${enrolledStudents.map(st => {
            const g = allGami.find(record => record.studentId === st.id || record.studentId === st.studentId) || {
              points: 1100,
              level: "Level 3 - Apprentice",
              badges: []
            };

            return `
              <tr>
                <td>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <img src="${st.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + st.id}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                    <div>
                      <div class="font-bold text-sm">${st.fullName || st.name}</div>
                      <div class="text-xs text-muted">ID: ${st.studentId || st.id}</div>
                    </div>
                  </div>
                </td>
                <td>${st.className || st.department || 'B.Tech CSE'} - Sec ${st.section || 'A'}</td>
                <td><span class="badge badge-primary font-bold">${g.points || 0} PTS</span></td>
                <td><span class="badge badge-success">${(g.badges || []).length} Badges</span></td>
                <td><span class="text-xs text-muted font-bold">${g.level || 'Level 3'}</span></td>
                <td>
                  <button class="btn btn-primary btn-xs" onclick="SmartLearnRewards.openTeacherAwardModal('${st.id}')">
                    🎁 Award Points & Badge
                  </button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  },

  openTeacherAwardModal(studentId) {
    const users = SmartLearnAuth.getUsers();
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    const modalIdInp = document.getElementById("taward-student-id");
    if (modalIdInp) modalIdInp.value = student.id;

    const titleEl = document.getElementById("taward-modal-title");
    if (titleEl) titleEl.innerText = `Award Points & Badge: ${student.fullName || student.name}`;

    SmartLearnApp.openModal("teacher-award-modal");
  },

  saveTeacherAward(e) {
    if (e && e.preventDefault) e.preventDefault();

    const studentId = document.getElementById("taward-student-id")?.value;
    const ptsToAdd = parseInt(document.getElementById("taward-points")?.value || "100", 10);
    const badgePreset = document.getElementById("taward-badge-select")?.value || "Coding Wizard 🧙‍♂️";
    const customBadge = document.getElementById("taward-custom-badge")?.value.trim();
    const note = document.getElementById("taward-note")?.value.trim() || "Awarded for exceptional classroom performance";

    const users = SmartLearnAuth.getUsers();
    const student = users.find(u => u.id === studentId);

    const badgeTitle = customBadge || badgePreset;

    // Update Gamification Record
    const allGami = SmartLearnStorage.get(STORAGE_KEYS.GAMIFICATION) || [];
    let gRecord = allGami.find(g => g.studentId === studentId || g.studentId === (student ? student.studentId : ""));

    if (!gRecord && student) {
      gRecord = {
        studentId: student.id,
        studentName: student.fullName || student.name,
        className: student.className || "B.Tech CSE",
        section: student.section || "A",
        points: 1000,
        level: "Level 3 - Apprentice",
        badges: [],
        achievements: []
      };
      allGami.push(gRecord);
    }

    if (gRecord) {
      gRecord.points = (gRecord.points || 0) + ptsToAdd;
      if (!gRecord.badges) gRecord.badges = [];

      const newBadge = {
        id: "b_" + Date.now(),
        title: badgeTitle,
        category: "faculty",
        icon: badgeTitle.match(/\p{Extended_Pictographic}/u) ? badgeTitle.match(/\p{Extended_Pictographic}/u)[0] : "🌟",
        desc: note,
        awardedAt: new Date().toISOString().split("T")[0],
        awardedBy: SmartLearnAuth.getCurrentUser() ? SmartLearnAuth.getCurrentUser().name || "Faculty Instructor" : "Faculty Instructor"
      };

      gRecord.badges.push(newBadge);
      SmartLearnStorage.set(STORAGE_KEYS.GAMIFICATION, allGami);
    }

    // Add to Rewards Log
    const logs = SmartLearnStorage.get(STORAGE_KEYS.REWARDS_LOG) || [];
    logs.unshift({
      id: "rw_" + Date.now(),
      studentId: studentId,
      points: ptsToAdd,
      type: "faculty",
      title: `Faculty Award: +${ptsToAdd} PTS & ${badgeTitle}`,
      reason: note,
      timestamp: new Date().toISOString()
    });
    SmartLearnStorage.set(STORAGE_KEYS.REWARDS_LOG, logs);

    // Send Notification to Student
    const notifications = SmartLearnStorage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    notifications.unshift({
      id: "notif_" + Date.now(),
      userId: studentId,
      title: `🎉 You Earned ${ptsToAdd} PTS & '${badgeTitle}' Badge!`,
      message: `${note}. Check out your position on the class leaderboard!`,
      category: "rewards",
      read: false,
      timestamp: new Date().toISOString()
    });
    SmartLearnStorage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);

    SmartLearnApp.showToast(`🎉 Awarded +${ptsToAdd} PTS & '${badgeTitle}' badge to ${student ? student.name : 'Student'}!`, "success");
    SmartLearnApp.closeModal("teacher-award-modal");
    this.initTeacherGamification();
  }
};
window.SmartLearnRewards = SmartLearnRewards;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof SmartLearnApp !== "undefined" && SmartLearnApp.init) {
    try { SmartLearnApp.init(); } catch (e) { console.warn("App init warning:", e); }
  }
  if (typeof SmartLearnRewards !== "undefined") {
    if (document.getElementById("reward-stat-points")) {
      try { SmartLearnRewards.initStudentRewards(); } catch (e) {}
    }
    if (document.getElementById("teacher-gamification-roster-container")) {
      try { SmartLearnRewards.initTeacherGamification(); } catch (e) {}
    }
  }
  if (typeof SmartLearnAdmin !== "undefined" && document.getElementById("admin-pending-teachers-list")) {
    try { SmartLearnAdmin.init(); } catch (e) { console.warn("Admin init warning:", e); }
  }
  if (typeof SmartLearnTeacherTimetable !== "undefined" && document.getElementById("teacher-section-select")) {
    try { SmartLearnTeacherTimetable.init(); } catch (e) { console.warn("Teacher Timetable init warning:", e); }
  }
  if (typeof SmartLearnStudentTimetable !== "undefined" && document.getElementById("schedule-cards-container")) {
    try { SmartLearnStudentTimetable.init(); } catch (e) { console.warn("Student Timetable init warning:", e); }
  }
  if (typeof SmartLearnTeacherExamTimetable !== "undefined") {
    try { SmartLearnTeacherExamTimetable.init(); } catch (e) { console.warn("Teacher Exam Timetable init warning:", e); }
  }
  if (typeof SmartLearnStudentExamTimetable !== "undefined") {
    try { SmartLearnStudentExamTimetable.init(); } catch (e) { console.warn("Student Exam Timetable init warning:", e); }
  }
  if (typeof SmartLearnTeacherStudents !== "undefined" && (document.getElementById("teacher-students-roster-container") || document.getElementById("tstudent-search-input"))) {
    try { SmartLearnTeacherStudents.init(); } catch (e) { console.warn("Teacher Students init warning:", e); }
  }

  // Register PWA & APK Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('SmartLearn PWA Service Worker registered:', reg.scope);
      }).catch(err => {
        console.log('SW registration note:', err);
      });
    });
  }
});

