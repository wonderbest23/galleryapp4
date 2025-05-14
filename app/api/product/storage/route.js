import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 현재 존재하는 버킷 목록 가져오기
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.log('버킷 목록 조회 오류:', bucketsError.message);
      return NextResponse.json(
        { error: '버킷 목록 조회 오류', details: bucketsError.message },
        { status: 500 }
      );
    }
    
    // product 버킷이 있는지 확인
    const productBucket = buckets.find(bucket => bucket.name === 'product');
    
    if (!productBucket) {
      // product 버킷 생성
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('product', {
          public: true, // 파일에 공개 URL 액세스 허용
          fileSizeLimit: 5 * 1024 * 1024, // 5MB 크기 제한
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] // 허용되는 이미지 타입
        });
      
      if (createError) {
        console.log('버킷 생성 오류:', createError.message);
        return NextResponse.json(
          { error: '버킷 생성 오류', details: createError.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: 'product 스토리지 버킷이 생성되었습니다.',
        bucket: newBucket
      });
    }
    
    // 버킷이 이미 존재하는 경우
    return NextResponse.json({
      message: 'product 스토리지 버킷이 이미 존재합니다.',
      bucket: productBucket
    });
    
  } catch (error) {
    console.log('스토리지 버킷 처리 중 오류 발생:', error.message);
    return NextResponse.json(
      { error: '스토리지 버킷 처리 중 오류 발생', details: error.message },
      { status: 500 }
    );
  }
} 