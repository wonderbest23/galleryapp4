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

export function MagazineList({ onSelectMagazine, selectedKeys = new Set([]) }) {
  const [search, setSearch] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [currentSelectedKeys, setSelectedKeys] = React.useState(selectedKeys);

  // 샘플 데이터
  const magazines = [
    {
      id: 1,
      title: "미술계 소식: 2024년 봄 전시회 특집",
      summary: "2024년 봄에 개최되는 주요 전시회와 아트 이벤트 소개",
      author: "김예술",
      status: "active",
      createdAt: "2024-03-15",
      thumbnail: "/images/magazine/spring-exhibition.jpg",
      viewCount: 1245,
    },
    {
      id: 2,
      title: "작가 인터뷰: 현대 미술의 선두주자",
      summary: "신진 작가들과의 인터뷰를 통해 본 현대 미술의 동향",
      author: "이비평",
      status: "active",
      createdAt: "2024-03-10",
      thumbnail: "/images/magazine/artist-interview.jpg",
      viewCount: 983,
    },
    {
      id: 3,
      title: "갤러리 투어: 서울의 숨겨진 갤러리",
      summary: "서울 곳곳에 위치한 소규모 갤러리들을 소개합니다",
      author: "박큐레이터",
      status: "pending",
      createdAt: "2024-03-05",
      thumbnail: "/images/magazine/gallery-tour.jpg",
      viewCount: 567,
    },
  ];

  const filteredMagazines = magazines.filter(
    (magazine) =>
      magazine.title.toLowerCase().includes(search.toLowerCase()) ||
      magazine.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 items-center justify-end gap-4">
        <Button
          className="text-white col-span-4 md:col-span-1 md:col-start-4"
          color="primary"
          variant="solid"
          onPress={() =>
            onSelectMagazine({
              id: null,
              title: "",
              content: "",
              summary: "",
              author: "",
              status: "pending",
              createdAt: new Date().toISOString().split("T")[0],
              thumbnail: "",
              viewCount: 0,
            })
          }
        >
          <Icon icon="lucide:plus" className="mr-1" />새 소식 등록
        </Button>
      </div>
      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="소식 검색..."
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
        aria-label="소식 목록"
        selectionMode="single"
        selectedKeys={currentSelectedKeys}
        onSelectionChange={setSelectedKeys}
        onRowAction={(key) => {
          const magazine = magazines.find((m) => m.id === Number(key));
          if (magazine) onSelectMagazine(magazine);
        }}
      >
        <TableHeader>
          <TableColumn>제목</TableColumn>
          <TableColumn>작성자</TableColumn>
          <TableColumn>상태</TableColumn>
          <TableColumn>등록일</TableColumn>
          <TableColumn>조회수</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredMagazines.map((magazine) => (
            <TableRow key={magazine.id}>
              <TableCell>{magazine.title}</TableCell>
              <TableCell>{magazine.author}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    magazine.status === "active"
                      ? "bg-success-100 text-success-600"
                      : "bg-warning-100 text-warning-600"
                  }`}
                >
                  {magazine.status === "active" ? "게시" : "대기"}
                </span>
              </TableCell>
              <TableCell>{magazine.createdAt}</TableCell>
              <TableCell>{magazine.viewCount.toLocaleString()}</TableCell>
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
