import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'member' | 'guest'>('member');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const { user, loading, isAuthenticating, loginWithGoogle, loginWithApple, loginWithNaver, loginWithKakao, loginEmailPassword } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'guest') {
      navigate('/order-tracking');
      return;
    }
    setError(null);
    try {
      // In this app, we take 'ID' as email for login simplicity if the user signed up via email
      await loginEmailPassword(formData.id, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  const isConfigError = error?.includes('configured') || error?.includes('missing');
  const isOperationNotAllowed = error?.includes('operation-not-allowed') || error?.includes('활성화되지 않았습니다');
  const isPopupError = error?.includes('popup') || error?.includes('closed');
  const isNetworkError = error?.includes('network-request-failed') || error?.includes('연결에 실패');

  const handleSocialLogin = async (loginFn: () => Promise<void>) => {
    setError(null);
    try {
      await loginFn();
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('로그인 팝업이 닫혔거나 취소되었습니다. 다시 시도해주세요.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('이 로그인 기능이 활성화되지 않았습니다. (Firebase Console에서 활성화가 필요합니다.)');
      } else if (err.code === 'auth/network-request-failed') {
        setError('네트워크 요청에 실패했습니다. (auth/network-request-failed)');
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="flex flex-col items-center gap-6 p-8 text-center animate-in fade-in duration-700">
          <Loader2 className="w-12 h-12 animate-spin text-[#003D27] opacity-80" />
          <div className="space-y-2">
            <p className="text-base font-black text-stone-900 tracking-tight">인증 상태를 확인 중입니다</p>
            <p className="text-xs font-medium text-stone-400">잠시만 기다려 주세요...</p>
          </div>
          
          {/* Fallback button in case of persistent loading */}
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 border border-stone-200 text-stone-400 text-[11px] font-bold hover:text-stone-900 hover:border-stone-400 transition-all rounded-full"
          >
            홈으로 돌아가기
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB] flex flex-col items-center p-4 pt-6 md:pt-10">
      <div className="w-full max-w-[420px] bg-white p-8 md:p-10 shadow-sm border border-stone-100 origin-top">
        <header className="text-center mb-6">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">로그인</h2>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 text-[11px] font-medium rounded-sm border border-red-100 flex flex-col gap-2">
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

              {isNetworkError && (
                <div className="mt-2 pt-2 border-t border-red-200 text-left text-[10px] opacity-80 space-y-1">
                  <p className="font-bold text-red-700">💡 브라우저 설정 확인이 필요합니다:</p>
                  <ul className="list-disc list-inside space-y-0.5 leading-relaxed">
                    <li>광고 차단 프로그램(Ad-blocker)을 비활성화해 주세요.</li>
                    <li>브라우저의 <b>'모든 쿠키 허용'</b> 또는 <b>'교차 사이트 추적 방지'</b> 해제를 확인해 주세요.</li>
                    <li>Safari나 Chrome Incognito 모드에서는 로그인이 제한될 수 있습니다.</li>
                    <li>지속적으로 발생할 경우 <b>우측 상단의 [Open in new tab]</b> 버튼을 눌러 새 창에서 시도해 주세요.</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 mb-6">
           <button 
             onClick={() => setActiveTab('member')}
             className={`flex-1 pb-4 text-sm font-black transition-all relative ${
               activeTab === 'member' ? 'text-stone-900' : 'text-stone-300'
             }`}
           >
             회원 로그인
             {activeTab === 'member' && (
               <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-stone-900" />
             )}
           </button>
           <div className="self-center w-[1px] h-3 bg-stone-100 mx-2" />
           <button 
             onClick={() => setActiveTab('guest')}
             className={`flex-1 pb-4 text-sm font-bold transition-all relative ${
               activeTab === 'guest' ? 'text-stone-900' : 'text-stone-300'
             }`}
           >
             비회원 주문조회
             {activeTab === 'guest' && (
               <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-stone-900" />
             )}
           </button>
        </div>

        <form className="space-y-3" onSubmit={handleEmailLogin}>
          <input 
            type="text" 
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            placeholder={activeTab === 'member' ? "아이디 (이메일)" : "주문자명"}
            className="w-full h-12 bg-white border border-stone-200 px-4 focus:outline-none focus:border-stone-400 transition-all font-medium text-sm rounded-sm"
          />
          <input 
            type={activeTab === 'member' ? "password" : "text"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={activeTab === 'member' ? "비밀번호" : "주문번호"}
            className="w-full h-12 bg-white border border-stone-200 px-4 focus:outline-none focus:border-stone-400 transition-all font-medium text-sm rounded-sm"
          />
          
          {activeTab === 'member' && (
            <div className="flex items-center justify-between py-2 text-xs font-medium text-stone-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-stone-200 rounded-sm accent-primary" />
                <span>아이디 저장</span>
              </label>
              <div className="flex items-center gap-1 text-red-500">
                <Lock size={14} />
                <span>보안접속</span>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button className="w-full h-12 bg-[#003D27] text-white font-black text-sm transition-all hover:bg-opacity-90">
              {activeTab === 'member' ? '로그인' : '조회하기'}
            </button>
            {activeTab === 'member' && (
              <button 
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full h-12 bg-white border border-stone-200 text-stone-900 font-black text-sm transition-all hover:bg-stone-50"
              >
                회원가입
              </button>
            )}
          </div>
        </form>

        <div className="flex justify-center items-center gap-4 mt-6 text-[11px] text-stone-500 font-medium">
          <button className="hover:text-stone-900 transition-colors">아이디찾기</button>
          <span className="w-[1px] h-3 bg-stone-200" />
          <button className="hover:text-stone-900 transition-colors">비밀번호찾기</button>
          <span className="w-[1px] h-3 bg-stone-200" />
          <button onClick={() => navigate('/signup')} className="hover:text-stone-900 transition-colors">회원가입</button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold text-stone-300">
            <span className="bg-white px-4 tracking-widest uppercase">OR</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button 
            onClick={() => handleSocialLogin(loginWithNaver)}
            disabled={isAuthenticating}
            className="w-full h-12 bg-[#03C75A] text-white flex items-center px-5 font-black text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50"
          >
            <div className="w-8 flex justify-center">
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-xl font-black italic">N</span>}
            </div>
            <span className="flex-1 text-center">네이버 로그인</span>
          </button>
          
          <button 
            onClick={() => handleSocialLogin(loginWithKakao)}
            disabled={isAuthenticating}
            className="w-full h-12 bg-[#FEE500] text-stone-900 flex items-center px-5 font-black text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50"
          >
            <div className="w-8 flex justify-center">
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 3.135-9 7 0 2.455 1.636 4.613 4.125 5.86l-.841 3.12 3.864-2.583A11.166 11.166 0 0012 17c4.97 0 9-3.135 9-7s-4.03-7-9-7z" />
                </svg>
              )}
            </div>
            <span className="flex-1 text-center">카카오 로그인</span>
          </button>

          <button 
            onClick={() => handleSocialLogin(loginWithApple)}
            disabled={isAuthenticating}
            className="w-full h-12 bg-white border border-stone-900 text-stone-900 flex items-center px-5 font-black text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50"
          >
            <div className="w-8 flex justify-center">
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.96.95-2.04 1.44-3.23 1.44-1.15 0-2.18-.46-3.26-1.44l-.16-.14-.15.14c-1.11.96-2.14 1.44-3.26 1.44-1.19 0-2.26-.49-3.23-1.44-1.99-1.95-2.99-4.81-2.99-8.58 0-3.69 1.05-6.52 3.16-8.5C5.07 2.05 6.3 1.5 7.66 1.5c1.19 0 2.22.42 3.23 1.25.43.35.88.75 1.11.93l.16.14.15-.14c.24-.18.7-.58 1.13-.93 1.01-.83 2.04-1.25 3.23-1.25 1.35 0 2.59.55 3.73 1.65 2.11 1.98 3.16 4.81 3.16 8.5 0 3.77-1.02 6.63-3.11 8.58zm-4.93-19c-.06-.51-.23-.97-.54-1.39-.18-.24-.4-.44-.64-.59C10.5.06 9.87 0 9.21 0c-.01 0-.02 0-.02.01s0 .02.01.02c.79.02 1.52.33 2.14.93.59.58.9 1.25.92 2.02 0 .01.01.02.02.02s.02-.01.02-.02c0-.1-.13-.78-.18-1c-.01-.06-.02-.15-.02-.17z" />
                </svg>
              )}
            </div>
            <span className="flex-1 text-center">Apple 로그인</span>
          </button>

          <button 
            onClick={() => handleSocialLogin(loginWithGoogle)}
            disabled={isAuthenticating}
            className="w-full h-12 bg-white border border-stone-200 text-stone-700 flex items-center px-5 font-black text-sm rounded-sm transition-shadow hover:shadow-md disabled:opacity-50"
          >
            <div className="w-8 flex justify-center">
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="" className="w-5 h-5 object-contain" />}
            </div>
            <span className="flex-1 text-center">Google 로그인</span>
          </button>
        </div>
      </div>
    </main>
  );
}
