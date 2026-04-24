import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Image as ImageIcon, Check, X, Monitor, ExternalLink } from 'lucide-react';

interface EditableImageProps {
  src: string;
  onSave: (newSrc: string) => void;
  className?: string;
  alt?: string;
  detailUrl?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export default function EditableImage({ 
  src, 
  onSave, 
  className = '', 
  alt = '',
  detailUrl,
  objectFit = 'cover'
}: EditableImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to process clipboard/file items
  const processItems = (items: DataTransferItemList | FileList) => {
    let imageItem: File | null = null;

    if (items instanceof DataTransferItemList) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          imageItem = items[i].getAsFile();
          break;
        }
      }
    } else {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          imageItem = items[i];
          break;
        }
      }
    }

    if (imageItem) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        onSave(reader.result as string);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setIsProcessing(false);
        alert("이미지를 처리하는 중 오류가 발생했습니다.");
      };
      reader.readAsDataURL(imageItem);
      return true;
    }
    return false;
  };

  // Global paste handler when hovered
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (!isHovered) return;
      
      const items = e.clipboardData?.items;
      if (items && processItems(items)) {
        e.preventDefault();
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isHovered, onSave]);

  // Fallback state
  const [currentSrc, setCurrentSrc] = useState(src);
  const navigate = useNavigate();
  
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onSave(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreenCapture = async () => {
    try {
      setIsProcessing(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" } as any 
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      
      video.onloadedmetadata = async () => {
        try {
          video.play();
          // Wait longer for frames to be ready
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/png');
          onSave(dataUrl);
        } catch (captureErr) {
          console.error("Frame extraction failed:", captureErr);
          alert("화면 프레임을 추출하는 중 오류가 발생했습니다.");
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };
    } catch (err: any) {
      setIsProcessing(false);
      console.error("Screen capture failed:", err);
      
      // Handle the case where the user simply cancels the dialog
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const systemPath = isMac 
          ? "브라우저 주소창 왼쪽 '자물쇠' 아이콘을 클릭해 권한을 확인하시거나, Mac '시스템 설정 > 개인정보 보호 및 보안 > 화면 기록'에서 브라우저를 허용해 주세요."
          : "브라우저 주소창 왼쪽 '자물쇠' 아이콘이나 권한 팝업에서 '허용'을 선택해 주세요. 캡처할 창을 선택해야 공유 버튼이 활성화됩니다.";
        
        alert(`화면 공유가 취소되었거나 권한이 거부되었습니다.\n\n해결 방법:\n1. ${systemPath}\n2. 캡처할 '창'이나 '전체 화면'을 클릭한 후 '공유' 버튼을 눌러주세요.`);
      } else {
        alert(`화면 캡처 오류: ${err.message || "알 수 없는 오류"}\n브라우저 설정을 확인하거나 지원되는 브라우저(Chrome, Edge 등)를 사용해주세요.`);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    if (processItems(items)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      processItems(items);
    } else if (e.dataTransfer.files) {
      processItems(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className={`relative group overflow-hidden outline-none ${className} ${isFocused ? 'ring-2 ring-primary ring-inset' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      tabIndex={0}
      title="클릭하여 업로드, 드래그&드롭, 또는 이미지 붙여넣기(Ctrl+V)"
    >
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${detailUrl ? 'cursor-pointer' : ''}`}
        style={{ objectFit }}
        referrerPolicy="no-referrer"
        onError={() => setCurrentSrc('https://picsum.photos/seed/nature/800/800')}
        onClick={() => {
          if (detailUrl) {
            navigate(detailUrl);
          }
        }}
      />

      {/* Control Overlay */}
      <div 
        onClick={() => {
          if (detailUrl) navigate(detailUrl);
        }}
        className={`absolute inset-0 z-40 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-[2px] ${isHovered || isFocused ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${detailUrl ? 'cursor-pointer' : ''}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
             <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
             <p className="text-white text-xs font-bold font-sans">이미지 처리 중...</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
               <button 
                 onClick={(e) => {
                   fileInputRef.current?.click();
                 }}
                 className="w-12 h-12 flex items-center justify-center bg-white text-primary rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                 title="이미지 업로드 (모바일 갤러리/PC 파일)"
               >
                 <Upload size={20} />
               </button>
               <button 
                 onClick={(e) => {
                   handleScreenCapture();
                 }}
                 className="w-12 h-12 flex items-center justify-center bg-white text-orange-500 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                 title="화면 캡처"
               >
                 <Monitor size={20} />
               </button>
               {detailUrl && (
                  <button 
                     onClick={(e) => {
                       navigate(detailUrl);
                     }}
                     className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                     title="상세보기"
                  >
                     <ExternalLink size={20} />
                  </button>
               )}
            </div>
            <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-white/20 select-none">
               <p className="text-[11px] font-black text-stone-800 flex items-center gap-2">
                 <ImageIcon size={12} className="text-secondary" />
                 클릭 업로드 / 붙여넣기 / 드롭
               </p>
            </div>
          </>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
