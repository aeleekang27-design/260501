/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CurationDetail from './pages/CurationDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import EventPage from './pages/Event';
import AdminDashboard from './pages/AdminDashboard';
import { Eye, ShoppingCart, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Floating Bottom Tab Bar for Mobile/Quick Navigation ---
const QuickTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: '홈', icon: <ShoppingCart size={20} />, path: '/', id: 'home' },
    { label: '장바구니', icon: <ShoppingCart size={20} />, path: '/cart', id: 'cart' },
    { label: '마이페이지', icon: <User size={20} />, path: '/mypage', id: 'mypage' },
    { label: '주문조회', icon: <Eye size={20} />, path: '/mypage?tab=orders', id: 'recent' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-md md:hidden">
       <div className="bg-white/80 backdrop-blur-xl border border-stone-100 rounded-full shadow-2xl p-2 flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 p-3 flex-1 rounded-full transition-all ${
                location.pathname === tab.path ? 'bg-primary text-white scale-110 shadow-lg' : 'text-stone-400 hover:text-stone-900'
              }`}
            >
              {tab.icon}
              <span className="text-[8px] font-black">{tab.label}</span>
            </button>
          ))}
       </div>
    </div>
  );
};
const PromoPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-black/60 transition-all"
        >
          <X size={20} />
        </button>
        <div className="relative aspect-[4/5]">
          <img 
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop" 
            alt="Promo" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003D27] via-transparent to-transparent flex flex-col justify-end p-12 text-white">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/30">
                Seasonal Event
              </span>
              <h3 className="text-3xl font-serif font-bold leading-tight">
                오늘 주문하고<br/>내일 새벽에 받으세요
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                더 바른 농장의 신규 가입 혜택과<br/>봄맞이 첫 주문 50% 쿠폰을 놓치지 마세요.
              </p>
              <div className="pt-4 flex gap-3 text-xs font-bold">
                 <button 
                   onClick={() => { onClose(); window.location.href = '/event'; }}
                   className="flex-1 h-14 bg-white text-[#003D27] rounded-2xl hover:scale-[1.02] transition-all shadow-xl"
                 >
                   혜택 상세보기
                 </button>
                 <button 
                   onClick={onClose}
                   className="px-6 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all"
                 >
                   오늘 하루 닫기
                 </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
import { Product, CartItem } from './types';
import { PRODUCTS as INITIAL_PRODUCTS } from './constants';

const INITIAL_HOME_CONTENT = {
  heroTag: '최상의 품질',
  heroTitle: '가장 소중한 순간 더 바른 농장',
  heroTitle_fontSize: 80,
  heroDesc: '엄격하게 선별된 자연의 정수를 가장 신선한 상태로 전달합니다. 우리는 맛과 진심을 큐레이팅합니다.',
  philosophyTag: '진심을 담은 수확',
  philosophyTitle: '자연이 허락한 만큼만, 진심을 담아 전합니다.',
  philosophyDesc: '우리는 대량 생산보다 품질의 진정성을 믿습니다. 산지의 신선함을 그대로 식탁으로 옮기기 위해, 우리의 시간은 오늘도 가장 완벽한 수확의 순간을 향해 있습니다.',
  featuredTag: '금주의 추천',
  featuredTitle: '이달의 추천 상품',
  heroImg1: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=2000&auto=format&fit=crop',
  featureImg1: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=1000&auto=format&fit=crop',
  featureTitle1: '새벽 배송',
  featureDesc1: '오늘 주문하면 내일 아침 가장 신선할 때 도착합니다.',
  featureImg2: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop',
  featureTitle2: '엄격한 선별',
  featureDesc2: '큐레이터가 직접 확인한 프리미엄 등급 식재료만을 담습니다.',
  featureImg3: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
  featureTitle3: '프리미엄 큐레이션',
  featureDesc3: '우리는 단순히 상품을 파는 것이 아니라 삶의 가치를 제안합니다.',
  featureImg4: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?q=80&w=1000&auto=format&fit=crop',
  featureTitle4: '산지 직송',
  featureDesc4: '산지의 신선함과 농부의 정성을 그대로 식탁에 전해드립니다.',
  farmStoryImg: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2000&auto=format&fit=crop',
  farmStoryTag: '산지 직송의 진심',
  farmStoryTitle: '농장에서 식탁까지, 가장 정직한 여행',
  farmStoryQuote: '"우리의 바구니는 단순한 상품이 아닌 농부의 땀과 정성을 담고 있습니다. 자연이 허락한 가장 완벽한 결실만을 골라 가장 신선한 상태로 보내드립니다."',
  farmStoryAdvTitle1: '100% 친환경 재배',
  farmStoryAdvDesc1: '인위적인 방식 대신 자연의 순환을 따르며, 땅의 힘을 믿고 건강하게 기릅니다.',
  farmStoryAdvTitle2: '새벽 수확, 당일 발송',
  farmStoryAdvDesc2: '햇살이 비치기 전 수확하여 수분과 영양을 그대로 품은 채 고객님의 문 앞까지 배송합니다.',
};

const INITIAL_FOOTER_CONTENT = {
  company: '더 바른 농장',
  footerLogo: 'https://picsum.photos/seed/harvest-basket/100/100',
  contact: '고객센터: 1588-0000 (09:00~18:00)',
  copyright: '© 2024 더 바른 농장 큐레이션. All rights reserved.',
};

const INITIAL_GLOBAL_CONTENT = {
  storeName: '더 바른 농장',
  logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
  login: '로그인',
  join: '회원 가입',
  orderTracking: '주문 조회',
  myPage: '마이 페이지',
  cart: '장바구니',
  cartTitle: '장바구니',
  cartEmpty: '장바구니에 담긴 상품이 없습니다.',
};

const INITIAL_DETAIL_PAGE_CONTENT = {
  backToList: '목록으로 돌아가기',
  deleteProduct: '상품 삭제하기',
  skuLabel: 'SKU',
  deliveryLabel: '배송 방식',
  deliveryValue: '샛별배송 (수도권 기준)',
  weightLabel: '중량/용량',
  quantityLabel: '주문 수량',
  addToCart: '장바구니 담기',
  buyNow: '바로 구매하기',
  wishlist: '위시리스트',
  share: '공유하기',
  originTitle: '상세 산지 정보',
  originHeading: '투명한 생산 과정, 당신이 먹는 것이 곧 당신입니다.',
  originDesc: '프리미엄 오가닉은 산지의 토양부터 수확의 순간까지 엄격하게 관리합니다. 모든 상품의 생산 이력을 투명하게 공개하여 안심하고 드실 수 있습니다.',
  specLabel1: '수확 시기',
  specValue1: '2024년 3월 중순',
  specLabel2: '배송 온도',
  specValue2: '신선 냉장 보관 (0 ~ 4°C)',
  specLabel3: '원산지',
  specLabel4: '품질 인증',
  specValue4: '유기농 농산물 인증 완료',
};

const INITIAL_EVENT_PAGE_CONTENT = {
  eventPageTitle: '더 바른 농장의\n특별한 소식',
  eventPageDesc: '자연의 신선함과 함께 찾아오는 다양한 혜택과 이벤트를 지금 바로 확인해보세요.',
};

export default function App() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error('Error parsing products from localStorage:', e);
      return INITIAL_PRODUCTS;
    }
  });

  const [homeContent, setHomeContent] = useState(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_home');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...INITIAL_HOME_CONTENT, ...parsed }; // Merge to preserve new fields
    } catch (e) {
      console.error('Error parsing homeContent from localStorage:', e);
      return INITIAL_HOME_CONTENT;
    }
  });

  const [footerContent, setFooterContent] = useState(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_footer');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...INITIAL_FOOTER_CONTENT, ...parsed };
    } catch (e) {
      console.error('Error parsing footerContent from localStorage:', e);
      return INITIAL_FOOTER_CONTENT;
    }
  });

  const [globalContent, setGlobalContent] = useState(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_global');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...INITIAL_GLOBAL_CONTENT, ...parsed };
    } catch (e) {
      console.error('Error parsing globalContent from localStorage:', e);
      return INITIAL_GLOBAL_CONTENT;
    }
  });

  const [detailPageContent, setDetailPageContent] = useState(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_detail_page');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...INITIAL_DETAIL_PAGE_CONTENT, ...parsed };
    } catch (e) {
      console.error('Error parsing detailPageContent from localStorage:', e);
      return INITIAL_DETAIL_PAGE_CONTENT;
    }
  });

  const [eventPageContent, setEventPageContent] = useState(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_event_page');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...INITIAL_EVENT_PAGE_CONTENT, ...parsed };
    } catch (e) {
      console.error('Error parsing eventPageContent from localStorage:', e);
      return INITIAL_EVENT_PAGE_CONTENT;
    }
  });

  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const hasSeenPromo = sessionStorage.getItem('hasSeenPromo');
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setShowPromo(true);
        sessionStorage.setItem('hasSeenPromo', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const [productListContent, setProductListContent] = useState(() => {
    const saved = localStorage.getItem('bareun_farm_product_list');
    const defaultContent = {
      tag: '최고의 신선함, 제철 컬렉션',
      title: '신선한 오늘의 수확',
      desc: '가장 완벽한 순간에 수확하여 산지의 신선함을 그대로 전해드립니다.',
      categories: [
        { id: '전체', label: '전체', image: 'https://images.unsplash.com/photo-1488459718432-06758a01a666?q=80&w=300&auto=format&fit=crop' },
        { id: '과일', label: '과일', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=300&auto=format&fit=crop' },
        { id: '야채', label: '야채', image: 'https://images.unsplash.com/photo-1540331547168-8b63109225b7?q=80&w=300&auto=format&fit=crop' },
        { id: '감자', label: '감자', image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=300&auto=format&fit=crop' },
        { id: '고구마', label: '고구마', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=300&auto=format&fit=crop' },
        { id: '옥수수', label: '옥수수', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=300&auto=format&fit=crop' },
        { id: '이벤트', label: '이벤트', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=300&auto=format&fit=crop' }
      ]
    };
    try {
      const saved = localStorage.getItem('bareun_farm_product_list');
      return saved ? JSON.parse(saved) : defaultContent;
    } catch (e) {
      console.error('Error parsing productListContent from localStorage:', e);
      return defaultContent;
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing cartItems from localStorage:', e);
      return [];
    }
  });

  const [curationDetails, setCurationDetails] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('bareun_farm_curation_details');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Error parsing curationDetails from localStorage:', e);
      return {};
    }
  });

  const [filter, setFilter] = useState('전체');

  // 1. Initial Load & Sync from Firestore (Global Config & Products)
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        // Fetch Config
        const configRef = doc(db, 'config', 'site_data');
        const configDoc = await getDoc(configRef);
        
        if (configDoc.exists()) {
          const remoteData = configDoc.data();
          if (remoteData.homeContent) setHomeContent(prev => ({ ...prev, ...remoteData.homeContent }));
          if (remoteData.footerContent) setFooterContent(prev => ({ ...prev, ...remoteData.footerContent }));
          if (remoteData.globalContent) setGlobalContent(prev => ({ ...prev, ...remoteData.globalContent }));
          if (remoteData.detailPageContent) setDetailPageContent(prev => ({ ...prev, ...remoteData.detailPageContent }));
          if (remoteData.eventPageContent) setEventPageContent(prev => ({ ...prev, ...remoteData.eventPageContent }));
          if (remoteData.productListContent) setProductListContent(prev => ({ ...prev, ...remoteData.productListContent }));
        }

        // Fetch curationDetails from collection
        const curationCol = collection(db, 'curation_details');
        const curationSnapshot = await getDocs(curationCol);
        const fetchedCuration: Record<string, any> = {};
        curationSnapshot.docs.forEach(d => {
          fetchedCuration[d.id] = d.data();
        });
        if (Object.keys(fetchedCuration).length > 0) {
          setCurationDetails(fetchedCuration);
        }

        // Fetch Products from collection (to avoid doc size limits)
        const productsCol = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCol);
        const fetchedProducts = productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Error fetching site data from Firestore:', error);
      }
    };

    fetchSiteData();
  }, []);

  // 2. Global Persistence Effect to Firestore
  useEffect(() => {
    const saveSiteData = async () => {
      // ONLY save global site data if user is logged in as the admin
      if (!user || user.email !== 'aeleekang27@gmail.com') return;

      try {
        const configRef = doc(db, 'config', 'site_data');
        // NOTE: We EXCLUDE products from the main site_data doc to avoid 1MB limit
        await setDoc(configRef, {
          homeContent,
          footerContent,
          globalContent,
          detailPageContent,
          eventPageContent,
          productListContent,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Sync individual products
        const batch = writeBatch(db);
        products.forEach(product => {
          const productRef = doc(db, 'products', product.id);
          batch.set(productRef, { ...product, updatedAt: serverTimestamp() }, { merge: true });
        });
        
        // Sync curation details
        Object.entries(curationDetails).forEach(([id, detail]) => {
          const curationRef = doc(db, 'curation_details', id);
          batch.set(curationRef, { ...(detail as object), updatedAt: serverTimestamp() }, { merge: true });
        });

        await batch.commit();

        // Optional: In a real app, you'd also want to track and delete products 
        // that are no longer in the products array from the Firestore collection.
      } catch (error) {
        console.error('Error auto-saving site data to Firestore:', error);
      }
    };

    const timer = setTimeout(() => {
      saveSiteData();
    }, 5000); // 5s debounce for heavier split saves

    return () => clearTimeout(timer);
  }, [user, products, homeContent, footerContent, globalContent, detailPageContent, eventPageContent, productListContent, curationDetails]);

  // Sync cart with Firestore if user is logged in
  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        const cartRef = doc(db, 'users', user.uid, 'cart', 'current');
        const cartDoc = await getDoc(cartRef);
        if (cartDoc.exists()) {
          const remoteItems = cartDoc.data().items || [];
          // Merge or overwrite based on strategy. Here we'll overwrite local with remote on first load
          setCartItems(remoteItems);
        }
      } catch (error) {
        console.error('Error fetching cart from Firestore:', error);
      }
    };

    fetchCart();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_cart', JSON.stringify(cartItems));
    
    // Save to Firestore if logged in
    if (user) {
      const saveCart = async () => {
        try {
          const cartRef = doc(db, 'users', user.uid, 'cart', 'current');
          await setDoc(cartRef, {
            items: cartItems,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error('Error saving cart to Firestore:', error);
        }
      };
      saveCart();
    }
  }, [cartItems, user]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('bareun_farm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_home', JSON.stringify(homeContent));
  }, [homeContent]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_footer', JSON.stringify(footerContent));
  }, [footerContent]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_global', JSON.stringify(globalContent));
  }, [globalContent]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_detail_page', JSON.stringify(detailPageContent));
  }, [detailPageContent]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_event_page', JSON.stringify(eventPageContent));
  }, [eventPageContent]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_product_list', JSON.stringify(productListContent));
  }, [productListContent]);

  useEffect(() => {
    localStorage.setItem('bareun_farm_curation_details', JSON.stringify(curationDetails));
  }, [curationDetails]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    // Also update cart items if the product is there
    setCartItems(prev => prev.map(item => item.product.id === id ? { ...item, product: { ...item.product, ...updates } } : item));
  };

  const handleCreateProduct = (category: string) => {
    if (!user || user.email !== 'aeleekang27@gmail.com') {
      alert('관리자만 상품을 추가할 수 있습니다.');
      return;
    }
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: '새로운 상품 이름',
      price: 15000,
      description: '상품에 대한 설명을 입력해주세요.',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop',
      category: category === '전체' ? '과일' : category,
      badges: []
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user || user.email !== 'aeleekang27@gmail.com') {
      alert('관리자만 상품을 삭제할 수 있습니다.');
      return;
    }
    if (window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setCartItems(prev => prev.filter(item => item.product.id !== id));
      
      // Also delete from Firestore collection
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error('Error deleting product from Firestore:', error);
      }
    }
  };

  const updateHomeContent = (key: string, value: string | number | boolean, type: 'text' | 'fontSize' | 'deleted' = 'text') => {
    const finalKey = type === 'text' ? key : `${key}_${type}`;
    setHomeContent(prev => ({ ...prev, [finalKey]: value }));
  };

  const updateFooterContent = (key: string, value: string | number | boolean, type: 'text' | 'fontSize' | 'deleted' = 'text') => {
    const finalKey = type === 'text' ? key : `${key}_${type}`;
    setFooterContent(prev => ({ ...prev, [finalKey]: value }));
  };

  const updateGlobalContent = (key: string, value: string | number | boolean, type: 'text' | 'fontSize' | 'deleted' = 'text') => {
    const finalKey = type === 'text' ? key : `${key}_${type}`;
    setGlobalContent(prev => ({ ...prev, [finalKey]: value }));
  };

  const updateDetailPageContent = (key: string, value: string | number | boolean, type: 'text' | 'fontSize' | 'deleted' = 'text') => {
    const finalKey = type === 'text' ? key : `${key}_${type}`;
    setDetailPageContent(prev => ({ ...prev, [finalKey]: value }));
  };

  const updateEventPageContent = (key: string, value: string | number | boolean, type: 'text' | 'fontSize' | 'deleted' = 'text') => {
    const finalKey = type === 'text' ? key : `${key}_${type}`;
    setEventPageContent(prev => ({ ...prev, [finalKey]: value }));
  };

  const updateProductListContent = (key: string, value: any) => {
    setProductListContent(prev => ({ ...prev, [key]: value }));
  };

  const updateProductListCategory = (id: string, newLabel: string) => {
    setProductListContent(prev => ({
      ...prev,
      categories: prev.categories.map((c: any) => c.id === id ? { ...c, label: newLabel } : c)
    }));
  };

  const updateProductListCategoryImage = (id: string, newImage: string) => {
    setProductListContent(prev => ({
      ...prev,
      categories: prev.categories.map((c: any) => c.id === id ? { ...c, image: newImage } : c)
    }));
  };

  const updateProductListCategoryFontSize = (id: string, size: number) => {
    setProductListContent(prev => ({
      ...prev,
      categories: prev.categories.map((c: any) => c.id === id ? { ...c, labelFontSize: size } : c)
    }));
  };

  const handleDeleteCategory = (id: string) => {
    if (id === '전체' || id === '더 바른 농장') {
      alert('기본 카테고리는 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm('정말 이 카테고리를 삭제하시겠습니까? 관련 상품들의 카테고리는 유지되지만 필터링에서 제외됩니다.')) {
      setProductListContent(prev => ({
        ...prev,
        categories: prev.categories.filter((c: any) => c.id !== id)
      }));
    }
  };

  const handleReorderCategories = (newCategories: any[]) => {
    setProductListContent(prev => ({
      ...prev,
      categories: newCategories
    }));
  };

  const handleCreateCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCategory = {
      id: newId,
      label: '새 카테고리',
      image: 'https://images.unsplash.com/photo-1488459718432-06758a01a666?q=80&w=300&auto=format&fit=crop'
    };
    setProductListContent(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeCartItem = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const handleUpdateCurationDetail = (id: string, key: string, value: string) => {
    setCurationDetails(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [key]: value
      }
    }));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {!isAdminPath && (
        <Header 
          cartCount={cartCount} 
          storeName={globalContent.storeName}
          onUpdateStoreName={(val) => updateGlobalContent('storeName', val)}
          content={globalContent}
          onUpdateContent={updateGlobalContent}
          categories={productListContent.categories}
          filter={filter}
          onSetFilter={setFilter}
          onUpdateCategory={updateProductListCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategory={handleReorderCategories}
          onCreateCategory={handleCreateCategory}
          onUpdateCategoryFontSize={updateProductListCategoryFontSize}
        />
      )}
      
      <div className="flex-1">
        <Routes>
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <AdminDashboard 
                  products={products} 
                  onUpdateProduct={handleUpdateProduct} 
                  onDeleteProduct={handleDeleteProduct} 
                  onCreateProduct={handleCreateProduct} 
                />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">접근 권한이 없습니다.</h2>
                    <button onClick={() => navigate('/')} className="text-primary hover:underline">홈으로 돌아가기</button>
                  </div>
                </div>
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Home 
                products={products} 
                content={homeContent} 
                onUpdateContent={updateHomeContent}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddToCart={handleAddToCart}
                productListContent={productListContent}
                onUpdateProductListContent={updateProductListContent}
                onUpdateCategory={updateProductListCategory}
                onUpdateCategoryImage={updateProductListCategoryImage}
                onDeleteCategory={handleDeleteCategory}
                onReorderCategory={handleReorderCategories}
                onCreateCategory={handleCreateCategory}
                onCreateProduct={handleCreateProduct}
                filter={filter}
                setFilter={setFilter}
              />
            } 
          />
          {/* Legacy routes redirected to Home with shared state */}
          <Route path="/products" element={<Home products={products} content={homeContent} onUpdateContent={updateHomeContent} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onAddToCart={handleAddToCart} productListContent={productListContent} onUpdateProductListContent={updateProductListContent} onUpdateCategory={updateProductListCategory} onUpdateCategoryImage={updateProductListCategoryImage} onDeleteCategory={handleDeleteCategory} onReorderCategory={handleReorderCategories} onCreateCategory={handleCreateCategory} onCreateProduct={handleCreateProduct} filter={filter} setFilter={setFilter} />} />
          <Route path="/vegetables" element={<Home products={products} content={homeContent} onUpdateContent={updateHomeContent} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onAddToCart={handleAddToCart} productListContent={productListContent} onUpdateProductListContent={updateProductListContent} onUpdateCategory={updateProductListCategory} onUpdateCategoryImage={updateProductListCategoryImage} onDeleteCategory={handleDeleteCategory} onReorderCategory={handleReorderCategories} onCreateCategory={handleCreateCategory} onCreateProduct={handleCreateProduct} filter={filter} setFilter={setFilter} />} />
          <Route path="/gifts" element={<Home products={products} content={homeContent} onUpdateContent={updateHomeContent} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onAddToCart={handleAddToCart} productListContent={productListContent} onUpdateProductListContent={updateProductListContent} onUpdateCategory={updateProductListCategory} onUpdateCategoryImage={updateProductListCategoryImage} onDeleteCategory={handleDeleteCategory} onReorderCategory={handleReorderCategories} onCreateCategory={handleCreateCategory} onCreateProduct={handleCreateProduct} filter={filter} setFilter={setFilter} />} />
          <Route path="/events" element={<EventPage products={products} content={eventPageContent} onUpdateContent={updateEventPageContent} />} />
          <Route path="/event" element={<EventPage products={products} content={eventPageContent} onUpdateContent={updateEventPageContent} />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/order-tracking" element={<MyPage user={user} products={products} />} />
          <Route path="/mypage" element={<MyPage user={user} products={products} />} />
          <Route 
            path="/product/:id" 
            element={
              <ProductDetail 
                products={products}
                onAddToCart={handleAddToCart} 
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                content={detailPageContent}
                onUpdateContent={updateDetailPageContent}
              />
            } 
          />
          <Route 
            path="/curation/:id" 
            element={
              <CurationDetail 
                curationDetails={curationDetails}
                onUpdateDetail={handleUpdateCurationDetail}
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <Cart 
                items={cartItems} 
                content={globalContent}
                onUpdateContent={updateGlobalContent}
                onUpdateQuantity={updateQuantity} 
                onRemoveItem={removeCartItem} 
              />
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cartItems={cartItems} 
                user={user} 
                onClearCart={() => setCartItems([])}
              />
            }
          />
          <Route path="/order-detail/:orderId" element={<OrderDetail />} />
        </Routes>
      </div>

      {!isAdminPath && (
        <>
          <Footer content={footerContent} onUpdate={updateFooterContent} />
          <QuickTabBar />
          <PromoPopup isOpen={showPromo} onClose={() => setShowPromo(false)} />
        </>
      )}
    </div>
  );
}

