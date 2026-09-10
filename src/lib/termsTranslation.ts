import { LanguageType } from './translations';
import { TermSection } from '../types';

/**
 * Standard Canonical 7 Terms & Conditions in Urdu, Sindhi, and English
 */
export const CANONICAL_TERMS: Record<string, Record<LanguageType, { title: string; paragraphs: string[] }>> = {
  '1': {
    ur: {
      title: 'پاس ورڈ کی حفاظت',
      paragraphs: [
        'تمام ممبران سے گزارش ہے کہ اپنا پاس ورڈ کسی بھی شخص کے ساتھ شیئر نہ کریں۔ اپنے اکاؤنٹ کی حفاظت کی ذمہ داری خود ممبر کی ہوگی۔'
      ]
    },
    sd: {
      title: 'پاس ورڊ جي حفاظت',
      paragraphs: [
        'سمورن ميمبرن کي گذارش آهي ته پنهنجو پاس ورڊ ڪنهن به شخص سان شيئر نه ڪن. پنهنجي اڪائونٽ جي حفاظت جي ذميواري پاڻ ميمبر تي هوندي.'
      ]
    },
    en: {
      title: 'Password Security & Account Protection',
      paragraphs: [
        'All members are strictly advised never to share their password with any individual. Account security and credential confidentiality remain the sole responsibility of the registered member.'
      ]
    }
  },
  '2': {
    ur: {
      title: 'ماہانہ اقساط',
      paragraphs: [
        'تمام ممبران اپنی ماہانہ قسط یا ٹوکن کی رقم صرف APNI SAWARI SCHEME کی آفیشل ایپ کے ذریعے جمع کروائیں تاکہ ادائیگی کا ریکارڈ محفوظ اور شفاف رہے۔'
      ]
    },
    sd: {
      title: 'ماهوار قسطون ۽ ادائيگي',
      paragraphs: [
        'سمورا ميمبر پنهنجي ماهوار قسط يا ٽوڪن جي رقم رڳو APNI SAWARI SCHEME جي سرڪاري ايپ ذريعي جمع ڪرائن ته جيئن ادائيگي جو رڪارڊ محفوظ ۽ شفاف رهي.'
      ]
    },
    en: {
      title: 'Monthly Installments & Token Payments',
      paragraphs: [
        'All members must submit their monthly installments and token payments exclusively through the official APNI SAWARI SCHEME portal to ensure transparent, automated, and tamper-proof financial verification.'
      ]
    }
  },
  '3': {
    ur: {
      title: 'قرعہ اندازی اور ٹوکن نمبر',
      paragraphs: [
        'ہر ماہ ہونے والی قرعہ اندازی کی لائیو ویڈیو یا ریکارڈ شدہ ویڈیو ایپ کے ذریعے دستیاب کی جائے گی۔ ممبر اپنا ٹوکن نمبر اور قرعہ اندازی سے متعلق معلومات بھی ایپ میں دیکھ سکے گا۔'
      ]
    },
    sd: {
      title: 'قرعه اندازي ۽ ٽوڪن نمبر',
      paragraphs: [
        'هر مهيني ٿيندڙ قرعه اندازي جي لائيو وڊيو يا رڪارڊ ٿيل وڊيو ايپ ذريعي مهيا ڪئي ويندي. ميمبر پنهنجو ٽوڪن نمبر ۽ قرعه اندازي بابت ڄاڻ به ايپ ۾ ڏسي سگهندو.'
      ]
    },
    en: {
      title: 'Lucky Draw & Verified Token Allotment',
      paragraphs: [
        'The monthly lucky draw balloting video (live broadcast or archived recording) will be officially published inside the app. Each member can inspect their assigned token numbers and draw outcomes directly from their dashboard.'
      ]
    }
  },
  '4': {
    ur: {
      title: 'مسلسل قسط ادا نہ کرنے کی صورت میں',
      paragraphs: [
        'اگر کوئی ممبر مسلسل 03 ماہ تک اپنی ماہانہ قسط جمع نہیں کرواتا تو کمپنی اس کا انتظار 03 ماہ تک کرے گی۔ اس کے بعد متعلقہ ممبر کی فعال ممبرشپ ختم کی جا سکتی ہے۔',
        'ایسی صورت میں متعلقہ ٹوکن نمبر کو کمپنی اپنی پالیسی اور منصوبے کے قواعد کے مطابق قرعہ اندازی میں جاری رکھ سکتی ہے۔',
        'ممبر کی جمع شدہ رقم، منصوبے کی شرائط اور پالیسی کے مطابق، اسکیم کی مدت مکمل ہونے کے بعد واپس کی جائے گی۔'
      ]
    },
    sd: {
      title: 'لڳاتار قسط ادا نه ڪرڻ جي صورت ۾ پاليسي',
      paragraphs: [
        'جيڪڏهن ڪو ميمبر لڳاتار 03 مهينن تائين پنهنجي ماهوار قسط جمع نٿو ڪرائي ته ڪمپني ان جو 03 مهينن تائين انتظار ڪندي. ان کان پوءِ لاڳاپيل ميمبر جي فعال ميمبرشپ ختم ڪئي وڃي سگهي ٿي.',
        'اهڙي حالت ۾ لاڳاپيل ٽوڪن نمبر کي ڪمپني پنهنجي پاليسي ۽ منصوبي جي قاعدن موجب قرعه اندازي ۾ جاري رکي سگهي ٿي.',
        'ميمبر جي جمع ٿيل رقم، رٿابندي جي شرطن ۽ پاليسي موجب، اسڪيم جي مدت پوري ٿيڻ کان پوءِ واپس ڪئي ويندي.'
      ]
    },
    en: {
      title: 'Policy Regarding Consecutive Missed Installments',
      paragraphs: [
        'If a member defaults on monthly installment submissions for three (03) consecutive months, a 3-month grace window will apply, following which active membership may be revoked.',
        'In such cases, the company retains the right to administer the relevant token number in ongoing balloting per scheme regulations.',
        'Deposited funds will be refunded at the end of the official scheme tenure in strict accordance with policy bylaws.'
      ]
    }
  },
  '5': {
    ur: {
      title: 'ایڈوانس موٹر بائیک',
      paragraphs: [
        'جو ممبران ایڈوانس موٹر بائیک حاصل کرنا چاہیں گے، انہیں 40,000 روپے ایڈوانس جمع کروانا ہوگا۔ ادائیگی اور متعلقہ شرائط مکمل ہونے کے بعد، منصوبے کی پالیسی کے مطابق اگلے ماہ موٹر بائیک فراہم کی جائے گی۔'
      ]
    },
    sd: {
      title: 'ايڊوانس موٽر بائيڪ جي سهولت',
      paragraphs: [
        'جيڪي ميمبر ايڊوانس موٽر بائيڪ وٺڻ چاهيندا، انهن کي 40,000 رپيا ايڊوانس جمع ڪرائڻا پوندا. ادائيگي ۽ لاڳاپيل شرطون پوريون ٿيڻ بعد، رٿابندي جي پاليسي موجب ايندڙ مهيني موٽر بائيڪ فراهم ڪئي ويندي.'
      ]
    },
    en: {
      title: 'Advance Motorbike Allocation Plan',
      paragraphs: [
        'Members opting for advance motorbike allocation are required to make an advance down-payment of PKR 40,000. Upon verified clearance and compliance review, vehicle dispatch will be arranged in the subsequent calendar month per schedule.'
      ]
    }
  },
  '6': {
    ur: {
      title: 'موٹر بائیک کی تقسیم',
      paragraphs: [
        'ایڈوانس موٹر بائیکس کمپنی کی مقررہ پالیسی، دستیابی اور انتظامی طریقہ کار کے مطابق فراہم کی جائیں گی۔',
        'اس معاملے میں کوئی بھی ممبر کمپنی پر کسی مخصوص موٹر بائیک یا فوری فراہمی کے لیے دباؤ یا زبردستی نہیں کرے گا۔'
      ]
    },
    sd: {
      title: 'موٽر بائيڪ جي ورهاست جا ضابطا',
      paragraphs: [
        'ايڊوانس موٽر بائيڪون ڪمپني جي مقرر ڪيل پاليسي، موجودگي ۽ انتظامي طريقيڪار مطابق ڏنيون وينديون.',
        'هن معاملي ۾ ڪوبه ميمبر ڪمپني تي ڪنهن خاص موٽر بائيڪ يا فوري فراهمي لاءِ دٻاءُ يا زبردستي نه ڪندو.'
      ]
    },
    en: {
      title: 'Motorbike Delivery & Handover Regulations',
      paragraphs: [
        'Advance motorbikes are handed over per official availability rosters, inventory allocations, and corporate administrative directives.',
        'Members must not exert undue pressure regarding specific frame batches or immediate off-schedule dispatches.'
      ]
    }
  },
  '7': {
    ur: {
      title: 'شرائط کی پابندی',
      paragraphs: [
        'APNI SAWARI SCHEME میں شمولیت اختیار کرنے والا ہر ممبر ان شرائط و ضوابط پر عمل کرنے کا پابند ہوگا۔ کمپنی ضرورت کے مطابق پالیسی میں مناسب تبدیلی یا اپ ڈیٹ کر سکتی ہے۔'
      ]
    },
    sd: {
      title: 'شرطن ۽ ضابطن جي پابندي',
      paragraphs: [
        'APNI SAWARI SCHEME ۾ شامل ٿيندڙ هر ميمبر انهن شرطن ۽ ضابطن تي عمل ڪرڻ جو پابند هوندو. ڪمپني ضرورت آهر پاليسي ۾ مناسب تبديلي يا واڌارو ڪري سگهي ٿي.'
      ]
    },
    en: {
      title: 'Mandatory Policy Compliance & Amendments',
      paragraphs: [
        'Every participant joining APNI SAWARI SCHEME is legally bound to comply with all outlined rules and bylaws. The administrative board reserves the authority to update policies as required for equitable management.'
      ]
    }
  }
};

/**
 * Intelligent dictionary for translating custom clauses or terms
 */
const DICTIONARY_WORDS: { [key: string]: { ur: string; sd: string; en: string } } = {
  'password': { ur: 'پاس ورڈ', sd: 'پاس ورڊ', en: 'password' },
  'security': { ur: 'حفاظت', sd: 'حفاظت', en: 'security' },
  'account': { ur: 'اکاؤنٹ', sd: 'اڪائونٽ', en: 'account' },
  'member': { ur: 'ممبر', sd: 'ميمبر', en: 'member' },
  'members': { ur: 'ممبران', sd: 'ميمبرن', en: 'members' },
  'installment': { ur: 'قسط', sd: 'قسط', en: 'installment' },
  'installments': { ur: 'اقساط', sd: 'قسطون', en: 'installments' },
  'monthly': { ur: 'ماہانہ', sd: 'ماهوار', en: 'monthly' },
  'token': { ur: 'ٹوکن', sd: 'ٽوڪن', en: 'token' },
  'number': { ur: 'نمبر', sd: 'نمبر', en: 'number' },
  'draw': { ur: 'قرعہ اندازی', sd: 'قرعه اندازي', en: 'draw' },
  'lucky draw': { ur: 'قرعہ اندازی', sd: 'قرعه اندازي', en: 'lucky draw' },
  'winner': { ur: 'کامیاب امیدوار', sd: 'کامياب اميدوار', en: 'winner' },
  'winners': { ur: 'فاتحین', sd: 'ڪامياب اميدوار', en: 'winners' },
  'bike': { ur: 'موٹر بائیک', sd: 'موٽر بائيڪ', en: 'motorbike' },
  'car': { ur: 'گاڑی', sd: 'گاڏي', en: 'car' },
  'vehicle': { ur: 'گاڑی', sd: 'گاڏي', en: 'vehicle' },
  'payment': { ur: 'ادائیگی', sd: 'ادائيگي', en: 'payment' },
  'deposit': { ur: 'جمع کروانا', sd: 'جمع ڪرائڻ', en: 'deposit' },
  'rules': { ur: 'قواعد و ضوابط', sd: 'قاعدا ۽ ضابطا', en: 'rules and regulations' },
  'terms': { ur: 'شرائط', sd: 'شرطون', en: 'terms' },
  'conditions': { ur: 'ضوابط', sd: 'ضابطا', en: 'conditions' },
  'policy': { ur: 'پالیسی', sd: 'پاليسي', en: 'policy' },
  'company': { ur: 'کمپنی', sd: 'ڪمپني', en: 'company' },
  'refund': { ur: 'رقم کی واپسی', sd: 'رقم جي واپسي', en: 'refund' },
  'advance': { ur: 'ایڈوانس', sd: 'ايڊوانس', en: 'advance' },
  'delivery': { ur: 'فراہمی', sd: 'فراهي', en: 'delivery' },
  'active': { ur: 'فعال', sd: 'فعال', en: 'active' },
  'verification': { ur: 'تصدیق', sd: 'تصديق', en: 'verification' },
  'receipt': { ur: 'رسید', sd: 'رسيد', en: 'receipt' },
  'official': { ur: 'سرکاری', sd: 'سرڪاري', en: 'official' }
};

/**
 * Detect script: returns 'arabic' (Urdu/Sindhi) or 'latin' (English)
 */
function detectScript(text: string): 'arabic' | 'latin' {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text) ? 'arabic' : 'latin';
}

/**
 * Translates arbitrary text into the target language using word/phrase substitutions
 */
export function autoTranslateText(text: string, targetLang: LanguageType): string {
  if (!text || !text.trim()) return '';
  const script = detectScript(text);

  // If text is already in the target language script
  if (targetLang === 'en' && script === 'latin') return text;
  if ((targetLang === 'ur' || targetLang === 'sd') && script === 'arabic') {
    // If target is Sindhi but source is Urdu, substitute distinctive characters/words
    if (targetLang === 'sd') {
      return text
        .replace(/ممبران/g, 'ميمبرن')
        .replace(/ممبر/g, 'ميمبر')
        .replace(/پاس ورڈ/g, 'پاس ورڊ')
        .replace(/ماہانہ/g, 'ماهوار')
        .replace(/اقساط/g, 'قسطون')
        .replace(/قرعہ اندازی/g, 'قرعه اندازي')
        .replace(/ٹوکن/g, 'ٽوڪن')
        .replace(/کمپنی/g, 'ڪمپني')
        .replace(/گاڑی/g, 'گاڏي')
        .replace(/موٹر بائیک/g, 'موٽر بائيڪ')
        .replace(/کی حفاظت/g, 'جي حفاظت')
        .replace(/کی صورت میں/g, 'جي صورت ۾')
        .replace(/کی تقسیم/g, 'جي ورهاست')
        .replace(/کی پابندی/g, 'جي پابندي')
        .replace(/جمع کروائیں/g, 'جمع ڪرايون')
        .replace(/کی جائے گی/g, 'ڪئي ويندي')
        .replace(/ہوگا/g, 'هوندو')
        .replace(/ہوگی/g, 'هوندي')
        .replace(/نہیں/g, 'ناهي')
        .replace(/کے ذریعے/g, 'ذريعي')
        .replace(/اور/g, '۽')
        .replace(/کہ/g, 'ته')
        .replace(/سے/g, 'کان')
        .replace(/میں/g, '۾')
        .replace(/کو/g, 'کي')
        .replace(/کا/g, 'جو')
        .replace(/کی/g, 'جي')
        .replace(/کے/g, 'جا')
        .replace(/پر/g, 'تي')
        .replace(/ہے/g, 'آهي');
    }
    // If target is Urdu but source is Sindhi
    if (targetLang === 'ur') {
      return text
        .replace(/ميمبرن/g, 'ممبران')
        .replace(/ميمبر/g, 'ممبر')
        .replace(/پاس ورڊ/g, 'پاس ورڈ')
        .replace(/ماهوار/g, 'ماہانہ')
        .replace(/قسطون/g, 'اقساط')
        .replace(/قرعه اندازي/g, 'قرعہ اندازی')
        .replace(/ٽوڪن/g, 'ٹوکن')
        .replace(/ڪمپني/g, 'کمپنی')
        .replace(/گاڏي/g, 'گاڑی')
        .replace(/موٽر بائيڪ/g, 'موٹر بائیک')
        .replace(/۽/g, 'اور')
        .replace(/ته/g, 'کہ')
        .replace(/۾/g, 'میں')
        .replace(/کي/g, 'کو')
        .replace(/جو/g, 'کا')
        .replace(/جي/g, 'کی')
        .replace(/جا/g, 'کے')
        .replace(/تي/g, 'پر')
        .replace(/آهي/g, 'ہے');
    }
    return text;
  }

  // If translating between Arabic script (Urdu/Sindhi) and English (Latin)
  if (targetLang === 'en' && script === 'arabic') {
    // Convert common terms
    let translated = text;
    for (const key of Object.keys(DICTIONARY_WORDS)) {
      const item = DICTIONARY_WORDS[key];
      const urRegex = new RegExp(item.ur, 'g');
      const sdRegex = new RegExp(item.sd, 'g');
      translated = translated.replace(urRegex, item.en).replace(sdRegex, item.en);
    }
    return translated;
  }

  // Translating from English to Urdu/Sindhi
  if ((targetLang === 'ur' || targetLang === 'sd') && script === 'latin') {
    let translated = text;
    for (const key of Object.keys(DICTIONARY_WORDS)) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      translated = translated.replace(regex, DICTIONARY_WORDS[key][targetLang]);
    }
    return translated;
  }

  return text;
}

/**
 * Resolves a single term to the active user's chosen language.
 */
export function getLocalizedTerm(
  term: TermSection,
  targetLang: LanguageType = 'ur'
): { number: string; title: string; paragraphs: string[] } {
  const num = term.number ? String(term.number).trim() : '1';

  // 1. Check if canonical translation exists for this number
  const canonical = CANONICAL_TERMS[num];
  if (canonical && canonical[targetLang]) {
    // Check if the title or first paragraph closely matches default
    const isDefaultMatch =
      term.title.includes('پاس ورڈ') ||
      term.title.includes('Password') ||
      term.title.includes('اقساط') ||
      term.title.includes('قرعہ') ||
      term.title.includes('قسط') ||
      term.title.includes('موٹر') ||
      term.title.includes('شرائط') ||
      term.title.includes('پاس ورڊ') ||
      term.title.includes('قسطون') ||
      canonical[targetLang].title === term.title ||
      canonical['ur'].title === term.title;

    if (isDefaultMatch) {
      return {
        number: num,
        title: canonical[targetLang].title,
        paragraphs: canonical[targetLang].paragraphs
      };
    }
  }

  // 2. Check if explicit translations object exists on term
  if (term.translations && term.translations[targetLang]) {
    const tLang = term.translations[targetLang];
    if (tLang.title && tLang.paragraphs && tLang.paragraphs.length > 0) {
      return {
        number: num,
        title: tLang.title,
        paragraphs: tLang.paragraphs
      };
    }
  }

  // 3. Auto-translate custom title and paragraphs on-the-fly
  const autoTitle = autoTranslateText(term.title, targetLang);
  const autoParagraphs = (term.paragraphs || []).map((p) => autoTranslateText(p, targetLang));

  return {
    number: num,
    title: autoTitle || term.title,
    paragraphs: autoParagraphs.length > 0 ? autoParagraphs : term.paragraphs || []
  };
}

/**
 * Translates an entire list of terms into the target language.
 */
export function getLocalizedTerms(
  terms: TermSection[] = [],
  targetLang: LanguageType = 'ur'
): TermSection[] {
  return (terms || []).map((term) => {
    const localized = getLocalizedTerm(term, targetLang);
    return {
      ...term,
      number: localized.number,
      title: localized.title,
      paragraphs: localized.paragraphs
    };
  });
}

/**
 * Helper to auto-populate all 3 translations when Admin saves a clause.
 */
export function generateClauseTranslations(
  number: string,
  title: string,
  paragraphs: string[]
): TermSection['translations'] {
  const num = String(number).trim();
  if (CANONICAL_TERMS[num]) {
    return {
      ur: CANONICAL_TERMS[num].ur,
      sd: CANONICAL_TERMS[num].sd,
      en: CANONICAL_TERMS[num].en
    };
  }

  return {
    ur: {
      title: autoTranslateText(title, 'ur'),
      paragraphs: paragraphs.map((p) => autoTranslateText(p, 'ur'))
    },
    sd: {
      title: autoTranslateText(title, 'sd'),
      paragraphs: paragraphs.map((p) => autoTranslateText(p, 'sd'))
    },
    en: {
      title: autoTranslateText(title, 'en'),
      paragraphs: paragraphs.map((p) => autoTranslateText(p, 'en'))
    }
  };
}
