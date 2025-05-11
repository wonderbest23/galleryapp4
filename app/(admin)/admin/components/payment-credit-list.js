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
import * as XLSX from "xlsx";

export function PaymentCreditList({
  onSelectCredit,
  selectedKeys,
  onSelectionChange,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
  selectedCredit,
  setSelectedCredit,
}) {
  const [search, setSearch] = useState("");
  const [credits, setCredits] = useState([]);
  const itemsPerPage = 10;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const supabase = createClient();
  console.log('credits', credits)
  useEffect(() => {
    console.log("PaymentCreditList: 크레딧 구매 목록 업데이트됨", credits.length, "건");
  }, [credits]);

  const GetCredits = async () => {
    const offset = (page - 1) * itemsPerPage;
    let query = supabase
      .from("payment_credit")
      .select("*, profiles(*)", { count: "exact" })
      .order("id", { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    if (search.trim()) {
      query = query.or(
        `order_id.ilike.%${search}%`,
        `payment_key.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      console.log("크레딧 데이터 조회 중 오류:", error);
    }
    setCredits(data || []);
    setTotal(Math.ceil(count / itemsPerPage));
  };

  // 외부에서 호출할 수 있는 새로고침 함수 추가
  const refreshCredits = () => {
    GetCredits();
  };

  useEffect(() => {
    GetCredits();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      onRefresh(refreshCredits);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (refreshToggle) {
      GetCredits();
    }
  }, [refreshToggle]);

  const debouncedSearch = debounce(() => {
    GetCredits();
  }, 500);

  useEffect(() => {
    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
    };
  }, [page, search]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSelectionChange = (keys) => {
    onSelectionChange(keys);
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      const credit = credits.find((a) => a.id === Number(selectedKey));
      if (credit) {
        onSelectCredit(credit);
        setSelectedCredit(credit);
      }
    } else {
      setSelectedCredit(null);
    }
  };

  const handleExcelDownload = async () => {
    try {
      setUploading(true);
      const { data, error } = await supabase
        .from("payment_credit")
        .select("*, profiles(*)")
        .order("id", { ascending: false });
        
      if (error) throw error;
      if (!data || data.length === 0) {
        addToast({
          title: "데이터 없음",
          description: "다운로드할 크레딧 구매 데이터가 없습니다.",
          color: "warning",
        });
        setUploading(false);
        return;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(
        data.map((credit) => {
          return {
            주문ID: credit.order_id || "",
            결제키: credit.payment_key || "",
            아티스트ID: credit.artist_id || "",
            아티스트명: credit.profiles?.artist_name || "",
            아티스트연락처: credit.profiles?.artist_phone || "",
            금액: credit.amount || 0,
            상태: credit.status || "",
            구매일자: credit.created_at ? new Date(credit.created_at).toLocaleString() : "",
          };
        })
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "크레딧구매내역");
      XLSX.writeFile(workbook, "payment_credit_list.xlsx");
      addToast({
        title: "엑셀 다운로드 완료",
        description: `총 ${data.length}개의 크레딧 구매 데이터가 엑셀 파일로 다운로드되었습니다.`,
        color: "success",
      });
    } catch (error) {
      console.log("엑셀 다운로드 중 오류:", error);
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
      case "success":
        return "success";
      case "failed":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <div className="space-y-4 PaymentCreditList">
      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="주문ID, 결제키, 아티스트ID 검색..."
          value={search}
          onValueChange={setSearch}
          startContent={<Icon icon="lucide:search" className="text-default-400" />}
          className="w-full"
        />
        <Button onPress={handleExcelDownload} isLoading={uploading} color="primary">
          <Icon icon="lucide:download" className="text-lg mr-1" />
          엑셀 다운로드
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          classNames={{ wrapper: "p-0" }}
          className="min-w-[900px]"
          shadow="none"
          variant="bordered"
          aria-label="크레딧 구매 목록 테이블"
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>구매일시</TableColumn>
            <TableColumn>주문ID</TableColumn>
            <TableColumn>결제키</TableColumn>
            <TableColumn>아티스트</TableColumn>
            <TableColumn>금액</TableColumn>
            <TableColumn>상태</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"크레딧 구매 데이터가 없습니다."} items={credits || []}>
            {(credit) => (
              <TableRow key={credit.id}>
                <TableCell>{credit.id}</TableCell>
                <TableCell>{credit.created_at ? new Date(credit.created_at).toLocaleString() : "-"}</TableCell>
                <TableCell>{credit.order_id || "-"}</TableCell>
                <TableCell>{credit.payment_key || "-"}</TableCell>
                <TableCell>{credit.profiles?.artist_name || credit.artist_id || "-"}</TableCell>
                <TableCell>{credit.amount ? `${credit.amount.toLocaleString()}원` : "0원"}</TableCell>
                <TableCell>{credit.status || "-"}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center w-full">
        <Pagination total={total} page={page} onChange={handlePageChange} showControls />
      </div>
    </div>
  );
} 