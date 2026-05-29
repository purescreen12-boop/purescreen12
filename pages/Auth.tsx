
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, CheckCircle2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import { GoogleLogin } from '@react-oauth/google';
import MobileNavBar from '../components/MobileNavBar';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const editMode = searchParams.get('edit') === 'true';
  const initialIsLogin = editMode ? false : !(searchParams.get('signup') === 'true' || searchParams.get('tab') === 'signup' || searchParams.get('mode') === 'signup');
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isEditMode] = useState(editMode);
  const [originalEmail, setOriginalEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profession, setProfession] = useState('');
  const [description, setDescription] = useState('');
  const [locationInfo, setLocationInfo] = useState<{ country?: string; currency?: string }>({});
  const [phoneCountry, setPhoneCountry] = useState<string>('US'); // Default to United States
  const [phonePlaceholder, setPhonePlaceholder] = useState<string>('+1 123 456 7890');
  const avatarRef = React.useRef<HTMLInputElement | null>(null);

  const phonePrefix: Record<string, string> = {
    NG: '+234', US: '+1', GB: '+44', CA: '+1', AU: '+61', DE: '+49', FR: '+33', JP: '+81', IN: '+91', BR: '+55',
    ZA: '+27', EG: '+20', KE: '+254', GH: '+233', TZ: '+255', UG: '+256', RW: '+250', ET: '+251', ZM: '+260', ZW: '+263',
    MX: '+52', AR: '+54', CL: '+56', CO: '+57', PE: '+51', VE: '+58', EC: '+593', PY: '+595', BO: '+591', UY: '+598',
    IT: '+39', ES: '+34', PT: '+351', NL: '+31', BE: '+32', CH: '+41', SE: '+46', NO: '+47', DK: '+45', FI: '+358',
    PL: '+48', CZ: '+420', HU: '+36', RO: '+40', GR: '+30', TR: '+90', KR: '+82', CN: '+86', TH: '+66', MY: '+60',
    SG: '+65', PH: '+63', ID: '+62', VN: '+84', BD: '+880', PK: '+92', LK: '+94', NZ: '+64', AE: '+971',
    SA: '+966', QA: '+974', KW: '+965', OM: '+968', BH: '+973', JO: '+962', LB: '+961', IL: '+972', IR: '+98', IQ: '+964',
    RU: '+7', UA: '+380', BY: '+375', KZ: '+7', UZ: '+998', TJ: '+992', KG: '+996', TM: '+993', PA: '+507',
    CR: '+506', GT: '+502', HN: '+504', SV: '+503', NI: '+505', DO: '+1', JM: '+1', TT: '+1', CU: '+53', HT: '+509',
    BZ: '+501', BB: '+1', AG: '+1', DM: '+1', GD: '+1', KN: '+1', LC: '+1', VC: '+1', BS: '+1',
    SI: '+386', HR: '+385', BG: '+359', SK: '+421', LV: '+371', LT: '+370', EE: '+372', IS: '+354', MT: '+356', CY: '+357',
    LU: '+352', IE: '+353', AT: '+43', MO: '+853', HK: '+852', TW: '+886', IM: '+44', GG: '+44', JE: '+44', AS: '+1',
    GU: '+1', MP: '+1', PR: '+1', VI: '+1', FJ: '+679', PG: '+675', SB: '+677', VU: '+678', WS: '+685', TO: '+676',
    KI: '+686', MH: '+692', FM: '+691', PW: '+680', NR: '+674', TV: '+688', BF: '+226', BJ: '+229', CM: '+237', CV: '+238',
    CF: '+236', TD: '+235', KM: '+269', CG: '+242', CD: '+243', CI: '+225', DJ: '+253', EQ: '+240', ER: '+291', GA: '+241',
    GM: '+220', GN: '+224', GW: '+245', LR: '+231', LS: '+266', MG: '+261', MW: '+265', ML: '+223', MR: '+222', MU: '+230',
    MA: '+212', MZ: '+258', NA: '+264', NE: '+227', SN: '+221', SC: '+248', SL: '+232', SO: '+252', SS: '+211', SD: '+249',
    SZ: '+268', TG: '+228', TN: '+216', BW: '+267', AC: '+247', AD: '+376', AX: '+358', AW: '+297', BM: '+1',
    BN: '+673', CW: '+599', FK: '+500', FO: '+298', GI: '+350', GL: '+299', GS: '+500', IO: '+246',
    KY: '+1', MF: '+590', RE: '+262', SJ: '+47', TF: '+262', UM: '+1', VB: '+1', WF: '+681', YE: '+967', YT: '+262',
  };

  const normalizePhone = (value: string, country: string) => {
    const prefix = phonePrefix[country] || '+1';
    const trimmed = value.trim();
    if (trimmed === '') return '';
    if (trimmed.startsWith('+')) return trimmed;
    if (trimmed.startsWith(prefix.replace('+', ''))) return `+${trimmed}`;
    return `${prefix} ${trimmed}`;
  };

  const countryData: Record<string, { name: string; currency: string }> = {
    NG: { name: 'Nigeria', currency: 'NGN' }, US: { name: 'United States', currency: 'USD' }, GB: { name: 'United Kingdom', currency: 'GBP' },
    CA: { name: 'Canada', currency: 'CAD' }, AU: { name: 'Australia', currency: 'AUD' }, DE: { name: 'Germany', currency: 'EUR' },
    FR: { name: 'France', currency: 'EUR' }, JP: { name: 'Japan', currency: 'JPY' }, IN: { name: 'India', currency: 'INR' },
    BR: { name: 'Brazil', currency: 'BRL' }, ZA: { name: 'South Africa', currency: 'ZAR' }, EG: { name: 'Egypt', currency: 'EGP' },
    KE: { name: 'Kenya', currency: 'KES' }, GH: { name: 'Ghana', currency: 'GHS' }, TZ: { name: 'Tanzania', currency: 'TZS' },
    UG: { name: 'Uganda', currency: 'UGX' }, RW: { name: 'Rwanda', currency: 'RWF' }, ET: { name: 'Ethiopia', currency: 'ETB' },
    ZM: { name: 'Zambia', currency: 'ZMW' }, ZW: { name: 'Zimbabwe', currency: 'ZWL' }, MX: { name: 'Mexico', currency: 'MXN' },
    AR: { name: 'Argentina', currency: 'ARS' }, CL: { name: 'Chile', currency: 'CLP' }, CO: { name: 'Colombia', currency: 'COP' },
    PE: { name: 'Peru', currency: 'PEN' }, VE: { name: 'Venezuela', currency: 'VES' }, EC: { name: 'Ecuador', currency: 'USD' },
    PY: { name: 'Paraguay', currency: 'PYG' }, BO: { name: 'Bolivia', currency: 'BOB' }, UY: { name: 'Uruguay', currency: 'UYU' },
    IT: { name: 'Italy', currency: 'EUR' }, ES: { name: 'Spain', currency: 'EUR' }, PT: { name: 'Portugal', currency: 'EUR' },
    NL: { name: 'Netherlands', currency: 'EUR' }, BE: { name: 'Belgium', currency: 'EUR' }, CH: { name: 'Switzerland', currency: 'CHF' },
    SE: { name: 'Sweden', currency: 'SEK' }, NO: { name: 'Norway', currency: 'NOK' }, DK: { name: 'Denmark', currency: 'DKK' },
    FI: { name: 'Finland', currency: 'EUR' }, PL: { name: 'Poland', currency: 'PLN' }, CZ: { name: 'Czech Republic', currency: 'CZK' },
    HU: { name: 'Hungary', currency: 'HUF' }, RO: { name: 'Romania', currency: 'RON' }, GR: { name: 'Greece', currency: 'EUR' },
    TR: { name: 'Turkey', currency: 'TRY' }, KR: { name: 'South Korea', currency: 'KRW' }, CN: { name: 'China', currency: 'CNY' },
    TH: { name: 'Thailand', currency: 'THB' }, MY: { name: 'Malaysia', currency: 'MYR' }, SG: { name: 'Singapore', currency: 'SGD' },
    PH: { name: 'Philippines', currency: 'PHP' }, ID: { name: 'Indonesia', currency: 'IDR' }, VN: { name: 'Vietnam', currency: 'VND' },
    BD: { name: 'Bangladesh', currency: 'BDT' }, PK: { name: 'Pakistan', currency: 'PKR' }, LK: { name: 'Sri Lanka', currency: 'LKR' },
    NZ: { name: 'New Zealand', currency: 'NZD' }, AE: { name: 'United Arab Emirates', currency: 'AED' }, SA: { name: 'Saudi Arabia', currency: 'SAR' },
    QA: { name: 'Qatar', currency: 'QAR' }, KW: { name: 'Kuwait', currency: 'KWD' }, OM: { name: 'Oman', currency: 'OMR' },
    BH: { name: 'Bahrain', currency: 'BHD' }, JO: { name: 'Jordan', currency: 'JOD' }, LB: { name: 'Lebanon', currency: 'LBP' },
    IL: { name: 'Israel', currency: 'ILS' }, IR: { name: 'Iran', currency: 'IRR' }, IQ: { name: 'Iraq', currency: 'IQD' },
    RU: { name: 'Russia', currency: 'RUB' }, UA: { name: 'Ukraine', currency: 'UAH' }, BY: { name: 'Belarus', currency: 'BYN' },
    KZ: { name: 'Kazakhstan', currency: 'KZT' }, UZ: { name: 'Uzbekistan', currency: 'UZS' }, TJ: { name: 'Tajikistan', currency: 'TJS' },
    KG: { name: 'Kyrgyzstan', currency: 'KGS' }, TM: { name: 'Turkmenistan', currency: 'TMT' }, PA: { name: 'Panama', currency: 'PAB' },
    CR: { name: 'Costa Rica', currency: 'CRC' }, GT: { name: 'Guatemala', currency: 'GTQ' }, HN: { name: 'Honduras', currency: 'HNL' },
    SV: { name: 'El Salvador', currency: 'USD' }, NI: { name: 'Nicaragua', currency: 'NIO' }, DO: { name: 'Dominican Republic', currency: 'DOP' },
    JM: { name: 'Jamaica', currency: 'JMD' }, TT: { name: 'Trinidad and Tobago', currency: 'TTD' }, CU: { name: 'Cuba', currency: 'CUP' },
    HT: { name: 'Haiti', currency: 'HTG' }, BZ: { name: 'Belize', currency: 'BZD' }, BB: { name: 'Barbados', currency: 'BBD' },
    AG: { name: 'Antigua and Barbuda', currency: 'XCD' }, DM: { name: 'Dominica', currency: 'XCD' }, GD: { name: 'Grenada', currency: 'XCD' },
    KN: { name: 'Saint Kitts and Nevis', currency: 'XCD' }, LC: { name: 'Saint Lucia', currency: 'XCD' }, VC: { name: 'Saint Vincent', currency: 'XCD' },
    BS: { name: 'Bahamas', currency: 'BSD' }, SI: { name: 'Slovenia', currency: 'EUR' }, HR: { name: 'Croatia', currency: 'EUR' },
    BG: { name: 'Bulgaria', currency: 'BGN' }, SK: { name: 'Slovakia', currency: 'EUR' }, LV: { name: 'Latvia', currency: 'EUR' },
    LT: { name: 'Lithuania', currency: 'EUR' }, EE: { name: 'Estonia', currency: 'EUR' }, IS: { name: 'Iceland', currency: 'ISK' },
    MT: { name: 'Malta', currency: 'EUR' }, CY: { name: 'Cyprus', currency: 'EUR' }, LU: { name: 'Luxembourg', currency: 'EUR' },
    IE: { name: 'Ireland', currency: 'EUR' }, AT: { name: 'Austria', currency: 'EUR' }, MO: { name: 'Macau', currency: 'MOP' },
    HK: { name: 'Hong Kong', currency: 'HKD' }, TW: { name: 'Taiwan', currency: 'TWD' }, FJ: { name: 'Fiji', currency: 'FJD' },
    PG: { name: 'Papua New Guinea', currency: 'PGK' }, SB: { name: 'Solomon Islands', currency: 'SBD' }, VU: { name: 'Vanuatu', currency: 'VUV' },
    WS: { name: 'Samoa', currency: 'WST' }, TO: { name: 'Tonga', currency: 'TOP' }, KI: { name: 'Kiribati', currency: 'AUD' },
    MH: { name: 'Marshall Islands', currency: 'USD' }, FM: { name: 'Micronesia', currency: 'USD' }, PW: { name: 'Palau', currency: 'USD' },
    NR: { name: 'Nauru', currency: 'AUD' }, TV: { name: 'Tuvalu', currency: 'AUD' }, BF: { name: 'Burkina Faso', currency: 'XOF' },
    BJ: { name: 'Benin', currency: 'XOF' }, CM: { name: 'Cameroon', currency: 'XAF' }, CV: { name: 'Cape Verde', currency: 'CVE' },
    CF: { name: 'Central African Republic', currency: 'XAF' }, TD: { name: 'Chad', currency: 'XAF' }, KM: { name: 'Comoros', currency: 'KMF' },
    CG: { name: 'Congo', currency: 'XAF' }, CD: { name: 'Democratic Republic of Congo', currency: 'CDF' }, CI: { name: 'Ivory Coast', currency: 'XOF' },
    DJ: { name: 'Djibouti', currency: 'DJF' }, EQ: { name: 'Equatorial Guinea', currency: 'XAF' }, ER: { name: 'Eritrea', currency: 'ERN' },
    GA: { name: 'Gabon', currency: 'XAF' }, GM: { name: 'Gambia', currency: 'GMD' }, GN: { name: 'Guinea', currency: 'GNF' },
    GW: { name: 'Guinea-Bissau', currency: 'XOF' }, LR: { name: 'Liberia', currency: 'LRD' }, LS: { name: 'Lesotho', currency: 'LSL' },
    MG: { name: 'Madagascar', currency: 'MGA' }, MW: { name: 'Malawi', currency: 'MWK' }, ML: { name: 'Mali', currency: 'XOF' },
    MR: { name: 'Mauritania', currency: 'MRU' }, MU: { name: 'Mauritius', currency: 'MUR' }, MA: { name: 'Morocco', currency: 'MAD' },
    MZ: { name: 'Mozambique', currency: 'MZN' }, NA: { name: 'Namibia', currency: 'NAD' }, NE: { name: 'Niger', currency: 'XOF' },
    SN: { name: 'Senegal', currency: 'XOF' }, SC: { name: 'Seychelles', currency: 'SCR' }, SL: { name: 'Sierra Leone', currency: 'SLL' },
    SO: { name: 'Somalia', currency: 'SOS' }, SS: { name: 'South Sudan', currency: 'SSP' }, SD: { name: 'Sudan', currency: 'SDG' },
    SZ: { name: 'Eswatini', currency: 'SZL' }, TG: { name: 'Togo', currency: 'XOF' }, TN: { name: 'Tunisia', currency: 'TND' },
    BW: { name: 'Botswana', currency: 'BWP' }, AC: { name: 'Ascension Island', currency: 'GBP' }, AD: { name: 'Andorra', currency: 'EUR' },
    AW: { name: 'Aruba', currency: 'AWG' }, BM: { name: 'Bermuda', currency: 'BMD' }, BN: { name: 'Brunei', currency: 'BND' },
    CW: { name: 'Curacao', currency: 'ANG' }, FK: { name: 'Falkland Islands', currency: 'FKP' }, FO: { name: 'Faroe Islands', currency: 'DKK' },
    GI: { name: 'Gibraltar', currency: 'GIP' }, GL: { name: 'Greenland', currency: 'DKK' }, GS: { name: 'South Georgia', currency: 'GBP' },
    IO: { name: 'British Indian Ocean Territory', currency: 'USD' }, KY: { name: 'Cayman Islands', currency: 'KYD' },
    MF: { name: 'Saint Martin', currency: 'EUR' }, RE: { name: 'Reunion', currency: 'EUR' }, SJ: { name: 'Svalbard', currency: 'NOK' },
    TF: { name: 'French Southern Territories', currency: 'EUR' }, UM: { name: 'US Minor Islands', currency: 'USD' },
    VG: { name: 'British Virgin Islands', currency: 'USD' }, WF: { name: 'Wallis and Futuna', currency: 'XPF' },
    YE: { name: 'Yemen', currency: 'YER' }, YT: { name: 'Mayotte', currency: 'EUR' },
  };

  const parsePhoneCountry = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/[^\d\+]/g, '');
    // Try to match known prefixes - longest first
    const prefixes = ['+234', '+1', '+44', '+61', '+49', '+33', '+81', '+91', '+55', '+27', '+20', '+254', '+233', '+255', '+256',
      '+250', '+251', '+260', '+263', '+52', '+54', '+56', '+57', '+51', '+58', '+593', '+595', '+591', '+598', '+39', '+34',
      '+351', '+31', '+32', '+41', '+46', '+47', '+45', '+358', '+48', '+420', '+36', '+40', '+30', '+90', '+82', '+86',
      '+66', '+60', '+65', '+63', '+62', '+84', '+880', '+92', '+94', '+64', '+971', '+966', '+974', '+965', '+968', '+973',
      '+962', '+961', '+972', '+98', '+964', '+7', '+380', '+375', '+998', '+992', '+996', '+993', '+507', '+506', '+502',
      '+504', '+503', '+505', '+1', '+53', '+509', '+501', '+385', '+359', '+421', '+371', '+370', '+372', '+354', '+356',
      '+357', '+352', '+353', '+43', '+853', '+852', '+886', '+679', '+675', '+677', '+678', '+685', '+676', '+686', '+692',
      '+691', '+680', '+674', '+688', '+226', '+229', '+237', '+238', '+236', '+235', '+269', '+242', '+243', '+225', '+253',
      '+240', '+291', '+241', '+220', '+224', '+245', '+231', '+266', '+261', '+265', '+223', '+222', '+230', '+212', '+258',
      '+264', '+227', '+221', '+248', '+232', '+252', '+211', '+249', '+268', '+228', '+216', '+267',
    ];
    
    let bestMatch: any = null;
    let bestPrefix = '';
    for (let prefix of prefixes) {
      if (digits.startsWith(prefix) || digits.startsWith('00' + prefix.slice(1))) {
        if (prefix.length > bestPrefix.length) {
          bestPrefix = prefix;
          const code = Object.keys(phonePrefix).find(k => phonePrefix[k] === prefix);
          if (code && countryData[code]) {
            const data = countryData[code];
            bestMatch = { countryCode: code, country: data.name, currency: data.currency };
          }
        }
      }
    }
    
    return bestMatch;
  };

  const doesPhoneMatchCountry = (phoneNumber: string, country: string) => {
    if (!phoneNumber) return true;
    const parsed = parsePhoneCountry(phoneNumber);
    if (!parsed) return false;
    return parsed.countryCode === country;
  };

  const saveLocationToServer = async (location: { country?: string; currency?: string; ip?: string }) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.email) return;
    try {
      await fetch('/api/user/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          country: location.country,
          currency: location.currency,
          ip_address: location.ip || '',
        }),
      });
    } catch (err) {
      console.warn('Failed to save location to server:', err);
    }
  };

  // We no longer auto-detect location on initial load. Sign-up or login state determines country/currency.
  // detectLocation has been intentionally removed to avoid browser-side geo API usage and localStorage persistence.
  
  const determineLocationFromPhone = (phoneNumber: string) => {
    if (!phoneNumber) return null;
    const phoneLocation = parsePhoneCountry(phoneNumber);
    if (!phoneLocation) return null;
    return { country: phoneLocation.country, currency: phoneLocation.currency };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditMode) {
        console.log('Edit mode - form data:', { formData, phone, profession, description });
        const updated = await authService.updateUser({
          name: formData.name,
          email: originalEmail || formData.email,
          password: formData.password,
          phone: phone || undefined,
          avatar: undefined, // Keep existing avatar, don't update unless new file uploaded
          description: description || undefined,
          profession: profession || undefined,
        }, originalEmail || undefined);
        console.log('User updated:', updated);

        // Upload avatar if selected
        if (avatarFile) {
          console.log('Uploading new avatar file');
          const newAvatarUrl = await uploadAvatar(formData.email);
          // Update the current user with the new avatar URL
          if (newAvatarUrl) {
            const current = authService.getCurrentUser();
            if (current) {
              const updatedUser = { ...current, avatar: newAvatarUrl };
              authService.setCurrentUser(updatedUser);
            }
          }
        } else {
          authService.setCurrentUser(updated);
        }

        setSuccess('Profile updated successfully!');
        navigate('/profile');
        return;
      }
      if (isLogin) {
        const user = await authService.login({
          email: formData.email,
          password: formData.password
        });

        // Prefer stored user location; fallback to phone-derived location or default.
        let location = {
          country: user.country || locationInfo.country || 'United States',
          currency: user.currency || locationInfo.currency || 'USD',
        };

        const phoneToUse = user.phone || phone;
        if (phoneToUse) {
          const phoneLocation = determineLocationFromPhone(phoneToUse);
          if (phoneLocation) {
            location = phoneLocation;
            setPhoneCountry(parsePhoneCountry(phoneToUse)?.countryCode || phoneCountry);
          }
        }

        setLocationInfo(location);

        const userWithLocation = { ...user, ...location };

        // Persist location to backend route after login
        fetch('/api/user/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...location, email: user.email })
        }).catch(err => console.warn('Failed to post user location after login:', err));

        // show a success toast then redirect via onAuthSuccess
        setSuccess('Signed in successfully! Redirecting...');
        // Keep the existing delay before handing control to parent
        setTimeout(() => {
          onAuthSuccess(userWithLocation);
        }, 3000);
      } else {
        if (!formData.name) throw new Error("Full Name is required.");
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }
        if (phone && !doesPhoneMatchCountry(phone, phoneCountry)) {
          setError('Phone number country code does not match selected country. Please fix it and try again.');
          setLoading(false);
          return;
        }
        // Check if name already exists
        const nameCheckResponse = await fetch(`http://localhost:8081/api/check-name/${encodeURIComponent(formData.name)}`);
        if (!nameCheckResponse.ok) {
          throw new Error('Failed to verify name availability');
        }
        const nameCheckData = await nameCheckResponse.json();
        if (nameCheckData.exists) {
          setError('This full name has already been used. Please use a different name.');
          setLoading(false);
          return;
        }
        // Check if email already exists
        const emailCheckResponse = await fetch(`http://localhost:8081/api/check-email/${encodeURIComponent(formData.email)}`);
        if (!emailCheckResponse.ok) {
          throw new Error('Failed to verify email availability');
        }
        const emailCheckData = await emailCheckResponse.json();
        if (emailCheckData.exists) {
          setError('This email has already been used. Please use a different email or sign in.');
          setLoading(false);
          return;
        }
        // Check if phone already exists
        if (phone) {
          const phoneCheckResponse = await fetch(`http://localhost:8081/api/check-phone/${encodeURIComponent(phone)}`);
          if (!phoneCheckResponse.ok) {
            throw new Error('Failed to verify phone availability');
          }
          const phoneCheckData = await phoneCheckResponse.json();
          if (phoneCheckData.exists) {
            setError('This phone number is already registered. Please use a different phone number or sign in.');
            setLoading(false);
            return;
          }
        }
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: phone || undefined,
          avatar: undefined, // Will be uploaded separately
          description: description || undefined,
          profession: profession || undefined,
        });
        // Upload avatar if selected
        if (avatarFile) {
          await uploadAvatar(formData.email);
        }
        // Determine location from phone or selected option, then persist.
        const phoneLocation = determineLocationFromPhone(phone || '');
        const location = phoneLocation || locationInfo || { country: 'United States', currency: 'USD' };
        setLocationInfo(location);

        await fetch('/api/user/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...location, email: formData.email })
        }).catch(err => console.warn('Failed to post user location after signup:', err));

        setIsLogin(true);
        setFormData({ ...formData, password: '' });
        setPhone('');
        setProfession('');
        setDescription('');
        setAvatarFile(null);
        setAvatarPreview(null);
        setError(null);
        setSuccess('Account created successfully! Please sign in with your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide floating success toast after a few seconds
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  // Location is determined by user input (phone/country select) and backend data; no auto-detect on page load.
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.country && currentUser?.currency) {
      setLocationInfo({ country: currentUser.country, currency: currentUser.currency });
      const parsedPhoneCountry = currentUser.phone ? parsePhoneCountry(currentUser.phone) : null;
      if (parsedPhoneCountry) setPhoneCountry(parsedPhoneCountry.countryCode);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const u = authService.getCurrentUser();
      if (!u) {
        navigate('/auth');
        return;
      }
      setFormData({ name: u.name || '', email: u.email || '', password: '' });
      setPhone(u.phone || '');
      setOriginalEmail(u.email);
      setProfession(u.profession || '');
      setDescription(u.description || '');
      // Load avatar from server if exists
      if (u.email && (!u.avatar || !u.avatar.startsWith('data:') || !u.avatar.startsWith('http'))) {
        console.log('Fetching avatar for edit mode:', u.email);
        fetch(`http://localhost:8081/api/upload-avatar/${u.email}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error(`Avatar fetch failed with status ${response.status}`);
          })
          .then(data => {
            console.log('Avatar data received for edit mode:', data);
            setAvatarPreview(data.avatar);
          })
          .catch((error) => {
            console.log('Avatar fetch error for edit mode:', error);
            setAvatarPreview(u.avatar || null);
          });
      } else {
        setAvatarPreview(u.avatar || null);
      }
    }
  }, [isEditMode, navigate]);
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const uploadAvatar = async (email: string): Promise<string | null> => {
    if (!avatarFile) return null;
    
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('email', email);
    
    try {
      const response = await fetch('http://localhost:8081/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      // If backend returned the file path, update stored current user
      if (data.avatar) {
        const current = authService.getCurrentUser();
        if (current) {
          const updatedUser = { ...current, avatar: data.avatar };
          authService.setCurrentUser(updatedUser);
        }
        setAvatarPreview(data.avatar);
        return data.avatar;
      }
      return null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Continue with registration/update even if avatar upload fails
      return null;
    }
  };

  return (
    

    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
      {/* Cinematic background image, same as Hero, but fixed and 100vw/100vh */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('/wet-monstera-deliciosa-plant-leaves-garden.jpg')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />

      <div className="max-w-md w-full z-20">
        <div className="bg-[#121212]/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {isEditMode ? 'Edit Account' : (isLogin ? 'Sign In' : 'Sign up to start your membership')}
            </h1>
            <p className="text-gray-500 text-sm">
              {isEditMode ? 'Update your account details.' : (isLogin ? 'Sign in to watch inspiring stories.' : 'Just a few more steps and you are done.')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
              <p>{success}</p>
            </div>
          )}

          

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    required={!isLogin}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>

                  <div className="flex items-center bg-[#0f1720] border border-[#d4af37]/40 rounded-xl overflow-hidden">
                    <select
                      value={phoneCountry}
                      onChange={(e) => {
                        const country = e.target.value;
                        setPhoneCountry(country);
                        const countryInfo = countryData[country] || { name: 'United States', currency: 'USD' };
                        setLocationInfo({ country: countryInfo.name, currency: countryInfo.currency });

                        const newPrefix = phonePrefix[country] || '+1';
                        setPhonePlaceholder(`${newPrefix} 123 456 7890`);
                        if (!phone || !phone.startsWith('+')) {
                          setPhone(`${newPrefix} `);
                        }
                      }}
                      disabled={isEditMode}
                      className="appearance-none bg-[#0f1720] text-white px-4 py-3.5 border-r border-[#d4af37]/40 outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    >
                      <option value="US">🇺🇸 +1</option>
                      <option value="NG">🇳🇬 +234</option>
                      <option value="GB">🇬🇧 +44</option>
                      <option value="CA">🇨🇦 +1</option>
                      <option value="AU">🇦🇺 +61</option>
                      <option value="DE">🇩🇪 +49</option>
                      <option value="FR">🇫🇷 +33</option>
                      <option value="JP">🇯🇵 +81</option>
                      <option value="IN">🇮🇳 +91</option>
                      <option value="BR">🇧🇷 +55</option>
                      <option value="ZA">🇿🇦 +27</option>
                      <option value="EG">🇪🇬 +20</option>
                      <option value="KE">🇰🇪 +254</option>
                      <option value="GH">🇬🇭 +233</option>
                      <option value="TZ">🇹🇿 +255</option>
                      <option value="UG">🇺🇬 +256</option>
                      <option value="RW">🇷🇼 +250</option>
                      <option value="ET">🇪🇹 +251</option>
                      <option value="ZM">🇿🇲 +260</option>
                      <option value="ZW">🇿🇼 +263</option>
                      <option value="MX">🇲🇽 +52</option>
                      <option value="AR">🇦🇷 +54</option>
                      <option value="CL">🇨🇱 +56</option>
                      <option value="CO">🇨🇴 +57</option>
                      <option value="PE">🇵🇪 +51</option>
                      <option value="VE">🇻🇪 +58</option>
                      <option value="EC">🇪🇨 +593</option>
                      <option value="PY">🇵🇾 +595</option>
                      <option value="BO">🇧🇴 +591</option>
                      <option value="UY">🇺🇾 +598</option>
                      <option value="IT">🇮🇹 +39</option>
                      <option value="ES">🇪🇸 +34</option>
                      <option value="PT">🇵🇹 +351</option>
                      <option value="NL">🇳🇱 +31</option>
                      <option value="BE">🇧🇪 +32</option>
                      <option value="CH">🇨🇭 +41</option>
                      <option value="SE">🇸🇪 +46</option>
                      <option value="NO">🇳🇴 +47</option>
                      <option value="DK">🇩🇰 +45</option>
                      <option value="FI">🇫🇮 +358</option>
                      <option value="PL">🇵🇱 +48</option>
                      <option value="CZ">🇨🇿 +420</option>
                      <option value="HU">🇭🇺 +36</option>
                      <option value="RO">🇷🇴 +40</option>
                      <option value="GR">🇬🇷 +30</option>
                      <option value="TR">🇹🇷 +90</option>
                      <option value="KR">🇰🇷 +82</option>
                      <option value="CN">🇨🇳 +86</option>
                      <option value="TH">🇹🇭 +66</option>
                      <option value="MY">🇲🇾 +60</option>
                      <option value="SG">🇸🇬 +65</option>
                      <option value="PH">🇵🇭 +63</option>
                      <option value="ID">🇮🇩 +62</option>
                      <option value="VN">🇻🇳 +84</option>
                      <option value="BD">🇧🇩 +880</option>
                      <option value="PK">🇵🇰 +92</option>
                      <option value="LK">🇱🇰 +94</option>
                      <option value="NZ">🇳🇿 +64</option>
                      <option value="AE">🇦🇪 +971</option>
                      <option value="SA">🇸🇦 +966</option>
                      <option value="QA">🇶🇦 +974</option>
                      <option value="KW">🇰🇼 +965</option>
                      <option value="OM">🇴🇲 +968</option>
                      <option value="BH">🇧🇭 +973</option>
                      <option value="JO">🇯🇴 +962</option>
                      <option value="LB">🇱🇧 +961</option>
                      <option value="IL">🇮🇱 +972</option>
                      <option value="IR">🇮🇷 +98</option>
                      <option value="IQ">🇮🇶 +964</option>
                      <option value="RU">🇷🇺 +7</option>
                      <option value="UA">🇺🇦 +380</option>
                      <option value="BY">🇧🇾 +375</option>
                      <option value="KZ">🇰🇿 +7</option>
                      <option value="UZ">🇺🇿 +998</option>
                      <option value="TJ">🇹🇯 +992</option>
                      <option value="KG">🇰🇬 +996</option>
                      <option value="TM">🇹🇲 +993</option>
                      <option value="PA">🇵🇦 +507</option>
                      <option value="CR">🇨🇷 +506</option>
                      <option value="GT">🇬🇹 +502</option>
                      <option value="HN">🇭🇳 +504</option>
                      <option value="SV">🇸🇻 +503</option>
                      <option value="NI">🇳🇮 +505</option>
                      <option value="DO">🇩🇴 +1</option>
                      <option value="JM">🇯🇲 +1</option>
                      <option value="TT">🇹🇹 +1</option>
                      <option value="CU">🇨🇺 +53</option>
                      <option value="HT">🇭🇹 +509</option>
                      <option value="BZ">🇧🇿 +501</option>
                      <option value="BB">🇧🇧 +1</option>
                      <option value="AG">🇦🇬 +1</option>
                      <option value="DM">🇩🇲 +1</option>
                      <option value="GD">🇬🇩 +1</option>
                      <option value="KN">🇰🇳 +1</option>
                      <option value="LC">🇱🇨 +1</option>
                      <option value="VC">🇻🇨 +1</option>
                      <option value="BS">🇧🇸 +1</option>
                      <option value="SI">🇸🇮 +386</option>
                      <option value="HR">🇭🇷 +385</option>
                      <option value="BG">🇧🇬 +359</option>
                      <option value="SK">🇸🇰 +421</option>
                      <option value="LV">🇱🇻 +371</option>
                      <option value="LT">🇱🇹 +370</option>
                      <option value="EE">🇪🇪 +372</option>
                      <option value="IS">🇮🇸 +354</option>
                      <option value="MT">🇲🇹 +356</option>
                      <option value="CY">🇨🇾 +357</option>
                      <option value="LU">🇱🇺 +352</option>
                      <option value="IE">🇮🇪 +353</option>
                      <option value="AT">🇦🇹 +43</option>
                      <option value="MO">🇲🇴 +853</option>
                      <option value="HK">🇭🇰 +852</option>
                      <option value="TW">🇹🇼 +886</option>
                      <option value="FJ">🇫🇯 +679</option>
                      <option value="PG">🇵🇬 +675</option>
                      <option value="SB">🇸🇧 +677</option>
                      <option value="VU">🇻🇺 +678</option>
                      <option value="WS">🇼🇸 +685</option>
                      <option value="TO">🇹🇴 +676</option>
                      <option value="KI">🇰🇮 +686</option>
                      <option value="MH">🇲🇭 +692</option>
                      <option value="FM">🇫🇲 +691</option>
                      <option value="PW">🇵🇼 +680</option>
                      <option value="NR">🇳🇷 +674</option>
                      <option value="TV">🇹🇻 +688</option>
                      <option value="BF">🇧🇫 +226</option>
                      <option value="BJ">🇧🇯 +229</option>
                      <option value="CM">🇨🇲 +237</option>
                      <option value="CV">🇨🇻 +238</option>
                      <option value="CF">🇨🇫 +236</option>
                      <option value="TD">🇹🇩 +235</option>
                      <option value="KM">🇰🇲 +269</option>
                      <option value="CG">🇨🇬 +242</option>
                      <option value="CD">🇨🇩 +243</option>
                      <option value="CI">🇨🇮 +225</option>
                      <option value="DJ">🇩🇯 +253</option>
                      <option value="EQ">🇪🇶 +240</option>
                      <option value="ER">🇪🇷 +291</option>
                      <option value="GA">🇬🇦 +241</option>
                      <option value="GM">🇬🇲 +220</option>
                      <option value="GN">🇬🇳 +224</option>
                      <option value="GW">🇬🇼 +245</option>
                      <option value="LR">🇱🇷 +231</option>
                      <option value="LS">🇱🇸 +266</option>
                      <option value="MG">🇲🇬 +261</option>
                      <option value="MW">🇲🇼 +265</option>
                      <option value="ML">🇲🇱 +223</option>
                      <option value="MR">🇲🇷 +222</option>
                      <option value="MU">🇲🇺 +230</option>
                      <option value="MA">🇲🇦 +212</option>
                      <option value="MZ">🇲🇿 +258</option>
                      <option value="NA">🇳🇦 +264</option>
                      <option value="NE">🇳🇪 +227</option>
                      <option value="SN">🇸🇳 +221</option>
                      <option value="SC">🇸🇨 +248</option>
                      <option value="SL">🇸🇱 +232</option>
                      <option value="SO">🇸🇴 +252</option>
                      <option value="SS">🇸🇸 +211</option>
                      <option value="SD">🇸🇩 +249</option>
                      <option value="SZ">🇸🇿 +268</option>
                      <option value="TG">🇹🇬 +228</option>
                      <option value="TN">🇹🇳 +216</option>
                      <option value="BW">🇧🇼 +267</option>
                    </select>
                    <span className="text-gray-400">|</span>
                    <input
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(normalizePhone(e.target.value, phoneCountry))}
                      type="tel"
                      maxLength={15}
                      disabled={isEditMode}
                      className="flex-1 bg-transparent border-0 py-3.5 pl-3 pr-4 text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={phonePlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Profession</label>
                  <input
                    name="profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                    placeholder="e.g. Filmmaker"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  required
                  disabled={isEditMode}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 overflow-hidden border border-white/10">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">No Image</div>
                    )}
                  </div>
                  <div>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                    <button type="button" onClick={() => avatarRef.current?.click()} className="text-[#d4af37] font-bold">Upload Image</button>
                  </div>
                </div>
              </div>
            )}

            {!isEditMode && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <div className="text-[10px] text-gray-400">At least 8 characters, with letters and numbers (e.g. Abc12345)</div>
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[10px] text-[#d4af37] hover:underline uppercase tracking-widest"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  maxLength={64}
                  type={showPassword ? 'text' : 'password'} 
                  required={!isEditMode}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Short Bio / Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" placeholder="e.g. Filmmaker, pastor, worship leader..." />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4cf67] text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In Now' : (isEditMode ? 'Save Changes' : 'Create Account')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* GoogleLogin removed as requested */}
          </form>

          {!isEditMode && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-500">
                {isLogin ? "New to PureScreen?" : "Already have an account?"}
              </span>
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-[#d4af37] font-bold hover:underline"
              >
                {isLogin ? 'Sign Up now.' : 'Login'}
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4 text-gray-600">
            <CheckCircle2 size={16} className="text-[#d4af37] shrink-0" />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed">
              Safe & Secure Authentication for all PureScreen users.
            </p>
          </div>
        </div>
      </div>
      <MobileNavBar showNav={true} isAlwaysVisible={true} />
    </div>
  );
};

export default Auth;
