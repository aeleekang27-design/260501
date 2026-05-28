import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  TrendingUp, 
  ArrowUpRight,
  Search,
  Bell,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { Product } from '../types';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct?: (id: string) => void;
  onCreateProduct?: (category: string) => void;
}

export default function AdminDashboard({ 
  products, 
  onUpdateProduct, 
  onDeleteProduct, 
  onCreateProduct 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [orders, setOrders] = useState([
    { id: '#20260519-01', customer: '홍길동', product: '꿀사과 5kg', total: '29,900원', status: '준비중', date: '10분 전' },
    { id: '#20260519-02', customer: '김수진', product: '프리미엄 한우세트', total: '158,000원', status: '배송중', date: '25분 전' },
    { id: '#20260519-03', customer: '이영희', product: '유기농 야채팩', total: '18,500원', status: '완료', date: '1시간 전' },
    { id: '#20260519-04', customer: '박준호', product: '샤인머스캣 2kg', total: '45,000원', status: '취소', date: '3시간 전' },
  ]);

  const [customers] = useState([
    { name: '홍길동', email: 'hong@gmail.com', joined: '2026.04.12', ordersCount: 5, spent: '148,000원', tier: 'VIP' },
    { name: '김수진', email: 'sujin.kim@naver.com', joined: '2026.05.01', ordersCount: 2, spent: '208,000원', tier: 'GOLD' },
    { name: '이영희', email: 'younghee@daum.net', joined: '2026.03.22', ordersCount: 12, spent: '485,000원', tier: 'VVIP' },
    { name: '박준호', email: 'juno.park@kakao.com', joined: '2026.05.15', ordersCount: 1, spent: '45,000원', tier: 'FAMILY' },
  ]);

  const [shopSettings, setShopSettings] = useState({
    shopName: '더바른농장',
    supportEmail: 'aeleekang27@gmail.com',
    shippingFee: 3000,
    freeShippingThreshold: 50000,
    maintenanceMode: false
  });

  const handleUpdateOrderStatus = (orderId: string, nextStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '준비중': return 'bg-amber-100 text-amber-700 border-amber-200';
      case '배송중': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '완료': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '취소': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: '운영 현황 대시보드', desc: '오늘의 쇼핑몰 주요 실적과 최근 활동 내역을 확인하세요.' };
      case 'products':
        return { title: '상품 등록/관리', desc: '더바른농장의 판매 상품 목록을 관리하고 새 상품을 추가합니다.' };
      case 'orders':
        return { title: '주문/배송 관리', desc: '고객들의 실시간 주문 현황과 배송 상태를 관리합니다.' };
      case 'users':
        return { title: '고객 데이터', desc: '회원 고객 정보와 누적 구매액 데이터를 조회합니다.' };
      case 'settings':
        return { title: '시스템 설정', desc: '쇼핑몰의 기본 정보와 환경 설정을 구성합니다.' };
      default:
        return { title: 'Farm Admin', desc: '관리자 페이지' };
    }
  };

  const headerInfo = getHeaderInfo();

  const stats = [
    { label: '오늘 주문 건수', value: '12', change: '+12%', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '오늘 매출액', value: '348,000원', change: '+8%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '활성 고객 수', value: '1,240', change: '+24%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '등록 상품 수', value: products.length.toString(), change: '0%', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const renderDashboardTab = () => {
    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[32px] shadow-sm border border-stone-100 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full">
                  {stat.change} <ArrowUpRight size={14} />
                </div>
              </div>
              <div>
                <p className="text-stone-400 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-stone-900 tracking-tight">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid: Orders & Products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Recent Orders List */}
          <div className="xl:col-span-2 bg-white rounded-[40px] shadow-sm border border-stone-100 p-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
                <Clock className="text-stone-300" /> 최근 주문 리스트
              </h2>
              <button onClick={() => setActiveTab('orders')} className="text-stone-400 hover:text-primary text-sm font-bold transition-colors">전체보기</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left text-xs font-black text-stone-400 uppercase tracking-widest">
                    <th className="px-6 py-4">주문번호</th>
                    <th className="px-6 py-4">구매자</th>
                    <th className="px-6 py-4">상품명</th>
                    <th className="px-6 py-4">결제금액</th>
                    <th className="px-6 py-4 text-center">진행상태</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i} className="group hover:bg-stone-50 transition-colors rounded-2xl">
                      <td className="px-6 py-5 first:rounded-l-2xl border-y border-transparent">
                        <span className="font-mono text-sm font-bold text-stone-900">{order.id}</span>
                        <p className="text-[10px] text-stone-400 mt-0.5">{order.date}</p>
                      </td>
                      <td className="px-6 py-5 border-y border-transparent font-bold text-sm">{order.customer}</td>
                      <td className="px-6 py-5 border-y border-transparent text-sm text-stone-500">{order.product}</td>
                      <td className="px-6 py-5 border-y border-transparent font-black text-sm text-stone-900">{order.total}</td>
                      <td className="px-6 py-5 border-y border-transparent text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black border ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 last:rounded-r-2xl border-y border-transparent text-right">
                        <button className="text-stone-300 hover:text-stone-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions / Stock Alert */}
          <div className="space-y-8">
            <div className="bg-[#1C1C1C] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                 <CheckCircle2 className="text-primary" /> 운영 알림
               </h2>
               <div className="space-y-6">
                 {[
                   { icon: Clock, label: '오늘 새벽배송 12건 마감 임박', time: '14:00 마감' },
                   { icon: AlertCircle, label: '품절 임박 상품 (꿀사과 5kg)', time: '재고 3개 남음' },
                   { icon: Bell, label: '주말 프로모션 제안서 도착', time: '전략실 발송' },
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                     <div className="shrink-0 text-primary">
                       <item.icon size={20} />
                     </div>
                     <div>
                       <p className="text-sm font-medium">{item.label}</p>
                       <p className="text-xs text-white/40 mt-1">{item.time}</p>
                     </div>
                   </div>
                 ))}
               </div>
               <button className="w-full mt-10 py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
                 모든 알림 확인
               </button>
            </div>

            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-stone-100">
               <h2 className="text-xl font-black text-stone-900 mb-8">빠른 도구</h2>
               <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: '상품 목록 관리', icon: Package, action: () => setActiveTab('products') },
                   { label: '상점 설정 수정', icon: Settings, action: () => setActiveTab('settings') },
                 ].map((item, i) => (
                   <button 
                     key={i} 
                     onClick={item.action}
                     className="flex flex-col items-center gap-3 p-6 rounded-[24px] bg-stone-50 hover:bg-primary/5 hover:text-primary transition-all border border-stone-100 group"
                   >
                     <item.icon className="text-stone-300 group-hover:text-primary transition-colors" />
                     <span className="text-[11px] font-black">{item.label}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderProductsTab = () => {
    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-stone-900">판매 상품 목록 ({products.length})</h2>
          <button 
            onClick={() => onCreateProduct?.('과일')}
            className="flex items-center gap-2 bg-[#003D27] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <Plus size={18} /> 새 상품 추가
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-xs font-black text-stone-400 uppercase tracking-widest">
                <th className="px-6 py-4">이미지</th>
                <th className="px-6 py-4">상품명</th>
                <th className="px-6 py-4">카테고리</th>
                <th className="px-6 py-4">가격</th>
                <th className="px-6 py-4">설명</th>
                <th className="px-6 py-4 text-center">동작</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors rounded-2xl">
                  <td className="px-6 py-3 first:rounded-l-2xl border-y border-transparent">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl shadow-md" />
                  </td>
                  <td className="px-6 py-3 border-y border-transparent font-bold text-sm">
                    <input 
                      type="text" 
                      value={p.name} 
                      onChange={(e) => onUpdateProduct(p.id, { name: e.target.value })}
                      className="bg-transparent border-b border-transparent focus:border-stone-300 outline-none w-full font-bold text-stone-800 focus:bg-white px-1 py-0.5 rounded"
                    />
                  </td>
                  <td className="px-6 py-3 border-y border-transparent text-sm text-stone-500">
                    <select
                      value={p.category}
                      onChange={(e) => onUpdateProduct(p.id, { category: e.target.value })}
                      className="bg-transparent border border-stone-200 rounded-lg text-xs px-2 py-1 outline-none focus:border-primary"
                    >
                      <option value="과일">과일</option>
                      <option value="채소">채소</option>
                      <option value="쌀/잡곡">쌀/잡곡</option>
                      <option value="세트">세트</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 border-y border-transparent font-black text-sm text-stone-900">
                    <input 
                      type="number" 
                      value={p.price} 
                      onChange={(e) => onUpdateProduct(p.id, { price: Number(e.target.value) })}
                      className="bg-transparent border-b border-transparent focus:border-stone-300 outline-none w-24 font-black text-primary focus:bg-white px-1 py-0.5 rounded"
                    />원
                  </td>
                  <td className="px-6 py-3 border-y border-transparent text-xs text-stone-400 max-w-[200px] truncate">
                    {p.description}
                  </td>
                  <td className="px-6 py-3 last:rounded-r-2xl border-y border-transparent text-center">
                    <button 
                      onClick={() => onDeleteProduct?.(p.id)}
                      className="text-stone-300 hover:text-rose-500 transition-colors p-2"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrdersTab = () => {
    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 p-10">
        <h2 className="text-2xl font-black text-stone-900 mb-8">주문 및 배송 현황 ({orders.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-xs font-black text-stone-400 uppercase tracking-widest">
                <th className="px-6 py-4">주문번호</th>
                <th className="px-6 py-4">구매자</th>
                <th className="px-6 py-4">상품명</th>
                <th className="px-6 py-4">결제금액</th>
                <th className="px-6 py-4">주문 시간</th>
                <th className="px-6 py-4 text-center">진행상태 변경</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors rounded-2xl">
                  <td className="px-6 py-4 first:rounded-l-2xl border-y border-transparent font-bold font-mono text-sm">{order.id}</td>
                  <td className="px-6 py-4 border-y border-transparent text-sm font-semibold">{order.customer}</td>
                  <td className="px-6 py-4 border-y border-transparent text-sm text-stone-500">{order.product}</td>
                  <td className="px-6 py-4 border-y border-transparent font-black text-sm text-stone-900">{order.total}</td>
                  <td className="px-6 py-4 border-y border-transparent text-xs text-stone-400">{order.date}</td>
                  <td className="px-6 py-4 last:rounded-r-2xl border-y border-transparent text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border outline-none cursor-pointer ${getStatusStyle(order.status)}`}
                    >
                      <option value="준비중">준비중</option>
                      <option value="배송중">배송중</option>
                      <option value="완료">완료</option>
                      <option value="취소">취소</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomersTab = () => {
    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 p-10">
        <h2 className="text-2xl font-black text-stone-900 mb-8">고객 관리 데이터 ({customers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-xs font-black text-stone-400 uppercase tracking-widest">
                <th className="px-6 py-4">이름</th>
                <th className="px-6 py-4">이메일</th>
                <th className="px-6 py-4">가입일</th>
                <th className="px-6 py-4 text-center">총 주문횟수</th>
                <th className="px-6 py-4">총 누적금액</th>
                <th className="px-6 py-4 text-center">고객 등급</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors rounded-2xl">
                  <td className="px-6 py-4 first:rounded-l-2xl border-y border-transparent font-bold text-sm">{c.name}</td>
                  <td className="px-6 py-4 border-y border-transparent text-sm text-stone-500">{c.email}</td>
                  <td className="px-6 py-4 border-y border-transparent text-xs text-stone-400">{c.joined}</td>
                  <td className="px-6 py-4 border-y border-transparent text-center text-sm font-semibold">{c.ordersCount}회</td>
                  <td className="px-6 py-4 border-y border-transparent font-black text-sm text-primary">{c.spent}</td>
                  <td className="px-6 py-4 last:rounded-r-2xl border-y border-transparent text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${
                      c.tier === 'VVIP' ? 'bg-purple-100 text-purple-700' :
                      c.tier === 'VIP' ? 'bg-indigo-100 text-indigo-700' :
                      c.tier === 'GOLD' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {c.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 p-10 max-w-4xl">
        <h2 className="text-2xl font-black text-stone-900 mb-10">쇼핑몰 기본 환경설정</h2>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">상점명</label>
              <input 
                type="text" 
                value={shopSettings.shopName}
                onChange={(e) => setShopSettings(prev => ({ ...prev, shopName: e.target.value }))}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#003D27] focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">대표 관리 이메일</label>
              <input 
                type="email" 
                value={shopSettings.supportEmail}
                onChange={(e) => setShopSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#003D27] focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">기본 배송 금액 (원)</label>
              <input 
                type="number" 
                value={shopSettings.shippingFee}
                onChange={(e) => setShopSettings(prev => ({ ...prev, shippingFee: Number(e.target.value) }))}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#003D27] focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">무료 배송 임계값 (원)</label>
              <input 
                type="number" 
                value={shopSettings.freeShippingThreshold}
                onChange={(e) => setShopSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#003D27] focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm" 
              />
            </div>
          </div>

          <hr className="border-stone-100 my-6" />

          <div className="flex justify-between items-center bg-stone-50 p-6 rounded-[24px] border border-stone-100">
            <div>
              <h4 className="font-bold text-stone-800 text-sm">상점 임시 점검 모드</h4>
              <p className="text-xs text-stone-400 mt-1">활성화 시 고객들의 웹사이트 접근이 차단되며 공사 중 안내가 표시됩니다.</p>
            </div>
            <button 
              onClick={() => setShopSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center p-1 ${
                shopSettings.maintenanceMode ? 'bg-[#003D27] justify-end' : 'bg-stone-300 justify-start'
              }`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md" />
            </button>
          </div>

          <button 
            onClick={() => alert('상점 설정이 저장되었습니다.')}
            className="w-full py-5 bg-[#003D27] text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
          >
            설정 저장하기
          </button>
        </div>
      </div>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'products':
        return renderProductsTab();
      case 'orders':
        return renderOrdersTab();
      case 'users':
        return renderCustomersTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-72 bg-[#003D27] text-white flex flex-col fixed inset-y-0 shadow-2xl z-50">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl text-[#003D27] bg-white">F</div>
            <span className="font-bold text-xl tracking-tight">Farm Admin</span>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: '대시보드 홈', icon: LayoutDashboard },
              { id: 'products', label: '상품 등록/관리', icon: Package },
              { id: 'orders', label: '주문/배송 관리', icon: ShoppingCart },
              { id: 'users', label: '고객 데이터', icon: Users },
              { id: 'settings', label: '시스템 설정', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium text-sm ${
                  activeTab === item.id 
                    ? 'bg-white/15 text-white font-bold shadow-inner' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-white">최관리자 님</p>
              <p className="text-[10px] text-white/40">Super Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">{headerInfo.title}</h1>
            <p className="text-stone-500 mt-1">{headerInfo.desc}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="빠른 검색..." 
                className="pl-12 pr-6 py-3 bg-white border border-stone-200 rounded-2xl w-64 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
              />
            </div>
            <button className="relative w-12 h-12 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-stone-400 hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderActiveTabContent()}
      </main>
    </div>
  );
}
