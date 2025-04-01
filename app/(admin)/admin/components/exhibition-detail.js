"use client";
import React from "react";
import { Input, Button, Textarea, Checkbox, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

export function ExhibitionDetail({
  exhibition,
  onUpdate,
  selectedKeys,
  setSelectedKeys,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
  selectedExhibition,
  setSelectedExhibition,
}) {
  // 전시회 ID가 없으면 신규 등록 모드로 간주
  const isNewExhibition = !exhibition.id;
  const [isEditing, setIsEditing] = React.useState(isNewExhibition);
  const [editedExhibition, setEditedExhibition] = React.useState(exhibition);
  // 이전 전시회 ID를 저장하는 ref
  const prevExhibitionIdRef = React.useRef(exhibition.id);
  const supabase = createClient();

  useEffect(() => {
    // 전시회 데이터가 변경된 경우에만 처리
    if (prevExhibitionIdRef.current !== exhibition.id) {
      // 전시회가 변경되면 editedExhibition 상태 업데이트
      setEditedExhibition(exhibition);

      // 새 전시회이거나 다른 전시회로 전환된 경우에만 편집 모드 설정
      if (!exhibition.id) {
        setIsEditing(true); // 신규 등록 모드
      } else {
        setIsEditing(false); // 기존 전시회 조회 모드
      }

      // 이전 전시회 ID 업데이트
      prevExhibitionIdRef.current = exhibition.id;
    }
  }, [exhibition]);

  const handleSave = async () => {
    if (!editedExhibition.name) {
      addToast({
        title: "전시회 저장 중 오류 발생",
        description: "전시회 이름을 입력해주세요.",
        color: "danger",
      });
      return;
    }
    if (isNaN(Number(editedExhibition.review_average))) {
      addToast({
        title: "전시회 저장 중 오류 발생",
        description: "평점을 숫자로 입력해주세요.",
        color: "danger",
      });
      return;
    }
    if (isNaN(Number(editedExhibition.review_count))) {
      addToast({
        title: "전시회 저장 중 오류 발생",
        description: "리뷰 수를 숫자로 입력해주세요.",
        color: "danger",
      });
      return;
    }
    if (editedExhibition.naver_gallery_url==="") {
      addToast({
        title: "전시회 저장 중 오류 발생",
        description: "네이버 갤러리 URL을 입력해주세요.",
        color: "danger",
      });
    }

    try {
      if (isNewExhibition) {
        // Supabase에 새 전시회 데이터 삽입
        console.log("삽입하기");
        const { data, error } = await supabase
          .from("exhibition")
          .insert([
            {
              name: editedExhibition.name,
              contents: editedExhibition.contents,
              photo: editedExhibition.photo,
              date: editedExhibition.date,
              working_hour: editedExhibition.working_hour,
              off_date: editedExhibition.off_date,
              add_info: editedExhibition.add_info,
              homepage_url: editedExhibition.homepage_url,
              isFree: editedExhibition.isFree,
              isRecommended: editedExhibition.isRecommended,
              review_count: editedExhibition.review_count,
              review_average: editedExhibition.review_average,
              naver_gallery_url: editedExhibition.naver_gallery_url,
              price: editedExhibition.price,
            },
          ])
          .select();

        if (error) {
          throw error;
        }

        // 저장된 데이터 (ID 포함)로 전시회 정보 업데이트
        const newExhibitionWithId = data[0];
        onUpdate(newExhibitionWithId);

      } else {
        // 기존 전시회 데이터 업데이트
        console.log("업데이트하기");
        const { error } = await supabase
          .from("exhibition")
          .update({
            name: editedExhibition.name,
            contents: editedExhibition.contents,
            photo: editedExhibition.photo,
            date: editedExhibition.date,
            working_hour: editedExhibition.working_hour,
            off_date: editedExhibition.off_date,
            add_info: editedExhibition.add_info,
            homepage_url: editedExhibition.homepage_url,
            isFree: editedExhibition.isFree,
            isRecommended: editedExhibition.isRecommended,
            review_count: editedExhibition.review_count,
            review_average: editedExhibition.review_average,
            naver_gallery_url: editedExhibition.naver_gallery_url,
            price: editedExhibition.price,
          })
          .eq("id", editedExhibition.id);

        if (error) {
          throw error;
        }

        onUpdate(editedExhibition);
      }

      // 저장 후 편집 모드 종료
      setIsEditing(false);
      setEditedExhibition({
        name: "",
        contents: "",
        photo: "",
        date: "",
        working_hour: "",
        off_date: "",
        add_info: "",
        homepage_url: "",
        isFree: false,
        isRecommended: false,
        review_count: 0,
        review_average: 0,
        naver_gallery_url:"",
        price:0
      });
      // 목록 새로고침 실행
      try {
        if (onRefresh) {
          console.log("전시회 목록 새로고침 함수 호출 시도");
          onRefresh();
          console.log("전시회 목록 새로고침 함수 호출 성공");
        } else {
          console.log("전시회 목록 새로고침 함수가 전달되지 않았습니다");
        }
      } catch (refreshError) {
        console.error("전시회 목록 새로고침 중 오류 발생:", refreshError);
      }

      addToast({
        title: "전시회 저장 완료",
        description: "전시회 정보가 성공적으로 저장되었습니다.",
        color: "success",
      });
      setSelectedKeys(new Set([]));
      setRefreshToggle((refreshToggle) => refreshToggle + 1);
      setSelectedExhibition(null);
    } catch (error) {
      console.log("전시회 저장 중 오류 발생:", error);
      addToast({
        title: "전시회 저장 중 오류 발생",
        description: error.message,
        color: "danger",
      });
      setRefreshToggle((refreshToggle) => refreshToggle + 1);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("exhibition")
      .delete()
      .eq("id", editedExhibition.id);
    if (error) {
      throw error;
    }
    addToast({
      title: "전시회 삭제 완료",
      description: "전시회 정보가 성공적으로 삭제되었습니다.",
      color: "success",
    });
    setSelectedKeys(new Set([]));
    setRefreshToggle((refreshToggle) => refreshToggle + 1);
    setIsEditing(false);
    setEditedExhibition({
      name: "",
      contents: "",
      photo: "",
      date: "",
      working_hour: "",
      off_date: "",
      add_info: "",
      homepage_url: "",
      isFree: false,
      isRecommended: false,
      review_count: 0,
      review_average: 0,
      naver_gallery_url:"",
      price:0
    });
    setSelectedExhibition(null);
  };

  const handleCancel = () => {
    if (isNewExhibition) {
      // 신규 등록 취소 시 해당 데이터를 삭제하고 목록으로 돌아감
      setSelectedExhibition(null);
      setSelectedKeys(new Set([]));
    } else {
      // 기존 데이터 편집 취소 시 원래 데이터로 복원
      setEditedExhibition(exhibition);
      setIsEditing(false);
    }
  };
  

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isNewExhibition ? "전시회 신규 등록" : "전시회 상세 정보"}
        </h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button color="primary" onPress={handleSave}>
                <Icon icon="lucide:save" className="text-lg mr-1" />
                {isNewExhibition ? "등록" : "저장"}
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
                onPress={() =>{handleSave(); setIsEditing(true)}}
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
        <Input
          label="전시회 이름"
          value={editedExhibition.name}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, name: value })
          }
          isRequired={true}
        />
        <Input
          label="이미지 URL"
          value={editedExhibition.photo}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, photo: value })
          }
        />
        <Input
          label="전시 기간"
          value={editedExhibition.date}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, date: value })
          }
        />
        <Input
          label="운영 시간"
          value={editedExhibition.working_hour}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, working_hour: value })
          }
        />
        <Input
          label="휴무일"
          value={editedExhibition.off_date}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, off_date: value })
          }
        />
        <Input
          label="홈페이지 URL"
          value={editedExhibition.homepage_url}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, homepage_url: value })
          }
        />
        <Input
          label="리뷰 수"
          value={editedExhibition.review_count}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, review_count: value })
          }
        />
        <Input
          label="평균 평점"
          value={editedExhibition.review_average}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, review_average: value })
          }
        />
        <Input
          label="네이버 갤러리 URL"
          value={editedExhibition.naver_gallery_url}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, naver_gallery_url: value })
          }
          isRequired
        />
        <Input
          label="가격"
          value={editedExhibition.price}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, price: value })
          }
        />
        <Textarea
          label="전시회 내용"
          value={editedExhibition.contents}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, contents: value })
          }
          className="md:col-span-2"
        />
        <Textarea
          label="추가 정보"
          value={editedExhibition.add_info}
          onValueChange={(value) =>
            setEditedExhibition({ ...editedExhibition, add_info: value })
          }
          className="md:col-span-2"
        />

        <div className="flex flex-col gap-4 md:col-span-2 mt-2">
          <h3 className="text-md font-medium">전시회 옵션</h3>
          <div className="flex flex-col gap-3 pl-1">
            <Checkbox
              id="isFree"
              isSelected={editedExhibition.isFree||false}
              onValueChange={(value) =>
                setEditedExhibition({ ...editedExhibition, isFree: value })
              }
            >
              무료 전시회
            </Checkbox>
            <Checkbox
              id="isRecommended"
              isSelected={editedExhibition.isRecommended||false}
              onValueChange={(value) =>
                setEditedExhibition({ ...editedExhibition, isRecommended: value })
              }
            >
              추천 전시회로 표시
            </Checkbox>
          </div>
        </div>
      </div>
    </div>
  );
}
