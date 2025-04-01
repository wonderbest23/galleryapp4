"use client";

import React from "react";
import { ExhibitionList } from "../components/exhibition-list";
import { ExhibitionDetail } from "../components/exhibition-detail";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

export default function Exhibition() {
  const [selectedExhibition, setSelectedExhibition] = React.useState(null);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedKey, setSelectedKey] = React.useState(new Set([]));

  const handleNewExhibition = () => {
    setSelectedExhibition(null);
    setIsCreatingNew(true);
    setIsEditMode(false);
    setSelectedKey(new Set([]));
  };

  const handleCancel = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
    } else if (isEditMode) {
      setIsEditMode(false);
    }
  };

  const handleSaveNew = (newExhibition) => {
    // 여기에 신규 전시 저장 로직 추가
    // 저장 후 리스트 새로고침 및 상태 업데이트
    setIsCreatingNew(false);
    setSelectedExhibition(newExhibition);
    setSelectedKey(new Set([newExhibition.id.toString()]));
  };

  const handleSelectExhibition = (exhibition) => {
    // 이미 신규 생성 모드였다면 취소
    if (isCreatingNew) {
      setIsCreatingNew(false);
    }
    
    // 수정 모드도 초기화
    setIsEditMode(false);
    
    // 선택된 전시 설정
    setSelectedExhibition(exhibition);
    setSelectedKey(new Set([exhibition.id.toString()]));
  };

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleUpdate = (updatedExhibition) => {
    // 전시 정보 업데이트 로직
    setSelectedExhibition(updatedExhibition);
    setIsEditMode(false);
  };

  const handleDelete = () => {
    // 전시 삭제 로직
    setSelectedExhibition(null);
    setIsEditMode(false);
    setSelectedKey(new Set([]));
  };

  // selectedKey 변경 핸들러 (ExhibitionList에서 직접 호출됨)
  const handleKeyChange = (keys) => {
    setSelectedKey(keys);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">전시 관리</h1>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleNewExhibition}
            className="bg-primary text-white"
            disabled={isCreatingNew}
          >
            <Icon icon="lucide:plus" className="text-lg mr-1" />
            신규 전시 등록
          </Button>
        </div>
        {/* Exhibition List Section */}
        <section className="rounded-lg">
          <ExhibitionList 
            onSelectExhibition={handleSelectExhibition} 
            selectedKey={selectedKey}
            onSelectedKeyChange={handleKeyChange}
          />
        </section>

        {/* Exhibition Detail Section */}
        <section className="bg-content2 rounded-lg p-4">
          {isCreatingNew ? (
            <ExhibitionDetail
              isNew={true}
              onSave={handleSaveNew}
              onCancel={handleCancel}
              selectedKey={selectedKey}
            />
          ) : selectedExhibition ? (
            isEditMode ? (
              <ExhibitionDetail
                exhibition={selectedExhibition}
                isEdit={true}
                onSave={handleUpdate}
                onCancel={handleCancel}
                selectedKey={selectedKey}
              />
            ) : (
              <div>
                <div className="flex justify-end space-x-2 mb-4">
                  <Button 
                    onClick={handleEditMode}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Icon icon="lucide:edit" className="text-lg mr-1" />
                    수정
                  </Button>
                  <Button 
                    onClick={handleDelete}
                    variant="destructive"
                    className="flex items-center"
                  >
                    <Icon icon="lucide:trash" className="text-lg mr-1" />
                    삭제
                  </Button>
                </div>
                <ExhibitionDetail
                  exhibition={selectedExhibition}
                  isReadOnly={true}
                  selectedKey={selectedKey}
                />
              </div>
            )
          ) : (
            <div className="text-center text-default-500 py-8">
              전시회를 선택하거나 신규 등록 버튼을 클릭하세요.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
