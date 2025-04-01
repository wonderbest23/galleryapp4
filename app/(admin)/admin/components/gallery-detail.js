"use client";
import React from "react";
import { Input, Button, Textarea, Checkbox, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

export function GalleryDetail({
  gallery,
  onUpdate,
  selectedKeys,
  setSelectedKeys,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
  selectedGallery,
  setSelectedGallery,
}) {
  // 갤러리 ID가 없으면 신규 등록 모드로 간주
  const isNewGallery = !gallery.id;
  const [isEditing, setIsEditing] = React.useState(isNewGallery);
  const [editedGallery, setEditedGallery] = React.useState(gallery);
  // 이전 갤러리 ID를 저장하는 ref
  const prevGalleryIdRef = React.useRef(gallery.id);
  const supabase = createClient();

  useEffect(() => {
    // 갤러리 데이터가 변경된 경우에만 처리
    if (prevGalleryIdRef.current !== gallery.id) {
      // 갤러리가 변경되면 editedGallery 상태 업데이트
      setEditedGallery(gallery);

      // 새 갤러리이거나 다른 갤러리로 전환된 경우에만 편집 모드 설정
      if (!gallery.id) {
        setIsEditing(true); // 신규 등록 모드
      } else {
        setIsEditing(false); // 기존 갤러리 조회 모드
      }

      // 이전 갤러리 ID 업데이트
      prevGalleryIdRef.current = gallery.id;
    }
  }, [gallery]);

  const handleSave = async () => {
    if (!editedGallery.url) {
      addToast({
        title: "갤러리 저장 중 오류 발생",
        description: "URL을 입력해주세요.",
        color: "danger",
      });
      return;
    }
    if (isNaN(Number(editedGallery.visitor_rating))) {
      addToast({
        title: "갤러리 저장 중 오류 발생",
        description: "방문자 평점을 숫자로 입력해주세요.",
        color: "danger",
      });
      return;
    }
    if (isNaN(Number(editedGallery.blog_review_count))) {
      addToast({
        title: "갤러리 저장 중 오류 발생",
        description: "블로그 리뷰 수를 숫자로 입력해주세요.",
        color: "danger",
      });
    }

    try {
      if (isNewGallery) {
        // Supabase에 새 갤러리 데이터 삽입
        console.log("삽입하기기");
        const { data, error } = await supabase
          .from("gallery")
          .insert([
            {
              name: editedGallery.name,
              url: editedGallery.url,
              address: editedGallery.address,
              phone: editedGallery.phone,
              workinghour: editedGallery.workinghour,
              thumbnail: editedGallery.thumbnail,
              visitor_rating: editedGallery.visitor_rating,
              blog_review_count: editedGallery.blog_review_count,
              homepage_url: editedGallery.homepage_url,
              shop_info: editedGallery.shop_info,
              add_info: editedGallery.add_info,
              isNew: editedGallery.isNew,
              isRecommended: editedGallery.isRecommend,
              isNow: editedGallery.isNow,
            },
          ])
          .select();

        if (error) {
          throw error;
        }

        // 저장된 데이터 (ID 포함)로 갤러리 정보 업데이트
        const newGalleryWithId = data[0];
        onUpdate(newGalleryWithId);
      } else {
        // 기존 갤러리 데이터 업데이트
        console.log("업데이트하기");
        const { error } = await supabase
          .from("gallery")
          .update({
            name: editedGallery.name,
            url: editedGallery.url,
            address: editedGallery.address,
            phone: editedGallery.phone,
            workinghour: editedGallery.workinghour,
            thumbnail: editedGallery.thumbnail,
            visitor_rating: editedGallery.visitor_rating,
            blog_review_count: editedGallery.blog_review_count,
            homepage_url: editedGallery.homepage_url,
            shop_info: editedGallery.shop_info,
            add_info: editedGallery.add_info,
            isNew: editedGallery.isNew,
            isRecommended: editedGallery.isRecommend,
            isNow: editedGallery.isNow,
          })
          .eq("id", editedGallery.id);

        if (error) {
          throw error;
        }

        onUpdate(editedGallery);
      }

      // 저장 후 편집 모드 종료
      setIsEditing(false);
      setEditedGallery({
        name: "",
        url: "",
        address: "",
        phone: "",
        workinghour: "",
        thumbnail: "",
        visitor_rating: 0,
        blog_review_count: 0,
        homepage_url: "",
        shop_info: "",
        add_info: "",
        isNew: false,
        isRecommended: false,
        isNow: false,
      });
      // 목록 새로고침 실행
      try {
        if (onRefresh) {
          console.log("갤러리 목록 새로고침 함수 호출 시도");
          onRefresh();
          console.log("갤러리 목록 새로고침 함수 호출 성공");
        } else {
          console.log("갤러리 목록 새로고침 함수가 전달되지 않았습니다");
        }
      } catch (refreshError) {
        console.error("갤러리 목록 새로고침 중 오류 발생:", refreshError);
      }

      addToast({
        title: "갤러리 저장 완료",
        description: "갤러리 정보가 성공적으로 저장되었습니다.",
        color: "success",
      });
      setSelectedKeys(new Set([]));
      setRefreshToggle((refreshToggle) => refreshToggle + 1);
      setSelectedGallery(null);
    } catch (error) {
      console.log("갤러리 저장 중 오류 발생:", error);
      addToast({
        title: "갤러리 저장 중 오류 발생",
        description: error.message.includes("duplicate")
          ? "중복되는 URL이 있어 등록이 불가합니다."
          : error.message,
        color: "danger",
      });
      setRefreshToggle((refreshToggle) => refreshToggle + 1);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", editedGallery.id);
    if (error) {
      throw error;
    }
    addToast({
      title: "갤러리 삭제 완료",
      description: "갤러리 정보가 성공적으로 삭제되었습니다.",
      color: "success",
    });
    setSelectedKeys(new Set([]));
    setRefreshToggle((refreshToggle) => refreshToggle + 1);
    setIsEditing(false);
    setEditedGallery({
      name: "",
      url: "",
      address: "",
      phone: "",
      workinghour: "",
      thumbnail: "",
      visitor_rating: 0,
      blog_review_count: 0,
      homepage_url: "",
      shop_info: "",
      add_info: "",
      isNew: false,
      isRecommended: false,
      isNow: false,
    });
    setSelectedGallery(null);

  };

  const handleCancel = () => {
    if (isNewGallery) {
      // 신규 등록 취소 시 해당 데이터를 삭제하고 목록으로 돌아감
      onDelete();
    } else {
      // 기존 데이터 편집 취소 시 원래 데이터로 복원
      setEditedGallery(gallery);
      setIsEditing(false);
    }
  };
  console.log("editedGallery:", editedGallery);
  console.log("selectedKeys:", selectedKeys);

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isNewGallery ? "갤러리 신규 등록" : "갤러리 상세 정보"}
        </h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button color="primary" onPress={handleSave}>
                <Icon icon="lucide:save" className="text-lg mr-1" />
                {isNewGallery ? "등록" : "저장"}
              </Button>
              <Button variant="flat" onPress={handleCancel}>
                <Icon icon="lucide:x" className="text-lg mr-1" />
                취소
              </Button>
            </>
          ) : (
            <>
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setIsEditing(true);
                  handleSave();
                }}
              >
                <Icon icon="lucide:edit" className="text-lg mr-1" />
                수정
              </Button>
              <Button color="danger" variant="flat" onPress={handleDelete}>
                <Icon icon="lucide:trash" className="text-lg mr-1" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {!isEditing && (
          <>
            <Input
              label="아이디"
              value={editedGallery.id}
              onValueChange={(value) =>
                setEditedGallery({ ...editedGallery, id: value })
              }
            />
            <div className="flex flex-col justify-center items-center">
              <Button className="w-full h-full" color="primary" variant="solid">
                <Icon icon="lucide:user-plus" className="text-lg mr-1" />
                계정 생성하기
              </Button>
            </div>
          </>
        )}

        <Input
          label="이름"
          value={editedGallery.name}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, name: value })
          }
        />
        <Input
          label="URL"
          value={editedGallery.url}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, url: value })
          }
          isRequired
        />
        <Input
          label="주소"
          value={editedGallery.address}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, address: value })
          }
        />
        <Input
          label="전화번호"
          value={editedGallery.phone}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, phone: value })
          }
        />
        <Input
          label="영업시간"
          value={editedGallery.workinghour}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, workinghour: value })
          }
        />
        <Input
          label="썸네일"
          value={editedGallery.thumbnail}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, thumbnail: value })
          }
        />
        <Input
          label="방문자 평점"
          value={editedGallery.visitor_rating}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, visitor_rating: value })
          }
        />
        <Input
          label="블로그 리뷰 수"
          value={editedGallery.blog_review_count}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, blog_review_count: value })
          }
        />
        <Input
          label="홈페이지 URL"
          value={editedGallery.homepage_url}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, homepage_url: value })
          }
        />
        <Textarea
          label="매장 정보"
          value={editedGallery.shop_info}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, shop_info: value })
          }
          className="md:col-span-2"
        />
        <Textarea
          label="추가 정보"
          value={editedGallery.add_info}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, add_info: value })
          }
          className="md:col-span-2"
        />

        <div className="flex flex-col gap-4 md:col-span-2 mt-2">
          <h3 className="text-md font-medium">갤러리 옵션</h3>
          <div className="flex flex-col gap-3 pl-1">
            <Checkbox
              id="isNew"
              isSelected={editedGallery.isNew}
              onValueChange={(isSelected) =>
                setEditedGallery({ ...editedGallery, isNew: isSelected })
              }
              size="md"
              radius="sm"
            >
              <div className="flex items-center gap-2">

                <span>신규</span>
              </div>
            </Checkbox>
            <Checkbox
              id="isRecommended"
              isSelected={editedGallery.isRecommended || false}
              onValueChange={(isSelected) =>
                setEditedGallery({
                  ...editedGallery,
                  isRecommended: isSelected,
                })
              }
              size="md"
              radius="sm"
            >
              <div className="flex items-center gap-2">

                <span>추천</span>
              </div>
            </Checkbox>
            <Checkbox
              id="isNow"
              isSelected={editedGallery.isNow}
              onValueChange={(isSelected) =>
                setEditedGallery({ ...editedGallery, isNow: isSelected })
              }
              size="md"
              radius="sm"
            >
              <div className="flex items-center gap-2">
                
                <span>현재 진행 중</span>
              </div>
            </Checkbox>
          </div>
        </div>
      </div>
    </div>
  );
}
