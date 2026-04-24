import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Share2, Heart } from 'lucide-react';
import EditableText from '../components/EditableText';
import EditableImage from '../components/EditableImage';

interface CurationDetailProps {
  curationDetails: Record<string, any>;
  onUpdateDetail: (id: string, key: string, value: string) => void;
}

export default function CurationDetail({ curationDetails, onUpdateDetail }: CurationDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;

  const detail = curationDetails[id] || {
    title: '상세 제목을 입력하세요',
    subtitle: '부제목 혹은 핵심 요약',
    content: '이곳에 상세한 내용을 작성해 주세요. 자연의 정취와 더 바른 농장의 진심이 담긴 이야기를 자유롭게 편집할 수 있습니다.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200',
    quote: '자연이 주는 가장 큰 선물은 정직함입니다.',
    date: '2024.04.17'
  };

  const updateField = (key: string, value: string) => {
    onUpdateDetail(id, key, value);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-500 hover:text-black transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </button>
          <div className="flex items-center gap-4">
             <button className="p-2 text-stone-400 hover:text-primary transition-colors hover:scale-110">
                <Heart size={20} />
             </button>
             <button className="p-2 text-stone-400 hover:text-blue-500 transition-colors hover:scale-110">
                <Share2 size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto px-6 pt-12"
      >
        <div className="space-y-6 mb-12">
          <EditableText 
            value={detail.date} 
            onSave={(val) => updateField('date', val)}
            className="text-primary font-bold tracking-widest text-sm uppercase"
          />
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-stone-900">
            <EditableText 
              value={detail.title} 
              onSave={(val) => updateField('title', val)}
              multiline
            />
          </h1>
          <EditableText 
            value={detail.subtitle} 
            onSave={(val) => updateField('subtitle', val)}
            className="text-xl text-stone-500 font-light max-w-2xl block"
            multiline
          />
        </div>

        {/* Featured Image */}
        <div className="relative aspect-[21/9] rounded-[48px] overflow-hidden editorial-shadow mb-16">
          <EditableImage 
            src={detail.image} 
            onSave={(val) => updateField('image', val)}
            className="w-full h-full"
          />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="prose prose-stone prose-lg max-w-none">
              <EditableText 
                value={detail.content} 
                onSave={(val) => updateField('content', val)}
                className="text-stone-700 leading-relaxed font-light whitespace-pre-wrap block min-h-[400px]"
                multiline
              />
            </div>
          </div>

          {/* Sidebar / Quote */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white p-10 rounded-[40px] editorial-shadow border border-stone-100 italic text-stone-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-primary/10 select-none">
                  <span className="text-8xl serif">"</span>
                </div>
                <EditableText 
                   value={detail.quote} 
                   onSave={(val) => updateField('quote', val)}
                   className="relative z-10 block"
                   multiline
                />
              </div>

              <div className="bg-[#003D32] text-white p-8 rounded-[40px] editorial-shadow">
                <h4 className="font-bold mb-4">더 바른 농장의 약속</h4>
                <p className="text-sm text-white/70 leading-relaxed font-light">
                  우리는 인위적인 기술보다 자연의 시간을 존중합니다. 가장 신선한 결실을 식탁에 올리기 위한 우리의 노력은 오늘도 계속됩니다.
                </p>
                <button 
                  onClick={() => navigate('/products')}
                  className="w-full mt-6 py-3 bg-white text-[#003D32] rounded-xl font-bold hover:scale-105 transition-all text-sm"
                >
                  제철 상품 보러가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
