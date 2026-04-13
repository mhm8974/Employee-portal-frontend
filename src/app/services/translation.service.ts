import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Record<string, Record<string, string>> = {
    'hi': {
      // Sidebar & Header
      'Main Menu': 'मुख्य मेनू',
      'Home': 'मुख्य पृष्ठ',
      'Employee Profile': 'कर्मचारी प्रोफ़ाइल',
      'Payslip & Payroll': 'वेतन पर्ची और पेरोल',
      'Payslip': 'वेतन पर्ची',
      'Leaves & Time Off': 'छुट्टियाँ और समय',
      'SYSTEM': 'सिस्टम',
      'Settings': 'सेटिंग्स',
      'Account Settings': 'खाता सेटिंग्स',
      'Help Center': 'सहयोग केंद्र',
      'Logout': 'लॉग आउट',
      'Search services, employees, or documents...': 'सेवाओं, कर्मचारियों या दस्तावेज़ों को खोजें...',
      
      // Settings Page Headers
      'Manage your account preferences': 'अपनी खाता प्राथमिकताएं प्रबंधित करें',
      'Account & Security': 'खाता और सुरक्षा',
      'Notification Preferences': 'सूचना प्राथमिकताएं',
      'Display & Interface': 'प्रदर्शन और इंटरफ़ेस',
      'Privacy': 'गोपनीयता',

      // Settings Items
      'Change Password': 'पासवर्ड बदलें',
      'Update your login credentials': 'अपने लॉगिन क्रेडेंशियल अपडेट करें',
      'Two-Factor Authentication (2FA)': 'दो-चरण प्रमाणीकरण (2FA)',
      'Protect your account with an extra layer of security': 'अतिरिक्त सुरक्षा परत के साथ अपने खाते को सुरक्षित करें',
      'Active Sessions': 'सक्रिय सत्र',
      'Manage devices currently logged into your account': 'वर्तमान में लॉग इन उपकरणों का प्रबंधन करें',
      'Log Out All Devices': 'सभी उपकरणों से लॉग आउट करें',
      'Payslip Alerts': 'वेतन पर्ची अलर्ट',
      'Get notified when a new payslip is generated': 'नई वेतन पर्ची उत्पन्न होने पर अधिसूचना प्राप्त करें',
      'Leave Status': 'छुट्टी की स्थिति',
      'Notifications when leave is approved or rejected': 'छुट्टी के स्वीकृत या अस्वीकृत होने पर सूचनाएं',
      'System Announcements': 'सिस्टम घोषणाएं',
      'Company-wide news and updates': 'कंपनी-व्यापी समाचार और अपडेट',
      'Dark Mode': 'डार्क मोड',
      'Switch to a darker color theme': 'गहरे रंग की थीम पर स्विच करें',
      'Compact View': 'कॉम्पैक्ट लेआउट',
      'Reduce spacing for denser data display': 'सघन डेटा प्रदर्शन के लिए रिक्ति कम करें',
      'Language & Region': 'भाषा और क्षेत्र',
      'Choose your preferred portal language': 'अपनी पसंदीदा पोर्टल भाषा चुनें',
      'Show Phone in Directory': 'निर्देशिका में फोन दिखाएं',
      'Allow colleagues to see your phone number': 'सहयोगियों को अपना फोन नंबर देखने दें',
      'Show Email in Directory': 'निर्देशिका में ईमेल दिखाएं',
      'Allow colleagues to see your email address': 'सहयोगियों को अपना ईमेल पता देखने दें',
      'Cancel': 'रद्द करें',
      'Change': 'बदलें',
      'Update Password': 'पासवर्ड अपडेट करें',
      'Current Password': 'वर्तमान पासवर्ड',
      'New Password': 'नया पासवर्ड',
      'Confirm Password': 'पासवर्ड की पुष्टि करें',
      'Enter current password': 'वर्तमान पासवर्ड दर्ज करें',
      'Enter new password': 'नया पासवर्ड दर्ज करें',
      'Confirm new password': 'नये पासवर्ड की पुष्टि करें',

      // Leaves Page
      'Manage your leave applications and track your balances': 'अपने अवकाश आवेदनों का प्रबंधन करें और शेष राशि ट्रैक करें',
      'Apply for Leave': 'छुट्टी के लिए आवेदन करें',
      'Days Left': 'दिन शेष',
      'New Leave Application': 'नया अवकाश आवेदन',
      'Leave Type': 'अवकाश का प्रकार',
      'Start Date': 'आरंभिक तिथि',
      'End Date': 'अंतिम तिथि',
      'Reason for Leave': 'छुट्टी का कारण',
      'Explain your reason briefly...': 'संक्षेप में अपना कारण बताएं...',
      'Submit Application': 'आवेदन जमा करें',
      'Sick Leave': 'बीमारी की छुट्टी',
      'Casual Leave': 'कैज़ुअल लीव',
      'Earned Leave': 'अर्जित अवकाश',

      // Profile Page
      'Active Employee': 'सक्रिय कर्मचारी',
      'Personal Information': 'व्यक्तिगत जानकारी',
      'Full Name': 'पूरा नाम',
      'Date of Birth': 'जन्म तिथि',
      'Gender': 'लिंग',
      'Contact Number': 'संपर्क नंबर',
      'Email Address': 'ईमेल पता',
      'Employment Details': 'रोजगार विवरण',
      'Designation': 'पदनाम',
      'Section / Department': 'अनुभाग / विभाग',
      'CPF Number': 'सीपीएफ नंबर',
      'Appointment Order Date': 'नियुक्ति आदेश तिथि',
      'Date of Retirement': 'सेवानिवृत्ति की तिथि',
      'Work Location': 'कार्य स्थान',

      // Home Page
      'IFMS Sikkim': 'आईएफएमएस सिक्किम',
      'Integrated Financial': 'एकीकृत वित्तीय',
      'Management System': 'प्रबंधन प्रणाली',
      'Empowering the Government of Sikkim with a Unified, Transparent, and Efficient Financial Ecosystem.': 'एकजुट, पारदर्शी और कुशल वित्तीय पारिस्थितिकी तंत्र के साथ सिक्किम सरकार को सशक्त बनाना।',
      'What is Pranali?': 'प्रणाली क्या है?',
      'Pranali is a state-of-the-art ': 'प्रणाली एक अत्याधुनिक ',
      ' developed for the Government of Sikkim. It serves as a single source of truth for all financial transactions, budgeting, and employee records.': ' है जो सिक्किम सरकार के लिए विकसित की गई है। यह सभी वित्तीय लेनदेन, बजटिंग और कर्मचारी रिकॉर्ड के लिए सत्य के एकल स्रोत के रूप में कार्य करती है।',
      'Core Objectives': 'मुख्य उद्देश्य',
      'Designed to enhance ': ' को बढ़ाने के लिए डिज़ाइन किया गया। ',
      ' and ': ' और ',
      ' in government spending. Pranali automates complex financial workflows, reducing manual errors and ensuring real-time auditing.': ' में। प्रणाली जटिल वित्तीय कार्यप्रवाहों को स्वचालित करती है, मैन्युअल त्रुटियों को कम करती है और रीयल-टाइम ऑडिटिंग सुनिश्चित करती है।',
      'Employee Empowerment': 'कर्मचारी सशक्तिकरण',
      'Through this portal, employees can access digital services such as ': 'इस पोर्टल के माध्यम से, कर्मचारी ऐसी डिजिटल सेवाओं तक पहुंच सकते हैं जैसे ',
      ' generation, ': ' जनरेशन, ',
      ' management, and ': ' प्रबंधन, और ',
      ' updates with unprecedented ease.': ' अभूतपूर्व आसानी के साथ अपडेट।',
      'Driving Digital Transformation': 'डिजिटल परिवर्तन को गति देना',
      'Pranali is more than just a software; it\'s a commitment to a ': 'प्रणाली केवल एक सॉफ्टवेयर नहीं है; यह ',
      '. By digitizing the treasury and financial processes, we are building a more responsive and resilient governance model.': ' के लिए एक प्रतिबद्धता है। राजकोष और वित्तीय प्रक्रियाओं का डिजिटलीकरण करके, हम एक अधिक उत्तरदायी और लचीला शासन मॉडल बना रहे हैं।',
      'Integrated Financial Management System (IFMS)': 'एकीकृत वित्तीय प्रबंधन प्रणाली (IFMS)',
      'transparency': 'पारदर्शिता',
      'accountability': 'जवाबदेही',
      'Leave': 'अवकाश',
      'Personal Profile': 'व्यक्तिगत प्रोफ़ाइल',
      'Digital Sikkim': 'डिजिटल सिक्किम',

      // Help Center
      'How can we help you today?': 'आज हम आपकी कैसे मदद कर सकते हैं?',
      'Knowledge Base': 'ज्ञान का आधार',
      'Common Questions': 'सामान्य प्रश्न',
      'View All': 'सभी देखें',
      'View Articles →': 'लेख देखें →'
    }
  };

  constructor() {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      this.currentLanguageSubject.next(savedLang);
    }
  }

  setLanguage(lang: string) {
    if (lang === 'hi' || lang === 'en' || lang === 'en-gb') {
      localStorage.setItem('language', lang);
      this.currentLanguageSubject.next(lang);
    }
  }

  get currentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  translate(key: string): string {
    const lang = this.currentLanguageSubject.value;
    if (lang === 'hi' && this.translations['hi'][key]) {
      return this.translations['hi'][key];
    }
    return key;
  }
}
