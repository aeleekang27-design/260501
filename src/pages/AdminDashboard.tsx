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
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
}

export default function AdminDashboard({ products, onUpdateProduct }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: '오늘 주문 건수', value: '12', change: '+12%', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '오늘 매출액', value: '348,000원', change: '+8%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '활성 고객 수', value: '1,240', change: '+24%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '등록 상품 수', value: products.length.toString(), change: '0%', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const recentOrders = [
    { id: '#20260519-01', customer: '홍길동', product: '꿀사과 5kg', total: '29,900원', status: '준비중', date: '10분 전' },
    { id: '#20260519-02', customer: '김수진', product: '프리미엄 한우세트', total: '158,000원', status: '배송중', date: '25분 전' },
    { id: '#20260519-03', customer: '이영희', product: '유기농 야채팩', total: '18,500원', status: '완료', date: '1시간 전' },
    { id: '#20260519-04', customer: '박준호', product: '샤인머스캣 2kg', total: '45,000원', status: '취소', date: '3시간 전' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '준비중': return 'bg-amber-100 text-amber-700 border-amber-200';
      case '배송중': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '완료': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '취소': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-72 bg-[#003D27] text-white flex flex-col fixed inset-y-0 shadow-2xl z-50">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl">F</div>
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
                    ? 'bg-white/10 text-primary shadow-inner shadow-black/10' 
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
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
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
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">운영 현황 대시보드</h1>
            <p className="text-stone-500 mt-1">오늘의 쇼핑몰 주요 실적과 최근 활동 내역을 확인하세요.</p>
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
              <button className="text-stone-400 hover:text-primary text-sm font-bold transition-colors">전체보기</button>
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
                  {recentOrders.map((order, i) => (
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
                   { label: '상품 일괄등록', icon: Package },
                   { icon: Settings, label: '상점정보 수정' },
                 ].map((item, i) => (
                   <button key={i} className="flex flex-col items-center gap-3 p-6 rounded-[24px] bg-stone-50 hover:bg-primary/5 hover:text-primary transition-all border border-stone-100 group">
                     <item.icon className="text-stone-300 group-hover:text-primary transition-colors" />
                     <span className="text-[11px] font-black">{item.label}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
