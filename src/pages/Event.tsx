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
