import React from "react";
import { Input, Button, Textarea, Checkbox } from "@heroui/react";
import { Icon } from "@iconify/react";

export function GalleryDetail({ gallery, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = React.useState(true);
  const [editedGallery, setEditedGallery] = React.useState(gallery);

  const handleSave = () => {
    onUpdate(editedGallery);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 갤러리를 삭제하시겠습니까?")) {
      onDelete();
    }
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">갤러리 상세 정보</h2>
        <div className="flex gap-2">
          <Button color="primary" onPress={handleSave}>
            <Icon icon="lucide:save" className="text-lg mr-1" />
            저장
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <Input
          label="제목"
          value={editedGallery.title}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, title: value })
          }
          isReadOnly={!isEditing}
        />
        <Input
          label="이름"
          value={editedGallery.name}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, name: value })
          }
          isReadOnly={!isEditing}
        />
        <Input
          label="URL"
          value={editedGallery.url}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, url: value })
          }
          isReadOnly={!isEditing}
        />
        <Input
          label="주소"
          value={editedGallery.address}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, address: value })
          }
          isReadOnly={!isEditing}
        />
        <Input
          label="전화번호"
          value={editedGallery.phone}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, phone: value })
          }
          isReadOnly={!isEditing}
        />
        <Input
          label="영업시간"
          value={editedGallery.workinghour}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, workinghour: value })
          }
          isReadOnly={!isEditing}
        />
        <Input
          label="썸네일"
          value={editedGallery.thumbnail}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, thumbnail: value })
          }
          isReadOnly={!isEditing}
        />

        <Input
          label="홈페이지 URL"
          value={editedGallery.homepage_url}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, homepage_url: value })
          }
          isReadOnly={!isEditing}
        />
        <Input
          label="상태"
          value={editedGallery.status === "active" ? "활성" : "대기"}
          onValueChange={(value) =>
            setEditedGallery({
              ...editedGallery,
              status: value === "활성" ? "active" : "pending",
            })
          }
          isReadOnly={!isEditing}
        />
        <Input label="등록일" value={editedGallery.createdAt} isReadOnly />
        <Textarea
          label="매장 정보"
          value={editedGallery.shop_info}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, shop_info: value })
          }
          isReadOnly={!isEditing}
          className="md:col-span-2"
        />
        <Textarea
          label="추가 정보"
          value={editedGallery.add_info}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, add_info: value })
          }
          isReadOnly={!isEditing}
          className="md:col-span-2"
        />
        <Textarea
          label="설명"
          value={editedGallery.description}
          onValueChange={(value) =>
            setEditedGallery({ ...editedGallery, description: value })
          }
          isReadOnly={!isEditing}
          className="md:col-span-2"
        />
      </div>
    </div>
  );
}
