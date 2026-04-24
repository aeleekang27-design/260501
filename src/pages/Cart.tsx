import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, X, Info, Truck } from 'lucide-react';
import { CartItem } from '../types';
import EditableText from '../components/EditableText';

interface CartProps {
  items: CartItem[];
  content: any;
  onUpdateContent: (key: string, value: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function Cart({ items, content, onUpdateContent, onUpdateQuantity, onRemoveItem }: CartProps) {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = items.reduce((sum, item) => {
    if (item.product.originalPrice) {
      return sum + (item.product.originalPrice - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 3000;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-[#F8F9FA] pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 font-serif">
            <EditableText 
                value={content.cartTitle} 
                onSave={(val) => onUpdateContent('cartTitle', val)}
            />
          </h1>
          <p className="text-stone-400 font-light text-sm tracking-tight border-stone-100">
            엄격하게 선별된 당신의 신선한 선택들입니다.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Cart Items List */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex justify-between items-center py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={items.length > 0} 
                  readOnly 
                  className="w-5 h-5 accent-primary border-stone-300 rounded"
                />
                <span className="text-stone-700">전체선택 ({items.length}/{items.length})</span>
              </div>
              <button className="text-stone-300 hover:text-stone-500 transition-colors">선택삭제</button>
            </div>

            {items.map((item) => (
              <div key={item.product.id} className="bg-white p-8 rounded-2xl editorial-shadow relative group">
                <button 
                  onClick={() => onRemoveItem(item.product.id)}
                  className="absolute top-6 right-6 text-stone-300 hover:text-stone-500 p-2"
                >
                  <X size={20} />
                </button>

                <div className="flex gap-6 items-center">
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-stone-50 shrink-0 shadow-sm border border-stone-100">
                    <Link to={`/product/${item.product.id}`}>
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </Link>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{item.product.name}</h3>
                      <p className="text-xs text-stone-400 font-light">{item.product.description}</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-stone-100 rounded-lg bg-white">
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="px-3 py-2 text-stone-300 hover:text-primary"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-3 py-2 text-stone-300 hover:text-primary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.product.originalPrice && (
                          <div className="text-xs text-stone-300 line-through mb-1">
                            {(item.product.originalPrice * item.quantity).toLocaleString()}원
                          </div>
                        )}
                        <div className="text-xl font-black">
                          {(item.product.price * item.quantity).toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {items.length === 0 && (
              <div className="bg-white p-20 rounded-2xl text-center border border-dashed border-stone-200">
                <div className="text-stone-400">
                    <EditableText 
                        value={content.cartEmpty} 
                        onSave={(val) => onUpdateContent('cartEmpty', val)}
                    />
                </div>
                <Link to="/products" className="inline-block mt-4 text-primary font-bold hover:underline">
                  상품 보러가기
                </Link>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="lg:w-[400px] shrink-0 sticky top-32 space-y-6">
            <div className="bg-white p-8 rounded-2xl editorial-shadow">
              <h2 className="text-xl font-bold mb-10">결제 요약</h2>
              
              <div className="space-y-4 text-sm mb-10">
                <div className="flex justify-between text-stone-600">
                  <span>총 상품금액</span>
                  <span>{(subtotal + discount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">할인금액</span>
                  <span className="text-[#E12E2E]">-{discount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>배송비</span>
                  <span>{shipping.toLocaleString()}원</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-8 mb-8 border-t border-stone-50">
                <span className="text-lg font-bold">결제 예정 금액</span>
                <span className="text-4xl font-black">{total.toLocaleString()}원</span>
              </div>

              {shipping > 0 && (
                <div className="bg-[#F0F9F5] p-5 rounded-xl flex gap-3 text-xs text-[#003D32] leading-relaxed mb-8">
                  <Info size={16} className="shrink-0" />
                  <p>
                    <span className="font-bold">{(50000 - subtotal).toLocaleString()}원</span> 더 담으시면 <span className="font-bold">무료배송</span> 혜택을 받으실 수 있습니다.
                  </p>
                </div>
              )}

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#003D32] text-white py-5 rounded-xl font-bold text-lg hover:shadow-xl hover:bg-opacity-95 transition-all"
              >
                주문하기
              </button>
              
              <p className="text-center text-[10px] text-stone-300 mt-6">
                쿠폰/적립금은 다음 주문 단계에서 적용 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
