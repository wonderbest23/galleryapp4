"use client";
import { useState, useEffect, useRef } from "react";
import {
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Button,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { debounce } from "lodash";
import Link from "next/link";
import * as XLSX from 'xlsx';
import axios from "axios";


export function GalleryList({
  onSelectGallery,
  selectedKeys,
  onSelectionChange,
  onCreateGallery,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
}) {
  const [search, setSearch] = useState("");
  const [galleries, setGalleries] = useState([]);
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const GetGalleries = async () => {
    const offset = (page - 1) * itemsPerPage;
    console.log("GetGalleries 함수 호출됨 - 페이지:", page, "검색어:", search);

    let query = supabase
      .from("gallery")
      .select("*", {
        count: "exact",
      })
      .order("id", { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    // search 값이 있을 경우 필터 추가
    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search}%, address.ilike.%${search}%, phone.ilike.%${search}%, url.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("갤러리 데이터 조회 중 오류:", error);
    }
    console.log(
      "갤러리 데이터 조회 결과:",
      data?.length,
      "건, 총:",
      count,
      "건"
    );
    setGalleries(data || []);
    setTotal(Math.ceil(count / itemsPerPage));
  };

  // 외부에서 호출할 수 있는 새로고침 함수 추가
  const refreshGalleries = () => {
    console.log("refreshGalleries 함수 호출됨 - 갤러리 목록 새로고침");
    GetGalleries();
  };

  // onRefresh props가 존재하면 refreshGalleries 함수 전달
  useEffect(() => {
    if (onRefresh) {
      console.log("GalleryList: onRefresh 함수에 refreshGalleries 함수 전달");
      onRefresh(refreshGalleries);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (refreshToggle) {
      console.log(
        "GalleryList: refreshToggle 변경 감지 - 갤러리 목록 새로고침"
      );
      GetGalleries();
    }
  }, [refreshToggle]);

  // debounce 적용한 검색 함수
  const debouncedSearch = debounce(() => {
    GetGalleries();
  }, 500);

  useEffect(() => {
    debouncedSearch();
    // 컴포넌트 언마운트 시 debounce 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [page, search]);

  // 페이지 변경 처리 함수
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // 갤러리 선택 처리
  const handleSelectionChange = (keys) => {
    onSelectionChange(keys);
    const selectedKey = Array.from(keys)[0];

    if (selectedKey) {
      const gallery = galleries.find((g) => g.id === Number(selectedKey));
      if (gallery) onSelectGallery(gallery);
    }
  };

  // 엑셀 파일 업로드 처리 함수
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 형식 검사
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('파일 형식 오류', 'Excel 파일(.xlsx 또는 .xls)만 업로드 가능합니다.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://ytuc5hjepdzzvgqeupwg35mxhm0lupwf.lambda-url.ap-northeast-2.on.aws/uploadgallery',
        formData,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      const result = response.data;

      // 업로드 성공 시 성공/실패 건수 표시
      addToast({
        title: "갤러리 업로드 결과",
        description: `총 ${result.total_length}건 중 ${result.success_length}건 성공, ${result.fail_length}건 실패`,
        color: "success",
      });
      
      // 목록 새로고침
      GetGalleries();
    } catch (error) {
      console.error('파일 업로드 중 오류 발생:', error);
      toast.error('업로드 오류', '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      // 파일 인풋 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 엑셀 업로드 버튼 클릭 처리 함수
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 갤러리 전체 데이터를 가져와서 엑셀로 다운로드하는 함수
  const handleExcelDownload = async () => {
    try {
      setUploading(true); // 로딩 상태 활성화
      
      // 모든 갤러리 데이터 가져오기
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("id", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // 엑셀 워크시트 생성
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // 열 너비 설정
        const columnWidths = [
          { wch: 10 }, // id
          { wch: 30 }, // name
          { wch: 50 }, // address
          { wch: 20 }, // phone
          { wch: 40 }, // url
          { wch: 30 }, // 기타 필드들...
        ];
        worksheet['!cols'] = columnWidths;
        
        // 워크북 생성 및 워크시트 추가
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "갤러리 목록");
        
        // 엑셀 파일로 내보내기
        XLSX.writeFile(workbook, "갤러리목록_" + new Date().toISOString().split('T')[0] + ".xlsx");
        
        addToast({
          title: "다운로드 완료",
          description: `총 ${data.length}건의 갤러리 데이터를 다운로드했습니다.`,
          color: "success",
        });
      } else {
        addToast({
          title: "다운로드 실패",
          description: "다운로드할 갤러리 데이터가 없습니다.",
          color: "warning",
        });
      }
    } catch (error) {
      console.error("갤러리 데이터 다운로드 중 오류:", error);
      addToast({
        title: "다운로드 오류",
        description: "갤러리 데이터를 다운로드하는 중 오류가 발생했습니다.",
        color: "danger",
      });
    } finally {
      setUploading(false); // 로딩 상태 비활성화
    }
  };

  return (
    <div className="space-y-4 GalleryList">
      <div className="grid grid-cols-4 items-center justify-end gap-4">
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
          onPress={handleUploadClick}
          isLoading={uploading}
        >
          <Icon icon="lucide:upload" className="mr-1" />
          {uploading ? '업로드 중...' : '갤러리 엑셀 업로드'}
        </Button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".xlsx,.xls"
        />
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
          onPress={handleExcelDownload}
          isLoading={uploading}
        >
          <Icon icon="lucide:download" className="mr-1" />
          {uploading ? '처리 중...' : '갤러리 엑셀 다운로드'}
        </Button>
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
          onPress={onCreateGallery}
        >
          <Icon icon="lucide:plus" className="mr-1" />
          갤러리 신규 등록
        </Button>
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
          onPress={() => {
            const link = document.createElement('a');
            link.href = '/sample/galleryupload.xlsx';
            link.download = 'galleryupload.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Icon icon="lucide:file-spreadsheet" className="mr-1" />
          갤러리 엑셀 업로드 양식
        </Button>
      </div>
      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="갤러리 검색..."
          value={search}
          onValueChange={setSearch}
          startContent={
            <Icon icon="lucide:search" className="text-default-400" />
          }
          className="w-full"
        />
      </div>
      <div className="overflow-x-auto">
        <Table
          classNames={{ wrapper: "p-0" }}
          className="min-w-[600px] "
          shadow="none"
          variant="bordered"
          aria-label="갤러리 목록"
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          <TableHeader>
            <TableColumn>이름</TableColumn>
            <TableColumn>주소</TableColumn>
            <TableColumn>연락처</TableColumn>
            <TableColumn>URL</TableColumn>
          </TableHeader>
          <TableBody>
            {galleries.map((gallery) => (
              <TableRow key={gallery.id}>
                <TableCell>{gallery.name}</TableCell>
                <TableCell>{gallery.address}</TableCell>
                <TableCell>{gallery.phone}</TableCell>
                <TableCell>
                  <Link href={gallery.url} target="_blank">
                    {gallery.url}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center w-full">
        <Pagination
          page={page}
          total={total}
          initialPage={1}
          onChange={handlePageChange}
          showControls
        />
      </div>
    </div>
  );
}
