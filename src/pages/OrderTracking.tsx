import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Search, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  User,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

// --- Delivery Tracking Modal ---
const TrackingModal = ({ order, isOpen, onClose }: { order: any, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !order) return null;

  const steps = [
    { label: '결제완료', status: 'completed', date: order.createdAt?.toDate().toLocaleString() },
    { label: '상품준비중', status: order.status === 'ready' || order.status === 'shipping' || order.status === 'completed' ? 'completed' : 'pending' },
    { label: '배송중', status: order.status === 'shipping' || order.status === 'completed' ? 'completed' : 'pending' },
    { label: '배송완료', status: order.status === 'completed' ? 'completed' : 'pending' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="bg-[#003D27] p-6 text-white flex justify-between items-center">
           <div>
             <h3 className="text-lg font-bold">배송 현황</h3>
             <p className="text-[10px] text-white/60 font-medium">Order ID: {order.id}</p>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
             <X size={18} />
           </button>
        </div>

        <div className="p-8 space-y-8">
           <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
             <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
               <Truck size={24} />
             </div>
             <div>
               <p className="text-xs font-bold text-stone-400">배송 업체</p>
               <p className="text-sm font-black text-stone-900">대한통운 (운송장: 1234567890)</p>
             </div>
           </div>

           <div className="relative pl-10 space-y-10">
              <div className="absolute left-[15px] top-1 bottom-1 w-[2px] bg-stone-100" />
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 ${
                    step.status === 'completed' ? 'bg-primary text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${step.status === 'completed' ? 'text-stone-900' : 'text-stone-300'}`}>
                      {step.label}
                    </h4>
                    {step.status === 'completed' && step.date && (
                      <p className="text-[10px] text-stone-400 mt-1">{step.date}</p>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100">
           <button 
             onClick={onClose}
             className="w-full h-12 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 transition-all"
           >
             확인
           </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Return/Exchange Request Modal ---
const ReturnModal = ({ order, isOpen, onClose }: { order: any, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-stone-900">교환/반품 신청</h3>
          <button onClick={onClose} className="text-stone-300 hover:text-stone-900 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-2">신청 구분</label>
            <div className="flex gap-2">
               {['교환 신청', '반품 신청'].map(type => (
                 <button key={type} className={`flex-1 h-12 rounded-xl text-sm font-bold border transition-all ${
                   type === '교환 신청' ? 'border-primary bg-primary/5 text-primary' : 'border-stone-200 text-stone-400 bg-white'
                 }`}>
                   {type}
                 </button>
               ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-2">사유 선택</label>
            <select className="w-full h-12 bg-stone-50 border border-stone-100 rounded-xl px-4 text-sm font-medium outline-none focus:border-stone-200">
              <option>단순 변심</option>
              <option>상품 불량</option>
              <option>오배송</option>
              <option>파손</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-2">상세 사유</label>
            <textarea 
              placeholder="상세한 사유를 입력해주세요 (10자 이상)"
              className="w-full h-32 bg-stone-50 border border-stone-100 rounded-xl p-4 text-sm font-medium outline-none focus:border-stone-200 resize-none"
            />
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[11px] text-red-600 leading-relaxed">
              * 신석 식품군(냉장/냉동)은 제품 특성상 단순 변심에 의한 교환/반품이 불가할 수 있습니다.<br />
              * 상품 불량이나 파손의 경우 사진 증빙이 필요할 수 있으니 고객센터로 문의 바랍니다.
            </p>
          </div>
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-2">
           <button onClick={onClose} className="flex-1 h-12 bg-white border border-stone-200 text-stone-600 font-bold text-sm rounded-xl hover:bg-stone-50 transition-all">
             취소
           </button>
           <button onClick={() => {
             alert('신청이 성공적으로 접수되었습니다. 담당자 확인 후 연락드리겠습니다.');
             onClose();
           }} className="flex-1 h-12 bg-primary text-white font-bold text-sm rounded-xl hover:bg-opacity-90 transition-all">
             신청하기
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function OrderTracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('3months');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const tabs = [
    { label: '주문내역조회', count: orders.length },
    { label: '취소/반품/교환 내역', count: orders.filter(o => o.status === 'canceled').length },
    { label: '이전 주문내역', count: 0 },
  ];

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

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300">
          <User size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">로그인이 필요합니다</h2>
          <p className="text-stone-400 font-light">주문 내역을 확인하시려면 먼저 로그인해주세요.</p>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-[#003D32] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          로그인하러 가기
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Member Info Summary */}
        <div className="flex justify-between items-start mb-20">
          <div className="text-xl font-medium text-stone-800 pb-1 border-b-2 border-primary">
            {user.displayName || '고객'}님의 회원등급은 <br /> 
            <span className="font-bold text-stone-900">일반회원입니다.</span>
          </div>
          <div className="flex gap-1">
            {[
              { label: '총 주문내역', value: `${orders.length}건` },
              { label: '적립금', value: '0원' },
              { label: '쿠폰', value: '1개' },
            ].map((stat, i) => (
              <div key={i} className="bg-white w-40 p-10 flex flex-col items-center justify-center border border-stone-50 editorial-shadow">
                <span className="text-[11px] font-bold text-stone-400 mb-2">{stat.label}</span>
                <span className="text-xl font-black text-stone-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">주문조회</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 mb-8">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-4 text-xs font-bold border-t border-r first:border-l relative ${
                activeTab === i 
                ? 'bg-white text-stone-900 border-x border-stone-200 border-b-white z-10' 
                : 'bg-stone-50/50 text-stone-400 border-stone-100 hover:text-stone-600'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
          <div className="flex-[2] border-stone-100" />
        </div>

        {/* Filter Section */}
        <div className="bg-stone-50/50 border border-stone-100 p-8 rounded-sm mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
             <select className="h-10 px-4 border border-stone-200 bg-white text-xs font-medium focus:outline-none focus:border-stone-400 w-48 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.4c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095.3c3.6-3.6%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-13.1z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat">
               <option>전체 주문처리상태</option>
               <option>입금대기</option>
               <option>배송준비중</option>
               <option>배송중</option>
               <option>배송완료</option>
             </select>

             <div className="flex gap-1 h-10">
                {['오늘', '1개월', '3개월', '6개월'].map((p) => (
                  <button 
                    key={p}
                    className={`px-4 border text-[11px] font-bold transition-all ${
                      p.includes('3개월') ? 'border-primary text-primary bg-white' : 'border-stone-200 text-stone-500 bg-white hover:bg-stone-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-1">
                <div className="relative">
                  <input type="text" value="2026-01-18" readOnly className="h-10 w-32 border border-stone-200 px-3 text-xs font-medium outline-none" />
                  <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                </div>
                <span className="text-stone-300">~</span>
                <div className="relative">
                  <input type="text" value="2026-04-18" readOnly className="h-10 w-32 border border-stone-200 px-3 text-xs font-medium outline-none" />
                  <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                </div>
             </div>

             <button className="h-10 px-6 bg-[#003D27] text-white font-bold text-sm tracking-widest flex items-center gap-2">
                조회
             </button>
          </div>
        </div>

        {/* Guidance Text */}
        <div className="mb-20 space-y-1">
          {[
            '기본적으로 최근 3개월간의 자료가 조회되며, 기간 검색 시 주문처리완료 후 36개월 이내의 주문내역을 조회하실 수 있습니다.',
            '완료 후 36개월 이상 경과한 주문은 [과거주문내역]에서 확인할 수 있습니다.',
            '리뉴얼 전에 주문한 내역은 [이전 주문내역]에서 확인할 수 있습니다.',
            '취소/교환/반품 신청은 배송완료일 기준 7일까지 가능합니다.',
          ].map((text, i) => (
            <p key={i} className="text-[11px] text-stone-400 font-medium">
              - {text}
            </p>
          ))}
        </div>

        {/* Order List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-stone-100 overflow-hidden editorial-shadow group">
                <div className="bg-stone-50 px-8 py-4 flex justify-between items-center border-b border-stone-100">
                  <div className="flex gap-6 items-center">
                    <span className="text-xs font-bold text-stone-900">
                      {order.createdAt?.toDate().toLocaleDateString()}
                    </span>
                    <span className="text-xs text-stone-400">
                      주문번호: {order.id}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate(`/order-detail/${order.id}`)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 group"
                  >
                    상세보기 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-8 items-center">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-50 border border-stone-100">
                        <img 
                          src={order.items[0]?.image || "https://picsum.photos/seed/product/300/300"} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="inline-flex items-center px-2 py-1 bg-[#F0F9F5] text-primary text-[10px] font-black uppercase rounded-sm mb-2">
                          {getStatusText(order.status)}
                        </div>
                        <h4 className="text-lg font-bold text-stone-900">
                          {order.items[0]?.name} {order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}
                        </h4>
                        <p className="text-sm font-black text-stone-900">
                          {order.total.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <button 
                         onClick={() => {
                           setSelectedOrder(order);
                           setIsTrackingOpen(true);
                         }}
                         className="w-32 py-2 bg-[#003D27] text-white text-xs font-bold rounded-sm hover:opacity-90 transition-opacity"
                       >
                         배송조회
                       </button>
                       <button 
                         onClick={() => {
                           setSelectedOrder(order);
                           setIsReturnOpen(true);
                         }}
                         className="w-32 py-2 border border-stone-200 text-stone-600 text-xs font-bold rounded-sm hover:bg-stone-50 transition-all"
                       >
                         교환/반품신청
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-24 flex flex-col items-center justify-center text-stone-300">
             <div className="w-16 h-16 rounded-full border-4 border-stone-100 flex items-center justify-center mb-4">
                <span className="text-3xl font-black">!</span>
             </div>
             <p className="text-xs font-bold text-stone-400">주문 내역이 없습니다.</p>
          </div>
        )}

        {/* Modals */}
        <TrackingModal order={selectedOrder} isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
        <ReturnModal order={selectedOrder} isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} />

        {/* Pagination */}
        <div className="mt-16 flex justify-center items-center gap-1">
          <button className="w-10 h-10 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
            <ChevronsLeft size={16} />
          </button>
          <button className="w-10 h-10 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors mr-2">
            <ChevronLeft size={16} />
          </button>
          
          <button className="w-10 h-10 border border-primary bg-white text-primary text-xs font-black">1</button>
          
          <button className="w-10 h-10 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors ml-2">
            <ChevronRight size={16} />
          </button>
          <button className="w-10 h-10 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
