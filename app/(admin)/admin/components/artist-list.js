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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { debounce } from "lodash";
import Link from "next/link";
import * as XLSX from "xlsx";
import axios from "axios";

export function ArtistList({
  onSelectArtist,
  selectedKeys,
  onSelectionChange,
  onCreateArtist,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
  selectedArtist,
  setSelectedArtist,
}) {
  const [search, setSearch] = useState("");
  const [artists, setArtists] = useState([]);
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressStatus, setProgressStatus] = useState(""); // 'processing', 'success', 'failed'
  const supabase = createClient();
  const fileInputRef = useRef(null);

  // artists 상태 변화 감지
  useEffect(() => {
    console.log("ArtistList: 작가 목록 업데이트됨", artists.length, "건");
  }, [artists]);

  const GetArtists = async () => {
    const offset = (page - 1) * itemsPerPage;
    console.log(
      "GetArtists 함수 호출됨 - 페이지:",
      page,
      "검색어:",
      search
    );

    let query = supabase
      .from("profiles")
      .select("*", { count: 'exact' })
      .eq("isArtist", true)
      .order("id", { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    // search 값이 있을 경우 필터 추가
    if (search.trim()) {
      query = query.or(
        `artist_name.ilike.%${search}%`,
        `artist_intro.ilike.%${search}%`,
        `artist_genre.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;
    console.log("data:", data)
    if (error) {
      console.error("작가 데이터 조회 중 오류:", error);
    }
    console.log('count:', count)
    console.log(
      "작가 데이터 조회 결과:",
      data?.length,
      "건, 총:",
      count,
      "건"
    );
    setArtists(data || []);
    setTotal(Math.ceil(count / itemsPerPage));
  };

  // 외부에서 호출할 수 있는 새로고침 함수 추가
  const refreshArtists = () => {
    console.log("refreshArtists 함수 호출됨 - 작가 목록 새로고침");
    GetArtists();
  };

  // 컴포넌트 마운트 시 작가 목록 로드
  useEffect(() => {
    console.log("ArtistList: 컴포넌트 마운트 - 초기 작가 목록 로드");
    GetArtists();
  }, []);

  // onRefresh props가 존재하면 refreshArtists 함수 전달
  useEffect(() => {
    if (onRefresh) {
      console.log(
        "ArtistList: onRefresh 함수에 refreshArtists 함수 전달"
      );
      onRefresh(refreshArtists);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (refreshToggle) {
      console.log(
        "ArtistList: refreshToggle 변경 감지 - 작가 목록 새로고침"
      );
      GetArtists();
    }
  }, [refreshToggle]);

  // debounce 적용한 검색 함수
  const debouncedSearch = debounce(() => {
    GetArtists();
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

  // 작가 선택 처리
  const handleSelectionChange = (keys) => {
    onSelectionChange(keys);
    const selectedKey = Array.from(keys)[0];
    console.log("선택된 작가 ID:", selectedKey);
    if (selectedKey) {
      const artist = artists.find((a) => a.id === Number(selectedKey));
      console.log("선택된 작가 ID:", selectedKey);
      console.log("찾은 작가 정보:", artist);  

      if (selectedKeys) {
        onSelectArtist(selectedKeys);
        setSelectedArtist(selectedKeys);
      }
    } else {
      // 선택 해제 시 초기화
      setSelectedArtist(null);
    }
  };

  // 엑셀 파일 다운로드 처리 함수
  const handleExcelDownload = async () => {
    try {
      setUploading(true); // 로딩 상태 활성화

      // 모든 작가 데이터 가져오기
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("isArtist", true)
        .order("id", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        addToast({
          title: "데이터 없음",
          description: "다운로드할 작가 데이터가 없습니다.",
          color: "warning",
        });
        setUploading(false);
        return;
      }

      // 엑셀 워크시트용 데이터 준비
      const worksheet = XLSX.utils.json_to_sheet(
        data.map((artist) => ({
          ID: artist.id,
          이름: artist.artist_name || "",
          전화번호: artist.artist_phone || "",
          소개: artist.artist_intro || "",
          생년월일: artist.artist_birth || "",
          장르: artist.artist_genre || "",
          인증자료: artist.artist_proof || "",
          추가정보: artist.artist_credit || "",
          승인여부: artist.isArtistApproval ? "승인" : "미승인",
          아티스트여부: artist.isArtist ? "예" : "아니오",
        }))
      );

      // 워크북 생성 및 워크시트 추가
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "작가목록");

      // 엑셀 파일 생성 및 다운로드
      XLSX.writeFile(workbook, "artist_list.xlsx");

      addToast({
        title: "엑셀 다운로드 완료",
        description: `총 ${data.length}개의 작가 데이터가 엑셀 파일로 다운로드되었습니다.`,
        color: "success",
      });
    } catch (error) {
      console.error("엑셀 다운로드 중 오류:", error);
      addToast({
        title: "다운로드 오류",
        description: `엑셀 다운로드 중 오류가 발생했습니다: ${error.message}`,
        color: "danger",
      });
    } finally {
      setUploading(false);
    }
  };

  // 프로그레스 바의 색상 설정
  const getProgressColor = () => {
    switch (progressStatus) {
      case "success":
        return "success";
      case "failed":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <div className="space-y-4 ArtistList">


      {/* 로딩 프로그레스 바 */}
      {progressVisible && (
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">
              {progressStatus === "completed"
                ? "업로드 완료"
                : progressStatus === "failed"
                  ? "업로드 실패"
                  : "업로드 진행 중..."}
            </span>
            <span className="text-sm font-medium">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <Progress
            value={uploadProgress}
            color={getProgressColor()}
            size="md"
            showValueLabel={false}
          />
        </div>
      )}

      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="작가 검색..."
          value={search}
          onValueChange={setSearch}
          startContent={
            <Icon icon="lucide:search" className="text-default-400" />
          }
          className="w-full"
        />
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto">
        <Table
          classNames={{ wrapper: "p-0" }}
          className="min-w-[600px]"
          shadow="none"
          variant="bordered"
          aria-label="작가 목록 테이블"
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          <TableHeader>
            <TableColumn>이름</TableColumn>
            <TableColumn>전화번호</TableColumn>
            <TableColumn>장르</TableColumn>
            <TableColumn>인증 여부</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={"작가 데이터가 없습니다."}
            items={artists || []}
          >
            {(artist) => (
              <TableRow key={artist.id}>
                <TableCell>{artist.artist_name || "이름 없음"}</TableCell>
                <TableCell>{artist.artist_phone || "-"}</TableCell>
                <TableCell>{artist.artist_genre || "-"}</TableCell>
                <TableCell>
                  {artist.isArtistApproval ? (
                    <span className="text-success">승인됨</span>
                  ) : (
                    <span className="text-danger">미승인</span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center w-full">
        <Pagination
          total={total}
          page={page}
          onChange={handlePageChange}
          showControls
        />
      </div>
    </div>
  );
} 