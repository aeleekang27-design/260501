import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Tag, Clock, Sparkles } from 'lucide-react';
import { Product } from '../types';
import EditableText from '../components/EditableText';
import EditableImage from '../components/EditableImage';

interface EventPageProps {
  products: Product[];
  content: any;
  onUpdateContent: (key: string, value: string | number | boolean, type?: 'text' | 'fontSize' | 'deleted') => void;
}

export default function EventPage({ products, content, onUpdateContent }: EventPageProps) {
  // Mock event data structure that can be edited via content
  const events = [
    {
      id: 'welcome',
      tag: 'NEW MEMBER',
      title: '첫 구매 회원 특별 혜택',
      desc: '더 바른 농장이 처음이신가요? 인기 야채 꾸러미를 50% 할인가에 만나보세요.',
      img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
      color: 'bg-emerald-600',
      link: '/product/12'
    },
    {
      id: 'spring',
      tag: 'SEASONAL',
      title: '봄맞이 고당도 과일 기획전',
      desc: '가장 싱싱할 때 수확한 제철 과일들로 구성된 특별 큐레이션입니다.',
      img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop',
      color: 'bg-orange-500',
      link: '/?filter=과일'
    },
    {
      id: 'midnight',
      tag: 'DAILY FLASH',
      title: '자정 전 주문 시 새벽배송',
      desc: '오늘 밤 12시까지 주문하면, 내일 아침 현관 앞에 신선함이 도착합니다.',
      img: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=1000&auto=format&fit=crop',
      color: 'bg-blue-600',
      link: '/products'
    },
    {
      id: 'gift',
      tag: 'PREMIUM GIFT',
      title: '감사의 마음을 전하는 선물세트',
      desc: '소중한 분들께 전하는 정직하고 바른 선물. 한우와 제철 과일의 완벽한 조화.',
      img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop',
      color: 'bg-stone-800',
      link: '/product/11'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Floating Coupon */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-32 right-8 z-[80] hidden lg:block"
      >
        <div className="bg-[#003D27] text-white p-6 rounded-3xl shadow-2xl border border-white/10 w-64 group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Tag size={12} /> Special Coupon
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold leading-tight">이벤트 페이지 전용<br/>할인 쿠폰팩</h4>
              <p className="text-[11px] text-white/50">모든 회원 대상 바로 다운로드</p>
            </div>
            <button 
              onClick={() => alert('쿠폰이 발급되었습니다! 결제 시 사용 가능합니다.')}
              className="w-full py-3 bg-white text-[#003D27] rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              쿠폰팩 전체 받기
            </button>
          </div>
        </div>
      </motion.div>
      {/* Header Section */}
      <section className="bg-white pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black tracking-widest uppercase mb-4">
              <Sparkles size={14} />
              <span>Events & Promotions</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1]">
              <EditableText 
                value={content.eventPageTitle || '더 바른 농장의\n특별한 소식'} 
                onSave={(val) => onUpdateContent('eventPageTitle', val)}
                multiline
              />
            </h1>
            <p className="max-w-2xl text-lg text-stone-500 font-light leading-relaxed mx-auto lg:mx-0">
              <EditableText 
                value={content.eventPageDesc || '자연의 신선함과 함께 찾아오는 다양한 혜택과 이벤트를 지금 바로 확인해보세요.'} 
                onSave={(val) => onUpdateContent('eventPageDesc', val)}
                multiline
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="px-6 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#003D27] rounded-[40px] p-8 md:p-12 overflow-hidden relative group editorial-shadow">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Live Flash Sale
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                  <EditableText value={content.flashSaleTitle || "오늘만 이 가격! 타임 세일"} onSave={(val) => onUpdateContent('flashSaleTitle', val)} />
                </h3>
              </div>

              <div className="flex items-center gap-4 md:gap-8">
                <div className="flex gap-2 md:gap-4">
                  {[
                    { label: '주말특가', time: '12' },
                    { label: '남은시간', time: '08' },
                    { label: '종료임박', time: '45' }
                  ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                        {t.time}
                      </div>
                      <span className="text-[10px] font-bold text-white/40 uppercase mt-2 tracking-widest">{t.label}</span>
                    </div>
                  ))}
                </div>
                <Link to="/products" className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-white hover:scale-110 transition-transform shadow-xl">
                  <ArrowRight size={24} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {events.map((event, idx) => (
             <motion.div
               key={event.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="group relative h-[400px] rounded-[48px] overflow-hidden editorial-shadow cursor-pointer"
             >
               <EditableImage 
                  src={content[`eventImg_${event.id}`] || event.img} 
                  onSave={(val) => onUpdateContent(`eventImg_${event.id}`, val)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end">
                  <div className="space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black text-white uppercase tracking-widest">
                       {event.tag}
                    </span>
                    <h3 className="text-3xl font-bold text-white leading-tight">
                       {event.title}
                    </h3>
                    <p className="text-white/70 font-light line-clamp-2 max-w-md">
                       {event.desc}
                    </p>
                    <Link to={event.link} className="inline-flex items-center gap-2 text-white font-bold group/btn pt-2">
                       자세히 보기 <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2" />
                    </Link>
                  </div>
               </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Mini Events & Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[40px] editorial-shadow space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
               <Gift size={32} />
            </div>
            <h4 className="text-xl font-bold text-stone-900">회원가입 무료배송</h4>
            <p className="text-stone-500 font-light leading-relaxed">
              지금 가입하시면 모든 상품에 대해 첫 배송비를 지원해 드립니다.
            </p>
            <Link to="/signup" className="text-sm font-black text-primary border-b-2 border-primary/20 pb-1 hover:border-primary transition-all">
              참여하기
            </Link>
          </div>

          <div className="bg-white p-10 rounded-[40px] editorial-shadow space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
               <Tag size={32} />
            </div>
            <h4 className="text-xl font-bold text-stone-900">리뷰 작성 포인트</h4>
            <p className="text-stone-500 font-light leading-relaxed">
              정성이 담긴 사진 리뷰를 작성하시면 결제 금액의 3%를 포인트로 드립니다.
            </p>
            <Link to="/mypage" className="text-sm font-black text-secondary border-b-2 border-secondary/20 pb-1 hover:border-secondary transition-all">
              포인트 확인
            </Link>
          </div>

          <div className="bg-white p-10 rounded-[40px] editorial-shadow space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
               <Clock size={32} />
            </div>
            <h4 className="text-xl font-bold text-stone-900">새벽배송 타임어택</h4>
            <p className="text-stone-500 font-light leading-relaxed">
              매일 저녁 6시, 일부 품목을 파격적인 할인가로 만나보실 수 있습니다.
            </p>
            <div className="text-sm font-black text-orange-600">
              COMMING SOON
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
