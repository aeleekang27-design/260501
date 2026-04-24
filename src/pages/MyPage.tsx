import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  ChevronRight, 
  Heart, 
  Eye, 
  Settings, 
  MapPin, 
  LogOut,
  FileText,
  HelpCircle,
  CalendarCheck,
  User,
  Calendar,
  Search,
  AlertCircle,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  X,
  ShoppingBag,
  Plus
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, getDocs, orderBy, doc, updateDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import EditableImage from '../components/EditableImage';

interface MyPageProps {
  user: any;
  products: any[];
}

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

export default function MyPage({ user: propUser, products = [] }: MyPageProps) {
  const { user: authUser, logout } = useAuth();
  const user = authUser || propUser;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    payment_pending: 0,
    ready: 0,
    shipping: 0,
    completed: 0,
    canceled: 0,
  });
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      // Safety timeout (10 seconds)
      const timeoutId = setTimeout(() => setLoading(false), 10000);

      try {
        // Fetch Orders
        const ordersQ = query(
          collection(db, 'users', user.uid, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQ);
        const fetchedOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
        
        const stats = {
          total: fetchedOrders.length,
          payment_pending: fetchedOrders.filter((o: any) => o.status === 'payment_pending').length,
          ready: fetchedOrders.filter((o: any) => o.status === 'ready').length,
          shipping: fetchedOrders.filter((o: any) => o.status === 'shipping').length,
          completed: fetchedOrders.filter((o: any) => o.status === 'completed').length,
          canceled: fetchedOrders.filter((o: any) => o.status === 'canceled').length,
        };
        setOrderStats(stats);

        // Fetch Wishlist
        const wishlistSnapshot = await getDocs(collection(db, 'users', user.uid, 'wishlist'));
        setWishlist(wishlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Addresses
        const addressSnapshot = await getDocs(collection(db, 'users', user.uid, 'addresses'));
        setAddresses(addressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Get Recently Viewed from LocalStorage
        try {
          const recentKey = `recent_${user.uid}`;
          const recentIds = JSON.parse(localStorage.getItem(recentKey) || '[]');
          const resolved = recentIds
            .map((id: string) => products.find(p => p.id === id))
            .filter(Boolean);
          setRecentProducts(resolved);
        } catch (e) {
          console.error('Recent viewed load failed:', e);
        }

      } catch (error) {
        console.error('Error fetching mypage data:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileData.displayName,
        phone: profileData.phone,
        updatedAt: serverTimestamp()
      });
      alert('회원정보가 수정되었습니다.');
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user || !window.confirm('배송지를 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Delete address failed:', error);
    }
  };

  const handleAddDefaultAddress = async () => {
    if (!user) return;
    const newAddress = {
      name: '기본 배송지',
      recipient: user.displayName || '본인',
      phone: '010-0000-0000',
      address: '서울특별시 강남구 테헤란로 123',
      isDefault: true,
      createdAt: serverTimestamp()
    };
    try {
      const addrRef = doc(collection(db, 'users', user.uid, 'addresses'));
      await setDoc(addrRef, newAddress);
      setAddresses(prev => [{ id: addrRef.id, ...newAddress }, ...prev]);
    } catch (error) {
      console.error('Add address failed:', error);
    }
  };

  const sidebarMenu = [
    {
      title: '쇼핑정보',
      items: [
        { label: '주문내역', tab: 'orders' },
        { label: '취소/반품/교환', tab: 'returns' },
        { label: '관심상품', tab: 'wishlist' },
        { label: '최근 본 상품', tab: 'recent' },
      ]
    },
    {
      title: '혜택정보',
      items: [
        { label: '적립금', tab: 'points' },
        { label: '쿠폰', tab: 'coupons' },
      ]
    },
    {
      title: '나의정보',
      items: [
        { label: '회원정보수정', tab: 'profile' },
        { label: '배송지관리', tab: 'address' },
        { label: '로그아웃', path: '/login' },
      ]
    }
  ];

  const orderStatusDisplay = [
    { label: '입금대기', count: orderStats.payment_pending, status: 'payment_pending', icon: <CreditCard size={32} strokeWidth={1} /> },
    { label: '배송준비중', count: orderStats.ready, status: 'ready', icon: <div className="text-[10px] font-black uppercase tracking-tighter text-primary">Ready</div> },
    { label: '배송중', count: orderStats.shipping, status: 'shipping', icon: <Truck size={32} strokeWidth={1} /> },
    { label: '배송완료', count: orderStats.completed, status: 'completed', icon: <CalendarCheck size={32} strokeWidth={1} /> },
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

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300">
          <User size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">로그인이 필요합니다</h2>
          <p className="text-stone-400 font-light">마이페이지를 확인하시려면 먼저 로그인해주세요.</p>
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

  const renderContent = () => {
    switch (currentTab) {
      case 'orders':
      case 'returns':
        const filteredOrders = currentTab === 'returns' ? orders.filter(o => o.status === 'canceled') : orders;
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-end pb-4 border-b border-stone-100">
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                {currentTab === 'orders' ? '주문 내역 조회' : '취소/반품/교환 내역'}
              </h3>
            </div>
            
            {/* Filter */}
            <div className="bg-stone-50/50 border border-stone-100 p-6 rounded-sm mb-6 flex flex-wrap items-center gap-4">
               <div className="flex gap-1">
                  {['오늘', '1개월', '3개월', '6개월'].map((p) => (
                    <button 
                      key={p}
                      className={`px-4 h-10 border text-[11px] font-bold transition-all bg-white ${
                        p.includes('3개월') ? 'border-primary text-primary' : 'border-stone-200 text-stone-500 hover:border-stone-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
               </div>
               <div className="flex items-center gap-2">
                  <input type="date" className="h-10 border border-stone-200 px-3 text-xs outline-none bg-white font-medium" defaultValue="2026-01-20" />
                  <span className="text-stone-200">~</span>
                  <input type="date" className="h-10 border border-stone-200 px-3 text-xs outline-none bg-white font-medium" defaultValue="2026-04-20" />
               </div>
               <button className="h-10 px-6 bg-stone-900 text-white font-bold text-xs">조회</button>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-stone-100 overflow-hidden shadow-sm group hover:border-stone-200 transition-all">
                    <div className="bg-stone-50 px-6 py-3 flex justify-between items-center border-b border-stone-100">
                      <div className="flex gap-4 items-center">
                        <span className="text-xs font-bold text-stone-900">{order.createdAt?.toDate().toLocaleDateString()}</span>
                        <span className="text-[10px] text-stone-300">|</span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">ORD: {order.id.slice(0, 8)}...</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/order-detail/${order.id}`)}
                        className="text-[11px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 group"
                      >
                        상세보기 <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                       <div className="flex gap-6 items-center">
                          <div className="w-20 h-20 bg-stone-50 border border-stone-100 rounded-lg overflow-hidden shrink-0">
                             <img src={order.items[0]?.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1">
                             <div className="inline-flex px-1.5 py-0.5 bg-primary/5 text-primary text-[10px] font-black rounded-sm mb-1">
                                {getStatusText(order.status)}
                             </div>
                             <h4 className="text-sm font-bold text-stone-900">{order.items[0]?.name} {order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}</h4>
                             <p className="text-xs font-black text-stone-900">{order.total.toLocaleString()}원</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => { setSelectedOrder(order); setIsTrackingOpen(true); }}
                            className="px-4 py-2 bg-stone-900 text-white text-[11px] font-bold rounded-sm hover:opacity-90"
                          >
                            배송조회
                          </button>
                          <button 
                            onClick={() => { setSelectedOrder(order); setIsReturnOpen(true); }}
                            className="px-4 py-2 border border-stone-200 text-stone-600 text-[11px] font-bold rounded-sm hover:bg-stone-50"
                          >
                            교환/반품
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center space-y-4">
                 <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
                    <Package size={32} />
                 </div>
                 <p className="text-sm font-bold text-stone-400">데이터가 없습니다.</p>
              </div>
            )}
          </div>
        );
      case 'wishlist':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-stone-900 border-b border-stone-100 pb-4">관심상품</h3>
            {wishlist.length > 0 ? (
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                 {wishlist.map((item) => (
                   <div key={item.id} className="group cursor-pointer">
                      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-50 border border-stone-100 mb-4">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                         <p className="text-xs font-black text-stone-900 mt-1">{item.price?.toLocaleString()}원</p>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center space-y-4">
                 <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
                    <Heart size={32} />
                 </div>
                 <p className="text-sm font-bold text-stone-400">관심상품이 없습니다.</p>
                 <button onClick={() => navigate('/')} className="px-6 h-10 bg-stone-900 text-white text-[11px] font-bold">쇼핑하러 가기</button>
              </div>
            )}
          </div>
        );
      case 'recent':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-stone-900 border-b border-stone-100 pb-4">최근 본 상품</h3>
            {recentProducts.length > 0 ? (
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                 {recentProducts.map((item) => (
                   <div key={item.id} className="group cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                      <div className="aspect-square rounded-xl overflow-hidden bg-stone-50 border border-stone-100 mb-4">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                         <p className="text-xs font-black text-stone-900 mt-1">{item.price?.toLocaleString()}원</p>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center space-y-4">
                 <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
                    <Eye size={32} />
                 </div>
                 <p className="text-sm font-bold text-stone-400">최근 본 상품이 없습니다.</p>
              </div>
            )}
          </div>
        );
      case 'points':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-stone-900 border-b border-stone-100 pb-4">적립금 내역</h3>
            <div className="bg-stone-50 p-8 rounded-2xl text-center space-y-2">
               <p className="text-sm font-bold text-stone-400">사용 가능한 적립금</p>
               <div className="text-4xl font-black text-primary">0원</div>
            </div>
            <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-2xl">
               <p className="text-sm font-bold text-stone-400">적립금 내역이 없습니다.</p>
            </div>
          </div>
        );
      case 'coupons':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-stone-900 border-b border-stone-100 pb-4">쿠폰 관리</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#003D27] text-white p-6 rounded-2xl editorial-shadow relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                  <div className="space-y-1 relative">
                     <div className="text-[10px] font-black uppercase tracking-widest text-white/60">New Member</div>
                     <h4 className="text-xl font-bold">회원가입 축하 쿠폰</h4>
                     <p className="text-sm font-medium text-white/80">3,000원 할인 (2만원 이상 구매시)</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-white/40">
                     <span>2026.04.30 까지</span>
                     <span className="bg-white/10 px-2 py-1 rounded-sm text-white">미사용</span>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-stone-900 border-b border-stone-100 pb-4">회원정보 수정</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">이름</label>
                  <input 
                    type="text" 
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full h-12 border border-stone-200 rounded-xl px-4 text-sm font-medium outline-none focus:border-primary transition-colors"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">휴대전화</label>
                  <input 
                    type="text" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full h-12 border border-stone-200 rounded-xl px-4 text-sm font-medium outline-none focus:border-primary transition-colors"
                  />
               </div>
               <div className="space-y-2 opacity-50">
                  <label className="text-xs font-bold text-stone-400 uppercase">이메일 (수정불가)</label>
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full h-12 border border-stone-100 bg-stone-50 rounded-xl px-4 text-sm font-medium outline-none"
                  />
               </div>
               <button type="submit" className="w-full h-14 bg-stone-900 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]">
                  회원정보 저장하기
               </button>
            </form>
          </div>
        );
      case 'address':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
               <h3 className="text-2xl font-black text-stone-900">배송지 관리</h3>
               <button onClick={handleAddDefaultAddress} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  <Plus size={14} /> 새 배송지 추가
               </button>
            </div>
            
            <div className="space-y-4">
               {addresses.length > 0 ? addresses.map((addr) => (
                 <div key={addr.id} className="p-8 border border-stone-100 rounded-2xl flex justify-between items-start group hover:border-primary/20 transition-all">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-stone-900">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-black rounded-sm">기본배송지</span>
                          )}
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-stone-600">{addr.recipient} ({addr.phone})</p>
                          <p className="text-sm text-stone-400 font-medium leading-relaxed">{addr.address}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="text-[11px] font-bold text-stone-400 hover:text-stone-900">수정</button>
                       <button onClick={() => handleDeleteAddress(addr.id)} className="text-[11px] font-bold text-red-400 hover:text-red-600">삭제</button>
                    </div>
                 </div>
               )) : (
                 <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
                       <MapPin size={32} />
                    </div>
                    <p className="text-sm font-bold text-stone-400">등록된 배송지가 없습니다.</p>
                 </div>
               )}
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-24">
            {/* Order Status Section */}
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-stone-100">
                 <h3 className="text-lg font-bold text-stone-900">
                   나의 주문처리 현황 <span className="text-stone-300 font-normal text-xs ml-2">(최근 3개월 기준)</span>
                 </h3>
                 <button onClick={() => handleTabChange('orders')} className="text-[11px] font-bold text-stone-400 hover:text-stone-900">더보기</button>
              </div>

              <div className="flex flex-wrap lg:flex-nowrap items-center justify-between px-10 gap-y-10">
                 {orderStatusDisplay.map((status, i) => (
                   <React.Fragment key={i}>
                      <div className="flex flex-col items-center gap-6 group cursor-pointer" onClick={() => handleTabChange('orders')}>
                         <div className="text-stone-400 group-hover:text-primary transition-colors">
                           {status.icon}
                         </div>
                         <div className="text-center space-y-2">
                            <span className="text-[13px] font-medium text-stone-400">{status.label}</span>
                            <div className="text-3xl font-black text-stone-900">{status.count}</div>
                         </div>
                      </div>
                      {i < orderStatusDisplay.length - 1 && (
                        <ChevronRight className="text-stone-100 hidden lg:block" size={32} strokeWidth={1} />
                      )}
                   </React.Fragment>
                 ))}
                 
                 <div className="w-[1px] h-20 bg-stone-100 mx-4 hidden lg:block" />

                 <div className="flex items-center gap-8 w-full lg:w-auto justify-center pt-8 lg:pt-0">
                    <div className="flex flex-col items-center gap-4">
                       <RotateCcw className="text-stone-400" size={32} strokeWidth={1} />
                    </div>
                    <div className="space-y-1">
                       <div className="flex gap-4 text-xs">
                          <span className="text-stone-400 font-medium">취소</span>
                          <span className="font-bold text-stone-900">{orderStats.canceled}</span>
                       </div>
                       <div className="flex gap-4 text-xs">
                          <span className="text-stone-400 font-medium">교환</span>
                          <span className="font-bold text-stone-900">0</span>
                       </div>
                       <div className="flex gap-4 text-xs">
                          <span className="text-stone-400 font-medium">반품</span>
                          <span className="font-bold text-stone-900">0</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Recently Viewed Products */}
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-stone-100">
                 <h3 className="text-lg font-bold text-stone-900">관심상품</h3>
                 <button onClick={() => handleTabChange('wishlist')} className="text-[11px] font-bold text-stone-400 hover:text-stone-900">더보기</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {wishlist.slice(0, 4).map((item) => (
                   <div key={item.id} className="space-y-4 group cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                      <div className="aspect-square rounded-lg overflow-hidden border border-stone-100 relative">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-sm font-bold text-stone-900 leading-tight truncate">{item.name}</h4>
                         <p className="text-xs font-black text-stone-900">{item.price?.toLocaleString()}원</p>
                      </div>
                   </div>
                ))}
                {wishlist.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-stone-300 font-medium italic border border-dashed border-stone-100 rounded-lg">
                    관심상품이 비어있습니다.
                  </div>
                )}
              </div>
            </div>

            {/* Recently Viewed Products */}
            <div className="space-y-8 mt-12">
              <div className="flex justify-between items-end pb-4 border-b border-stone-100">
                 <h3 className="text-lg font-bold text-stone-900">최근 본 상품</h3>
                 <button onClick={() => handleTabChange('recent')} className="text-[11px] font-bold text-stone-400 hover:text-stone-900">더보기</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {recentProducts.slice(0, 4).map((item) => (
                   <div key={item.id} className="space-y-4 group cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                      <div className="aspect-square rounded-xl overflow-hidden border border-stone-100 relative">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-sm font-bold text-stone-900 leading-tight truncate">{item.name}</h4>
                         <p className="text-xs font-black text-stone-900">{item.price?.toLocaleString()}원</p>
                      </div>
                   </div>
                ))}
                {recentProducts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-stone-300 font-medium italic border border-dashed border-stone-100 rounded-lg">
                    최근 본 상품이 비어있습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Top Profile Banner */}
      <section className="bg-stone-50 border-b border-stone-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex flex-col gap-2 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-medium text-stone-900 group">
                <span className="text-stone-500 font-light">{user.displayName || '고객'}님의 회원등급은</span>
              </h1>
              <div className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                일반회원 <span className="text-stone-900 font-medium font-sans">입니다.</span>
              </div>
           </div>

           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 scrollbar-hide px-4 md:px-0">
             {[
               { label: '총 주문내역', value: `${orderStats.total}건`, tab: 'orders' },
               { label: '적립금', value: '0원', tab: 'points' },
               { label: '쿠폰', value: '1개', tab: 'coupons' },
             ].map((stat, i) => (
                <button 
                  key={i} 
                  onClick={() => stat.tab && handleTabChange(stat.tab)}
                  className="bg-white min-w-[140px] flex-1 md:w-40 md:h-40 flex flex-col items-center justify-center editorial-shadow p-6 text-center border border-stone-50 hover:border-primary transition-colors"
                >
                  <span className="text-[11px] font-bold text-stone-400 mb-2">{stat.label}</span>
                  <span className="text-2xl font-black text-stone-900">{stat.value}</span>
                </button>
             ))}
           </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16 lg:gap-20">
        {/* Sidebar */}
        <aside className="lg:w-52 shrink-0 md:bg-stone-50/30 md:p-8 lg:p-0 md:rounded-2xl lg:bg-transparent">
          <h2 className="text-2xl font-black text-stone-900 mb-10 hidden lg:block cursor-pointer" onClick={() => handleTabChange('dashboard')}>마이페이지</h2>
          
          <nav className="grid grid-cols-2 lg:grid-cols-1 gap-12 md:gap-8 overflow-x-auto lg:overflow-visible">
             {sidebarMenu.map((group, i) => (
               <div key={i} className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">{group.title}</h3>
                  <ul className="space-y-3">
                    {group.items.map((item, j) => (
                      <li key={j}>
                        <button 
                          onClick={() => {
                            if (item.label === '로그아웃') {
                              logout ? logout() : (navigate('/login'));
                            } else if (item.tab) {
                              handleTabChange(item.tab);
                            } else if (item.path) {
                              navigate(item.path);
                            }
                          }}
                          className={`text-[13px] transition-all font-medium flex items-center gap-1 group text-left ${
                            currentTab === item.tab ? 'text-primary font-black' : 'text-stone-400 hover:text-stone-900'
                          }`}
                        >
                          {currentTab === item.tab && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
               </div>
             ))}
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 min-w-0">
           {loading ? (
             <div className="py-40 flex justify-center">
               <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             </div>
           ) : (
             <motion.div
               key={currentTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
             >
               {renderContent()}
             </motion.div>
           )}
        </section>
      </div>

      {/* Modals */}
      <TrackingModal order={selectedOrder} isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
      <ReturnModal order={selectedOrder} isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} />
    </main>
  );
}
