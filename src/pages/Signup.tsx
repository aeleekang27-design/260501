import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticating, loginWithGoogle, loginWithApple, loginWithNaver, loginWithKakao, signup } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    loginId: '', // Custom ID (optional storage)
    password: '',
    confirmPassword: '',
    name: '',
    phone1: '010',
    phone2: '',
    phone3: '',
    email: ''
  });

  const [agreedAll, setAgreedAll] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
    sms: false,
    email: false
  });

  const [expanded, setExpanded] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const isConfigError = error?.includes('configured') || error?.includes('missing');
  const isOperationNotAllowed = error?.includes('operation-not-allowed') || error?.includes('활성화되지 않았습니다');
  const isPopupError = error?.includes('popup') || error?.includes('closed');

  const handleSocialLogin = async (loginFn: () => Promise<void>) => {
    setError(null);
    try {
      await loginFn();
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('로그인 팝업이 닫혔거나 취소되었습니다. 다시 시도해주세요.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('이 로그인 기능이 활성화되지 않았습니다. (Firebase Console에서 활성화가 필요합니다.)');
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAgreeAll = (val: boolean) => {
    setAgreedAll(val);
    setAgreements({
      terms: val,
      privacy: val,
      marketing: val,
      sms: val,
      email: val
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements, val: boolean) => {
    const next = { ...agreements, [key]: val };
    
    // If marketing is toggled, also toggle sms/email
    if (key === 'marketing') {
      next.sms = val;
      next.email = val;
    }
    
    // If both sms and email are off, marketing should be off (optional logic but common)
    if (key === 'sms' || key === 'email') {
      if (next.sms || next.email) next.marketing = true;
      else next.marketing = false;
    }

    setAgreements(next);
    setAgreedAll(next.terms && next.privacy && next.marketing && next.sms && next.email);
  };

  const toggleExpand = (key: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    const fullPhone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;

    try {
      await signup(formData.email, formData.password, formData.name, fullPhone);
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 6자 이상이어야 합니다.');
      } else {
        setError(err.message || '회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <main className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">회원 가입</h1>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 text-[11px] font-medium rounded-sm max-w-md mx-auto border border-red-100 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <p className="flex-1">{error}</p>
              </div>

              {isConfigError && (
                <div className="mt-2 pt-2 border-t border-red-200 text-left">
                  <p className="font-bold text-[10px] uppercase tracking-wider mb-2 text-red-700">도움말: 소셜 API 설정 방법</p>
                  <div className="leading-relaxed opacity-90 text-red-800 space-y-3">
                    <div>
                      <span className="font-bold border-b border-red-200">1. 네이버(Naver) 설정</span><br/>
                      - <a href="https://developers.naver.com/apps/#/myapplications" target="_blank" rel="noopener noreferrer" className="underline">[개발자 센터]</a>에서 **Callback URL**에 아래 주소 추가:<br/>
                      <code className="inline-block mt-1 p-1 bg-white/60 border border-red-200 rounded text-[9px] select-all break-all font-mono">
                        {window.location.origin}/api/auth/callback/naver
                      </code>
                    </div>
                    <div>
                      <span className="font-bold border-b border-red-200">2. 카카오(Kakao) 설정</span><br/>
                      - <a href="https://developers.kakao.com/console/app" target="_blank" rel="noopener noreferrer" className="underline">[카카오 디벨로퍼스]</a>에서 **기본 정보 &gt; 앱 키**의 카카오 로그인 활성화 및 **Redirect URI** 추가:<br/>
                      <code className="inline-block mt-1 p-1 bg-white/60 border border-red-200 rounded text-[9px] select-all break-all font-mono">
                        {window.location.origin}/api/auth/callback/kakao
                      </code>
                    </div>
                    <div>
                      <span className="font-bold border-b border-red-200">3. 앱 설정</span><br/>
                      - 앱 우측 상단 <span className="font-bold">[Settings &gt; Secrets]</span>에 **NAVER_CLIENT_ID**, **NAVER_CLIENT_SECRET**, **KAKAO_CLIENT_ID**, **KAKAO_CLIENT_SECRET**을 각각 등록해주세요.
                    </div>
                  </div>
                </div>
              )}

              {isOperationNotAllowed && (
                <div className="mt-2 pt-2 border-t border-red-200 text-left">
                  <p className="font-bold text-[10px] uppercase tracking-wider mb-2 text-red-700">도움말: Firebase 서비스 활성화</p>
                  <div className="leading-relaxed opacity-90 text-red-800">
                    현재 시도하신 로그인 방식이 활성화되어 있지 않습니다.<br/>
                    1. <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-red-700">[Firebase Console]</a> 접속<br/>
                    2. **Authentication &gt; Sign-in method** 이동<br/>
                    3. {error?.toLowerCase().includes('apple') ? 'Apple' : 'Google/Apple'} 제공업체를 **[수정]** 버튼을 눌러 **[사용 설정]**으로 변경해주세요.<br/>
                    <span className="text-[10px] opacity-70 block mt-1">* Apple 로그인의 경우 Apple Developer의 App ID와 Team ID 설정이 필수입니다.</span>
                  </div>
                </div>
              )}

              {isPopupError && (
                <div className="mt-2 pt-2 border-t border-red-200 text-left text-[10px] opacity-80">
                  <p>💡 팝업창이 차단되어 있을 수 있습니다. 브라우저 주소창의 팝업 차단 해제 설정을 확인해주세요.</p>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Social Signup Options */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => handleSocialLogin(loginWithNaver)}
              disabled={isAuthenticating}
              className="h-14 bg-[#03C75A] text-white flex items-center justify-center gap-3 font-bold text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-xl font-black">N</span>}
              <span>네이버 가입</span>
            </button>
            <button 
              onClick={() => handleSocialLogin(loginWithKakao)}
              disabled={isAuthenticating}
              className="h-14 bg-[#FEE500] text-stone-900 flex items-center justify-center gap-3 font-bold text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 3.135-9 7 0 2.455 1.636 4.613 4.125 5.86l-.841 3.12 3.864-2.583A11.166 11.166 0 0012 17c4.97 0 9-3.135 9-7s-4.03-7-9-7z" />
                </svg>
              )}
              <span>카카오 가입</span>
            </button>
            <button 
              onClick={() => handleSocialLogin(loginWithApple)}
              disabled={isAuthenticating}
              className="h-14 bg-white border border-stone-900 text-stone-900 flex items-center justify-center gap-3 font-bold text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.96.95-2.04 1.44-3.23 1.44-1.15 0-2.18-.46-3.26-1.44l-.16-.14-.15.14c-1.11.96-2.14 1.44-3.26 1.44-1.19 0-2.26-.49-3.23-1.44-1.99-1.95-2.99-4.81-2.99-8.58 0-3.69 1.05-6.52 3.16-8.5C5.07 2.05 6.3 1.5 7.66 1.5c1.19 0 2.22.42 3.23 1.25.43.35.88.75 1.11.93l.16.14.15-.14c.24-.18.7-.58 1.13-.93 1.01-.83 2.04-1.25 3.23-1.25 1.35 0 2.59.55 3.73 1.65 2.11 1.98 3.16 4.81 3.16 8.5 0 3.77-1.02 6.63-3.11 8.58zm-4.93-19c-.06-.51-.23-.97-.54-1.39-.18-.24-.4-.44-.64-.59C10.5.06 9.87 0 9.21 0c-.01 0-.02 0-.02.01s0 .02.01.02c.79.02 1.52.33 2.14.93.59.58.9 1.25.92 2.02 0 .01.01.02.02.02s.02-.01.02-.02c0-.1-.13-.78-.18-1c-.01-.06-.02-.15-.02-.17z" />
                </svg>
              )}
              <span>Apple 가입</span>
            </button>
            <button 
              onClick={() => handleSocialLogin(loginWithGoogle)}
              disabled={isAuthenticating}
              className="h-14 bg-white border border-stone-200 text-stone-700 flex items-center justify-center gap-3 font-bold text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="" className="w-5 h-5 object-contain" />}
              <span>Google 가입</span>
            </button>
          </div>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold text-stone-300">
              <span className="bg-white px-4 tracking-widest uppercase">또는 일반 회원가입</span>
            </div>
          </div>
        </section>

        <form className="mb-20" onSubmit={handleSignup}>
          <table className="w-full border-t border-stone-200 divide-y divide-stone-100">
            <tbody>
              {/* ID */}
              <tr className="flex flex-col md:table-row">
                <th className="md:w-52 p-6 md:bg-stone-50/50 text-left align-middle text-sm font-bold text-stone-700">
                  아이디 <span className="text-red-500 ml-0.5">•</span>
                </th>
                <td className="p-4 md:p-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <input 
                      type="text" 
                      name="loginId"
                      value={formData.loginId}
                      onChange={handleInputChange}
                      className="w-full md:w-80 h-10 border border-stone-200 px-3 outline-none focus:border-stone-400 rounded-sm text-sm"
                    />
                    <span className="text-stone-400 text-xs">(영문소문자/숫자, 4~16자)</span>
                  </div>
                </td>
              </tr>

              {/* Password */}
              <tr className="flex flex-col md:table-row">
                <th className="md:w-52 p-6 md:bg-stone-50/50 text-left align-middle text-sm font-bold text-stone-700">
                  비밀번호 <span className="text-red-500 ml-0.5">•</span>
                </th>
                <td className="p-4 md:p-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full md:w-80 h-10 border border-stone-200 px-3 outline-none focus:border-stone-400 rounded-sm text-sm"
                    />
                    <span className="text-stone-400 text-xs">(영문 대소문자/숫자/특수문자 중 3가지 이상 조합, 8자~16자)</span>
                  </div>
                </td>
              </tr>

              {/* Confirm Password */}
              <tr className="flex flex-col md:table-row">
                <th className="md:w-52 p-6 md:bg-stone-50/50 text-left align-middle text-sm font-bold text-stone-700">
                  비밀번호 확인 <span className="text-red-500 ml-0.5">•</span>
                </th>
                <td className="p-4 md:p-6 flex-1">
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full md:w-80 h-10 border border-stone-200 px-3 outline-none focus:border-stone-400 rounded-sm text-sm"
                  />
                </td>
              </tr>

              {/* Name */}
              <tr className="flex flex-col md:table-row">
                <th className="md:w-52 p-6 md:bg-stone-50/50 text-left align-middle text-sm font-bold text-stone-700">
                  이름 <span className="text-red-500 ml-0.5">•</span>
                </th>
                <td className="p-4 md:p-6 flex-1">
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full md:w-80 h-10 border border-stone-200 px-3 outline-none focus:border-stone-400 rounded-sm text-sm"
                  />
                </td>
              </tr>

              {/* Mobile */}
              <tr className="flex flex-col md:table-row">
                <th className="md:w-52 p-6 md:bg-stone-50/50 text-left align-middle text-sm font-bold text-stone-700">
                  휴대전화 <span className="text-red-500 ml-0.5">•</span>
                </th>
                <td className="p-4 md:p-6 flex-1">
                  <div className="flex items-center gap-2">
                    <select 
                      name="phone1"
                      value={formData.phone1}
                      onChange={handleInputChange}
                      className="h-10 border border-stone-200 px-2 text-sm rounded-sm outline-none focus:border-stone-400 w-24"
                    >
                      <option>010</option>
                      <option>011</option>
                      <option>016</option>
                    </select>
                    <span className="text-stone-300">-</span>
                    <input 
                      type="text" 
                      name="phone2"
                      value={formData.phone2}
                      onChange={handleInputChange}
                      className="w-20 md:w-24 h-10 border border-stone-200 px-3 outline-none focus:border-stone-400 rounded-sm text-sm" 
                    />
                    <span className="text-stone-300">-</span>
                    <input 
                      type="text" 
                      name="phone3"
                      value={formData.phone3}
                      onChange={handleInputChange}
                      className="w-20 md:w-24 h-10 border border-stone-200 px-3 outline-none focus:border-stone-400 rounded-sm text-sm" 
                    />
                  </div>
                </td>
              </tr>

              {/* Email */}
              <tr className="flex flex-col md:table-row border-b border-stone-200">
                <th className="md:w-52 p-6 md:bg-stone-50/50 text-left align-middle text-sm font-bold text-stone-700">
                  이메일 <span className="text-red-500 ml-0.5">•</span>
                </th>
                <td className="p-4 md:p-6 flex-1">
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full md:w-80 h-10 border border-stone-200 px-3 outline-none focus:border-stone-400 rounded-sm text-sm"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-20 flex justify-center">
            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full md:w-64 h-14 bg-[#003D27] text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              회원가입
            </button>
          </div>
        </form>

        {/* Agreements Section */}
        <section className="space-y-6">
          <div className="pb-6 border-b border-stone-100">
             <label className="flex items-center gap-3 cursor-pointer group">
               <input 
                 type="checkbox" 
                 checked={agreedAll}
                 onChange={(e) => handleAgreeAll(e.target.checked)}
                 className="w-5 h-5 accent-[#003D27] cursor-pointer" 
               />
               <span className="text-base font-bold text-stone-900">전체 동의</span>
             </label>
             <p className="mt-3 text-xs text-stone-400 leading-relaxed font-medium">
               이용약관 및 개인정보수집 및 이용, 쇼핑정보 수신(선택)에 모두 동의합니다.<br/>
               이용약관 및 개인정보수집 및 이용에 모두 동의합니다.
             </p>
          </div>

          <div className="space-y-4">
             {/* Terms */}
             <div className="border-b border-stone-100 pb-4">
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={agreements.terms}
                     onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                     className="w-4 h-4 accent-[#003D27]" 
                   />
                   <span className="text-sm font-medium text-stone-600">[필수] 이용약관 동의</span>
                 </label>
                 <button onClick={() => toggleExpand('terms')} className="text-stone-300 hover:text-stone-600">
                   {expanded.terms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
               </div>
               <AnimatePresence>
                 {expanded.terms && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="mt-4 p-4 bg-stone-50 text-[11px] text-stone-400 h-16 overflow-y-auto rounded-sm">
                       이용약관 내용이 여기에 들어갑니다...
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Privacy */}
             <div className="border-b border-stone-100 pb-4">
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={agreements.privacy}
                     onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                     className="w-4 h-4 accent-[#003D27]" 
                   />
                   <span className="text-sm font-medium text-stone-600">[필수] 개인정보처리방침 동의</span>
                 </label>
                 <button onClick={() => toggleExpand('privacy')} className="text-stone-300 hover:text-stone-600">
                   {expanded.privacy ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
               </div>
               <AnimatePresence>
                 {expanded.privacy && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="mt-4 p-4 bg-stone-50 text-[11px] text-stone-400 h-16 overflow-y-auto rounded-sm">
                       개인정보처리방침 내용이 여기에 들어갑니다...
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Marketing */}
             <div>
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={agreements.marketing}
                     onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
                     className="w-4 h-4 accent-[#003D27]" 
                   />
                   <span className="text-sm font-medium text-stone-600">[선택] 쇼핑정보 수신 동의</span>
                 </label>
                 <button onClick={() => toggleExpand('marketing')} className="text-stone-300 hover:text-stone-600">
                   {expanded.marketing ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
               </div>
               
               <div className="mt-4 flex gap-6 pl-7">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreements.sms}
                      onChange={(e) => handleAgreementChange('sms', e.target.checked)}
                      className="w-4 h-4 accent-stone-300" 
                    />
                    <span className="text-xs text-stone-500 font-medium">SMS 수신 동의 (선택)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreements.email}
                      onChange={(e) => handleAgreementChange('email', e.target.checked)}
                      className="w-4 h-4 accent-stone-300" 
                    />
                    <span className="text-xs text-stone-500 font-medium">이메일 수신 동의 (선택)</span>
                  </label>
               </div>

               <AnimatePresence>
                 {expanded.marketing && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="mt-4 p-4 bg-stone-50 text-[11px] text-stone-400 h-16 overflow-y-auto rounded-sm">
                       쇼핑정보 수신 동의 내용이 여기에 들어갑니다...
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </section>
      </div>
    </main>
  );
}
