"use client";

import React, { useState, useEffect } from "react";
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

export function ExhibitionList({ onSelectExhibition, selectedKey, onSelectedKeyChange }) {
  const [search, setSearch] = useState("");
  const [exhibitions, setExhibitions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;
  
  // Supabase 클라이언트 생성
  const supabase = createClient();
  
  // 전시회 데이터 로드 함수
  const loadExhibitions = async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;
      
      let query = supabase
        .from('exhibition')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%, contents.ilike.%${search}%, add_info.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setExhibitions(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('전시회 데이터를 가져오는 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // debounce 적용한 검색 함수
  const debouncedSearch = debounce(() => {
    loadExhibitions();
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  }, 500);

  // 검색어 변경 핸들러
  const handleSearchChange = (value) => {
    setSearch(value);
    debouncedSearch();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 전시회 선택 핸들러
  const handleSelectionChange = (keys) => {
    if (onSelectedKeyChange) {
      onSelectedKeyChange(keys);
    }
    
    if (keys.size > 0) {
      const selectedId = Number(Array.from(keys)[0]);
      const exhibition = exhibitions.find((e) => e.id === selectedId);
      
      if (exhibition) {
        onSelectExhibition(exhibition);
      }
    }
  };

  // 페이지 또는 검색어 변경 시 데이터 로드
  useEffect(() => {
    loadExhibitions();
    // 컴포넌트 언마운트 시 debounce 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [currentPage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="전시회 검색..."
          value={search}
          onValueChange={handleSearchChange}
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
        aria-label="전시회 목록"
        selectionMode="single"
        selectedKeys={selectedKey}
        onSelectionChange={handleSelectionChange}
        isLoading={isLoading}
      >
        <TableHeader>
          <TableColumn className="text-center w-1/6">제목</TableColumn>
          <TableColumn className="text-center w-1/6">장소</TableColumn>
          <TableColumn className="text-center w-1/2">추가 정보</TableColumn>
          <TableColumn className="text-center w-1/6">기간</TableColumn>
        </TableHeader>
        <TableBody emptyContent="전시회 데이터가 없습니다.">
          {exhibitions.map((exhibition) => (
            <TableRow key={exhibition.id}>
              <TableCell>{exhibition.contents}</TableCell>
              <TableCell>{exhibition.name}</TableCell>
              <TableCell>
                {/* <div className="line-clamp-3 text-ellipsis overflow-hidden break-words">
                  {exhibition.add_info}
                </div> */}
              </TableCell>
              <TableCell>{exhibition.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center w-full">
        <Pagination 
          total={totalPages} 
          initialPage={1}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
}
