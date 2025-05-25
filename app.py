from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Form
from fastapi.responses import JSONResponse, StreamingResponse
import pandas as pd
import io
import json
import requests
from typing import List, Dict, Any, Optional
import os
from pydantic import BaseModel
from mangum import Mangum
import asyncio
import uuid
import tempfile
from fastapi.middleware.cors import CORSMiddleware

# Supabase 설정 직접 지정
SUPABASE_URL = "https://teaelrzxuigiocnukwha.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWVscnp4dWlnaW9jbnVrd2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1ODkzMTIsImV4cCI6MjA1NzE2NTMxMn0.H9MLjMOBFXSaq0O6mX8GQlZaVAbk0ZBFn3ABtX2WIws"

app = FastAPI(
    title="Gallery & Exhibition Upload API",
    description="갤러리와 전시회 정보를 엑셀 파일로 업로드하고 실시간으로 처리 상태를 확인하는 API",
    version="1.0.0"
)
handler = Mangum(app)

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영 환경에서는 구체적인 도메인으로 제한하세요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 업로드된 파일을 저장할 임시 저장소
temp_files = {}

class UploadResponse(BaseModel):
    success: List[Dict[str, Any]] = []
    failed: List[Dict[str, Any]] = []
    status_code: int = 200
    success_length: int = 0
    fail_length: int = 0
    total_length: int = 0

class FileUploadResponse(BaseModel):
    upload_id: str
    filename: str
    record_count: int
    message: str = "파일이 성공적으로 업로드되었습니다. 이 ID로 처리 상태를 확인할 수 있습니다."

@app.get("/")
async def root():
    """
    API 서버가 정상적으로 동작하는지 확인하는 루트 엔드포인트
    """
    return {
        "message": "갤러리 및 전시회 업로드 API가 정상적으로 실행 중입니다.",
        "api_docs": "/docs",
        "gallery_upload": "/gallery/upload",
        "exhibition_upload": "/exhibition/upload"
    }

async def generate_progress_events(total, current_success, current_failed):
    """진행 상황을 SSE 형식으로 반환합니다."""
    data = {
        "total": total,
        "processed": current_success + current_failed,
        "success": current_success,
        "failed": current_failed,
        "progress": round(((current_success + current_failed) / total) * 100, 2) if total > 0 else 0
    }
    return f"data: {json.dumps(data)}\n\n"

@app.post("/uploadgallery", response_model=UploadResponse)
async def upload_gallery_excel(file: UploadFile = File(...), batch_size: int = 100):
    """
    엑셀 파일을 업로드하여 Supabase의 gallery 테이블에 데이터를 삽입합니다.
    URL이 있는 항목만 처리하고, 없는 항목은 실패 목록으로 반환합니다.
    batch_size 매개변수를 통해 한 번에 처리할 레코드 수를 지정할 수 있습니다(기본값: 100).
    """
    print("업로드 갤러리 함수 시작")
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다.")
    
    # 엑셀 파일 읽기
    try:
        # Lambda에서도 잘 작동하도록 수정
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # 파일 포인터를 처음으로 되돌려 놓기
        await file.seek(0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"엑셀 파일 처리 중 오류 발생: {str(e)}")
    
    # DataFrame을 dictionary 목록으로 변환
    records = df.to_dict('records')
    total_records=len(records)
    success_records = []
    failed_records = []
    print(f"총 레코드 수: {total_records}")

    
    # Supabase API 요청 준비
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # 레코드를 batch_size 크기의 배치로 나누기
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        print(f"배치 처리 중: {i+1}~{min(i+batch_size, len(records))} / {len(records)}")
        
        for index, record in enumerate(batch):
            # None 값과 NaN 값 처리
            clean_record = {k: ('' if pd.isna(v) else v) for k, v in record.items()}
            print(f"{index+1}/{len(batch)} 레코드 처리 중")
            # URL 필드가 있고 비어있지 않은지 확인
            if 'url' in clean_record and clean_record['url']:
                try:
                    # Supabase REST API를 통해 gallery 테이블에 데이터 삽입
                    response = requests.post(
                        f"{SUPABASE_URL}/rest/v1/gallery",
                        headers=headers,
                        json=clean_record
                    )
                    
                    if response.status_code == 201:
                        success_records.append(clean_record)
                    else:
                        print("Supabase API 오류 발생 레코드:",response.text)
                        clean_record['error'] = f"Supabase API 오류: {response.status_code} - {response.text}"
                        failed_records.append(clean_record)

                except Exception as e:
                    clean_record['error'] = f"데이터 삽입 중 오류 발생: {str(e)}"
                    failed_records.append(clean_record)
            else:
                clean_record['error'] = "URL 필드가 없거나 비어 있습니다."
                failed_records.append(clean_record)
        
        # 각 배치 처리 후 현재 진행 상황 출력
        print(f"현재까지 처리: 성공 {len(success_records)}건, 실패 {len(failed_records)}건")
    
    # 응답 상태 코드 결정
    status_code = 200
    if not success_records and failed_records:
        status_code = 400
    elif failed_records:
        status_code = 207  # 부분 성공 (Multi-Status)

    success_length=len(success_records)
    fail_length=len(failed_records)
    total_length=success_length+fail_length
    print(f"업로드 완료: 총 {total_length}건 중 성공 {success_length}건, 실패 {fail_length}건")
    return UploadResponse(success=success_records, failed=failed_records, status_code=status_code, success_length=success_length, fail_length=fail_length, total_length=total_length)

@app.post("/uploadexhibition", response_model=UploadResponse)
async def upload_exhibition_excel(file: UploadFile = File(...), batch_size: int = 100):
    """
    엑셀 파일을 업로드하여 Supabase의 exhibition 테이블에 데이터를 삽입합니다.
    URL이 있는 항목만 처리하고, 없는 항목은 실패 목록으로 반환합니다.
    batch_size 매개변수를 통해 한 번에 처리할 레코드 수를 지정할 수 있습니다(기본값: 100).
    """
    print("업로드 전시회 함수 시작")
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다.")
    
    # 엑셀 파일 읽기
    try:
        # Lambda에서도 잘 작동하도록 수정
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # 파일 포인터를 처음으로 되돌려 놓기
        await file.seek(0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"엑셀 파일 처리 중 오류 발생: {str(e)}")
    
    # DataFrame을 dictionary 목록으로 변환
    records = df.to_dict('records')
    total_records=len(records)
    success_records = []
    failed_records = []
    print(f"총 레코드 수: {total_records}")

    
    # Supabase API 요청 준비
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # 레코드를 batch_size 크기의 배치로 나누기
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        print(f"배치 처리 중: {i+1}~{min(i+batch_size, len(records))} / {len(records)}")
        
        for record in batch:
            # None 값과 NaN 값 처리
            clean_record = {k: ('' if pd.isna(v) else v) for k, v in record.items()}
            
            # 필수 필드 검증 (전시회 데이터에는 title이 필수라고 가정)
            if 'naver_gallery_url' in clean_record and clean_record['naver_gallery_url']:
                try:
                    # Supabase REST API를 통해 exhibition 테이블에 데이터 삽입
                    response = requests.post(
                        f"{SUPABASE_URL}/rest/v1/exhibition",
                        headers=headers,
                        json=clean_record
                    )
                    
                    if response.status_code == 201:
                        success_records.append(clean_record)
                    else:
                        clean_record['error'] = f"Supabase API 오류: {response.status_code} - {response.text}"
                        failed_records.append(clean_record)
                except Exception as e:
                    clean_record['error'] = f"데이터 삽입 중 오류 발생: {str(e)}"
                    failed_records.append(clean_record)
            else:
                clean_record['error'] = "naver_gallery_url 필드가 없거나 비어 있습니다."
                failed_records.append(clean_record)
                
        # 각 배치 처리 후 현재 진행 상황 출력
        print(f"현재까지 처리: 성공 {len(success_records)}건, 실패 {len(failed_records)}건")
    
    # 응답 상태 코드 결정
    status_code = 200
    if not success_records and failed_records:
        status_code = 400
    elif failed_records:
        status_code = 207  # 부분 성공 (Multi-Status)

    success_length=len(success_records)
    fail_length=len(failed_records)
    total_length=success_length+fail_length
    print(f"업로드 완료: 총 {total_length}건 중 성공 {success_length}건, 실패 {fail_length}건")
    return UploadResponse(success=success_records, failed=failed_records, status_code=status_code, success_length=success_length, fail_length=fail_length, total_length=total_length)

# 새로운 파일 업로드 엔드포인트 - 갤러리
@app.post("/gallery/upload", response_model=FileUploadResponse)
async def upload_gallery_file(file: UploadFile = File(...)):
    """
    엑셀 파일을 업로드하고 처리를 위한 고유 ID를 반환합니다.
    이 ID를 사용하여 처리 상태를 확인할 수 있습니다.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다.")
    
    try:
        # 임시 파일로 저장
        contents = await file.read()
        upload_id = str(uuid.uuid4())
        
        # 임시 파일 객체 생성
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        temp_file.write(contents)
        temp_file.close()
        
        # 파일 정보 미리 읽기
        df = pd.read_excel(temp_file.name)
        record_count = len(df)
        
        # 임시 저장소에 파일 정보 저장
        temp_files[upload_id] = {
            'path': temp_file.name,
            'filename': file.filename,
            'type': 'gallery',
            'status': 'uploaded',
            'record_count': record_count,
            'processed': False
        }
        
        # 백그라운드에서 처리 시작 (실제 처리는 스트리밍 요청에서 수행)
        return FileUploadResponse(
            upload_id=upload_id,
            filename=file.filename,
            record_count=record_count
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"파일 업로드 중 오류 발생: {str(e)}")

# 새로운 파일 업로드 엔드포인트 - 전시회
@app.post("/exhibition/upload", response_model=FileUploadResponse)
async def upload_exhibition_file(file: UploadFile = File(...)):
    """
    엑셀 파일을 업로드하고 처리를 위한 고유 ID를 반환합니다.
    이 ID를 사용하여 처리 상태를 확인할 수 있습니다.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다.")
    
    try:
        # 임시 파일로 저장
        contents = await file.read()
        upload_id = str(uuid.uuid4())
        
        # 임시 파일 객체 생성
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        temp_file.write(contents)
        temp_file.close()
        
        # 파일 정보 미리 읽기
        df = pd.read_excel(temp_file.name)
        record_count = len(df)
        
        # 임시 저장소에 파일 정보 저장
        temp_files[upload_id] = {
            'path': temp_file.name,
            'filename': file.filename,
            'type': 'exhibition',
            'status': 'uploaded',
            'record_count': record_count,
            'processed': False
        }
        
        return FileUploadResponse(
            upload_id=upload_id,
            filename=file.filename,
            record_count=record_count
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"파일 업로드 중 오류 발생: {str(e)}")

# GET 방식의 SSE 스트리밍 엔드포인트 - 갤러리
@app.get("/gallery/process/{upload_id}")
async def process_gallery_stream(upload_id: str, batch_size: int = 100):
    """
    업로드된 갤러리 파일의 처리 상태를 실시간으로 스트리밍합니다.
    Server-Sent Events(SSE) 형식으로 응답합니다.
    """
    # 업로드 ID 검증
    if upload_id not in temp_files or temp_files[upload_id]['type'] != 'gallery':
        raise HTTPException(status_code=404, detail="해당 ID의 갤러리 업로드 파일을 찾을 수 없습니다.")
    
    file_info = temp_files[upload_id]
    
    # 이미 처리된 파일인지 확인
    if file_info['processed']:
        raise HTTPException(status_code=400, detail="이미 처리된 파일입니다.")
    
    async def stream_progress():
        try:
            # 파일 정보 가져오기
            file_path = file_info['path']
            
            # 엑셀 파일 읽기
            df = pd.read_excel(file_path)
            
            # DataFrame을 dictionary 목록으로 변환
            records = df.to_dict('records')
            total_records = len(records)
            success_records = []
            failed_records = []
            
            # 초기 상태 전송
            yield await generate_progress_events(total_records, 0, 0)
            
            # Supabase API 요청 준비
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # 레코드를 batch_size 크기의 배치로 나누기
            for i in range(0, len(records), batch_size):
                batch = records[i:i+batch_size]
                
                for record in batch:
                    # None 값과 NaN 값 처리
                    clean_record = {k: ('' if pd.isna(v) else v) for k, v in record.items()}
                    
                    # URL 필드가 있고 비어있지 않은지 확인
                    if 'url' in clean_record and clean_record['url']:
                        try:
                            # Supabase REST API를 통해 gallery 테이블에 데이터 삽입
                            response = requests.post(
                                f"{SUPABASE_URL}/rest/v1/gallery",
                                headers=headers,
                                json=clean_record
                            )
                            
                            if response.status_code == 201:
                                success_records.append(clean_record)
                            else:
                                clean_record['error'] = f"Supabase API 오류: {response.status_code} - {response.text}"
                                failed_records.append(clean_record)
                        except Exception as e:
                            clean_record['error'] = f"데이터 삽입 중 오류 발생: {str(e)}"
                            failed_records.append(clean_record)
                    else:
                        clean_record['error'] = "URL 필드가 없거나 비어 있습니다."
                        failed_records.append(clean_record)
                    
                    # 진행 상황 업데이트 (각 레코드 처리 후)
                    yield await generate_progress_events(total_records, len(success_records), len(failed_records))
                    # 너무 빠른 업데이트를 방지하기 위한 작은 지연
                    await asyncio.sleep(0.01)
                
            # 파일 처리 완료 상태로 변경
            temp_files[upload_id]['processed'] = True
            
            # 최종 결과 전송
            final_result = {
                "total": total_records,
                "processed": len(success_records) + len(failed_records),
                "success": len(success_records),
                "failed": len(failed_records),
                "success_records": success_records,
                "failed_records": failed_records,
                "completed": True
            }
            yield f"data: {json.dumps(final_result)}\n\n"
            
            # 임시 파일 삭제
            try:
                os.unlink(file_path)
            except:
                pass
            
        except Exception as e:
            error_data = {"error": str(e), "completed": True}
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        stream_progress(),
        media_type="text/event-stream"
    )

# GET 방식의 SSE 스트리밍 엔드포인트 - 전시회
@app.get("/exhibition/process/{upload_id}")
async def process_exhibition_stream(upload_id: str, batch_size: int = 100):
    """
    업로드된 전시회 파일의 처리 상태를 실시간으로 스트리밍합니다.
    Server-Sent Events(SSE) 형식으로 응답합니다.
    """
    # 업로드 ID 검증
    if upload_id not in temp_files or temp_files[upload_id]['type'] != 'exhibition':
        raise HTTPException(status_code=404, detail="해당 ID의 전시회 업로드 파일을 찾을 수 없습니다.")
    
    file_info = temp_files[upload_id]
    
    # 이미 처리된 파일인지 확인
    if file_info['processed']:
        raise HTTPException(status_code=400, detail="이미 처리된 파일입니다.")
    
    async def stream_progress():
        try:
            # 파일 정보 가져오기
            file_path = file_info['path']
            
            # 엑셀 파일 읽기
            df = pd.read_excel(file_path)
            
            # DataFrame을 dictionary 목록으로 변환
            records = df.to_dict('records')
            total_records = len(records)
            success_records = []
            failed_records = []
            
            # 초기 상태 전송
            yield await generate_progress_events(total_records, 0, 0)
            
            # Supabase API 요청 준비
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # 레코드를 batch_size 크기의 배치로 나누기
            for i in range(0, len(records), batch_size):
                batch = records[i:i+batch_size]
                
                for record in batch:
                    # None 값과 NaN 값 처리
                    clean_record = {k: ('' if pd.isna(v) else v) for k, v in record.items()}
                    
                    # 필수 필드 검증
                    if 'naver_gallery_url' in clean_record and clean_record['naver_gallery_url']:
                        try:
                            # Supabase REST API를 통해 exhibition 테이블에 데이터 삽입
                            response = requests.post(
                                f"{SUPABASE_URL}/rest/v1/exhibition",
                                headers=headers,
                                json=clean_record
                            )
                            
                            if response.status_code == 201:
                                success_records.append(clean_record)
                            else:
                                clean_record['error'] = f"Supabase API 오류: {response.status_code} - {response.text}"
                                failed_records.append(clean_record)
                        except Exception as e:
                            clean_record['error'] = f"데이터 삽입 중 오류 발생: {str(e)}"
                            failed_records.append(clean_record)
                    else:
                        clean_record['error'] = "naver_gallery_url 필드가 없거나 비어 있습니다."
                        failed_records.append(clean_record)
                    
                    # 진행 상황 업데이트 (각 레코드 처리 후)
                    yield await generate_progress_events(total_records, len(success_records), len(failed_records))
                    # 너무 빠른 업데이트를 방지하기 위한 작은 지연
                    await asyncio.sleep(0.01)
                
            # 파일 처리 완료 상태로 변경
            temp_files[upload_id]['processed'] = True
                
            # 최종 결과 전송
            final_result = {
                "total": total_records,
                "processed": len(success_records) + len(failed_records),
                "success": len(success_records),
                "failed": len(failed_records),
                "success_records": success_records,
                "failed_records": failed_records,
                "completed": True
            }
            yield f"data: {json.dumps(final_result)}\n\n"
            
            # 임시 파일 삭제
            try:
                os.unlink(file_path)
            except:
                pass
            
        except Exception as e:
            error_data = {"error": str(e), "completed": True}
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        stream_progress(),
        media_type="text/event-stream"
    )

# 로컬 서버 실행을 위한 코드
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 