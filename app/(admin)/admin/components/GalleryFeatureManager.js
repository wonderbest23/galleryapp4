'use client'
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { createClient } from "@/utils/supabase/client";
import {debounce} from 'lodash'
export default function GalleryFeatureManager() {
  // 상태 관리
  const [galleries, setGalleries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const itemsPerPage = 5;

  // Supabase 클라이언트 생성
  const supabase = createClient();

  // 데이터 가져오기
  const fetchGalleries = debounce(async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;
      
      // 한 번의 쿼리로 데이터와 전체 개수를 함께 가져옵니다
      let query = supabase
        .from('gallery')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setGalleries(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.log('갤러리 데이터를 가져오는 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  // 검색어 변경 시
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색어 변경 시 첫 페이지로 이동
  };

  // 페이지 변경 시
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 추천 상태 토글
  const toggleRecommended = async (id, currentState) => {
    const updatedGalleries = galleries.map((gallery) => 
      gallery.id === id 
        ? { ...gallery, isRecommended: !currentState } 
        : gallery
    );
    setGalleries(updatedGalleries);
  };

  // 변경사항 저장
  const saveChanges = async () => {
    setIsLoading(true);
    try {
      // 추천 상태가 변경된 갤러리들에 대해 업데이트
      for (const gallery of galleries) {
        const { error } = await supabase
          .from('gallery')
          .update({ isRecommended: gallery.isRecommended })
          .eq('id', gallery.id);
        
        if (error) throw error;
      }
      setSaveMessage("변경사항이 성공적으로 저장되었습니다.");
      onOpen();
    } catch (error) {
      console.error('변경사항 저장 중 오류 발생:', error);
      setSaveMessage("변경사항 저장 중 오류가 발생했습니다.");
      onOpen();
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 초기 로드 및 검색어/페이지 변경 시 다시 로드
  useEffect(() => {
    fetchGalleries();
  }, [searchTerm, currentPage]);

  return (
    <Card
      shadow="md"
      radius="lg"
      className="max-w-full col-span-2 md:col-span-1"
    >
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-xl font-semibold">갤러리 상단 노출 관리</p>
          <p className="text-small text-default-500">
            메인 페이지에 상단 노출할 갤러리를 선택합니다
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="갤러리 검색어를 입력하세요"
          radius="sm"
          className="mb-4"
          classNames={{
            input: "text-small",
            inputWrapper: "border-1",
          }}
        />

        <Table
          aria-label="갤러리 목록"
          className="mb-4"
          shadow="none"
          classNames={{ wrapper: "p-0" }}
          isLoading={isLoading}
        >
          <TableHeader>
            <TableColumn className="w-1/10">노출</TableColumn>
            <TableColumn className="w-full">갤러리명</TableColumn>
          </TableHeader>
          <TableBody>
            {galleries.map((gallery) => (
              <TableRow key={gallery.id}>
                <TableCell>
                  <Checkbox
                    isSelected={gallery.isRecommended}
                    onValueChange={() => toggleRecommended(gallery.id, gallery.isRecommended)}
                  />
                </TableCell>
                
                <TableCell>{gallery.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-center">
          <Pagination
            total={Math.ceil(totalCount / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </div>
      </CardBody>
      <CardFooter>
        <Button
          onPress={saveChanges}
          color="primary"
          radius="sm"
          className="w-full"
          isLoading={isLoading}
        >
          갤러리 상단 노출 저장하기
        </Button>
      </CardFooter>
      
      {/* 저장 결과 알림 모달 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>알림</ModalHeader>
          <ModalBody>
            {saveMessage}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose}>
              확인
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
} 