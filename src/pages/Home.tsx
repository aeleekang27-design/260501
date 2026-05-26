import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Plus, X } from 'lucide-react';
import { Product } from '../types';
import EditableText from '../components/EditableText';
import EditableImage from '../components/EditableImage';

interface HomeProps {
  products: Product[];
  content: any;
  onUpdateContent: (key: string, value: string | number | boolean, type?: 'text' | 'fontSize' | 'deleted') => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  // ... rest same
}

export default function Home({ 
  products, 
  content, 
  onUpdateContent, 
  onUpdateProduct, 
  onDeleteProduct,
  onAddToCart,
  productListContent,
  onUpdateProductListContent,
  onUpdateCategory,
  onUpdateCategoryImage,
  onDeleteCategory,
  onReorderCategory,
  onCreateCategory,
  onCreateProduct,
  filter,
  setFilter
}: any) { // Use any briefly to avoid complex interface changes for now

  const filteredProducts = filter === '전체' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <main className="overflow-hidden bg-[#F8F9FA]">
      {/* Featured Section */}
      <section className="pt-24 pb-12 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <div className="text-secondary font-bold tracking-widest uppercase text-xs">
                <EditableText value={content.featuredTag} onSave={(val) => onUpdateContent('featuredTag', val)} />
              </div>
              <div className="text-4xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight">
                <EditableText value={content.featuredTitle} onSave={(val) => onUpdateContent('featuredTitle', val)} />
              </div>
            </div>
            <Link to="/curation/story1" className="group flex items-center gap-3 text-sm font-black text-stone-900 hover:text-primary transition-all">
               <span>전체 스토리 보기</span>
               <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                  <ArrowRight size={18} />
               </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => {
                const imgKey = `featureImg${i}`;
                const titleKey = `featureTitle${i}`;
                const descKey = `featureDesc${i}`;
                if (!content[titleKey] && i > 2) return null;
                return (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="group space-y-6"
                  >
                    <div className="aspect-[8/5] rounded-[32px] overflow-hidden editorial-shadow bg-stone-50">
                      <EditableImage 
                        src={content[imgKey]} 
                        onSave={(val) => onUpdateContent(imgKey, val)}
                        detailUrl={`/curation/story${i}`}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="space-y-2 px-2">
                       <div className="font-bold text-xl">
                          <EditableText value={content[titleKey]} onSave={(val) => onUpdateContent(titleKey, val)} />
                       </div>
                       <div className="text-sm text-stone-500 font-light leading-relaxed">
                          <EditableText value={content[descKey]} onSave={(val) => onUpdateContent(descKey, val)} multiline />
                       </div>
                    </div>
                  </motion.div>
                );
             })}
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <section id="product-section" className="pt-8 pb-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-primary"></div>
              <span className="text-secondary font-bold tracking-widest uppercase text-xs">Shop Selection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight">
              판매상품
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <motion.div 
                  key={p.id} 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group"
                >
                   <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden bg-white editorial-shadow mb-6">
                     <EditableImage 
                       src={p.image} 
                       onSave={(val) => onUpdateProduct(p.id, { image: val })}
                       detailUrl={`/product/${p.id}`}
                       className="w-full h-full"
                     />
                     {/* Promotion Badges */}
                     <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
                        {p.price < 50000 ? (
                           <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-sm shadow-lg uppercase tracking-widest">Hot</span>
                        ) : (
                           <span className="bg-primary text-white text-[9px] font-black px-2 py-1 rounded-sm shadow-lg uppercase tracking-widest">Best</span>
                        )}
                     </div>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         onDeleteProduct(p.id);
                       }}
                       className="absolute top-4 left-4 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10 hover:scale-110 active:scale-95"
                       title="상품 삭제"
                     >
                       <X size={18} strokeWidth={3} />
                     </button>
                     <button 
                       onClick={() => onAddToCart(p, 1)}
                       className="absolute bottom-4 right-4 w-10 h-10 bg-[#003D27] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                       title="장바구니 담기"
                     >
                       <ShoppingCart size={18} />
                     </button>
                   </div>
                  
                  <div className="space-y-1 px-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-xs font-medium">{p.category}</span>
                        {p.badges?.includes('ORGANIC') && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">유기농</span>
                        )}
                      </div>
                    </div>
                    {!p.nameDeleted && (
                      <div className="text-lg font-bold group-hover:text-primary transition-colors">
                        <EditableText 
                          value={p.name} 
                          fontSize={p.nameFontSize}
                          onSave={(val) => onUpdateProduct(p.id, { name: val })}
                          onUpdateFontSize={(size) => onUpdateProduct(p.id, { nameFontSize: size })}
                          onDelete={() => onUpdateProduct(p.id, { nameDeleted: true })}
                        />
                      </div>
                    )}
                    {!p.priceDeleted && (
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-black text-primary">
                          <EditableText 
                              value={p.price} 
                              fontSize={p.priceFontSize}
                              onSave={(val) => onUpdateProduct(p.id, { price: Number(val) })}
                              onUpdateFontSize={(size) => onUpdateProduct(p.id, { priceFontSize: size })}
                              onDelete={() => onUpdateProduct(p.id, { priceDeleted: true })}
                              type="number"
                          />원
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              <motion.div 
                layout
                whileHover={{ y: -5 }}
                onClick={() => onCreateProduct?.(filter === '전체' ? '과일' : filter)}
                className="group cursor-pointer flex flex-col items-center justify-center p-8 rounded-[24px] border-2 border-dashed border-stone-200 bg-white/50 hover:bg-white hover:border-primary/30 transition-all aspect-[16/10] text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Plus className="text-stone-400 group-hover:text-primary transition-colors" size={24} />
                </div>
                <div>
                  <p className="font-bold text-stone-600 group-hover:text-primary transition-colors">새 상품 추가</p>
                  <p className="text-xs text-stone-400">"{filter === '전체' ? '과일' : filter}" 카테고리에<br/>새로운 상품을 등록합니다</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Editor's Choice: Seasonal Collection */}
      <section className="py-24 bg-[#003D27] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <div className="text-primary font-black tracking-widest uppercase text-xs">Editor's Choice</div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-white tracking-tight">
                지금 가장 바른 선택<br/>계절을 담은 컬렉션
              </h2>
            </div>
            <p className="text-white/40 text-sm font-light max-w-sm">
              더 바른 농장의 큐레이터들이 직접 선별하고 구성한 금주의 컬렉션입니다. 균형 잡힌 맛과 영양을 한 번에 만나보세요.
            </p>
          </div>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-12 px-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto flex gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[300px] md:w-[450px] shrink-0 group cursor-pointer">
                <div className="aspect-[4/5] rounded-[48px] overflow-hidden relative mb-8 editorial-shadow">
                  <img 
                    src={i === 1 ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000' : i === 2 ? 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000' : 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=1000'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt="Collection"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex flex-col justify-end p-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Bundle Set 0{i}</span>
                    <h4 className="text-2xl font-bold font-serif mb-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all underline underline-offset-8">
                      {i === 1 ? '유기농 조식 꾸러미' : i === 2 ? '비타민 충전 과일 세트' : '주말 스테이크 정찬'}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Banner Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/event" className="group block relative h-[400px] md:h-[500px] rounded-[48px] overflow-hidden editorial-shadow">
            <div className="absolute inset-0">
               <img 
                 src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop" 
                 alt="Spring Event" 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-12 md:px-24">
                  <div className="max-w-xl space-y-6">
                    <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black text-white uppercase tracking-widest">
                       Limited Time Event
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight">
                       첫 구매 회원<br/>특별 50% 혜택
                    </h2>
                    <p className="text-white/80 text-lg font-light leading-relaxed max-w-sm">
                       더 바른 농장의 신규 회원이 되시는 분들을 위한 가장 특별한 환영 선물을 준비했습니다.
                    </p>
                    <div className="inline-flex items-center gap-3 text-white font-black text-lg pt-4">
                       혜택 받으러 가기 <ArrowRight size={24} className="transition-transform group-hover:translate-x-3" />
                    </div>
                  </div>
               </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Farm Story Section */}
      <section className="py-32 bg-[#F8F9FA] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[48px] overflow-hidden editorial-shadow flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 lg:p-24 space-y-12">
              <div className="space-y-4">
                <div className="text-secondary font-bold tracking-widest uppercase text-xs">
                  <EditableText value={content.farmStoryTag} onSave={(val) => onUpdateContent('farmStoryTag', val)} />
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
                  <EditableText value={content.farmStoryTitle} onSave={(val) => onUpdateContent('farmStoryTitle', val)} multiline />
                </h2>
              </div>
              
              <div className="relative">
                <div className="absolute -left-8 top-0 text-primary opacity-20 font-serif text-8xl">"</div>
                <p className="text-xl italic font-light text-stone-600 leading-relaxed pl-4">
                   <EditableText value={content.farmStoryQuote} onSave={(val) => onUpdateContent('farmStoryQuote', val)} multiline />
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900">
                    <EditableText value={content.farmStoryAdvTitle1} onSave={(val) => onUpdateContent('farmStoryAdvTitle1', val)} />
                  </h4>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    <EditableText value={content.farmStoryAdvDesc1} onSave={(val) => onUpdateContent('farmStoryAdvDesc1', val)} multiline />
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900">
                    <EditableText value={content.farmStoryAdvTitle2} onSave={(val) => onUpdateContent('farmStoryAdvTitle2', val)} />
                  </h4>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    <EditableText value={content.farmStoryAdvDesc2} onSave={(val) => onUpdateContent('farmStoryAdvDesc2', val)} multiline />
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative min-h-[500px]">
              <EditableImage 
                src={content.farmStoryImg} 
                onSave={(val) => onUpdateContent('farmStoryImg', val)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
