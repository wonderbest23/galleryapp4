"use client";
import { useState, useEffect } from "react";
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { debounce } from "lodash";
import Link from "next/link";

export function GalleryList({
  onSelectGallery,
  selectedKeys,
  onSelectionChange,
  onCreateGallery,
  onRefresh,
  refreshToggle,
  setRefreshToggle
}) {
  const [search, setSearch] = useState("");
  const [galleries, setGalleries] = useState([]);
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const supabase = createClient();

  const GetGalleries = async () => {
    const offset = (page - 1) * itemsPerPage;
    console.log('GetGalleries 함수 호출됨 - 페이지:', page, '검색어:', search);
    
    let query = supabase.from("gallery").select("*", {
      count: "exact",
    }).order('id', { ascending: false })
      .range(offset, offset + itemsPerPage - 1);
    
    // search 값이 있을 경우 필터 추가
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%, address.ilike.%${search}%, phone.ilike.%${search}%, url.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('갤러리 데이터 조회 중 오류:', error);
    }
    console.log('갤러리 데이터 조회 결과:', data?.length, '건, 총:', count, '건');
    setGalleries(data || []);
    setTotal(Math.ceil(count / itemsPerPage));
  };

  // 외부에서 호출할 수 있는 새로고침 함수 추가
  const refreshGalleries = () => {
    console.log('refreshGalleries 함수 호출됨 - 갤러리 목록 새로고침');
    GetGalleries();
  };

  // onRefresh props가 존재하면 refreshGalleries 함수 전달
  useEffect(() => {
    if (onRefresh) {
      console.log('GalleryList: onRefresh 함수에 refreshGalleries 함수 전달');
      onRefresh(refreshGalleries);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (refreshToggle) {
      console.log('GalleryList: refreshToggle 변경 감지 - 갤러리 목록 새로고침');
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

  return (
    <div className="space-y-4 GalleryList">
      <div className="grid grid-cols-4 items-center justify-end gap-4">
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
        >
          <Icon icon="lucide:upload" className="mr-1" />
          갤러리 엑셀 업로드
        </Button>
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
        >
          <Icon icon="lucide:download" className="mr-1" />
          갤러리 엑셀 다운로드
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

      <Table
        classNames={{ wrapper: "p-0" }}
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
