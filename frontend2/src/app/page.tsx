'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // 跳转到 splash 页面
    router.push('/splash');
  }, [router]);
  
  return null;
}