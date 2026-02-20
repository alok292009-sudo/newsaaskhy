
import { Language, BusinessType } from './types';

export const TRANSLATIONS = {
  [Language.ENGLISH]: {
    app_name: "SAAKSHY",
    tagline: "Trust, Memory, Truth.",
    
    // Landing Page
    landing_hero_title: "The Trust Memory Layer for Informal Commerce",
    landing_hero_desc: "SAAKSHY is the neutral, immutable infrastructure that remembers your business truth. We do not judge, we do not move money. We simply remember what was agreed.",
    landing_cta_start: "Start for Free",
    landing_cta_login: "Existing User? Sign In",
    landing_trust_1: "Immutable Records",
    landing_trust_1_desc: "Once confirmed, records are cryptographically locked forever.",
    landing_trust_2: "Neutral Witness",
    landing_trust_2_desc: "We favor no one. We are a digital mirror of your agreements.",
    landing_trust_3: "Bank-Grade Security",
    landing_trust_3_desc: "Your data is encrypted, redundant, and secure.",
    
    // Auth & Onboarding
    login_title: "Sign In to SAAKSHY",
    login_subtitle: "Secure, Immutable Trust Infrastructure",
    btn_google: "Continue with Google",
    btn_mobile: "Continue with Mobile",
    enter_mobile: "Enter Mobile Number",
    send_otp: "Send OTP",
    enter_otp: "Enter OTP",
    verify_otp: "Verify & Proceed",
    otp_sent: "OTP sent to",
    resend_otp: "Resend OTP",
    
    onboard_title: "Setup Business Profile",
    onboard_desc: "This identity will be permanently linked to your records.",
    label_name: "Your Full Name",
    label_biz_name: "Business Name",
    label_biz_type: "Business Type",
    label_city: "City",
    
    // Dashboard - Command Center
    cmd_overdue: "Overdue",
    cmd_pending: "Confirmations",
    cmd_due_today: "Due Today",
    
    // Dashboard - Actions
    act_create: "Create Record",
    act_confirm: "Confirm Pending",
    act_payment: "Add Payment",
    act_profile: "Trust Profile",
    
    // Dashboard - Sections
    sect_obligations: "Today's Obligations",
    sect_trust_snap: "Trust Snapshot",
    sect_activity: "Recent Activity",
    sect_partners: "Counterparty Intelligence",
    
    // Dashboard - Trust Signals
    trust_sig_1: "Records are permanently stored after confirmation",
    trust_sig_2: "Data shared only with consent",
    trust_sig_3: "SAAKSHY does not move money",
    
    // Metrics
    metric_ontime: "On-Time Rate",
    metric_delay: "Avg Delay",
    metric_active: "Active Partners",

    nav_dashboard: "Dashboard",
    nav_create: "New Record",
    nav_profile: "Trust Profile",
    nav_more: "More",

    // Create Record
    create_title: "Create Immutable Record",
    role_label: "I am the...",
    seller: "Seller (Lender/Provider)",
    buyer: "Buyer (Borrower/Receiver)",
    cp_name: "Counterparty Name",
    cp_mobile: "Counterparty Mobile",
    amount: "Amount (₹)",
    due_date: "Due Date",
    note: "Note (Optional)",
    warning_title: "Irreversible Action",
    warning_text: "Once both parties confirm, this record becomes permanent and cannot be changed. This is a digital witness.",
    submit_btn: "Create Secure Record",

    // Record Detail & Card
    status_pending: "Pending",
    status_confirmed: "Confirmed",
    status_disputed: "Disputed",
    status_settled: "Settled",
    history_log: "Event History (Immutable)",
    trust_score: "Trust Score",
    btn_remind: "Remind",
    
    // Trust Profile
    profile_title: "Trust Profile",
    ai_analysis_btn: "Generate AI Trust Summary",
    ai_disclaimer: "AI analysis is assistive only and does not constitute a credit score.",
    
    // Account Settings
    settings_title: "Account Settings",
    sect_personal: "Personal Info",
    sect_business: "Business Details",
    sect_prefs: "Notification Preferences",
    pref_whatsapp: "WhatsApp Alerts",
    pref_email: "Email Alerts",
    pref_reports: "Daily Summary Reports",
    btn_save: "Save Changes",
    saved_success: "Profile updated successfully",

    // Common
    loading: "Loading...",
    language: "Language",
    
    // Static Pages
    about_title: "About SAAKSHY",
    mission: "To preserve truth and trust in informal commerce.",
    what_we_do: "We act as a neutral, permanent witness.",
    what_we_dont: "We DO NOT lend money, move money, or enforce recovery.",
  },
  [Language.HINDI]: {
    app_name: "साक्षी",
    tagline: "विश्वास, स्मृति, सत्य।",

    // Landing
    landing_hero_title: "अनौपचारिक व्यापार के लिए विश्वास की परत",
    landing_hero_desc: "साक्षी एक निष्पक्ष, स्थायी बुनियादी ढांचा है जो आपके व्यावसायिक सत्य को याद रखता है। हम न्याय नहीं करते, हम पैसा नहीं ले जाते। हम बस वही याद रखते हैं जिस पर सहमति बनी थी।",
    landing_cta_start: "मुफ्त में शुरू करें",
    landing_cta_login: "लॉगिन करें",
    landing_trust_1: "अपरिवर्तनीय रिकॉर्ड",
    landing_trust_1_desc: "एक बार पुष्टि होने के बाद, रिकॉर्ड हमेशा के लिए लॉक हो जाते हैं।",
    landing_trust_2: "निष्पक्ष गवाह",
    landing_trust_2_desc: "हम किसी का पक्ष नहीं लेते। हम आपके समझौतों का डिजिटल दर्पण हैं।",
    landing_trust_3: "बैंक-स्तर की सुरक्षा",
    landing_trust_3_desc: "आपका डेटा एन्क्रिप्टेड और सुरक्षित है।",

    // Auth
    login_title: "साक्षी में लॉगिन करें",
    login_subtitle: "सुरक्षित, स्थायी विश्वास बुनियादी ढांचा",
    btn_google: "Google के साथ जारी रखें",
    btn_mobile: "मोबाइल के साथ जारी रखें",
    enter_mobile: "मोबाइल नंबर दर्ज करें",
    send_otp: "OTP भेजें",
    enter_otp: "OTP दर्ज करें",
    verify_otp: "सत्यापित करें और आगे बढ़ें",
    otp_sent: "OTP भेजा गया",
    resend_otp: "OTP पुनः भेजें",

    onboard_title: "व्यापार प्रोफाइल सेटअप",
    onboard_desc: "यह पहचान आपके रिकॉर्ड से स्थायी रूप से जुड़ी रहेगी।",
    label_name: "आपका पूरा नाम",
    label_biz_name: "व्यापार का नाम",
    label_biz_type: "व्यापार का प्रकार",
    label_city: "शहर",

    // Dashboard - Command Center
    cmd_overdue: "अदेय (Overdue)",
    cmd_pending: "पुष्टि बाकी",
    cmd_due_today: "आज देय",
    
    // Dashboard - Actions
    act_create: "नया रिकॉर्ड",
    act_confirm: "पुष्टि करें",
    act_payment: "भुगतान जोड़ें",
    act_profile: "प्रोफाइल देखें",
    
    // Dashboard - Sections
    sect_obligations: "आज के कार्य",
    sect_trust_snap: "विश्वास स्नैपशॉट",
    sect_activity: "हाल की गतिविधि",
    sect_partners: "पार्टनर इंटेलिजेंस",
    
    // Dashboard - Trust Signals
    trust_sig_1: "पुष्टि के बाद रिकॉर्ड स्थायी रूप से संग्रहीत होते हैं",
    trust_sig_2: "डेटा केवल सहमति से साझा किया जाता है",
    trust_sig_3: "साक्षी पैसा नहीं ले जाता है",

    // Metrics
    metric_ontime: "समय पर भुगतान",
    metric_delay: "औसत देरी",
    metric_active: "सक्रिय पार्टनर",

    nav_dashboard: "डैशबोर्ड",
    nav_create: "नया रिकॉर्ड",
    nav_profile: "विश्वास प्रोफाइल",
    nav_more: "अधिक",

    create_title: "अपरिवर्तनीय रिकॉर्ड बनाएं",
    role_label: "मैं हूँ...",
    seller: "विक्रेता (लेनदार)",
    buyer: "खरीदार (देनदार)",
    cp_name: "सामने वाले का नाम",
    cp_mobile: "मोबाइल नंबर",
    amount: "राशि (₹)",
    due_date: "देय तिथि",
    note: "टिप्पणी (वैकल्पिक)",
    warning_title: "अपरिवर्तनीय कार्रवाई",
    warning_text: "एक बार दोनों पक्षों की पुष्टि हो जाने के बाद, यह रिकॉर्ड स्थायी हो जाता है और इसे बदला नहीं जा सकता। यह एक डिजिटल गवाह है।",
    submit_btn: "सुरक्षित रिकॉर्ड बनाएं",

    status_pending: "पुष्टि लंबित",
    status_confirmed: "पुष्टि और स्थायी",
    status_disputed: "विवादित",
    status_settled: "निपटारा हुआ",
    history_log: "इतिहास (स्थायी)",
    trust_score: "विश्वास स्कोर",
    btn_remind: "रिमाइंडर भेजें",

    profile_title: "विश्वास प्रोफाइल",
    ai_analysis_btn: "AI विश्वास सारांश उत्पन्न करें",
    ai_disclaimer: "AI विश्लेषण केवल सहायता के लिए है और यह क्रेडिट स्कोर नहीं है।",

    // Account Settings
    settings_title: "खाता सेटिंग",
    sect_personal: "व्यक्तिगत जानकारी",
    sect_business: "व्यापार विवरण",
    sect_prefs: "अधिसूचना प्राथमिकताएं",
    pref_whatsapp: "व्हाट्सएप अलर्ट",
    pref_email: "ईमेल अलर्ट",
    pref_reports: "दैनिक सारांश रिपोर्ट",
    btn_save: "परिवर्तन सहेजें",
    saved_success: "प्रोफाइल सफलतापूर्वक अपडेट हो गया",

    loading: "लोड हो रहा है...",
    language: "भाषा",

    about_title: "साक्षी के बारे में",
    mission: "अनौपचारिक वाणिज्य में सत्य और विश्वास को संरक्षित करना।",
    what_we_do: "हम एक निष्पक्ष, स्थायी गवाह के रूप में कार्य करते हैं।",
    what_we_dont: "हम पैसा उधार नहीं देते, पैसा नहीं भेजते, और वसूली नहीं करते।",
  },
  [Language.HINGLISH]: {
    app_name: "SAAKSHY",
    tagline: "Trust ka memory layer.",

    // Landing
    landing_hero_title: "Business Trust ki Memory Layer",
    landing_hero_desc: "SAAKSHY ek neutral, permanent system hai jo aapke business sach ko yaad rakhta hai. Hum judge nahi karte, paise move nahi karte. Hum bas sach yaad rakhte hain.",
    landing_cta_start: "Shuru Karein",
    landing_cta_login: "Login Karein",
    landing_trust_1: "Permanent Records",
    landing_trust_1_desc: "Ek baar confirm ho gaya, toh record lock ho jata hai hamesha ke liye.",
    landing_trust_2: "Neutral Gawah",
    landing_trust_2_desc: "Hum kisi ki side nahi lete. Hum bas aapke agreement ka digital saboot hain.",
    landing_trust_3: "High Security",
    landing_trust_3_desc: "Aapka data fully encrypted aur safe hai.",

    // Auth
    login_title: "SAAKSHY mein Login karein",
    login_subtitle: "Secure aur Permanent Trust System",
    btn_google: "Google se continue karein",
    btn_mobile: "Mobile se continue karein",
    enter_mobile: "Mobile Number daalein",
    send_otp: "OTP bhejein",
    enter_otp: "OTP daalein",
    verify_otp: "Verify karke aage badhein",
    otp_sent: "OTP bhej diya gaya hai",
    resend_otp: "OTP wapas bhejein",

    onboard_title: "Business Profile Banayein",
    onboard_desc: "Ye identity aapke records ke saath hamesha ke liye jud jayegi.",
    label_name: "Aapka Pura Naam",
    label_biz_name: "Business ka Naam",
    label_biz_type: "Business Type",
    label_city: "City",

    // Dashboard - Command Center
    cmd_overdue: "Overdue (Late)",
    cmd_pending: "Confirmations",
    cmd_due_today: "Aaj Due Hai",
    
    // Dashboard - Actions
    act_create: "New Record",
    act_confirm: "Confirm Karein",
    act_payment: "Payment Add",
    act_profile: "Trust Profile",
    
    // Dashboard - Sections
    sect_obligations: "Aaj Ke Kaam",
    sect_trust_snap: "Trust Snapshot",
    sect_activity: "Recent Activity",
    sect_partners: "Counterparty Intelligence",
    
    // Dashboard - Trust Signals
    trust_sig_1: "Records permanent hain (delete nahi ho sakte)",
    trust_sig_2: "Data sirf aapki marzi se share hoga",
    trust_sig_3: "SAAKSHY paise move nahi karta",

    // Metrics
    metric_ontime: "On-Time Rate",
    metric_delay: "Avg Delay",
    metric_active: "Active Partners",

    nav_dashboard: "Dashboard",
    nav_create: "New Record",
    nav_profile: "Trust Profile",
    nav_more: "More",

    create_title: "Permanent Record Banaye",
    role_label: "Main hoon...",
    seller: "Seller (Lene wala)",
    buyer: "Buyer (Dene wala)",
    cp_name: "Party ka Naam",
    cp_mobile: "Party ka Mobile",
    amount: "Amount (₹)",
    due_date: "Due Date",
    note: "Note (Optional)",
    warning_title: "Permanent Action",
    warning_text: "Jab dono parties confirm kar lengi, ye record permanent ho jayega aur badla nahi ja sakega. Ye ek digital witness hai.",
    submit_btn: "Secure Record Submit Karein",

    status_pending: "Confirmation Pending",
    status_confirmed: "Confirmed (Fixed)",
    status_disputed: "Dispute Raised",
    status_settled: "Settled (Hisaab Clear)",
    history_log: "History (Change nahi ho sakti)",
    trust_score: "Trust Score",
    btn_remind: "Remind Karo",

    profile_title: "Trust Profile",
    ai_analysis_btn: "AI Trust Summary Dekhein",
    ai_disclaimer: "AI sirf help ke liye hai, ye koi credit score nahi hai.",

    // Account Settings
    settings_title: "Account Settings",
    sect_personal: "Personal Info",
    sect_business: "Business Details",
    sect_prefs: "Notification Preferences",
    pref_whatsapp: "WhatsApp Alerts",
    pref_email: "Email Alerts",
    pref_reports: "Daily Summary Reports",
    btn_save: "Changes Save Karein",
    saved_success: "Profile successfully update ho gaya",

    loading: "Loading...",
    language: "Bhasha",

    about_title: "SAAKSHY ke baare mein",
    mission: "Business mein trust aur sachai ko bachana.",
    what_we_do: "Hum ek neutral, permanent gawah hain.",
    what_we_dont: "Hum loan nahi dete, paise transfer nahi karte, aur wasooli nahi karte.",
  }
};

export const BUSINESS_TYPES = [
  { value: BusinessType.KIRANA, label: "Kirana / General Store" },
  { value: BusinessType.WHOLESALER, label: "Wholesaler / Distributor" },
  { value: BusinessType.TRANSPORT, label: "Transport / Logistics" },
  { value: BusinessType.CONSTRUCTION, label: "Construction / Materials" },
  { value: BusinessType.MANUFACTURING, label: "Manufacturing" },
  { value: BusinessType.OTHER, label: "Other" }
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Solan"],
  "Jharkhand": ["Jamshedpur", "Dhanbad", "Ranchi", "Bokaro", "Hazaribagh"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli-Dharwad", "Mangalore", "Belgaum", "Gulbarga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Dimapur", "Kohima"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"]
};
