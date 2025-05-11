import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request, { params }) {
  try {
    const paramss=await params;
    const id = await paramss.id;
    
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.log('Error fetching product:', error);
      return NextResponse.json({ error: '제품을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.log('서버 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 