import React from 'react';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';
import EditableImage from './EditableImage';

interface FooterProps {
  content: any;
  onUpdate: (key: string, value: string | number | boolean, type?: 'text' | 'fontSize' | 'deleted') => void;
}

export default function Footer({ content, onUpdate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-stone-100 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="mb-32 text-center max-w-2xl mx-auto space-y-10">
           <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">더 바른 소식을 메일로 받으세요</h3>
              <p className="text-stone-500 font-light leading-relaxed">매주 수요일, 산지의 신선한 소식과 회원 전용 혜택을 보내드립니다.</p>
           </div>
           <div className="relative group">
              <input 
                type="email" 
                placeholder="이메일을 입력해주세요" 
                className="w-full h-16 bg-stone-50 border border-stone-100 rounded-2xl px-8 text-sm outline-none focus:border-stone-200 focus:bg-white transition-all shadow-sm"
              />
              <button 
                className="absolute right-2 top-2 bottom-2 px-8 bg-[#003D27] text-white text-xs font-bold rounded-xl hover:bg-stone-900 transition-all active:scale-[0.98]"
                onClick={() => alert('신청이 완료되었습니다. 감사합니다!')}
              >
                구독하기
              </button>
           </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            {content.footerLogo && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden mb-2 shadow-sm border border-stone-100">
                <EditableImage 
                  src={content.footerLogo} 
                  onSave={(val) => onUpdate('footerLogo', val)}
                  objectFit="contain"
                  className="w-full h-full"
                />
              </div>
            )}
            {!content.company_deleted && (
              <div className="text-xl font-bold font-serif text-primary">
                  <EditableText 
                      value={content.company} 
                      fontSize={content.company_fontSize}
                      onUpdateFontSize={(size) => onUpdate('company', size, 'fontSize')}
                      onSave={(val) => onUpdate('company', val)}
                      onDelete={() => onUpdate('company', true, 'deleted')}
                  />
              </div>
            )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-12 text-sm text-stone-500">
          <button className="hover:text-primary transition-colors">회사소개</button>
          <button className="hover:text-primary transition-colors">이용약관</button>
          <button className="hover:text-primary transition-colors font-bold">개인정보처리방침</button>
          {!content.contact_deleted && (
            <div className="hover:text-primary transition-colors">
              <EditableText 
                  value={content.contact} 
                  fontSize={content.contact_fontSize}
                  onUpdateFontSize={(size) => onUpdate('contact', size, 'fontSize')}
                  onSave={(val) => onUpdate('contact', val)}
                  onDelete={() => onUpdate('contact', true, 'deleted')}
              />
            </div>
          )}
        </div>
        
        {!content.copyright_deleted && (
          <div className="text-[10px] text-stone-300 uppercase tracking-widest">
              <EditableText 
                  value={content.copyright} 
                  fontSize={content.copyright_fontSize}
                  onUpdateFontSize={(size) => onUpdate('copyright', size, 'fontSize')}
                  onSave={(val) => onUpdate('copyright', val)}
                  onDelete={() => onUpdate('copyright', true, 'deleted')}
                  className="w-full"
              />
          </div>
        )}
      </div>
      </div>
    </footer>
  );
}
