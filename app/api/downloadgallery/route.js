import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import * as XLSX from 'xlsx';

export async function GET(request) {
  try {
    // 서버 측 Supabase 클라이언트 생성
    const supabase = createClient();
    
    // gallery 테이블에서 모든 데이터 가져오기
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("갤러리 데이터 조회 중 오류:", error);
      return NextResponse.json(
        { detail: '갤러리 데이터 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 엑셀 워크북 생성
    const workbook = XLSX.utils.book_new();
    
    // 데이터 가공 (필요시)
    const processedData = data.map(gallery => ({
      'ID': gallery.id,
      '갤러리명': gallery.name,
      '주소': gallery.address,
      '연락처': gallery.phone,
      'URL': gallery.url,
      '메모': gallery.memo || ''
    }));
    
    // 워크시트 생성 및 워크북에 추가
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "갤러리 목록");
    
    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // 응답 헤더 설정
    const headers = new Headers();
    headers.append('Content-Disposition', 'attachment; filename="gallery_list.xlsx"');
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // 응답 반환
    return new NextResponse(excelBuffer, { 
      status: 200,
      headers: headers
    });
  } catch (error) {
    console.error('갤러리 엑셀 다운로드 처리 중 오류:', error);
    return NextResponse.json(
      { detail: '엑셀 파일 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 