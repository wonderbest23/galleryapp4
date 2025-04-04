import React, { useState, useEffect } from "react";
import { Input, Button, Textarea, Checkbox, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";

export function GalleryDetail({ galleryId }) {
  const [gallery, setGallery] = useState(null);
  const [editedGallery, setEditedGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Supabase 클라이언트 생성
  const supabase = createClient();
  
  // 현재 로그인한 사용자 정보 가져오기
  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
      return user;
    } catch (error) {
      console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      return null;
    }
  };
  
  // 갤러리 데이터 불러오기
  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      // 먼저 사용자 정보 가져오기
      const currentUser = await getUser();
      
      if (!currentUser) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }
      
      // 사용자의 account_id와 일치하는 갤러리 찾기
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('account_id', currentUser.id)
        .single();
      
      if (error) throw error;
      
      setGallery(data);
      setEditedGallery(data);
    } catch (error) {
      console.error('갤러리 데이터를 불러오는 중 오류 발생:', error);
      setSaveMessage("갤러리 데이터를 불러오는 중 오류가 발생했습니다.");
      onOpen();
    } finally {
      setIsLoading(false);
    }
  };
  console.log('gallery:',gallery);
  
  // 초기 데이터 로드
  useEffect(() => {
    fetchGallery();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('gallery')
        .update(editedGallery)
        .eq('id', editedGallery.id);
      
      if (error) throw error;
      
      setGallery(editedGallery);
      setSaveMessage("갤러리 정보가 성공적으로 저장되었습니다.");
      onOpen();
    } catch (error) {
      console.error('갤러리 정보 저장 중 오류 발생:', error);
      setSaveMessage("갤러리 정보 저장 중 오류가 발생했습니다.");
      onOpen();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 갤러리를 삭제하시겠습니까?")) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('gallery')
          .delete()
          .eq('id', gallery.id);
        
        if (error) throw error;
        
        setSaveMessage("갤러리가 성공적으로 삭제되었습니다.");
        onOpen();
      } catch (error) {
        console.error('갤러리 삭제 중 오류 발생:', error);
        setSaveMessage("갤러리 삭제 중 오류가 발생했습니다.");
        onOpen();
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  if (isLoading && !gallery) {
    return <div className="flex justify-center items-center h-40">데이터를 불러오는 중...</div>;
  }
  
  if (!gallery) {
    return <div className="flex justify-center items-center h-40">갤러리 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 justify-end w-full">
          <Button color="primary" onPress={handleSave} isLoading={isLoading}>
            <Icon icon="lucide:save" className="text-lg mr-1" />
            저장
          </Button>
          
          {/* <Button color="danger" onPress={handleDelete} isLoading={isLoading}>
            <Icon icon="lucide:trash" className="text-lg mr-1" />
            삭제
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="갤러리 이름"
          value={editedGallery.name}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, name: value })
          }
          placeholder="갤러리의 공식 이름을 입력하세요"
          className="w-full"
        />
        <Input
          label="갤러리 URL"
          value={editedGallery.url}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, url: value })
          }
          placeholder="URL 경로를 입력하세요 (영문, 숫자, 하이픈만 사용)"
          className="w-full"
          isDisabled
        />
        <Input
          label="주소"
          value={editedGallery.address}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, address: value })
          }
          placeholder="갤러리의 실제 주소를 입력하세요"
          className="w-full"
        />
        <Input
          label="전화번호"
          value={editedGallery.phone}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, phone: value })
          }
          placeholder="연락 가능한 전화번호를 입력하세요"
          className="w-full"
        />
        <Input
          label="영업시간"
          value={editedGallery.workinghour}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, workinghour: value })
          }
          placeholder="예: 10:00 - 18:00 (월-금)"
          className="w-full"
        />
        <Input
          label="대표 이미지 URL"
          value={editedGallery.thumbnail}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, thumbnail: value })
          }
          placeholder="대표 이미지의 URL을 입력하세요"
          className="w-full"
        />

        <Input
          label="홈페이지 URL"
          value={editedGallery.homepage_url}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, homepage_url: value })
          }
          placeholder="갤러리 공식 웹사이트 URL을 입력하세요"
          className="w-full"
        />

        <Textarea
          label="갤러리 소개"
          value={editedGallery.shop_info}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, shop_info: value })
          }
          placeholder="갤러리에 대한 소개 정보를 입력하세요"
          className="md:col-span-2"
        />
        <Textarea
          label="추가 정보"
          value={editedGallery.add_info}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, add_info: value })
          }
          placeholder="방문객들에게 알리고 싶은 추가 정보를 입력하세요"
          className="md:col-span-2"
        />
        <Textarea
          label="갤러리 설명"
          value={editedGallery.description}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, description: value })
          }
          placeholder="갤러리에 대한 상세 설명을 입력하세요"
          className="md:col-span-2"
        />
      </div>

      <div className="flex justify-end mt-4">
        <p className="text-sm text-gray-500 italic">
          수정 후 저장 버튼을 클릭하세요
        </p>
      </div>
      
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
    </div>
  );
}
