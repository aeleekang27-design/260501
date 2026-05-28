import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserPlus, ClipboardList, ShoppingCart, Plus, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Reorder, motion } from 'motion/react';
import EditableText from './EditableText';
import EditableImage from './EditableImage';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  cartCount: number;
  storeName: string;
  onUpdateStoreName: (val: string) => void;
  content?: any;
  onUpdateContent?: (key: string, value: string | number | boolean, type?: 'text' | 'fontSize' | 'deleted') => void;
  categories?: any[];
  filter?: string;
  onSetFilter?: (id: string) => void;
  onUpdateCategory?: (id: string, newLabel: string) => void;
  onDeleteCategory?: (id: string) => void;
  onReorderCategory?: (newCategories: any[]) => void;
  onCreateCategory?: () => void;
  onUpdateCategoryFontSize?: (id: string, size: number) => void;
}

export default function Header({ 
  cartCount, 
  storeName, 
  onUpdateStoreName,
  content = {
    login: '로그인',
    join: '회원 가입',
    orderTracking: '주문 조회',
    myPage: '마이 페이지',
    cart: '장바구니',
  },
  onUpdateContent,
  categories = [],
  filter = '전체',
  onSetFilter,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategory,
  onCreateCategory,
  onUpdateCategoryFontSize,
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, logout, isAdmin } = useAuth();

  const handleCategoryClick = (id: string) => {
    if (id === '이벤트') {
      navigate('/event');
      return;
    }
    onSetFilter?.(id);
    if (!isHome) {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-6 lg:py-10 relative">
        {/* Top Header Area: Logo + User Menu */}
        <div className="flex items-center justify-between pb-6 lg:pb-10 gap-4">
          {/* Store Name - Left Aligned */}
          <div className="flex-none flex justify-start">
            {!content.storeName_deleted && (
              <div className="flex items-center gap-4">
                <div className="w-20 h-10 md:w-32 md:h-16 lg:w-40 lg:h-20 shrink-0">
                  <EditableImage 
                    src={content.logo} 
                    onSave={(val) => onUpdateContent?.('logo', val)}
                    objectFit="contain"
                    className="w-full h-full"
                  />
                </div>
                <Link to="/" onClick={() => onSetFilter?.('전체')} className="text-4xl md:text-6xl lg:text-7xl font-black font-serif text-[#003D27] tracking-tighter hover:opacity-80 transition-all transform hover:scale-[1.02] active:scale-95 group whitespace-nowrap">
                  <EditableText 
                    value={storeName} 
                    fontSize={content.storeName_fontSize}
                    onSave={onUpdateStoreName}
                    onUpdateFontSize={(size) => onUpdateContent?.('storeName', size, 'fontSize')}
                    onDelete={() => onUpdateContent?.('storeName', true, 'deleted')}
                  />
                </Link>
              </div>
            )}
          </div>

          {/* User Menu - Right Aligned (Consolidated into 1 row as requested) */}
          <div className="flex-1 flex justify-end">
             <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 md:gap-6 scrollbar-hide py-2 px-1">
                {isAdmin && (
                  <Link to="/admin" className="flex flex-col items-center gap-1 group shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#003D27] text-white flex items-center justify-center transition-all animate-pulse shadow-lg">
                       <LayoutDashboard size={18} />
                    </div>
                    <span className="text-[10px] md:text-[11px] font-black text-[#003D27] whitespace-nowrap">
                       관리자 모드
                    </span>
                  </Link>
                )}
                {user ? (
                  <button onClick={logout} className="flex flex-col items-center gap-1 group shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 group-hover:bg-primary/5 flex items-center justify-center transition-all overflow-hidden">
                       {user.photoURL ? (
                         <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <LogOut size={18} className="text-stone-600 group-hover:text-primary transition-colors" />
                       )}
                    </div>
                    <span className="text-[10px] md:text-[11px] font-black text-stone-500 group-hover:text-primary transition-colors whitespace-nowrap">
                       로그아웃
                    </span>
                  </button>
                ) : (
                  <Link to="/login" className="flex flex-col items-center gap-1 group shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 group-hover:bg-primary/5 flex items-center justify-center transition-all">
                       <User size={18} className="text-stone-600 group-hover:text-primary transition-colors" />
                    </div>
                    {!content.login_deleted && (
                      <span className="text-[10px] md:text-[11px] font-black text-stone-500 group-hover:text-primary transition-colors whitespace-nowrap">
                         <EditableText 
                            value={content.login} 
                            fontSize={content.login_fontSize}
                            onSave={(val) => onUpdateContent?.('login', val)} 
                            onUpdateFontSize={(size) => onUpdateContent?.('login', size, 'fontSize')}
                            onDelete={() => onUpdateContent?.('login', true, 'deleted')}
                         />
                      </span>
                    )}
                  </Link>
                )}
                
                {!user && (
                  <Link to="/signup" className="flex flex-col items-center gap-1 group shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 group-hover:bg-primary/5 flex items-center justify-center transition-all">
                       <UserPlus size={18} className="text-stone-600 group-hover:text-primary transition-colors" />
                    </div>
                    {!content.join_deleted && (
                      <span className="text-[10px] md:text-[11px] font-black text-stone-500 group-hover:text-primary transition-colors whitespace-nowrap">
                         <EditableText 
                            value={content.join} 
                            fontSize={content.join_fontSize}
                            onSave={(val) => onUpdateContent?.('join', val)} 
                            onUpdateFontSize={(size) => onUpdateContent?.('join', size, 'fontSize')}
                            onDelete={() => onUpdateContent?.('join', true, 'deleted')}
                         />
                      </span>
                    )}
                  </Link>
                )}

                <Link to="/mypage" className="flex flex-col items-center gap-1 group shrink-0">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 group-hover:bg-primary/5 flex items-center justify-center transition-all">
                      <User size={18} className="text-stone-600 group-hover:text-primary transition-colors" />
                   </div>
                   {!content.myPage_deleted && (
                     <span className="text-[10px] md:text-[11px] font-black text-stone-500 group-hover:text-primary transition-colors whitespace-nowrap">
                        <EditableText 
                           value={content.myPage} 
                           fontSize={content.myPage_fontSize}
                           onSave={(val) => onUpdateContent?.('myPage', val)} 
                           onUpdateFontSize={(size) => onUpdateContent?.('myPage', size, 'fontSize')}
                           onDelete={() => onUpdateContent?.('myPage', true, 'deleted')}
                        />
                     </span>
                   )}
                </Link>

                <Link to="/mypage?tab=orders" className="flex flex-col items-center gap-1 group shrink-0">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 group-hover:bg-primary/5 flex items-center justify-center transition-all">
                      <ClipboardList size={18} className="text-stone-600 group-hover:text-primary transition-colors" />
                   </div>
                   {!content.orderTracking_deleted && (
                     <span className="text-[10px] md:text-[11px] font-black text-stone-500 group-hover:text-primary transition-colors whitespace-nowrap">
                        <EditableText 
                           value={content.orderTracking} 
                           fontSize={content.orderTracking_fontSize}
                           onSave={(val) => onUpdateContent?.('orderTracking', val)} 
                           onUpdateFontSize={(size) => onUpdateContent?.('orderTracking', size, 'fontSize')}
                           onDelete={() => onUpdateContent?.('orderTracking', true, 'deleted')}
                        />
                     </span>
                   )}
                </Link>

                <Link to="/cart" className="flex flex-col items-center gap-1 group relative shrink-0">
                   <div className="relative">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 group-hover:bg-primary/5 flex items-center justify-center transition-all">
                        <ShoppingCart size={18} className="text-stone-600 group-hover:text-primary transition-colors" />
                      </div>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          {cartCount}
                        </span>
                      )}
                   </div>
                   {!content.cart_deleted && (
                     <span className="text-[10px] md:text-[11px] font-black text-stone-500 group-hover:text-primary transition-colors whitespace-nowrap">
                        <EditableText 
                           value={content.cart} 
                           fontSize={content.cart_fontSize}
                           onSave={(val) => onUpdateContent?.('cart', val)} 
                           onUpdateFontSize={(size) => onUpdateContent?.('cart', size, 'fontSize')}
                           onDelete={() => onUpdateContent?.('cart', true, 'deleted')}
                        />
                     </span>
                   )}
                </Link>
             </div>
          </div>
        </div>

        {/* Bottom Header Area: Navigation (Categories) */}
        <div className="flex justify-center pt-6 border-t border-stone-100">
          <div className="flex flex-nowrap gap-x-2 md:gap-x-6 items-center justify-start md:justify-center overflow-x-auto scrollbar-hide px-4 w-full max-w-7xl">
            <Reorder.Group 
              axis="x" 
              values={categories} 
              onReorder={onReorderCategory || (() => {})}
              className="flex flex-nowrap gap-x-4 md:gap-x-8 items-center"
            >
              {categories.map((cat: any) => (
                <Reorder.Item 
                  key={cat.id} 
                  value={cat}
                  className="flex items-center relative group shrink-0"
                >
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCategoryClick(cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCategoryClick(cat.id);
                      }
                    }}
                    className={`text-lg md:text-xl font-black transition-all hover:scale-110 active:scale-90 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 whitespace-nowrap ${
                      filter === cat.id ? 'text-[#003D27]' : 'text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <EditableText 
                      value={cat.label} 
                      fontSize={cat.labelFontSize}
                      onUpdateFontSize={(size) => onUpdateCategoryFontSize?.(cat.id, size)}
                      onSave={(val) => onUpdateCategory?.(cat.id, val)}
                    />
                  </div>
                  {cat.id !== '전체' && isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory?.(cat.id);
                      }}
                      className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-125 border-2 border-white shadow-sm"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  )}
                  {filter === cat.id && (
                    <motion.div 
                      layoutId="active-nav-dot"
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#003D27]"
                    />
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            {isAdmin && (
              <button 
                onClick={onCreateCategory}
                className="w-10 h-10 rounded-full border-2 border-dashed border-stone-200 text-stone-300 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center shrink-0 ml-4 group"
                title="카테고리 추가"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
