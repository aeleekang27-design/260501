import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Truck, 
  User, 
  MapPin, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Loader2,
  Lock,
  Smartphone
} from 'lucide-react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem } from '../types';

interface CheckoutProps {
  cartItems: CartItem[];
  user: any;
  onClearCart: () => void;
}

// Simulated Payment Gateway Modal component
const PaymentGateway = ({ total, onSucceed, onCancel, method }: { total: number, onSucceed: () => void, onCancel: () => void, method: string }) => {
  const [status, setStatus] = useState<'processing' | 'success'>('processing');

  useEffect(() => {
    // Auto-process for simulation
    const timer = setTimeout(() => {
      setStatus('success');
      setTimeout(onSucceed, 1500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onSucceed]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.9 }}
        className="bg-white w-full max-w-[400px] overflow-hidden rounded-[32px] editorial-shadow"
      >
        {/* Header */}
        <div className="bg-[#F8F9FA] px-8 py-6 flex items-center justify-between border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-stone-400" />
            <span className="text-sm font-bold text-stone-600">안전결제</span>
          </div>
          <button onClick={onCancel} className="text-stone-300 hover:text-stone-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 text-center space-y-8">
          <AnimatePresence mode="wait">
            {status === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 py-6"
              >
                <div className="flex justify-center">
                  <Loader2 size={48} className="text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">결제 진행 중</h3>
                  <p className="text-sm text-stone-400">결제 정보를 안전하게 처리하고 있습니다.</p>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 py-6"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">결제 성공</h3>
                  <p className="text-sm text-stone-400">결제가 정상적으로 완료되었습니다.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[#F8F9FA] p-6 rounded-2xl space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-400">결제수단</span>
              <span className="font-bold text-stone-800">{method}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-stone-400 text-sm">최종 결제금액</span>
              <span className="text-2xl font-black text-primary">{total.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="px-10 pb-10">
          <p className="text-[10px] text-center text-stone-300">
            주식회사 더 바른 농장 | 전자금융거래업 제02-001-00001호
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Checkout({ cartItems, user, onClearCart }: CheckoutProps) {
  const navigate = useNavigate();
  const [isOrdered, setIsOrdered] = useState(false);
  const [showPG, setShowPG] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.product.originalPrice) {
      return sum + (item.product.originalPrice - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 3000;
  const total = subtotal + shipping;

  const handleOrder = () => {
    setShowPG(true);
  };

  const saveOrderToFirestore = async () => {
    if (!user) return;

    try {
      const orderId = `ord-${Date.now()}`;
      const orderData = {
        userId: user.uid,
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        total,
        status: 'ready', // Default status: paid and ready for shipping
        createdAt: serverTimestamp(),
        paymentMethod: getMethodName(paymentMethod)
      };

      await setDoc(doc(db, 'users', user.uid, 'orders', orderId), orderData);
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const handlePaymentSuccess = () => {
    saveOrderToFirestore();
    setShowPG(false);
    setIsOrdered(true);
    onClearCart();
  };

  if (isOrdered) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-[32px] editorial-shadow text-center space-y-8"
        >
          <div className="w-20 h-20 bg-[#F0F9F5] rounded-full flex items-center justify-center mx-auto text-primary">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-serif">주문이 완료되었습니다</h2>
            <p className="text-stone-400 font-light leading-relaxed">
              프리미엄 오가닉 제품들과 함께<br />
              더욱 건강한 일상을 시작해보세요.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link to="/" className="w-full bg-[#003D32] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all">
              계속 쇼핑하기
            </Link>
            <Link to="/order-tracking" className="w-full bg-stone-50 text-stone-600 py-4 rounded-xl font-bold hover:bg-stone-100 transition-all">
              주문내역 확인
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-6">
        <h2 className="text-2xl font-bold">주문할 상품이 없습니다.</h2>
        <Link to="/" className="bg-[#003D32] text-white px-8 py-3 rounded-xl font-bold">
          상품 보러가기
        </Link>
      </main>
    );
  }

  const getMethodName = (id: string) => {
    switch(id) {
      case 'card': return '신용/체크카드';
      case 'kakao': return '카카오페이';
      case 'naver': return '네이버페이';
      case 'toss': return '토스페이';
      default: return '일반결제';
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pt-12 pb-32 px-6">
      <AnimatePresence>
        {showPG && (
          <PaymentGateway 
            total={total} 
            method={getMethodName(paymentMethod)}
            onSucceed={handlePaymentSuccess} 
            onCancel={() => setShowPG(false)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors text-stone-400 hover:text-stone-900">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold font-serif">주문/결제</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-stone-200'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-primary' : 'bg-stone-200'}`} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Info */}
            <section className="bg-white p-8 rounded-[32px] editorial-shadow space-y-8">
              <div className="flex items-center justify-between border-b border-stone-50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-primary">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-xl font-bold">배송 정보</h2>
                </div>
                <button className="text-sm font-bold text-primary hover:underline">변경하기</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">받으실 분</p>
                    <p className="font-bold">{user?.name || '홍길동'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">연락처</p>
                    <p className="font-bold">{user?.phone || '010-1234-5678'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">배송지</p>
                    <p className="font-bold leading-relaxed">
                      [06232] 서울특별시 강남구 테헤란로 231<br />
                      센터필드 18층 AI 빌딩
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-50">
                <select className="w-full h-14 bg-[#F8F9FA] border-none rounded-xl px-6 outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                  <option>주문 요청사항을 선택해주세요</option>
                  <option>부재 시 문 앞에 놓아주세요</option>
                  <option>경비실에 맡겨주세요</option>
                  <option>배송 전 연락 부탁드립니다</option>
                  <option>직접 입력</option>
                </select>
              </div>
            </section>

            {/* Order Items */}
            <section className="bg-white p-8 rounded-[32px] editorial-shadow space-y-8">
              <div className="flex items-center gap-3 border-b border-stone-50 pb-6">
                <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-primary">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-xl font-bold">주문 상품 ({cartItems.length})</h2>
              </div>
              
              <div className="divide-y divide-stone-50">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-6 flex gap-6 first:pt-0 last:pb-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-100">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold mb-1">{item.product.name}</h3>
                        <p className="text-xs text-stone-400 font-light">{item.quantity}개</p>
                      </div>
                      <span className="font-black">{(item.product.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-8 rounded-[32px] editorial-shadow space-y-8">
              <div className="flex items-center gap-3 border-b border-stone-50 pb-6">
                <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-primary">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-bold">결제 수단</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'card', name: '신용/체크카드', icon: CreditCard },
                  { id: 'kakao', name: '카카오페이', img: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/kakaotalk_logo_icon_147271.png' },
                  { id: 'naver', name: '네이버페이', text: 'N' },
                  { id: 'toss', name: '토스페이', text: 't' },
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 group ${
                      paymentMethod === method.id ? 'border-primary bg-[#F0F9F5]' : 'border-stone-50 hover:border-stone-200'
                    }`}
                  >
                    {method.icon && <method.icon size={24} className={paymentMethod === method.id ? 'text-primary' : 'text-stone-400 group-hover:text-stone-600'} />}
                    {method.img && <img src={method.img} alt="" className="w-6 h-6 object-contain" />}
                    {method.text && <span className={`text-xl font-black ${method.id === 'naver' ? 'text-[#03C75A]' : 'text-[#0050ff]'}`}>{method.text}</span>}
                    <span className={`text-[10px] font-bold ${paymentMethod === method.id ? 'text-primary' : 'text-stone-400'}`}>{method.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Side Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] editorial-shadow sticky top-32">
              <h2 className="text-xl font-bold mb-10">최종 결제 금액</h2>
              
              <div className="space-y-4 text-sm mb-10">
                <div className="flex justify-between text-stone-400">
                  <span>총 상품금액</span>
                  <span className="text-stone-900 font-bold">{(subtotal + discount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">할인금액</span>
                  <span className="text-red-500 font-bold">-{discount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>배송비</span>
                  <span className="text-stone-900 font-bold">+{shipping.toLocaleString()}원</span>
                </div>
              </div>

              <div className="pt-8 border-t border-stone-50 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold">총 결제금액</span>
                  <span className="text-4xl font-black text-primary">{total.toLocaleString()}원</span>
                </div>
              </div>

              <div className="bg-[#F8F9FA] p-6 rounded-2xl space-y-4 mb-10">
                <div className="flex items-center gap-3 text-xs font-medium text-stone-500">
                  <ShieldCheck size={16} className="text-primary" />
                  안전한 결제를 보장합니다.
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  개인정보 수집 및 이용에 동의하며, 위 상품의 주문 결제에 동의합니다.
                </p>
              </div>

              <button 
                onClick={handleOrder}
                className="w-full bg-[#003D32] text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-opacity-95 active:scale-[0.98] transition-all"
              >
                {total.toLocaleString()}원 결제하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
