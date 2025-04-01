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

export function ExhibitionList({ onSelectExhibition, selectedKey, onSelectedKeyChange }) {
  const [search, setSearch] = React.useState("");
  const [lastSelectedExhibition, setLastSelectedExhibition] = React.useState(null);

  // 샘플 데이터
  const exhibitions = [
    {
      id: 1,
      title: "현대미술의 혁신가들",
      location: "서울시립미술관",
      artist: "다양한 작가",
      status: "active",
      startDate: "2024-04-01",
      endDate: "2024-05-30",
      thumbnail: "/images/exhibition/modern-art.jpg",
      visitorCount: 1845,
    },
    {
      id: 2,
      title: "자연의 울림: 환경과 예술",
      location: "국립현대미술관",
      artist: "김자연, 이환경 외 3명",
      status: "active",
      startDate: "2024-03-15",
      endDate: "2024-06-15",
      thumbnail: "/images/exhibition/nature-art.jpg",
      visitorCount: 2241,
    },
    {
      id: 3,
      title: "디지털 시대의 예술",
      location: "디지털미디어시티",
      artist: "박디지털, 최테크 외 5명",
      status: "pending",
      startDate: "2024-05-10",
      endDate: "2024-07-20",
      thumbnail: "/images/exhibition/digital-art.jpg",
      visitorCount: 0,
    },
  ];

  const filteredExhibitions = exhibitions.filter(
    (exhibition) =>
      exhibition.title.toLowerCase().includes(search.toLowerCase()) ||
      exhibition.artist.toLowerCase().includes(search.toLowerCase()) ||
      exhibition.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectionChange = (keys) => {
    if (onSelectedKeyChange) {
      onSelectedKeyChange(keys);
    }
    
    if (keys.size > 0) {
      const selectedId = Number(Array.from(keys)[0]);
      const exhibition = exhibitions.find((e) => e.id === selectedId);
      
      if (exhibition) {
        const updatedExhibition = { ...exhibition };
        setLastSelectedExhibition(updatedExhibition);
        onSelectExhibition(updatedExhibition);
      }
    }
  };

  React.useEffect(() => {
    if (selectedKey && selectedKey.size > 0) {
      const selectedId = Number(Array.from(selectedKey)[0]);
      const exhibition = exhibitions.find((e) => e.id === selectedId);
      
      if (exhibition && !lastSelectedExhibition) {
        setLastSelectedExhibition(exhibition);
      }
    }
  }, [selectedKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 w-full">
        <Input
          placeholder="전시회 검색..."
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
        aria-label="전시회 목록"
        selectionMode="single"
        disabledKeys={[]}
        selectedKeys={selectedKey}
        onSelectionChange={handleSelectionChange}
      >
        <TableHeader>
          <TableColumn>제목</TableColumn>
          <TableColumn>장소</TableColumn>
          <TableColumn>작가</TableColumn>
          <TableColumn>기간</TableColumn>
          <TableColumn>상태</TableColumn>
          <TableColumn>방문자 수</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredExhibitions.map((exhibition) => (
            <TableRow key={exhibition.id}>
              <TableCell>{exhibition.title}</TableCell>
              <TableCell>{exhibition.location}</TableCell>
              <TableCell>{exhibition.artist}</TableCell>
              <TableCell>
                {exhibition.startDate} ~ {exhibition.endDate}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    exhibition.status === "active"
                      ? "bg-success-100 text-success-600"
                      : "bg-warning-100 text-warning-600"
                  }`}
                >
                  {exhibition.status === "active" ? "진행중" : "준비중"}
                </span>
              </TableCell>
              <TableCell>{exhibition.visitorCount.toLocaleString()}</TableCell>
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
