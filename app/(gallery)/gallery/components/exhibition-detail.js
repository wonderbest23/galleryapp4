import React from "react";
import { Input, Button, Textarea, Select, SelectItem, DatePicker } from "@heroui/react";
import { Icon } from "@iconify/react";

export function ExhibitionDetail({ 
  exhibition, 
  onUpdate, 
  onDelete, 
  isNew = false, 
  onSave, 
  onCancel, 
  isReadOnly = false, 
  isEdit = false,
  selectedKey
}) {
  const [isEditing, setIsEditing] = React.useState(isNew || isEdit);
  const emptyExhibition = {
    id: null,
    title: "",
    description: "",
    location: "",
    artist: "",
    status: "pending",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    thumbnail: "",
    ticketPrice: 0,
    visitorCount: 0,
  };
  
  const [editedExhibition, setEditedExhibition] = React.useState(isNew ? emptyExhibition : exhibition);
  const [imagePreview, setImagePreview] = React.useState(isNew ? null : exhibition?.thumbnail || null);

  // selectedKey가 변경될 때 필요한 데이터 로드
  React.useEffect(() => {
    if (exhibition && !isNew) {
      setEditedExhibition(exhibition);
      setImagePreview(exhibition.thumbnail || null);
    }
  }, [selectedKey, exhibition, isNew]);

  const handleSave = () => {
    if (isNew) {
      // 신규 전시회 저장
      if (onSave) {
        const newExhibition = {
          ...editedExhibition,
          id: Date.now(), // 임시 ID 생성
        };
        onSave(newExhibition);
      }
    } else {
      // 기존 전시회 업데이트
      const savedExhibition = {
        ...editedExhibition,
      };
      onUpdate(savedExhibition);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      if (onCancel) onCancel();
    } else {
      setEditedExhibition(exhibition);
      setImagePreview(exhibition.thumbnail || null);
      setIsEditing(false);
      if (onCancel) onCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 전시회를 삭제하시겠습니까?")) {
      onDelete();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditedExhibition({
          ...editedExhibition,
          thumbnail: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isNew ? "신규 전시회 등록" : isEditing ? "전시회 정보 수정" : "전시회 상세 정보"}
        </h2>
        {!isReadOnly && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button color="primary" onPress={handleSave}>
                  <Icon icon="lucide:save" className="text-lg mr-1" />
                  {isNew ? "추가" : "저장"}
                </Button>
                <Button color="default" variant="flat" onPress={handleCancel}>
                  취소
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="전시회 제목"
          value={editedExhibition.title}
          onValueChange={(value) => setEditedExhibition({...editedExhibition, title: value})}
          isReadOnly={!isEditing}
          className="md:col-span-2"
        />

        <Input
          label="전시 장소"
          value={editedExhibition.location}
          onValueChange={(value) => setEditedExhibition({...editedExhibition, location: value})}
          isReadOnly={!isEditing}
        />

        <Input
          label="작가"
          value={editedExhibition.artist}
          onValueChange={(value) => setEditedExhibition({...editedExhibition, artist: value})}
          isReadOnly={!isEditing}
        />

        <Input
          type="date"
          label="시작일"
          value={editedExhibition.startDate}
          onChange={(e) => setEditedExhibition({...editedExhibition, startDate: e.target.value})}
          isReadOnly={!isEditing}
        />

        <Input
          type="date"
          label="종료일"
          value={editedExhibition.endDate}
          onChange={(e) => setEditedExhibition({...editedExhibition, endDate: e.target.value})}
          isReadOnly={!isEditing}
        />

        <Input
          type="number"
          label="입장료 (원)"
          value={editedExhibition.ticketPrice}
          onValueChange={(value) => setEditedExhibition({...editedExhibition, ticketPrice: value})}
          isReadOnly={!isEditing}
        />

        <Select
          label="상태"
          selectedKeys={[editedExhibition.status]}
          onChange={(e) => setEditedExhibition({...editedExhibition, status: e.target.value})}
          isDisabled={!isEditing}
        >
          <SelectItem key="pending" value="pending">준비중</SelectItem>
          <SelectItem key="active" value="active">진행중</SelectItem>
          <SelectItem key="ended" value="ended">종료됨</SelectItem>
        </Select>

        <div className="space-y-2 md:col-span-2">
          <label className="text-small font-medium">썸네일 이미지</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
            {imagePreview ? (
              <div className="relative w-full">
                <img 
                  src={imagePreview} 
                  alt="썸네일 미리보기" 
                  className="w-full h-48 object-cover rounded-md"
                />
                {isEditing && (
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    size="sm"
                    className="absolute top-2 right-2"
                    onPress={() => {
                      setImagePreview(null);
                      setEditedExhibition({...editedExhibition, thumbnail: ""});
                    }}
                  >
                    <Icon icon="lucide:x" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Icon icon="lucide:image" className="text-4xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">이미지 미리보기</p>
              </>
            )}
            {isEditing && (
              <div className="mt-4 ">
                <input
                  type="file"
                  id="thumbnail-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="thumbnail-upload">
                  <Button as="span" color="primary" variant="flat" size="sm">
                    <Icon icon="lucide:upload" className="mr-1" />
                    이미지 {imagePreview ? '변경' : '업로드'}
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>

        <Textarea
          label="전시회 설명"
          value={editedExhibition.description}
          onValueChange={(value) => setEditedExhibition({...editedExhibition, description: value})}
          isReadOnly={!isEditing}
          className="md:col-span-2"
        />
      </div>

      {!isNew && !isEditing && (
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-medium mb-2">방문 통계</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-default-100 p-4 rounded-lg">
              <p className="text-sm text-default-600">총 방문자 수</p>
              <p className="text-2xl font-bold">{editedExhibition.visitorCount.toLocaleString()}명</p>
            </div>
            <div className="bg-default-100 p-4 rounded-lg">
              <p className="text-sm text-default-600">일일 평균 방문자</p>
              <p className="text-2xl font-bold">
                {Math.round(editedExhibition.visitorCount / 30).toLocaleString()}명
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
