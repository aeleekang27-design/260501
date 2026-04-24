import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Share2, ArrowLeft, Info, Package, Shield, Minus, Plus, Check } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types';
import EditableText from '../components/EditableText';
import EditableImage from '../components/EditableImage';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  content?: any;
  onUpdateContent?: (key: string, value: string) => void;
}

export default function ProductDetail({ 
  products, 
  onAddToCart, 
  onUpdateProduct, 
  onDeleteProduct,
  content = {
    backToList: '목록으로 돌아가기',
    deleteProduct: '상품 삭제하기',
    skuLabel: 'SKU',
    deliveryLabel: '배송 방식',
    deliveryValue: '샛별배송 (수도권 기준)',
    weightLabel: '중량/용량',
    quantityLabel: '주문 수량',
    addToCart: '장바구니 담기',
    buyNow: '바로 구매하기',
    wishlist: '위시리스트',
    share: '공유하기',
    originTitle: '상세 산지 정보',
    originHeading: '투명한 생산 과정, 당신이 먹는 것이 곧 당신입니다.',
    originDesc: '프리미엄 오가닉은 산지의 토양부터 수확의 순간까지 엄격하게 관리합니다. 모든 상품의 생산 이력을 투명하게 공개하여 안심하고 드실 수 있습니다.',
    specLabel1: '수확 시기',
    specValue1: '2024년 3월 중순',
    specLabel2: '배송 온도',
    specValue2: '신선 냉장 보관 (0 ~ 4°C)',
    specLabel3: '원산지',
    specLabel4: '품질 인증',
    specValue4: '유기농 농산물 인증 완료',
  },
  onUpdateContent
}: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (!product || !user) return;

    // Check wishlist status
    const checkWishlist = async () => {
      try {
        const wishRef = doc(db, 'users', user.uid, 'wishlist', product.id);
        const wishDoc = await getDoc(wishRef);
        setIsWishlisted(wishDoc.exists());
      } catch (error) {
        console.error('Wishlist check failed:', error);
      }
    };
    checkWishlist();

    // Track recently viewed
    const trackRecent = () => {
      try {
        const recentKey = `recent_${user.uid}`;
        const existing = JSON.parse(localStorage.getItem(recentKey) || '[]');
        const updated = [product.id, ...existing.filter((pid: string) => pid !== product.id)].slice(0, 10);
        localStorage.setItem(recentKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Track recent failed:', e);
      }
    };
    trackRecent();
  }, [product, user]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">상품을 찾을 수 없습니다.</h2>
        <button onClick={() => navigate('/products')} className="text-primary hover:underline">상품 목록으로 돌아가기</button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
        onDeleteProduct(product.id);
        navigate(-1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity);
    navigate('/checkout');
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }

    try {
      const wishRef = doc(db, 'users', user.uid, 'wishlist', product.id);
      if (isWishlisted) {
        await deleteDoc(wishRef);
        setIsWishlisted(false);
      } else {
        await setDoc(wishRef, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          addedAt: new Date()
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-12 pb-24 px-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-8 py-4 rounded-full editorial-shadow flex items-center gap-3 font-bold"
          >
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            장바구니에 상품을 담았습니다.
            <button 
                onClick={() => navigate('/cart')}
                className="ml-4 text-xs font-black uppercase tracking-widest text-primary border-b border-primary hover:text-white hover:border-white transition-all"
            >
                장바구니 보기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(-1)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(-1); }}
              className="flex items-center gap-2 text-sm text-stone-400 hover:text-primary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
            >
              <ArrowLeft size={18} /> 
              <EditableText 
                  value={content.backToList} 
                  onSave={(val) => onUpdateContent?.('backToList', val)}
              />
            </div>
            <div 
                role="button"
                tabIndex={0}
                onClick={handleDelete}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDelete(); }}
                className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1"
            >
                <EditableText 
                    value={content.deleteProduct} 
                    onSave={(val) => onUpdateContent?.('deleteProduct', val)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Gallery */}
           <div className="space-y-6">
             <div className="aspect-[8/5] overflow-hidden rounded-[32px] editorial-shadow bg-stone-50">
               <EditableImage
                 src={product.image}
                 onSave={(val) => onUpdateProduct(product.id, { image: val })}
                 className="w-full h-full"
               />
             </div>
            <div className="grid grid-cols-4 gap-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className={`aspect-[16/10] rounded-2xl border ${i === 1 ? 'border-primary ring-1 ring-primary' : 'border-stone-100'} bg-stone-50 overflow-hidden`}>
                    <EditableImage 
                      src={product.image} 
                      onSave={(val) => onUpdateProduct(product.id, { image: val })}
                      className="w-full h-full"
                    />
                 </div>
               ))}
            </div>
          </div>

          {/* Info Area */}
          <div className="space-y-10">
             <header className="space-y-4">
                <div className="flex items-center gap-3">
                   <span className="text-[#003D32] bg-[#F0F9F5] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{product.category}</span>
                   {product.badges?.includes('ORGANIC') && (
                     <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">유기농</span>
                   )}
                   <div className="text-stone-300 text-xs">
                     <EditableText 
                        value={content.skuLabel} 
                        onSave={(val) => onUpdateContent?.('skuLabel', val)}
                     />: {product.id.padStart(6, '0')}
                   </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold leading-tight">
                    <EditableText 
                        value={product.name} 
                        onSave={(val) => onUpdateProduct(product.id, { name: val })}
                        multiline
                    />
                </div>
                <div className="text-stone-500 font-light leading-relaxed text-lg">
                    <EditableText 
                        value={product.description} 
                        onSave={(val) => onUpdateProduct(product.id, { description: val })}
                        multiline
                    />
                </div>
             </header>

             <div className="space-y-6">
                <div className="flex items-baseline gap-4">
                   <div className="text-4xl font-black">
                        <EditableText 
                            value={product.price} 
                            onSave={(val) => onUpdateProduct(product.id, { price: Number(val) })}
                            type="number"
                        />원
                   </div>
                   {product.originalPrice && (
                      <div className="text-2xl text-stone-300 line-through font-light">
                        <EditableText 
                            value={product.originalPrice} 
                            onSave={(val) => onUpdateProduct(product.id, { originalPrice: Number(val) })}
                            type="number"
                        />원
                      </div>
                   )}
                </div>
                
                <div className="bg-[#F8F9FA] p-6 rounded-2xl flex flex-wrap gap-y-6 gap-x-12">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center editorial-shadow text-primary">
                         <Info size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                            <EditableText 
                                value={content.deliveryLabel} 
                                onSave={(val) => onUpdateContent?.('deliveryLabel', val)}
                            />
                         </p>
                         <p className="text-sm font-bold">
                            <EditableText 
                                value={content.deliveryValue} 
                                onSave={(val) => onUpdateContent?.('deliveryValue', val)}
                            />
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center editorial-shadow text-primary text-xs font-black">
                         {product.weight?.[0] || 'W'}
                      </div>
                      <div>
                         <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                            <EditableText 
                                value={content.weightLabel} 
                                onSave={(val) => onUpdateContent?.('weightLabel', val)}
                            />
                         </p>
                         <div className="text-sm font-bold">
                            <EditableText 
                                value={product.weight || '500g 내외'} 
                                onSave={(val) => onUpdateProduct(product.id, { weight: val })}
                            />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white border border-stone-100 rounded-2xl editorial-shadow">
                   <span className="font-bold text-sm">
                        <EditableText 
                            value={content.quantityLabel} 
                            onSave={(val) => onUpdateContent?.('quantityLabel', val)}
                        />
                   </span>
                   <div className="flex items-center gap-6 border border-stone-100 rounded-lg px-4 py-2">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-stone-300 hover:text-primary p-1">
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-black text-xl">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="text-stone-300 hover:text-primary p-1">
                        <Plus size={16} />
                      </button>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div 
                     role="button"
                     tabIndex={0}
                     onClick={handleAddToCart}
                     className="flex-[1.5] py-5 bg-white border border-stone-100 rounded-2xl font-bold editorial-shadow hover:bg-stone-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                   >
                      <ShoppingCart size={20} />
                      <EditableText 
                        value={content.addToCart} 
                        onSave={(val) => onUpdateContent?.('addToCart', val)}
                      />
                   </div>
                   <div 
                     role="button"
                     tabIndex={0}
                     onClick={handleBuyNow}
                     className="flex-[2] py-5 bg-primary text-white rounded-2xl font-bold shadow-xl hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
                   >
                      <EditableText 
                        value={content.buyNow} 
                        onSave={(val) => onUpdateContent?.('buyNow', val)}
                      />
                   </div>
                </div>
             </div>

             <div className="flex gap-8 justify-center pt-2">
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={handleToggleWishlist}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleWishlist(); }}
                  className={`flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer group/wish outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1 ${
                    isWishlisted ? 'text-primary' : 'text-stone-400 hover:text-primary'
                  }`}
                >
                   <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} /> 
                   <EditableText 
                        value={content.wishlist} 
                        onSave={(val) => onUpdateContent?.('wishlist', val)}
                   />
                </div>
                <div className="w-[1px] h-3 bg-stone-200" />
                <div className="flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-primary transition-colors cursor-pointer group/share pointer-events-auto">
                   <Share2 size={16} /> 
                   <EditableText 
                        value={content.share} 
                        onSave={(val) => onUpdateContent?.('share', val)}
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Details Section */}
        <section className="mt-32 pt-24 border-t border-stone-100 grid grid-cols-1 lg:grid-cols-3 gap-20">
            <div className="space-y-6">
               <div className="text-secondary font-bold tracking-widest uppercase text-xs">
                 <EditableText 
                     value={content.originTitle} 
                     onSave={(val) => onUpdateContent?.('originTitle', val)}
                 />
               </div>
               <div className="text-3xl font-bold font-serif leading-tight">
                 <EditableText 
                     value={content.originHeading} 
                     onSave={(val) => onUpdateContent?.('originHeading', val)}
                     multiline
                 />
               </div>
               <div className="text-stone-400 font-light leading-relaxed">
                 <EditableText 
                     value={content.originDesc} 
                     onSave={(val) => onUpdateContent?.('originDesc', val)}
                     multiline
                 />
               </div>
            </div>
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { label: content.specLabel1, val: content.specValue1, key: 'specValue1', labelKey: 'specLabel1' },
                { label: content.specLabel2, val: content.specValue2, key: 'specValue2', labelKey: 'specLabel2' },
                { label: content.specLabel3, val: product.origin || '대한민국', key: 'origin', productMode: true, labelKey: 'specLabel3' },
                { label: content.specLabel4, val: content.specValue4, key: 'specValue4', labelKey: 'specLabel4' },
              ].map((spec, i) => (
                <div key={i} className="pb-6 border-b border-stone-50 flex justify-between items-end">
                   <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                        <EditableText 
                            value={spec.label} 
                            onSave={(val) => onUpdateContent?.(spec.labelKey, val)}
                        />
                   </span>
                   <div className="font-bold">
                        <EditableText 
                            value={spec.val} 
                            onSave={(val) => spec.productMode ? onUpdateProduct(product.id, { [spec.key]: val }) : onUpdateContent?.(spec.key, val)}
                        />
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </main>
  );
}
