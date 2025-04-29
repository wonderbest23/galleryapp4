"use client";
import React from "react";
import { Card, CardBody, Image, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function MyArtworks({ user }) {
  // 임시 데이터 - 실제로는 사용자의 작품 데이터를 가져와야 합니다
  const artworks = [
    {
      id: 1,
      title: "봄의 정원",
      image: "/noimage.jpg",
      date: "2024.03.15",
      price: "150,000원",
    },
    {
      id: 2,
      title: "해변의 노을",
      image: "/noimage.jpg",
      date: "2024.03.10",
      price: "200,000원",
    },
    {
      id: 3,
      title: "도시의 밤",
      image: "/noimage.jpg",
      date: "2024.03.05",
      price: "180,000원",
    },
    {
      id: 4,
      title: "도시의 밤",
      image: "/noimage.jpg",
      date: "2024.03.05",
      price: "180,000원",
    },
  ];
  const router = useRouter();

  return (
    <div className="grid grid-cols-4 gap-4 w-[90%]">
      {artworks.map((artwork) => (
        <Card key={artwork.id} className="col-span-1" shadow="none">
          <CardBody className="p-0">
            <Link href={`/product/${artwork.id}`}>
              <img
                src={artwork.image}
                alt={artwork.title}
                className="object-cover w-full h-full"
              />
            </Link>
          </CardBody>
        </Card>
      ))}
      <div className="col-span-4 text-center text-[12px] text-gray-500 font-bold mt-4">
        현재등록 4건 / 신규등록 가능 수 6건
      </div>
      <Button
        onPress={() => router.push("/addProduct")}
        className="col-span-4 bg-black text-white text-[16px] h-12"
      >
        신규작품 등록하기
      </Button>
      <Button
        onPress={() => router.push("/payment/process")}
        className="col-span-4 bg-[#007AFF] text-white text-[16px] h-12"
      >
        결제하기
      </Button>
    </div>
  );
}
