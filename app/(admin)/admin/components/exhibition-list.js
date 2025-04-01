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

export function ExhibitionList({
  onSelectExhibition,
  selectedKeys,
  onSelectionChange,
  onCreateExhibition,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
}) {
  const [search, setSearch] = useState("");
  const [exhibitions, setExhibitions] = useState([]);
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const supabase = createClient();

  const GetExhibitions = async () => {
    const offset = (page - 1) * itemsPerPage;
    console.log(
      "GetExhibitions 함수 호출됨 - 페이지:",
      page,
      "검색어:",
      search
    );

    let query = supabase
      .from("exhibition")
      .select("*", {
        count: "exact",
      })
      .order("id", { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    // search 값이 있을 경우 필터 추가
    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search}%, contents.ilike.%${search}%, add_info.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.log("전시회 데이터 조회 중 오류:", error);
    }
    console.log(
      "전시회 데이터 조회 결과:",
      data?.length,
      "건, 총:",
      count,
      "건"
    );
    setExhibitions(data || []);
    setTotal(Math.ceil((count || 0) / itemsPerPage));
  };

  useEffect(() => {
    console.log('가져오자')
    GetExhibitions();
  }, [refreshToggle]);
  console.log('refreshToggle:',refreshToggle)

  // 외부에서 호출할 수 있는 새로고침 함수 추가
  const refreshExhibitions = () => {
    console.log("refreshExhibitions 함수 호출됨 - 전시회 목록 새로고침");
    GetExhibitions();
  };

  // onRefresh props가 존재하면 refreshExhibitions 함수 전달
  useEffect(() => {
    if (onRefresh) {
      console.log(
        "ExhibitionList: onRefresh 함수에 refreshExhibitions 함수 전달"
      );
      onRefresh(refreshExhibitions);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (refreshToggle) {
      console.log(
        "ExhibitionList: refreshToggle 변경 감지 - 전시회 목록 새로고침"
      );
      GetExhibitions();
    }
  }, [refreshToggle]);

  // debounce 적용한 검색 함수
  const debouncedSearch = debounce(() => {
    GetExhibitions();
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

  // 전시회 선택 처리
  const handleSelectionChange = (keys) => {
    onSelectionChange(keys);
    const selectedKey = Array.from(keys)[0];

    if (selectedKey) {
      const exhibition = exhibitions.find((e) => e.id === Number(selectedKey));
      if (exhibition) onSelectExhibition(exhibition);
    }
  };

  return (
    <div className="space-y-4 ExhibitionList">
      <div className="grid grid-cols-4 items-center justify-end gap-4">
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
        >
          <Icon icon="lucide:upload" className="mr-1" />
          전시회 엑셀 업로드
        </Button>
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
        >
          <Icon icon="lucide:download" className="mr-1" />
          전시회 엑셀 다운로드
        </Button>
        <Button
          className="text-white col-span-4 md:col-span-1"
          color="primary"
          variant="solid"
          onPress={onCreateExhibition}
        >
          <Icon icon="lucide:plus" className="mr-1" />
          전시회 신규 등록
        </Button>
      </div>
      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="전시회 검색..."
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
        aria-label="전시회 목록"
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
      >
        <TableHeader>
          <TableColumn className="w-1/4">제목</TableColumn>
          <TableColumn className="w-1/4">갤러리</TableColumn>
          <TableColumn className="w-1/2">추가정보</TableColumn>
        </TableHeader>
        <TableBody>
          {exhibitions.map((exhibition) => (
            <TableRow key={exhibition.id}>
              <TableCell>{exhibition.contents}</TableCell>
              <TableCell>{exhibition.name}</TableCell>
              <TableCell>
                <div className="line-clamp-2 overflow-hidden text-ellipsis">
                  {exhibition.add_info}
                </div>
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
