'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'en' | 'gu' | 'hi';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    // Nav & Header
    households: 'Households',
    tree: 'Interactive Tree',
    culture: 'Culture',
    dashboard: 'Dashboard',
    admin: 'Admin',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    myProfile: 'My Profile',
    submitHousehold: 'Submit New Household',

    // Landing / Hero
    heroTagline: 'EST. LATE 1800s • RAJASTHAN ROOTS • ONE KUTUMB',
    heroTitle: 'Mehta Kutumb.\nOne family.\nA thousand stories.',
    heroSubtitle: 'A living private archive of our people — across continents, generations and households.\nHonouring where we came from. Staying connected wherever life has taken us.',
    exploreHouseholds: 'Explore Our Households',
    traceLineage: 'Trace the Lineage',
    privateNote: 'PRIVATE • APPROVED MEMBERS ONLY • BUILT FOR THE MEHTA FAMILY',
    tagline: 'One family. Many homes. Forever connected.',
    familyAtGlance: 'Our Family at a Glance',
    liveNumbers: 'Live numbers from our shared records.',
    householdsLabel: 'HOUSEHOLDS',
    householdsDesc: 'Active family homes',
    membersLabel: 'FAMILY MEMBERS',
    membersDesc: 'Recorded in the Kutumb',
    livingLabel: 'LIVING TODAY',
    livingDesc: 'Current generation carriers',
    countriesLabel: 'COUNTRIES',
    countriesDesc: 'Our branches span the world',
    numbersNote: 'These numbers grow as our family contributes and records are lovingly maintained.',
    whatWeHold: 'WHAT WE HOLD DEAR',
    familyPreserved: 'Our Family, Preserved',
    unifiedTitle: 'One Unified Kutumb',
    unifiedDesc: 'Whether you live in the ancestral village, Mumbai, the US, UK, Canada or Australia — we are still one family. This is the digital thread that binds every household.',
    browseHouseholds: 'Browse every household →',
    richHistoryTitle: 'Rich History & Lineage',
    richHistoryDesc: 'From our roots in Rajasthan to a global diaspora, explore the stories, rituals, and guidance passed down through generations.',
    exploreCulture: 'Explore Culture →',
    privacyTitle: 'Privacy First',
    privacyDesc: 'Contact details and full family trees are visible only to approved family members. Visitors see only public information.',
    viewDirectory: 'View Directory →',

    // Directory
    directoryTitle: 'Mehta Kutumb Households',
    fullDetails: 'Full details visible to approved family members.',
    publicView: 'Public view — private contact details hidden for privacy.',
    oneFamilyNote: 'One family • Many branches across borders • Forever connected',
    submitNew: 'Submit New Household',
    searchPlaceholder: 'Search name, place...',
    noResults: 'No households or members found matching your search.',
    memberCount: 'Members',
    viewHousehold: 'VIEW HOUSEHOLD →',

    // Household Detail
    contactInformation: 'Contact Information',
    signInForFull: 'Sign in with an approved account to view full contact details and family links.',
    familyMembers: 'Family Members',
    primaryMember: 'Primary Member',
    edit: 'Edit',
    addMember: '+ Add member',
    backToHouseholds: 'Back to all households',
    verifiedRecord: '✓ VERIFIED FAMILY RECORD',

    // Forms general
    householdDetails: 'Household Details',
    contactDetails: 'Contact Details',
    addresses: 'Addresses',
    familyMembersSection: 'Family Members',
    startWithHead: 'Start with the head (“SELF”). Add spouse, children, and other relatives.',
    primaryMemberName: 'Primary Member Name (Head) *',
    householdCode: 'Household Code (optional)',
    nativePlace: 'Native Place',
    currentCity: 'Current City',
    state: 'State',
    country: 'Country',
    phoneLandline: 'Phone (Landline)',
    mobile: 'Mobile',
    whatsapp: 'WhatsApp',
    email: 'Email',
    residenceAddress: 'Residence Address',
    businessAddress: 'Business Address',
    notesPrivate: 'Notes (private)',
    fullName: 'Full Name *',
    relationshipToHead: 'Relationship to Head *',
    gender: 'Gender',
    dateOfBirth: 'Date of Birth',
    education: 'Education',
    occupation: 'Occupation',
    maritalStatus: 'Marital Status',
    bloodGroup: 'Blood Group',
    notes: 'Notes',
    deceased: 'Deceased',
    dateOfDeath: 'Date of Death',
    profilePicture: 'Profile Picture',
    uploadImage: 'Upload Image',
    addAnotherMember: '+ Add another family member',
    requiredFields: '* Required fields. All changes submitted by members go through admin approval.',

    // Buttons & Actions
    saveChanges: 'Save Changes',
    saveHousehold: 'Save Household',
    submitForApproval: 'Submit for Approval',
    submitNewMember: 'Submit New Member for Review',
    addFamilyMembers: 'Add These Family Members',
    cancel: 'Cancel',
    signInBtn: 'Sign in',
    signingIn: 'Signing in...',
    resendConfirmation: 'Resend confirmation email',

    // Login / Auth
    emailLabel: 'Email',
    passwordLabel: 'Password',
    emailNotConfirmed: 'Email not confirmed yet. Please check your inbox (and spam), or use the resend button below.',
    enterEmailFirst: 'Please enter your email address first, then click Resend.',
    confirmationResent: 'Confirmation email resent! Check your inbox and spam folder.',
    noAccount: "Don't have an account?",
    createAccount: 'Create one here',

    // Dashboard
    welcome: 'Welcome back',
    pendingApproval: 'Your account is pending approval.',
    pendingNote: 'An admin will review your registration soon. You can browse public information in the meantime.',
    myRequests: 'My Requests',
    viewMyRequests: 'View my requests →',
    upcomingCelebrations: 'Upcoming Celebrations',
    birthdaysAnniversaries: 'Birthdays and anniversaries in the next 30 days',
    noCelebrations: 'No upcoming celebrations in the next 30 days.',
    recentUpdates: 'Recent Updates',
    noRecentUpdates: 'No recent updates yet.',
    announcements: 'Announcements',
    noAnnouncements: 'No announcements at this time.',
    quickActions: 'Quick Actions',
    submitNewHousehold: 'Submit New Household',
    suggestCorrection: 'Suggest a Correction',
    markDeceased: 'Mark Someone Deceased',
    viewDirectoryBtn: 'View Full Directory',
    viewCulture: 'Explore Family Culture',
    viewTree: 'Interactive Family Tree',

    // Culture
    ourCulture: 'Our Family Culture & History.',
    cultureSubtitle: 'Explore the stories, traditions, and collective wisdom passed down through generations. These sacred documents form the foundation of our heritage.',
    noPages: 'No public pages published yet.',
    checkBack: 'Check back later for new historical documents.',
    quote: '“A family\'s history is an anchor in the storm.”',
    elders: '— The Elders of the Mehta Kutumb',
    livingArchive: 'These documents and the stories within them are our living connection to every generation that came before.',
    listen: '🔊 Listen',
    stop: '■ Stop',
    backToCulture: 'Back to Culture & History',

    // Submit / Forms
    submitNewHouseholdTitle: 'Submit New Household',
    submitNewHouseholdDesc: 'Your submission will be reviewed by an administrator before it appears in the family record.',
    correctionTitle: 'Suggest a Correction',
    correctionDesc: 'Notice an error in a family member\'s details? Submit the correct information below. An administrator will review your changes before they go live.',
    markDeceasedTitle: 'Mark a Family Member as Deceased',
    markDeceasedDesc: 'This is a sensitive update and requires admin approval.',
    targetRecord: 'Target Record',
    whichRecord: 'Which record are you correcting?',
    correctName: 'Correct Name',
    correctMobile: 'Correct Mobile',
    correctWhatsapp: 'Correct WhatsApp',
    correctEmail: 'Correct Email',
    correctCity: 'Correct Current City',
    correctState: 'Correct State',
    correctNotes: 'Correct Notes / Other Changes',
    submitCorrection: 'Submit Correction',

    showAdvanced: 'Show advanced filters',
    searchOurFamily: 'Search Our Family',
    clearAllFilters: 'Clear all filters',
    privacyProtected: 'Privacy protected — full contact details are shown only to approved family members.',
    enterPrimaryHousehold: 'Enter the primary household information. Contact fields are private to approved members.',

    // Privacy / Misc
    privacyPolicy: 'Privacy Policy',
    restrictedAccess: 'Restricted Access',
    allRights: 'All rights reserved.',
    loading: 'Loading...',
    verified: 'Verified',
    members: 'Members',
    active: 'Active',
  },
  gu: {
    // Nav & Header
    households: 'ઘરબાર',
    tree: 'વંશવેલો',
    culture: 'સંસ્કૃતિ',
    dashboard: 'ડેશબોર્ડ',
    admin: 'એડમિન',
    signIn: 'સાઇન ઇન',
    signOut: 'સાઇન આઉટ',
    myProfile: 'મારી પ્રોફાઇલ',
    submitHousehold: 'નવું ઘરબાર સબમિટ કરો',

    // Landing / Hero
    heroTagline: 'લેટ 1800s • રાજસ્થાન મૂળ • એક કુટુંબ',
    heroTitle: 'મહેતા કુટુંબ.\nએક પરિવાર.\nહજારો વાર્તાઓ.',
    heroSubtitle: 'અમારા લોકોનો જીવંત ખાનગી આર્કાઇવ — ખંડો, પેઢીઓ અને ઘરબારોમાં.\nજ્યાંથી આવ્યા છીએ તેનો સન્માન. જ્યાં જીવન લઈ ગયું ત્યાં જોડાયેલા રહેવું.',
    exploreHouseholds: 'અમારા ઘરબારો એક્સ્પ્લોર કરો',
    traceLineage: 'વંશ વેળો શોધો',
    privateNote: 'ખાનગી • મંજૂર સભ્યો માટે જ • મહેતા પરિવાર માટે બનાવેલ',
    tagline: 'એક પરિવાર. ઘણા ઘર. હંમેશા જોડાયેલા.',
    familyAtGlance: 'અમારો પરિવાર એક નજરમાં',
    liveNumbers: 'અમારા વહેંચાયેલા રેકોર્ડ્સમાંથી લાઇવ આંકડા.',
    householdsLabel: 'ઘરબારો',
    householdsDesc: 'સક્રિય પારિવારિક ઘરો',
    membersLabel: 'પરિવાર સભ્યો',
    membersDesc: 'કુટુંબમાં નોંધાયેલા',
    livingLabel: 'આજે જીવંત',
    livingDesc: 'વર્તમાન પેઢીના વાહક',
    countriesLabel: 'દેશો',
    countriesDesc: 'અમારી શાખાઓ વિશ્વમાં ફેલાયેલી',
    numbersNote: 'જેમ જેમ અમારો પરિવાર યોગદાન આપે છે તેમ આ આંકડા વધે છે.',
    whatWeHold: 'જે અમને પ્રિય છે',
    familyPreserved: 'અમારો પરિવાર, સાચવેલો',
    unifiedTitle: 'એક સંયુક્ત કુટુંબ',
    unifiedDesc: 'ભલે તમે વાંસળીના ગામમાં, મુંબઈમાં, અમેરિકા, યુકે, કેનેડા કે ઓસ્ટ્રેલિયામાં રહો — અમે હજી એક પરિવાર છીએ.',
    browseHouseholds: 'દરેક ઘરબાર બ્રાઉઝ કરો →',
    richHistoryTitle: 'સમૃદ્ધ ઇતિહાસ અને વંશ',
    richHistoryDesc: 'રાજસ્થાનના મૂળથી વૈશ્વિક પ્રવાસ સુધી, પેઢીઓથી પસાર થયેલી વાર્તાઓ, રિતુઓ અને માર્ગદર્શન શોધો.',
    exploreCulture: 'સંસ્કૃતિ એક્સ્પ્લોર કરો →',
    privacyTitle: 'ગોપનીયતા પ્રથમ',
    privacyDesc: 'સંપર્ક વિગતો અને સંપૂર્ણ વંશ વૃક્ષ માત્ર મંજૂર પરિવાર સભ્યોને જ દેખાય છે.',
    viewDirectory: 'ડિરેક્ટરી જુઓ →',

    // Directory
    directoryTitle: 'મહેતા કુટુંબ ઘરબારો',
    fullDetails: 'મંજૂર પરિવાર સભ્યોને સંપૂર્ણ વિગતો દેખાય છે.',
    publicView: 'સાર્વજનિક દૃશ્ય — ખાનગી સંપર્ક વિગતો ગોપનીયતા માટે છુપાયેલી.',
    oneFamilyNote: 'એક પરિવાર • સરહદો પાર ઘણી શાખાઓ • હંમેશા જોડાયેલા',
    submitNew: '+ નવું ઘરબાર સબમિટ કરો',
    searchPlaceholder: 'નામ, જગ્યા શોધો...',
    noResults: 'તમારી શોધ સાથે મેળ ખાતા કોઈ ઘરબાર અથવા સભ્ય મળ્યા નથી.',
    memberCount: 'સભ્યો',
    viewHousehold: 'ઘરબાર જુઓ →',

    // Household Detail
    contactInformation: 'સંપર્ક માહિતી',
    signInForFull: 'સંપૂર્ણ સંપર્ક વિગતો અને પારિવારિક જોડાણો જોવા માટે મંજૂર ખાતાથી સાઇન ઇન કરો.',
    familyMembers: 'પારિવારિક સભ્યો',
    primaryMember: 'મુખ્ય સભ્ય',
    edit: 'એડિટ',
    addMember: '+ સભ્ય ઉમેરો',
    backToHouseholds: 'બધા ઘરબારો પર પાછા',
    verifiedRecord: '✓ ચકાસાયેલ પારિવારિક રેકોર્ડ',

    // Forms general
    householdDetails: 'ઘરબાર વિગતો',
    contactDetails: 'સંપર્ક વિગતો',
    addresses: 'સરનામાં',
    familyMembersSection: 'પારિવારિક સભ્યો',
    startWithHead: 'મુખ્ય વ્યક્તિ (“SELF”)થી શરૂ કરો. પત્ની, બાળકો અને અન્ય સંબંધીઓ ઉમેરો.',
    primaryMemberName: 'મુખ્ય સભ્યનું નામ (મુખ્ય) *',
    householdCode: 'ઘરબાર કોડ (વૈકલ્પિક)',
    nativePlace: 'મૂળ ગામ',
    currentCity: 'વર્તમાન શહેર',
    state: 'રાજ્ય',
    country: 'દેશ',
    phoneLandline: 'ફોન (લેન્ડલાઇન)',
    mobile: 'મોબાઇલ',
    whatsapp: 'વોટ્સએપ',
    email: 'ઈમેલ',
    residenceAddress: 'રહેઠાણ સરનામું',
    businessAddress: 'વ્યવસાય સરનામું',
    notesPrivate: 'નોંધ (ખાનગી)',
    fullName: 'પૂરું નામ *',
    relationshipToHead: 'મુખ્ય સાથે સંબંધ *',
    gender: 'લિંગ',
    dateOfBirth: 'જન્મ તારીખ',
    education: 'શિક્ષણ',
    occupation: 'વ્યવસાય',
    maritalStatus: 'વૈવાહિક સ્થિતિ',
    bloodGroup: 'રક્ત જૂથ',
    notes: 'નોંધ',
    deceased: 'મૃત',
    dateOfDeath: 'મૃત્યુ તારીખ',
    profilePicture: 'પ્રોફાઇલ ફોટો',
    uploadImage: 'ફોટો અપલોડ કરો',
    addAnotherMember: '+ બીજો પારિવારિક સભ્ય ઉમેરો',
    requiredFields: '* જરૂરી ક્ષેત્રો. સભ્યો દ્વારા કરેલા બધા ફેરફારો એડમિન મંજૂરી માટે જાય છે.',

    // Buttons & Actions
    saveChanges: 'ફેરફારો સાચવો',
    saveHousehold: 'ઘરબાર સાચવો',
    submitForApproval: 'મંજૂરી માટે સબમિટ કરો',
    submitNewMember: 'નવા સભ્યને મંજૂરી માટે સબમિટ કરો',
    addFamilyMembers: 'આ પારિવારિક સભ્યો ઉમેરો',
    cancel: 'રદ કરો',
    signInBtn: 'સાઇન ઇન',
    signingIn: 'સાઇન ઇન થઈ રહ્યું છે...',
    resendConfirmation: 'પુષ્ટિ ઈમેલ ફરી મોકલો',

    // Login / Auth
    emailLabel: 'ઈમેલ',
    passwordLabel: 'પાસવર્ડ',
    emailNotConfirmed: 'ઈમેલ હજી પુષ્ટિ થયો નથી. કૃપા કરીને તમારું ઇનબોક્સ (અને સ્પામ) તપાસો, અથવા નીચે રિસેન્ડ બટન વાપરો.',
    enterEmailFirst: 'પહેલા તમારું ઈમેલ સરનામું દાખલ કરો, પછી રિસેન્ડ પર ક્લિક કરો.',
    confirmationResent: 'પુષ્ટિ ઈમેલ ફરી મોકલાઈ! તમારું ઇનબોક્સ અને સ્પામ ફોલ્ડર તપાસો.',
    noAccount: 'ખાતું નથી?',
    createAccount: 'અહીં બનાવો',

    // Dashboard
    welcome: 'પાછા સ્વાગત છે',
    pendingApproval: 'તમારું ખાતું મંજૂરી માટે બાકી છે.',
    pendingNote: 'એડમિન ટૂંક સમયમાં તમારી નોંધણી તપાસશે. તમે દરમિયાન સાર્વજનિક માહિતી બ્રાઉઝ કરી શકો છો.',
    myRequests: 'મારી વિનંતીઓ',
    viewMyRequests: 'મારી વિનંતીઓ જુઓ →',
    upcomingCelebrations: 'આગામી ઉત્સવો',
    birthdaysAnniversaries: 'આગામી 30 દિવસમાં જન્મદિવસ અને વર્ષગાંઠ',
    noCelebrations: 'આગામી 30 દિવસમાં કોઈ ઉત્સવ નથી.',
    recentUpdates: 'તાજા અપડેટ્સ',
    noRecentUpdates: 'હજી સુધી કોઈ તાજા અપડેટ્સ નથી.',
    announcements: 'જાહેરાતો',
    noAnnouncements: 'આ સમયે કોઈ જાહેરાતો નથી.',
    quickActions: 'ઝડપી ક્રિયાઓ',
    submitNewHousehold: 'નવું ઘરબાર સબમિટ કરો',
    suggestCorrection: 'સુધારો સૂચવો',
    markDeceased: 'કોઈને મૃત ચિહ્નિત કરો',
    viewDirectoryBtn: 'પૂર્ણ ડિરેક્ટરી જુઓ',
    viewCulture: 'પારિવારિક સંસ્કૃતિ એક્સ્પ્લોર કરો',
    viewTree: 'ઇન્ટરેક્ટિવ પારિવારિક વૃક્ષ',

    // Culture
    ourCulture: 'અમારો પારિવારિક સંસ્કૃતિ અને ઇતિહાસ.',
    cultureSubtitle: 'પેઢીઓથી પસાર થયેલી વાર્તાઓ, પરંપરાઓ અને સામૂહિક બુદ્ધિનું અન્વેષણ કરો. આ પવિત્ર દસ્તાવેજો અમારા વારસાની પાયો છે.',
    noPages: 'હજી કોઈ જાહેર પેજ પ્રકાશિત થયા નથી.',
    checkBack: 'નવા ઐતિહાસિક દસ્તાવેજો માટે પછી તપાસો.',
    quote: '“પરિવારનો ઇતિહાસ તોફાનમાં એન્કર છે.”',
    elders: '— મહેતા કુટુંબના વડીલો',
    livingArchive: 'આ દસ્તાવેજો અને તેમાંની વાર્તાઓ અમારા પેઢીઓ સાથેનું જીવંત જોડાણ છે.',
    listen: '🔊 સાંભળો',
    stop: '■ રોકો',
    backToCulture: 'સંસ્કૃતિ અને ઇતિહાસ પર પાછા',

    // Submit / Forms
    submitNewHouseholdTitle: 'નવું ઘરબાર સબમિટ કરો',
    submitNewHouseholdDesc: 'તમારી સબમિશન એડમિન દ્વારા સમીક્ષા કર્યા પછી પારિવારિક રેકોર્ડમાં દેખાશે.',
    correctionTitle: 'સુધારો સૂચવો',
    correctionDesc: 'પારિવારિક સભ્યની વિગતોમાં ભૂલ દેખાય છે? નીચે સાચી માહિતી સબમિટ કરો. એડમિન તમારા ફેરફારો સમીક્ષા કરશે.',
    markDeceasedTitle: 'પારિવારિક સભ્યને મૃત ચિહ્નિત કરો',
    markDeceasedDesc: 'આ સંવેદનશીલ અપડેટ છે અને એડમિન મંજૂરી જરૂરી છે.',
    targetRecord: 'લક્ષ્ય રેકોર્ડ',
    whichRecord: 'કયો રેકોર્ડ સુધારવો છે?',
    correctName: 'સુધારેલું નામ',
    correctMobile: 'સુધારેલો મોબાઇલ',
    correctWhatsapp: 'સુધારેલો વોટ્સએપ',
    correctEmail: 'સુધારેલો ઈમેલ',
    correctCity: 'સુધારેલું વર્તમાન શહેર',
    correctState: 'સુધારેલું રાજ્ય',
    correctNotes: 'સુધારેલી નોંધ / અન્ય ફેરફારો',
    submitCorrection: 'સુધારો સબમિટ કરો',

    // Privacy / Misc
    privacyPolicy: 'ગોપનીયતા નીતિ',
    restrictedAccess: 'પ્રતિબંધિત પ્રવેશ',
    allRights: 'બધા અધિકારો સુરક્ષિત.',
    loading: 'લોડ થઈ રહ્યું છે...',
    verified: 'ચકાસાયેલ',
    members: 'સભ્યો',
    active: 'સક્રિય',
  },
  hi: {
    // Nav & Header
    households: 'परिवार',
    tree: 'इंटरैक्टिव वंश वृक्ष',
    culture: 'संस्कृति',
    dashboard: 'डैशबोर्ड',
    admin: 'एडमिन',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    myProfile: 'मेरी प्रोफ़ाइल',
    submitHousehold: 'नया परिवार जमा करें',

    // Landing / Hero
    heroTagline: 'लेट 1800s • राजस्थान मूल • एक कुटुंब',
    heroTitle: 'मेहता कुटुंब.\nएक परिवार.\nहजारों कहानियाँ.',
    heroSubtitle: 'हमारे लोगों का जीवंत निजी संग्रह — महाद्वीपों, पीढ़ियों और घरों में.\nजहाँ से आए हैं उसका सम्मान. जहाँ जीवन ले गया, वहाँ जुड़े रहें.',
    exploreHouseholds: 'हमारे परिवार देखें',
    traceLineage: 'वंश का पता लगाएँ',
    privateNote: 'निजी • स्वीकृत सदस्यों के लिए • मेहता परिवार के लिए बनाया गया',
    tagline: 'एक परिवार. कई घर. हमेशा जुड़े हुए.',
    familyAtGlance: 'हमारा परिवार एक नज़र में',
    liveNumbers: 'हमारे साझा रिकॉर्ड से लाइव आंकड़े.',
    householdsLabel: 'परिवार',
    householdsDesc: 'सक्रिय पारिवारिक घर',
    membersLabel: 'परिवार के सदस्य',
    membersDesc: 'कुटुंब में दर्ज',
    livingLabel: 'आज जीवित',
    livingDesc: 'वर्तमान पीढ़ी के वाहक',
    countriesLabel: 'देश',
    countriesDesc: 'हमारी शाखाएँ विश्व में फैली हुई',
    numbersNote: 'जैसे-जैसे हमारा परिवार योगदान देता है, ये आंकड़े बढ़ते हैं।',
    whatWeHold: 'जो हमें प्रिय है',
    familyPreserved: 'हमारा परिवार, संरक्षित',
    unifiedTitle: 'एक एकीकृत कुटुंब',
    unifiedDesc: 'चाहे आप पैतृक गांव में, मुंबई में, अमेरिका, यूके, कनाडा या ऑस्ट्रेलिया में रहते हों — हम अभी भी एक परिवार हैं।',
    browseHouseholds: 'हर परिवार ब्राउज़ करें →',
    richHistoryTitle: 'समृद्ध इतिहास और वंश',
    richHistoryDesc: 'राजस्थान की जड़ों से वैश्विक प्रवास तक, पीढ़ियों से चली आ रही कहानियाँ, रीति-रिवाज और मार्गदर्शन देखें।',
    exploreCulture: 'संस्कृति देखें →',
    privacyTitle: 'गोपनीयता पहले',
    privacyDesc: 'संपर्क विवरण और पूर्ण परिवार वृक्ष केवल स्वीकृत सदस्यों को दिखते हैं।',
    viewDirectory: 'निर्देशिका देखें →',

    // Directory
    directoryTitle: 'मेहता कुटुंब परिवार',
    fullDetails: 'स्वीकृत परिवार सदस्यों को पूर्ण विवरण दिखते हैं।',
    publicView: 'सार्वजनिक दृश्य — निजी संपर्क विवरण गोपनीयता के लिए छिपे हैं।',
    oneFamilyNote: 'एक परिवार • सीमाओं के पार कई शाखाएँ • हमेशा जुड़े',
    submitNew: '+ नया परिवार जमा करें',
    searchPlaceholder: 'नाम, स्थान खोजें...',
    noResults: 'आपकी खोज से मेल खाने वाले कोई परिवार या सदस्य नहीं मिले।',
    memberCount: 'सदस्य',
    viewHousehold: 'परिवार देखें →',

    // Household Detail
    contactInformation: 'संपर्क जानकारी',
    signInForFull: 'पूर्ण संपर्क विवरण और पारिवारिक लिंक देखने के लिए स्वीकृत खाते से साइन इन करें।',
    familyMembers: 'परिवार के सदस्य',
    primaryMember: 'मुख्य सदस्य',
    edit: 'संपादित करें',
    addMember: '+ सदस्य जोड़ें',
    backToHouseholds: 'सभी परिवारों पर वापस',
    verifiedRecord: '✓ सत्यापित पारिवारिक रिकॉर्ड',

    // Forms general
    householdDetails: 'परिवार विवरण',
    contactDetails: 'संपर्क विवरण',
    addresses: 'पते',
    familyMembersSection: 'परिवार के सदस्य',
    startWithHead: 'मुखिया (“SELF”) से शुरू करें। पति/पत्नी, बच्चे और अन्य रिश्तेदार जोड़ें।',
    primaryMemberName: 'मुख्य सदस्य का नाम (मुखिया) *',
    householdCode: 'परिवार कोड (वैकल्पिक)',
    nativePlace: 'मूल स्थान',
    currentCity: 'वर्तमान शहर',
    state: 'राज्य',
    country: 'देश',
    phoneLandline: 'फ़ोन (लैंडलाइन)',
    mobile: 'मोबाइल',
    whatsapp: 'व्हाट्सएप',
    email: 'ईमेल',
    residenceAddress: 'निवास पता',
    businessAddress: 'व्यवसाय पता',
    notesPrivate: 'नोट्स (निजी)',
    fullName: 'पूरा नाम *',
    relationshipToHead: 'मुखिया से संबंध *',
    gender: 'लिंग',
    dateOfBirth: 'जन्म तिथि',
    education: 'शिक्षा',
    occupation: 'पेशा',
    maritalStatus: 'वैवाहिक स्थिति',
    bloodGroup: 'रक्त समूह',
    notes: 'नोट्स',
    deceased: 'मृत',
    dateOfDeath: 'मृत्यु तिथि',
    profilePicture: 'प्रोफ़ाइल चित्र',
    uploadImage: 'छवि अपलोड करें',
    addAnotherMember: '+ एक और परिवार सदस्य जोड़ें',
    requiredFields: '* आवश्यक फ़ील्ड। सदस्यों द्वारा किए गए सभी परिवर्तन एडमिन अनुमोदन से गुजरते हैं।',

    // Buttons & Actions
    saveChanges: 'परिवर्तन सहेजें',
    saveHousehold: 'परिवार सहेजें',
    submitForApproval: 'अनुमोदन के लिए जमा करें',
    submitNewMember: 'नए सदस्य को अनुमोदन के लिए जमा करें',
    addFamilyMembers: 'ये परिवार सदस्य जोड़ें',
    cancel: 'रद्द करें',
    signInBtn: 'साइन इन करें',
    signingIn: 'साइन इन हो रहा है...',
    resendConfirmation: 'पुष्टिकरण ईमेल दोबारा भेजें',

    // Login / Auth
    emailLabel: 'ईमेल',
    passwordLabel: 'पासवर्ड',
    emailNotConfirmed: 'ईमेल अभी तक पुष्टि नहीं हुआ है। कृपया अपना इनबॉक्स (और स्पैम) चेक करें, या नीचे रीसेंड बटन का उपयोग करें।',
    enterEmailFirst: 'पहले अपना ईमेल पता दर्ज करें, फिर रीसेंड पर क्लिक करें।',
    confirmationResent: 'पुष्टिकरण ईमेल दोबारा भेजा गया! अपना इनबॉक्स और स्पैम फ़ोल्डर चेक करें।',
    noAccount: 'खाता नहीं है?',
    createAccount: 'यहाँ बनाएँ',

    // Dashboard
    welcome: 'वापस स्वागत है',
    pendingApproval: 'आपका खाता अनुमोदन के लिए लंबित है।',
    pendingNote: 'एक एडमिन जल्द ही आपकी पंजीकरण की समीक्षा करेगा। इस बीच आप सार्वजनिक जानकारी ब्राउज़ कर सकते हैं।',
    myRequests: 'मेरी अनुरोध',
    viewMyRequests: 'मेरी अनुरोध देखें →',
    upcomingCelebrations: 'आगामी उत्सव',
    birthdaysAnniversaries: 'अगले 30 दिनों में जन्मदिन और वर्षगाँठ',
    noCelebrations: 'अगले 30 दिनों में कोई उत्सव नहीं।',
    recentUpdates: 'हाल के अपडेट',
    noRecentUpdates: 'अभी तक कोई हाल के अपडेट नहीं।',
    announcements: 'घोषणाएँ',
    noAnnouncements: 'इस समय कोई घोषणाएँ नहीं।',
    quickActions: 'त्वरित क्रियाएँ',
    submitNewHousehold: 'नया परिवार जमा करें',
    suggestCorrection: 'सुधार सुझाएँ',
    markDeceased: 'किसी को मृत चिह्नित करें',
    viewDirectoryBtn: 'पूर्ण निर्देशिका देखें',
    viewCulture: 'पारिवारिक संस्कृति देखें',
    viewTree: 'इंटरैक्टिव पारिवारिक वृक्ष',

    // Culture
    ourCulture: 'हमारा पारिवारिक संस्कृति और इतिहास।',
    cultureSubtitle: 'पीढ़ियों से चली आ रही कहानियों, परंपराओं और सामूहिक ज्ञान का अन्वेषण करें। ये पवित्र दस्तावेज़ हमारी विरासत की नींव हैं।',
    noPages: 'अभी तक कोई सार्वजनिक पेज प्रकाशित नहीं हुए।',
    checkBack: 'नए ऐतिहासिक दस्तावेज़ों के लिए बाद में चेक करें।',
    quote: '“परिवार का इतिहास तूफान में लंगर है।”',
    elders: '— मेहता कुटुंब के बुजुर्ग',
    livingArchive: 'ये दस्तावेज़ और उनमें की कहानियाँ हमारी पीढ़ियों से जीवंत संबंध हैं।',
    listen: '🔊 सुनें',
    stop: '■ रोकें',
    backToCulture: 'संस्कृति और इतिहास पर वापस',

    // Submit / Forms
    submitNewHouseholdTitle: 'नया परिवार जमा करें',
    submitNewHouseholdDesc: 'आपकी सबमिशन एडमिन द्वारा समीक्षा के बाद परिवार रिकॉर्ड में दिखाई देगी।',
    correctionTitle: 'सुधार सुझाएँ',
    correctionDesc: 'परिवार के सदस्य की जानकारी में कोई त्रुटि दिख रही है? नीचे सही जानकारी जमा करें। एडमिन आपके परिवर्तनों की समीक्षा करेगा।',
    markDeceasedTitle: 'परिवार के सदस्य को मृत चिह्नित करें',
    markDeceasedDesc: 'यह एक संवेदनशील अपडेट है और एडमिन अनुमोदन की आवश्यकता है।',
    targetRecord: 'लक्ष्य रिकॉर्ड',
    whichRecord: 'किस रिकॉर्ड को सुधारना है?',
    correctName: 'सही नाम',
    correctMobile: 'सही मोबाइल',
    correctWhatsapp: 'सही व्हाट्सएप',
    correctEmail: 'सही ईमेल',
    correctCity: 'सही वर्तमान शहर',
    correctState: 'सही राज्य',
    correctNotes: 'सही नोट्स / अन्य परिवर्तन',
    submitCorrection: 'सुधार जमा करें',

    // Privacy / Misc
    privacyPolicy: 'गोपनीयता नीति',
    restrictedAccess: 'प्रतिबंधित पहुँच',
    allRights: 'सभी अधिकार सुरक्षित।',
    loading: 'लोड हो रहा है...',
    verified: 'सत्यापित',
    members: 'सदस्य',
    active: 'सक्रिय',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = (localStorage.getItem('lang') as Lang) || 'en';
    setLangState(saved);
    document.documentElement.lang = saved === 'gu' ? 'gu' : saved === 'hi' ? 'hi' : 'en';
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l === 'gu' ? 'gu' : l === 'hi' ? 'hi' : 'en';
    // Optional: notify listeners
    window.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  };

  const t = (key: string) => {
    return DICT[lang]?.[key] || DICT.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback when not wrapped
    return { lang: 'en' as Lang, setLang: () => {}, t: (k: string) => k };
  }
  return ctx;
}
