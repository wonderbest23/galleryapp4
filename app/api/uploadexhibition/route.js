import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // multipart/form-data 처리
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { detail: '파일이 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 데이터를 새 FormData에 추가
    const newFormData = new FormData();
    newFormData.append('file', file);

    // FastAPI 서버로 파일 전송 (전시회 엔드포인트)
    // 환경 변수가 없는 경우 기본 URL 사용
    const baseUrl = process.env.FASTAPI_URL;
    
    if (!baseUrl) {
      console.error('FASTAPI_URL 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { detail: 'API 서버 구성 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // uploadgallery에서 uploadexhibition으로 엔드포인트 교체
    const apiUrl = baseUrl.replace('uploadgallery', 'uploadexhibition');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: newFormData,
    });

    // FastAPI 서버 응답 처리
    const result = await response.json();
    
    // 응답 반환
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('전시회 엑셀 업로드 처리 중 오류:', error);
    return NextResponse.json(
      { detail: '서버 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 