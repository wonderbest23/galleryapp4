import React, { useState } from "react";
import { Button, Card, CardBody, CardFooter } from "@heroui/react";
export default function TopArts() {
  const [categories, setCategories] = useState([
    { id: 1, name: "추천상품", selected: true },
    { id: 2, name: "현대미술", selected: false },
    { id: 3, name: "추상화", selected: false },
    { id: 4, name: "명화/동양화", selected: false },
    { id: 5, name: "사진/일러스트", selected: false },
    { id: 6, name: "기타", selected: false },
  ]);

  const artItems = [
    {
      id: 1,
      image: "/noimage.jpg",
      title: "꽃이 있는 풍경",
      artist: "김예술",
      price: "₩250,000",
    },
    {
      id: 2,
      image: "/noimage.jpg",
      title: "바다의 소리",
      artist: "이창작",
      price: "₩180,000",
    },
    {
      id: 3,
      image: "/noimage.jpg",
      title: "가을 숲",
      artist: "박작가",
      price: "₩320,000",
    },
    {
      id: 4,
      image: "/noimage.jpg",
      title: "도시의 야경",
      artist: "정아트",
      price: "₩210,000",
    },
  ];

  const handleCategoryClick = (clickedId) => {
    setCategories(
      categories.map((category) => ({
        ...category,
        selected: category.id === clickedId,
      }))
    );
  };

  return (
    <div className="flex flex-col justify-center items-center w-[90%] h-full ">
      <div className="w-full h-full py-1 flex flex-wrap gap-y-2 gap-x-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={category.selected ? "default" : "outline"}
            className={`h-8 rounded-full px-3 py-[9px] whitespace-nowrap text-[13px] font-normal ${
              category.selected
                ? "bg-[#0042e0] text-white shadow-[0px_0px_8px_#6aa3a61a]"
                : "bg-[#f1f5f5] text-[#0a2533]"
            }`}
            style={{ fontFamily: "'Noto Sans KR-Regular', Helvetica" }}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <div className="w-full grid grid-cols-2 gap-6 mt-1 justify-items-center">
        {artItems.map((item) => (
          <Card key={item.id} className="rounded-lg overflow-hidden shadow-sm w-full">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full w-full aspect-[157/200] object-cover rounded-lg"
            />
            <CardBody className="p-0 mt-2">
              <p className="text-[14px] font-medium line-clamp-1 text-[#606060]">{item.title}</p>
              <p className="text-[10px] text-[#606060]">{item.artist}</p>
              <p className="text-[14px] text-black font-bold mt-1">{item.price}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
