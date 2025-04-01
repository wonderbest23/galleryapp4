import React from "react";
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
} from "@heroui/react";
import { Icon } from "@iconify/react";

export function GalleryList({ onSelectGallery }) {
  const [search, setSearch] = React.useState("");

  // 샘플 데이터
  const galleries = [
    {
      id: 1,
      title: "봄 풍경 갤러리",
      description: "2024 봄 시즌 작품",
      author: "김작가",
      status: "active",
      createdAt: "2024-03-15",
    },
    {
      id: 2,
      title: "현대 미술전",
      description: "현대 미술 특별전",
      author: "이큐레이터",
      status: "pending",
      createdAt: "2024-03-14",
    },
    {
      id: 3,
      title: "자연 다큐멘터리",
      description: "자연 다큐멘터리 사진전",
      author: "박사진",
      status: "active",
      createdAt: "2024-03-13",
    },
  ];

  const filteredGalleries = galleries.filter(
    (gallery) =>
      gallery.title.toLowerCase().includes(search.toLowerCase()) ||
      gallery.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center justify-end gap-4">
        <Button className="text-white col-span-4 md:col-span-1" color="primary" variant="solid">
          <Icon icon="lucide:upload" className="mr-1" />갤러리 엑셀 업로드
        </Button>
        <Button className="text-white col-span-4 md:col-span-1" color="primary" variant="solid">
          <Icon icon="lucide:upload" className="mr-1" />전시회 엑셀 업로드
        </Button>
        <Button className="text-white col-span-4 md:col-span-1" color="primary" variant="solid">
          <Icon icon="lucide:download" className="mr-1" />갤러리 엑셀 다운로드
        </Button>
        <Button className="text-white col-span-4 md:col-span-1" color="primary" variant="solid">
          <Icon icon="lucide:plus" className="mr-1" />갤러리 신규 등록
        </Button>
      </div>
      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="갤러리 검색..."
          value={search}
          onValueChange={setSearch}
          startContent={
            <Icon icon="lucide:search" className="text-default-400" />
          }
          className="w-full"
        />
      </div>

      <Table
        classNames={{ wrapper: "p-0" }}
        shadow="none"
        variant="bordered"
        aria-label="갤러리 목록"
        selectionMode="single"
        onRowAction={(key) => {
          const gallery = galleries.find((g) => g.id === Number(key));
          if (gallery) onSelectGallery(gallery);
        }}
      >
        <TableHeader>
          <TableColumn>제목</TableColumn>
          <TableColumn>작성자</TableColumn>
          <TableColumn>상태</TableColumn>
          <TableColumn>등록일</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredGalleries.map((gallery) => (
            <TableRow key={gallery.id}>
              <TableCell>{gallery.title}</TableCell>
              <TableCell>{gallery.author}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    gallery.status === "active"
                      ? "bg-success-100 text-success-600"
                      : "bg-warning-100 text-warning-600"
                  }`}
                >
                  {gallery.status === "active" ? "활성" : "대기"}
                </span>
              </TableCell>
              <TableCell>{gallery.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center w-full">
        <Pagination total={10} initialPage={1} />
      </div>
    </div>
  );
}
