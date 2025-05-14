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
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { debounce } from "lodash";
import Link from "next/link";
import * as XLSX from 'xlsx';

export function ProductList({
  onSelectProduct,
  selectedKeys,
  onSelectionChange,
  onCreateProduct,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
}) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const itemsPerPage = 10;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressStatus, setProgressStatus] = useState(""); // 'processing', 'success', 'failed'
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const GetProducts = async () => {
    const offset = (page - 1) * itemsPerPage;
    console.log("GetProducts 함수 호출됨 - 페이지:", page, "검색어:", search);

    let query = supabase
      .from("product")
      .select("*, profiles(full_name, artist_name)", {
        count: "exact",
      })
      .order("id", { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    // search 값이 있을 경우 필터 추가
    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search}%,make_material.ilike.%${search}%,genre.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.log("상품 데이터 조회 중 오류:", error);
    }
    console.log(
      "상품 데이터 조회 결과:",
      data?.length,
      "건, 총:",
      count,
      "건"
    );
    setProducts(data || []);
    setTotalCount(count || 0);
    setTotal(Math.ceil((count || 0) / itemsPerPage));
  };

  // 외부에서 호출할 수 있는 새로고침 함수 추가
  const refreshProducts = () => {
    console.log("refreshProducts 함수 호출됨 - 상품 목록 새로고침");
    GetProducts();
  };

  // onRefresh props가 존재하면 refreshProducts 함수 전달
  useEffect(() => {
    if (onRefresh) {
      console.log("ProductList: onRefresh 함수에 refreshProducts 함수 전달");
      onRefresh(refreshProducts);
    }
  }, [onRefresh]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    console.log("ProductList: 컴포넌트 마운트 - 초기 상품 목록 로드");
    GetProducts();
  }, []);

  useEffect(() => {
    if (refreshToggle) {
      console.log(
        "ProductList: refreshToggle 변경 감지 - 상품 목록 새로고침"
      );
      GetProducts();
    }
  }, [refreshToggle]);

  // debounce 적용한 검색 함수
  const debouncedSearch = debounce(() => {
    GetProducts();
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

  // 상품 선택 처리
  const handleSelectionChange = (keys) => {
    onSelectionChange(keys);
    const selectedKey = Array.from(keys)[0];

    if (selectedKey) {
      const product = products.find((g) => g.id === Number(selectedKey));
      if (product) onSelectProduct(product);
    }
  };

  // 엑셀 파일 다운로드 처리 함수
  const handleExcelDownload = async () => {
    try {
      setUploading(true); // 로딩 상태 활성화
      
      // 모든 상품 데이터 가져오기
      const { data, error } = await supabase
        .from("product")
        .select("*, profiles(full_name, artist_name)")
        .order("id", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // 엑셀 워크시트용 데이터 가공
        const processedData = data.map(item => {
          // artist_name이 있으면 사용하고, 없으면 full_name 사용
          const artistName = item.profiles ? 
            (item.profiles.artist_name || item.profiles.full_name || "미상") : "미상";
          
          // 이미지 배열을 문자열로 변환
          const imageUrls = Array.isArray(item.image) ? item.image.join(", ") : "";
          
          return {
            ID: item.id,
            "작품명": item.name,
            "가격": item.price,
            "크기": item.size,
            "아티스트": artistName,
            "제작방법": item.make_method,
            "재료": item.make_material,
            "프레임": item.make_frame,
            "제작일": item.make_date,
            "장르": item.genre,
            "추천작품": item.isRecommended ? "O" : "X",
            "이번주 작품": item.isTopOfWeek ? "O" : "X",
            "이미지URL": imageUrls,
            "등록일": new Date(item.created_at).toLocaleDateString()
          };
        });
        
        // 엑셀 워크시트 생성
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        
        // 열 너비 설정
        const columnWidths = [
          { wch: 10 }, // ID
          { wch: 30 }, // 작품명
          { wch: 15 }, // 가격
          { wch: 15 }, // 크기
          { wch: 20 }, // 아티스트
          { wch: 20 }, // 제작방법
          { wch: 20 }, // 재료
          { wch: 20 }, // 프레임
          { wch: 15 }, // 제작일
          { wch: 15 }, // 장르
          { wch: 10 }, // 추천작품
          { wch: 10 }, // 이번주 작품
          { wch: 50 }, // 이미지URL
          { wch: 15 }, // 등록일
        ];
        
        worksheet['!cols'] = columnWidths;
        
        // 엑셀 워크북 생성
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "상품목록");
        
        // 엑셀 파일 다운로드
        XLSX.writeFile(workbook, `상품목록_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        addToast({
          title: "엑셀 다운로드 완료",
          description: `총 ${data.length}개의 상품 정보가 다운로드되었습니다.`,
          color: "success",
        });
      } else {
        addToast({
          title: "다운로드 실패",
          description: "다운로드할 상품 정보가 없습니다.",
          color: "warning",
        });
      }
    } catch (error) {
      console.error("엑셀 다운로드 중 오류 발생:", error);
      addToast({
        title: "다운로드 오류",
        description: `엑셀 다운로드 중 오류가 발생했습니다: ${error.message}`,
        color: "danger",
      });
    } finally {
      setUploading(false);
    }
  };

  const getProgressColor = () => {
    switch (progressStatus) {
      case "completed":
        return "success";
      case "failed":
        return "danger";
      default:
        return "primary";
    }
  };

  // 테이블에 표시할 열 정의
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "작품명" },
    { key: "price", label: "가격" },
    { key: "artist", label: "아티스트" },
    { key: "size", label: "크기" },
    { key: "genre", label: "장르" },
    { key: "isRecommended", label: "추천 작품" },
    { key: "isTopOfWeek", label: "이번주 작품" },
  ];

  // 페이지네이션 렌더링 함수
  const renderPagination = () => {
    if (total <= 0) return null;

    const startItem = (page - 1) * itemsPerPage + 1;
    const endItem = Math.min(page * itemsPerPage, totalCount);

    return (
      <div className="flex flex-col gap-2 items-center my-4">
        <Pagination
          total={total}
          initialPage={1}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showControls
          showShadow
          size="lg"
          radius="full"
          classNames={{
            base: "gap-2",
            item: "bg-white data-[hover=true]:bg-primary/10",
            cursor: "bg-primary text-white font-bold",
          }}
          variant="bordered"
          boundaries={1}
          siblings={1}
          dotsJump={5}
          getItemAriaLabel={(page) => {
            if (page === "prev") return "이전 페이지로 이동";
            if (page === "next") return "다음 페이지로 이동";
            if (page === "dots") return "더 많은 페이지로 이동";
            return `${page} 페이지로 이동`;
          }}
        />
        <div className="text-center text-sm text-default-500">
          총 {totalCount}개의 상품 중 {startItem} - {endItem}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 검색 및 버튼 영역 */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="w-full">
          <Input
            placeholder="작품명, 재료, 장르 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={
              <Icon
                icon="heroicons:magnifying-glass"
                className="text-2xl text-default-400 pointer-events-none flex-shrink-0"
              />
            }
          />
        </div>
        
      </div>

      {/* 업로드 진행상황 표시 */}
      {progressVisible && (
        <div className="mt-4">
          <Progress
            value={uploadProgress}
            color={getProgressColor()}
            aria-label="업로드 진행상황"
            className="max-w-full"
            label={
              progressStatus === "completed"
                ? "업로드 완료"
                : progressStatus === "failed"
                ? "업로드 실패"
                : "업로드 중..."
            }
          />
        </div>
      )}

      {/* 상품 목록 테이블 */}
      <Table
        shadow='none'
        classNames={{
          wrapper: 'p-0',
        }}
        aria-label="상품 목록 테이블"
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        isHeaderSticky
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={products}
          emptyContent={"상품 정보가 없습니다."}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.price?.toLocaleString()}원</TableCell>
              <TableCell>
                {item.profiles ? 
                  (item.profiles.artist_name || item.profiles.full_name || "미상")
                  : "미상"}
              </TableCell>
              <TableCell>{item.size}</TableCell>
              <TableCell>{item.genre !== 'null' ? item.genre : '-'}</TableCell>
              <TableCell>
                {item.isRecommended ? (
                  <Icon icon="heroicons:check-circle" className="text-success" />
                ) : (
                  <Icon icon="heroicons:x-circle" className="text-danger" />
                )}
              </TableCell>
              <TableCell>
                {item.isTopOfWeek ? (
                  <Icon icon="heroicons:check-circle" className="text-success" />
                ) : (
                  <Icon icon="heroicons:x-circle" className="text-danger" />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 페이지네이션 */}
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