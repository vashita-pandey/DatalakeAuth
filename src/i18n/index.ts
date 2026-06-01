import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App
      appName: 'PEHCHAN',
      appTagline: 'Personnel Entry & Human-resource Check-in through Hybrid AI Network',
      
      // Navigation
      home: 'Home',
      attendance: 'Attendance',
      employees: 'Employees',
      settings: 'Settings',
      
      // Home Screen
      todayAttendance: "Today's Attendance",
      pendingSync: 'Pending Sync',
      totalEmployees: 'Total Employees',
      markAttendance: 'Mark Attendance',
      recentActivity: 'Recent Activity',
      noActivity: 'No activity today',
      
      // Attendance Screen
      scanFace: 'Scan Face',
      identifying: 'Identifying...',
      authenticated: 'Authenticated',
      notRecognized: 'Not Recognized',
      livenessCheck: 'Liveness Check',
      positionFace: 'Position your face in the frame',
      alreadyMarked: 'Attendance already marked today',
      
      // Enroll Screen
      enrollEmployee: 'Enroll Employee',
      fullName: 'Full Name',
      employeeId: 'Employee ID',
      department: 'Department',
      designation: 'Designation',
      phoneNumber: 'Phone Number',
      captureFace: 'Capture Face',
      retake: 'Retake',
      saveEmployee: 'Save Employee',
      namePlaceholder: 'Enter full name',
      idPlaceholder: 'Enter employee ID',
      deptPlaceholder: 'Enter department',
      desgPlaceholder: 'Enter designation',
      phonePlaceholder: 'Enter phone number',
      
      // Employees Screen
      allEmployees: 'All Employees',
      searchEmployees: 'Search employees...',
      noEmployees: 'No employees enrolled yet',
      enrollFirst: 'Tap + to enroll your first employee',
      deleteEmployee: 'Delete Employee',
      deleteConfirm: 'Are you sure you want to delete this employee?',
      
      // Attendance Log
      attendanceLog: 'Attendance Log',
      selectDate: 'Select Date',
      noRecords: 'No records for this date',
      present: 'Present',
      exportCSV: 'Export CSV',
      
      // Settings
      language: 'Language',
      english: 'English',
      hindi: 'Hindi',
      syncNow: 'Sync Now',
      syncStatus: 'Sync Status',
      clearData: 'Clear All Data',
      clearConfirm: 'This will delete all data. Are you sure?',
      about: 'About',
      version: 'Version',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      ok: 'OK',
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
      online: 'ONLINE',
      offline: 'OFFLINE',
      synced: 'Synced',
      pending: 'Pending',
      confidence: 'Confidence',
      liveness: 'Liveness',
    },
  },
  hi: {
    translation: {
      // App
      appName: 'पहचान',
      appTagline: 'हाइब्रिड AI नेटवर्क के माध्यम से कर्मचारी प्रवेश और मानव संसाधन चेक-इन',
      
      // Navigation
      home: 'होम',
      attendance: 'उपस्थिति',
      employees: 'कर्मचारी',
      settings: 'सेटिंग्स',
      
      // Home Screen
      todayAttendance: 'आज की उपस्थिति',
      pendingSync: 'सिंक बाकी',
      totalEmployees: 'कुल कर्मचारी',
      markAttendance: 'उपस्थिति दर्ज करें',
      recentActivity: 'हाल की गतिविधि',
      noActivity: 'आज कोई गतिविधि नहीं',
      
      // Attendance Screen
      scanFace: 'चेहरा स्कैन करें',
      identifying: 'पहचान हो रही है...',
      authenticated: 'प्रमाणित',
      notRecognized: 'पहचाना नहीं गया',
      livenessCheck: 'जीवंतता जांच',
      positionFace: 'अपना चेहरा फ्रेम में रखें',
      alreadyMarked: 'आज की उपस्थिति पहले से दर्ज है',
      
      // Enroll Screen
      enrollEmployee: 'कर्मचारी नामांकन',
      fullName: 'पूरा नाम',
      employeeId: 'कर्मचारी आईडी',
      department: 'विभाग',
      designation: 'पदनाम',
      phoneNumber: 'फोन नंबर',
      captureFace: 'चेहरा कैप्चर करें',
      retake: 'दोबारा लें',
      saveEmployee: 'कर्मचारी सहेजें',
      namePlaceholder: 'पूरा नाम दर्ज करें',
      idPlaceholder: 'कर्मचारी आईडी दर्ज करें',
      deptPlaceholder: 'विभाग दर्ज करें',
      desgPlaceholder: 'पदनाम दर्ज करें',
      phonePlaceholder: 'फोन नंबर दर्ज करें',
      
      // Employees Screen
      allEmployees: 'सभी कर्मचारी',
      searchEmployees: 'कर्मचारी खोजें...',
      noEmployees: 'अभी तक कोई कर्मचारी नामांकित नहीं',
      enrollFirst: 'पहले कर्मचारी को नामांकित करने के लिए + दबाएं',
      deleteEmployee: 'कर्मचारी हटाएं',
      deleteConfirm: 'क्या आप वाकई इस कर्मचारी को हटाना चाहते हैं?',
      
      // Attendance Log
      attendanceLog: 'उपस्थिति लॉग',
      selectDate: 'तारीख चुनें',
      noRecords: 'इस तारीख के लिए कोई रिकॉर्ड नहीं',
      present: 'उपस्थित',
      exportCSV: 'CSV निर्यात करें',
      
      // Settings
      language: 'भाषा',
      english: 'अंग्रेज़ी',
      hindi: 'हिंदी',
      syncNow: 'अभी सिंक करें',
      syncStatus: 'सिंक स्थिति',
      clearData: 'सभी डेटा हटाएं',
      clearConfirm: 'यह सभी डेटा हटा देगा। क्या आप सुनिश्चित हैं?',
      about: 'के बारे में',
      version: 'संस्करण',
      
      // Common
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      back: 'वापस',
      ok: 'ठीक है',
      success: 'सफलता',
      error: 'त्रुटि',
      loading: 'लोड हो रहा है...',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      synced: 'सिंक हुआ',
      pending: 'बाकी',
      confidence: 'विश्वास',
      liveness: 'जीवंतता',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;