'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { GalleryDetail } from '../../components/gallery-detail';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';

export default function EditGallery() {
  const { id } = useParams();
  const router = useRouter();
  
  const goBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">갤러리 정보 수정</h1>
        <Button color="default" variant="light" onPress={goBack}>
          뒤로 가기
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <GalleryDetail galleryId={id} />
      </div>
    </div>
  );
} 