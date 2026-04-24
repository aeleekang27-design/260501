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
    <footer className="bg-white border-t border-stone-100 py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
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
    </footer>
  );
}
