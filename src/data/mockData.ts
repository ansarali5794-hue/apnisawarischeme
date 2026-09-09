import { VehicleProject, UserActiveProject, PaymentRecord, WinnerRecord, UserProfile, BankAccountDetail } from '../types';

export const DEFAULT_BANK_ACCOUNTS: BankAccountDetail[] = [
  {
    id: 'bank-1',
    methodType: 'easypaisa',
    title: 'EasyPaisa Account',
    accountTitle: 'Apni Sawari Scheme',
    accountNumber: '0300 2344076',
    instructions: 'EasyPaisa app se payment transfer karke Transaction ID aur receipt upload karein.',
    isActive: true
  },
  {
    id: 'bank-2',
    methodType: 'jazzcash',
    title: 'JazzCash Account',
    accountTitle: 'Apni Sawari Scheme',
    accountNumber: '0300 7062190',
    instructions: 'JazzCash app ya shop se payment transfer karein aur TRX ID darj karein.',
    isActive: true
  },
  {
    id: 'bank-3',
    methodType: 'bank',
    title: 'Meezan Bank Ltd',
    bankName: 'Meezan Bank Ltd',
    accountTitle: 'Apni Sawari Scheme Official',
    accountNumber: '0201-0108928371',
    branchOrIban: 'PK36MEZN0002010108928371',
    instructions: 'Online bank transfer ya counter deposit slip ki tasweer zaroor attach karein.',
    isActive: true
  },
  {
    id: 'bank-4',
    methodType: 'cash',
    title: 'Head Office Cash Counter',
    accountTitle: 'Authorized Cash Desk',
    accountNumber: 'Official Receipt Counter',
    instructions: 'Head office par naqd adaigi karke official receipt number darj karein.',
    isActive: true
  }
];

export const VEHICLE_PROJECTS: VehicleProject[] = [
  {
    id: 'honda-cd70-36m',
    title: 'HONDA CD70',
    subtitle: '36 Month Committee Plan',
    category: 'committee',
    vehicleType: 'bike',
    durationMonths: 36,
    monthlyKist: 5000,
    totalMembers: 200,
    monthlyDrawPrize: '1 Brand New Honda CD 70 Bike Monthly',
    qurstandaziBenefit: 'Naam Aane Par Agli Tamam Qistain MAAF!',
    nonWinnersRefundText: 'Non-winner ko 36 months ke baad Honda CD 70 bike ki full payment return ki jaye gi',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7oU0pLBFi8AOstO5UPuFwH2Pis-SH5Ucl1wKiCIEkFtbnWQ3v4ExLAm-AGMYL4C58_siamXki7Ox4jazk4dymoX3abKLhDXb5YxUyEfXynspNPksr-cdiaPPxalkYYFaK5Tp7GxdXaI7ZhqagM5s64dIwJv_ZODE0tsDFdS-3GvcbM3F5ZpixGYA4Luapi-5MEy0Khj65byociQlbQCIvc1gO_0rm1Nmdt8SNJ0bsJDnpdK7yYK6N',
    statusBadge: 'OPEN',
    startDate: '2026-06-01',
    description: '36-month Honda CD70 committee scheme. Monthly installment is PKR 5,000. Every month 1 lucky winner receives a brand new Honda CD 70 with remaining installments waived. Non-winners get 100% full payment refund after 36 months.',
    specs: {
      engine: '70cc 4-Stroke OHC Air-Cooled',
      mileage: '60+ km/L',
      warranty: '3 Years Official Atlas Honda Warranty',
      colorOptions: ['Red', 'Black']
    }
  },
  {
    id: 'suzuki-alto-660',
    title: 'SUZUKI ALTO 660cc',
    subtitle: '06-Months Lucky Draw Project',
    category: 'luckydraw',
    vehicleType: 'car',
    durationMonths: 6,
    tokenPrice: 5000,
    totalMembers: 150,
    monthlyDrawPrize: 'Suzuki Alto VXR Brand New',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhg45l2uhEFeMOR0zc2bE9jSPs2vzWvXhyHJmI8Gazztmdz23YAVBNFStFaJyU0Rth1OF-Y9enRcfCj8Rkgy5-jRhC3jTQ9vgko5XhxUM_Jt0jqJDoslUIT9MsvX-pGqGpOHVI6sVVgDQ3zgvedS-FDfCIUKxk5WYzNbq-wpbicyViHbZsZNxWF9iHsZVuihMtB1mlmCTzpn2SMYTWZ_-EUTJjP_GOZD31NK64DScPvUk8EfuQaJtp',
    statusBadge: 'OPEN',
    description: 'Suzuki Alto 660cc 6-month lucky draw scheme. Token price is PKR 5,000 per entry with 100% transparent digital balloting.',
    specs: {
      engine: '660cc R06A DOHC Engine',
      mileage: '20-22 km/L',
      warranty: '3 Years / 60,000 KM Pak Suzuki Warranty',
      colorOptions: ['Solid White', 'Silky Silver', 'Pearl Black']
    }
  },
  {
    id: 'suzuki-cultus',
    title: 'SUZUKI CULTUS',
    subtitle: '06-Months Lucky Draw Project',
    category: 'luckydraw',
    vehicleType: 'car',
    durationMonths: 6,
    tokenPrice: 5000,
    totalMembers: 150,
    monthlyDrawPrize: 'Suzuki Cultus VXL',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTWzp1fn3P8oBOF11kd51wD1UNdI-2eh5gXPmyv7ET5emaRBFOr6XIu8hGC9MwtQb7lw-0aTqgnUM4lHgP7RduaiU6or-iZXyruoMwCLYH0G-PjVfKAd-skopgfGGLHxfkUoSMxf6pGJntacZFi8xMVj2dFYjtr-yCMDf2ryNV1XEdZDmNiCbPpkeZiCM_OTSnUmvsyHMHTFIoT73VuekgiaRgWnhULh2sbH33L3bYizH8u7jzPXJh',
    statusBadge: 'FEW LEFT',
    description: 'Suzuki Cultus VXL 1000cc family car lucky draw project with dual airbags, ABS, and power steering.',
    specs: {
      engine: '1000cc K10B Engine',
      mileage: '18-20 km/L',
      warranty: '3 Years Pak Suzuki Warranty',
      colorOptions: ['Silky Silver', 'Graphite Grey', 'Super Pearl White']
    }
  },
  {
    id: 'suzuki-wagon-r',
    title: 'SUZUKI WAGON R',
    subtitle: '06-Months Lucky Draw Project',
    category: 'luckydraw',
    vehicleType: 'car',
    durationMonths: 6,
    tokenPrice: 5000,
    totalMembers: 150,
    monthlyDrawPrize: 'Suzuki Wagon R VXL',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaBvr3wr5utDt7qGf-3keWfvcj0I0BrBHDiPxm30A-IZjtMXsX-rMymtgFJh3n0HGu8i12NCMqQdEyDO42LfJ670mPxA6tEpXSfXsQ148y1pt1GjKsXq9hi5UDcVgq6VKrn-lJcPzOJUIdVoZe5sV6aeje1HjOYyNyLeGk6lwXDIg8yY_0QaOOsPU8Au4s7n3Zj6I7CMFUhWGp4BiMldKpup2XiVE-3_sjx3vVAfAVN8jveXLnO1DB',
    statusBadge: 'OPEN',
    description: 'Tall-boy spacious family car offering maximum cabin space, powerful AC, and modern utility.',
    specs: {
      engine: '1000cc K-Series K10B',
      mileage: '18-21 km/L',
      warranty: '3 Years Pak Suzuki Warranty',
      colorOptions: ['Solid White', 'Silky Silver', 'Sand Beige']
    }
  },
  {
    id: 'electric-bike-ev',
    title: 'ELECTRIC BIKE (EV)',
    subtitle: '06-Months Lucky Draw Project',
    category: 'luckydraw',
    vehicleType: 'ev',
    durationMonths: 6,
    tokenPrice: 1000,
    totalMembers: 300,
    monthlyDrawPrize: 'Electric Scooter EV 1200W',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf0D2UZj2blMxUxMbKGl31MXvlKMuZQrySBZxxN63R_Vn9zmIv6ZGG-0PhZCCF2IiyTJh5wtUhzddr9PSa0pI6whBC4W7rvWVofFjIb008OE700knVEq1OWsJvqV9rWzbLwtvwVka4WvMH_qqjavgoqOOqMWmrTwK6P1z_leTc-fMmH8gwfygSiIrDdIY6SftQXZTNEs5oUszqKMrzePGxqlbZtRIf2vP5O275HlZzT2faw_crdpNZ',
    statusBadge: 'OPEN',
    description: 'Eco-friendly electric bike with zero fuel expenses and fast-charging long life battery.',
    specs: {
      engine: '1200W Brushless Motor',
      mileage: '75-80 km per charge',
      warranty: '2 Years Battery & Motor Warranty',
      colorOptions: ['Teal Green', 'Deep Blue', 'Matte Grey']
    }
  }
];

// Clean empty initial user
export const INITIAL_USER: UserProfile = {
  uid: '',
  id: '',
  name: '',
  full_name: '',
  memberId: '',
  email: '',
  phoneNumber: '',
  cnic: '',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  isLoggedIn: false,
  role: 'customer',
  account_status: 'active',
  terms_accepted: false,
  activeTokensCount: 0,
  totalPaidAmount: 0
};

export const MOCK_USER = INITIAL_USER;

// Clean empty initial data for fresh real testing
export const USER_ACTIVE_PROJECTS: UserActiveProject[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const MOCK_PAYMENT_RECORDS = INITIAL_PAYMENTS;
export const WINNERS_LIST: WinnerRecord[] = [];

export const EXACT_TERMS_SECTIONS = [
  {
    number: '1',
    title: 'پاس ورڈ کی حفاظت',
    paragraphs: [
      'تمام ممبران سے گزارش ہے کہ اپنا پاس ورڈ کسی بھی شخص کے ساتھ شیئر نہ کریں۔ اپنے اکاؤنٹ کی حفاظت کی ذمہ داری خود ممبر کی ہوگی۔'
    ]
  },
  {
    number: '2',
    title: 'ماہانہ اقساط',
    paragraphs: [
      'تمام ممبران اپنی ماہانہ قسط یا ٹوکن کی رقم صرف APNI SAWARI SCHEME کی آفیشل ایپ کے ذریعے جمع کروائیں تاکہ ادائیگی کا ریکارڈ محفوظ اور شفاف رہے۔'
    ]
  },
  {
    number: '3',
    title: 'قرعہ اندازی اور ٹوکن نمبر',
    paragraphs: [
      'ہر ماہ ہونے والی قرعہ اندازی کی لائیو ویڈیو یا ریکارڈ شدہ ویڈیو ایپ کے ذریعے دستیاب کی جائے گی۔ ممبر اپنا ٹوکن نمبر اور قرعہ اندازی سے متعلق معلومات بھی ایپ میں دیکھ سکے گا۔'
    ]
  },
  {
    number: '4',
    title: 'مسلسل قسط ادا نہ کرنے کی صورت میں',
    paragraphs: [
      'اگر کوئی ممبر مسلسل 03 ماہ تک اپنی ماہانہ قسط جمع نہیں کرواتا تو کمپنی اس کا انتظار 03 ماہ تک کرے گی۔ اس کے بعد متعلقہ ممبر کی فعال ممبرشپ ختم کی جا سکتی ہے۔',
      'ایسی صورت میں متعلقہ ٹوکن نمبر کو کمپنی اپنی پالیسی اور منصوبے کے قواعد کے مطابق قرعہ اندازی میں جاری رکھ سکتی ہے۔',
      'ممبر کی جمع شدہ رقم، منصوبے کی شرائط اور پالیسی کے مطابق، اسکیم کی مدت مکمل ہونے کے بعد واپس کی جائے گی۔'
    ]
  },
  {
    number: '5',
    title: 'ایڈوانس موٹر بائیک',
    paragraphs: [
      'جو ممبران ایڈوانس موٹر بائیک حاصل کرنا چاہیں گے، انہیں 40,000 روپے ایڈوانس جمع کروانا ہوگا۔ ادائیگی اور متعلقہ شرائط مکمل ہونے کے بعد، منصوبے کی پالیسی کے مطابق اگلے ماہ موٹر بائیک فراہم کی جائے گی۔'
    ]
  },
  {
    number: '6',
    title: 'موٹر بائیک کی تقسیم',
    paragraphs: [
      'ایڈوانس موٹر بائیکس کمپنی کی مقررہ پالیسی، دستیابی اور انتظامی طریقہ کار کے مطابق فراہم کی جائیں گی۔',
      'اس معاملے میں کوئی بھی ممبر کمپنی پر کسی مخصوص موٹر بائیک یا فوری فراہمی کے لیے دباؤ یا زبردستی نہیں کرے گا۔'
    ]
  },
  {
    number: '7',
    title: 'شرائط کی پابندی',
    paragraphs: [
      'APNI SAWARI SCHEME میں شمولیت اختیار کرنے والا ہر ممبر ان شرائط و ضوابط پر عمل کرنے کا پابند ہوگا۔ کمپنی ضرورت کے مطابق پالیسی میں مناسب تبدیلی یا اپ ڈیٹ کر سکتی ہے۔'
    ]
  }
];

