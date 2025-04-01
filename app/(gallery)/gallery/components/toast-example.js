'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { useToast } from '@/utils/toast';

export default function ToastExample() {
  const toast = useToast();
  
  return (
    <div className="space-y-4 p-4 rounded-lg border bg-white">
      <h2 className="text-xl font-medium">토스트 알림 예제</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button
          color="primary"
          onClick={() => toast.info('안내 메시지', '이것은 정보 안내 토스트입니다.')}
        >
          기본 토스트
        </Button>
        
        <Button
          color="success"
          onClick={() => toast.success('성공!', '작업이 성공적으로 완료되었습니다.')}
        >
          성공 토스트
        </Button>
        
        <Button
          color="warning" 
          onClick={() => toast.warning('주의!', '주의가 필요한 작업입니다.')}
        >
          경고 토스트
        </Button>
        
        <Button
          color="danger"
          onClick={() => toast.error('오류 발생', '작업 중 문제가 발생했습니다.')}
        >
          오류 토스트
        </Button>
        
        <Button
          color="secondary"
          onClick={() => 
            toast.showToast({
              title: '커스텀 토스트',
              description: '원하는 스타일로 커스터마이징할 수 있습니다.',
              color: 'secondary',
              variant: 'bordered',
              timeout: 8000,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )
            })
          }
        >
          커스텀 토스트
        </Button>
      </div>
    </div>
  );
} 