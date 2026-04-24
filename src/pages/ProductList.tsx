import React, { useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { Link } from 'react-router-dom';
import { Plus, Grid, List, ShoppingCart, X } from 'lucide-react';
import { Product } from '../types';
import EditableText from '../components/EditableText';
import EditableImage from '../components/EditableImage';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  initialCategory?: string;
  header?: any;
  onUpdateHeader?: (key: string, value: string) => void;
  onUpdateCategory?: (id: string, newLabel: string) => void;
  onUpdateCategoryImage?: (id: string, newImage: string) => void;
  onDeleteCategory?: (id: string) => void;
  onReorderCategory?: (newCategories: any[]) => void;
  onCreateCategory?: () => void;
  onCreateProduct?: (category: string) => void;
}

export default function ProductList({ 
  products, 
  onAddToCart, 
  onUpdateProduct, 
  onDeleteProduct,
  initialCategory = '전체',
  header = {
    tag: '최고의 신선함, 제철 컬렉션',
    title: '신선한 오늘의 수확',
    desc: '가장 완벽한 순간에 수확하여 산지의 신선함을 그대로 전해드립니다.',
    categories: []
  },
  onUpdateHeader,
  onUpdateCategory,
  onUpdateCategoryImage,
  onDeleteCategory,
  onReorderCategory,
  onCreateCategory,
  onCreateProduct
}: ProductListProps) {
  const [filter, setFilter] = useState(initialCategory);

  const filteredProducts = filter === '전체' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pt-8 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="mb-16 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="h-[2px] w-12 bg-primary"></div>
              <span className="text-secondary font-bold tracking-widest uppercase text-xs">Our Recommendations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight">
              판매상품
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-stone-100 pb-10">
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide items-center flex-1">
               <Reorder.Group 
                 axis="x" 
                 values={header.categories || []} 
                 onReorder={(newCats) => onReorderCategory?.(newCats)}
                 className="flex gap-4 items-center"
               >
                 {header.categories?.map((cat: any) => (
                   <Reorder.Item 
                     key={cat.id} 
                     value={cat}
                     className="flex flex-col items-center relative group"
                   >
                     <div 
                       role="button"
                       tabIndex={0}
                       onClick={() => setFilter(cat.id)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                           e.preventDefault();
                           setFilter(cat.id);
                         }
                       }}
                       className={`whitespace-nowrap px-10 py-5 rounded-2xl text-xl font-black transition-all cursor-grab active:cursor-grabbing ${
                         filter === cat.id 
                         ? 'bg-stone-900 text-white shadow-2xl scale-110 ring-4 ring-stone-900/10' 
                         : cat.id === '이벤트'
                           ? 'bg-amber-400 text-amber-900 hover:bg-amber-500 border border-amber-200 shadow-sm'
                           : 'bg-white text-stone-400 hover:text-stone-900 border border-stone-100 shadow-sm hover:shadow-md'
                       }`}
                     >
                       <EditableText 
                          value={cat.label} 
                          onSave={(val) => onUpdateCategory?.(cat.id, val)}
                       />
                     </div>

                     {/* Dedicated Delete Button for Categories */}
                     {cat.id !== '전체' && cat.id !== '더 바른 농장' && (
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           onDeleteCategory?.(cat.id);
                         }}
                         className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:scale-110 active:scale-95"
                         title="카테고리 삭제"
                       >
                         <X size={14} strokeWidth={3} />
                       </button>
                     )}
                   </Reorder.Item>
                 ))}
               </Reorder.Group>

               {/* Add Category Button */}
               <div className="flex flex-col items-center shrink-0">
                 <button 
                   onClick={onCreateCategory}
                   className="whitespace-nowrap px-10 py-5 rounded-2xl text-xl font-black border-2 border-dashed border-stone-200 text-stone-300 hover:text-stone-900 hover:border-stone-400 hover:bg-white transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                 >
                   <Plus size={20} strokeWidth={3} /> 추가
                 </button>
               </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {filteredProducts.map((p) => (
            <div 
              key={p.id} 
              className="group"
            >
               <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden bg-white editorial-shadow mb-6">
                 <EditableImage 
                   src={p.image} 
                   onSave={(val) => onUpdateProduct(p.id, { image: val })}
                   detailUrl={`/product/${p.id}`}
                   className="w-full h-full"
                 />
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
                  className="absolute bottom-4 right-4 w-10 h-10 bg-[#003D32] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
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
                  {p.originalPrice && (
                    <span className="text-secondary text-[10px] font-black uppercase">Sale</span>
                  )}
                </div>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                  <EditableText 
                    value={p.name} 
                    onSave={(val) => onUpdateProduct(p.id, { name: val })}
                  />
                </h3>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-black">
                    <EditableText 
                        value={p.price} 
                        onSave={(val) => onUpdateProduct(p.id, { price: Number(val) })}
                        type="number"
                    />원
                  </div>
                  {p.originalPrice && (
                    <span className="text-sm text-stone-300 line-through">
                      <EditableText 
                        value={p.originalPrice} 
                        onSave={(val) => onUpdateProduct(p.id, { originalPrice: Number(val) })}
                        type="number"
                      />원
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Product Card (Moved to the end) */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => onCreateProduct?.(filter)}
            className="group cursor-pointer flex flex-col items-center justify-center p-8 rounded-[24px] border-2 border-dashed border-stone-200 bg-white/50 hover:bg-white hover:border-primary/30 transition-all aspect-[16/10] text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Plus className="text-stone-400 group-hover:text-primary transition-colors" size={24} />
            </div>
            <div>
              <p className="font-bold text-stone-600 group-hover:text-primary transition-colors">새 상품 추가</p>
              <p className="text-xs text-stone-400">"{filter}" 카테고리에<br/>새로운 상품을 등록합니다</p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
