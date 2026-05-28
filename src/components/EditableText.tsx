import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface EditableTextProps {
  value: string | number;
  onSave: (newValue: string) => void;
  onDelete?: () => void;
  fontSize?: number;
  onUpdateFontSize?: (size: number) => void;
  className?: string;
  multiline?: boolean;
  type?: 'text' | 'number';
}

export default function EditableText({ 
  value, 
  onSave, 
  onDelete, 
  fontSize: initialFontSize,
  onUpdateFontSize,
  className = '', 
  multiline = false,
  type = 'text'
}: EditableTextProps) {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value));
  const [fontSize, setFontSize] = useState(initialFontSize || 0); // 0 means inherited
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(tempValue);
    if (onUpdateFontSize && fontSize > 0) {
      onUpdateFontSize(fontSize);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(String(value));
    setFontSize(initialFontSize || 0);
    setIsEditing(false);
  };

  // 소비자 화면: 편집 기능 비활성화, 텍스트만 표시
  if (!isAdmin) {
    return (
      <span
        className={`inline-block ${className}`}
        style={{ fontSize: initialFontSize ? `${initialFontSize}px` : 'inherit' }}
      >
        {value}
      </span>
    );
  }

  if (isEditing) {
    return (
      <span className={`relative group inline-block w-full min-w-[120px] ${className}`} style={{ fontSize: fontSize > 0 ? `${fontSize}px` : 'inherit' }}>
        {multiline ? (
          <textarea
            ref={inputRef as any}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-full p-2 bg-white border-2 border-primary rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 text-stone-900 font-bold shadow-xl overflow-hidden resize-none min-h-[100px]"
            rows={2}
          />
        ) : (
          <input
            ref={inputRef as any}
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-full px-2 py-1 bg-white border-2 border-primary rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 text-stone-900 font-black shadow-xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 'inherit' }}
          />
        )}
        
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-4 flex flex-col gap-3 z-[100] p-4 bg-white rounded-2xl shadow-2xl border border-stone-200 min-w-[200px] animate-in fade-in zoom-in duration-200">
          <span className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Font Size</span>
            <span className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setFontSize(prev => Math.max(8, (prev || 16) - 2)); }}
                className="w-6 h-6 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600 font-bold"
              >-</button>
              <span className="text-xs font-mono font-bold text-primary w-8 text-center">{fontSize || '--'}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setFontSize(prev => Math.min(120, (prev || 16) + 2)); }}
                className="w-6 h-6 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600 font-bold"
              >+</button>
            </span>
          </span>

          <span className="h-px bg-stone-100 w-full block" />

          <span className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> 저장
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleCancel(); }}
              className="px-3 py-2 bg-stone-100 text-stone-500 rounded-lg hover:bg-stone-200 transition-colors font-medium text-xs whitespace-nowrap"
            >
              취소
            </button>
            {onDelete && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (confirm('정말 삭제하시겠습니까?')) onDelete(); 
                }}
                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                title="삭제"
              >
                <Trash2 size={16} />
              </button>
            )}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={`relative group inline-block ${className}`}
      style={{ fontSize: initialFontSize ? `${initialFontSize}px` : 'inherit' }}
    >
      <span className="block min-h-[1em]">{value}</span>
      <span className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-xl editorial-shadow z-10 border border-stone-100">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="p-2 text-stone-400 hover:text-primary transition-colors hover:bg-stone-50 rounded-lg"
          title="수정"
        >
          <Edit2 size={14} />
        </button>
        {onDelete && (
          <button 
            className="p-2 text-stone-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
            title="삭제"
            onClickCapture={(e) => {
               e.stopPropagation();
               if (confirm('정말 삭제하시겠습니까?')) onDelete();
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </span>
    </span>
  );
}
