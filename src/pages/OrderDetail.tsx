import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  ChevronLeft, 
  MapPin, 
  Package, 
  CreditCard, 
  Clock,
  Printer,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrder = async () => {
      // Safety timeout for order detail fetch (8 seconds)
      const timeoutId = setTimeout(() => {
        setLoading(prev => {
          if (prev) {
            console.warn('Order detail fetch timed out');
            return false;
          }
          return prev;
        });
      }, 8000);

      try {
        const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">주문 정보를 찾을 수 없습니다.</h2>
      <button onClick={() => navigate('/order-tracking')} className="text-primary font-bold">주문 목록으로 돌아가기</button>
    </div>
  );

  const getStatusText = (status: string) => {
    switch(status) {
      case 'payment_pending': return '입금대기';
      case 'ready': return '배송준비중';
      case 'shipping': return '배송중';
      case 'completed': return '배송완료';
      case 'canceled': return '취소/반품';
      default: return '상태확인중';
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-all font-medium">
            <ChevronLeft size={20} />
            뒤로가기
          </button>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-stone-600">
              <Printer size={16} />
              거래명세서 출력
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Order Status Card */}
          <div className="bg-white border border-stone-100 p-10 editorial-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-1">Order Summary</p>
                <h2 className="text-3xl font-black text-stone-900 tracking-tight">주문 상세 내역</h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-stone-400 font-medium">
                  <span>주문일자: {order.createdAt?.toDate().toLocaleDateString()}</span>
                  <span className="w-[1px] h-3 bg-stone-200" />
                  <span>주문번호: <span className="text-stone-900 font-bold">{order.id}</span></span>
                </div>
              </div>
              <div className="bg-[#F0F9F5] px-6 py-4 rounded-xl border border-[#D5EFE3] flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary/60 uppercase">Current Status</p>
                  <p className="text-lg font-black text-primary">{getStatusText(order.status)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Delivery Info */}
             <div className="bg-white border border-stone-100 p-8 editorial-shadow">
               <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                 <MapPin size={18} className="text-primary" />
                 배송지 정보
               </h3>
               <div className="space-y-4">
                 <div className="flex justify-between border-b border-stone-50 pb-4">
                   <span className="text-xs font-bold text-stone-400 uppercase">받는사람</span>
                   <span className="text-xs font-bold text-stone-900">{order.shippingInfo?.name || '본인'}</span>
                 </div>
                 <div className="flex justify-between border-b border-stone-50 pb-4">
                   <span className="text-xs font-bold text-stone-400 uppercase">연락처</span>
                   <span className="text-xs font-bold text-stone-900">{order.shippingInfo?.phone || '미등록'}</span>
                 </div>
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-stone-400 uppercase mb-2">주소</p>
                   <p className="text-sm font-medium text-stone-900 leading-relaxed">
                     {order.shippingInfo?.address || '서울특별시 강남구 테헤란로 123 더바른빌딩 7층'}
                   </p>
                 </div>
                 <div className="mt-6 p-4 bg-stone-50 rounded-lg text-[11px] text-stone-500 font-medium leading-relaxed">
                   <span className="font-bold text-stone-800">[배송요청사항]</span><br />
                   {order.shippingInfo?.memo || '부재 시 문 앞에 놓아주세요.'}
                 </div>
               </div>
             </div>

             {/* Payment Info */}
             <div className="bg-white border border-stone-100 p-8 editorial-shadow">
               <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                 <CreditCard size={18} className="text-primary" />
                 결제 정보
               </h3>
               <div className="space-y-4">
                 <div className="flex justify-between border-b border-stone-50 pb-4">
                   <span className="text-xs font-bold text-stone-400 uppercase">결제방법</span>
                   <span className="text-xs font-bold text-stone-900">{order.paymentMethod || '신용카드'}</span>
                 </div>
                 <div className="flex justify-between border-b border-stone-50 pb-4">
                   <span className="text-xs font-bold text-stone-400 uppercase">상품금액</span>
                   <span className="text-xs font-bold text-stone-900">{order.total.toLocaleString()}원</span>
                 </div>
                 <div className="flex justify-between border-b border-stone-50 pb-4">
                   <span className="text-xs font-bold text-stone-400 uppercase">배송비</span>
                   <span className="text-xs font-bold text-stone-900">0원</span>
                 </div>
                 <div className="flex justify-between border-b border-stone-50 pb-4 text-primary bg-primary/5 -mx-4 px-4 py-2">
                   <span className="text-sm font-black uppercase">총 결제금액</span>
                   <span className="text-lg font-black">{order.total.toLocaleString()}원</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Ordered Items */}
          <div className="bg-white border border-stone-100 editorial-shadow">
            <div className="px-8 py-6 border-b border-stone-100">
               <h3 className="text-lg font-bold text-stone-900">주문 상품 ({order.items.length})</h3>
            </div>
            <div className="divide-y divide-stone-50">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-8 flex items-center justify-between group">
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-50 border border-stone-100">
                       <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary/60 uppercase">Product {idx + 1}</p>
                      <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                      <p className="text-xs text-stone-400 font-medium">수량: {item.quantity || 1}개</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-stone-900">{item.price.toLocaleString()}원</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-stone-50 text-center border-t border-stone-100">
              <button 
                onClick={() => navigate('/products')}
                className="text-[11px] font-bold text-stone-400 hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                다른 상품 보러가기 <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
