"use client";
import React from "react";
import { Tabs, Tab, Button, Select, SelectItem } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Card, CardBody, Divider, Image } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";

export default function MagazineList() {
  const router = useRouter();

  const items = [
    {
      id: 1,
      title: "미술에술점",
      description: "제목을 입력해주세요.",
      date: "2025년 3월 1일",
      image: "https://picsum.photos/200/200?random=1",
    },
    {
      id: 2,
      title: "미술에술점",
      description: "제목을 입력해주세요.",
      date: "2025년 3월 1일",
      image: "https://picsum.photos/200/200?random=2",
    },
    {
      id: 3,
      title: "미술에술점",
      description: "제목을 입력해주세요.",
      date: "2025년 3월 1일",
      image: "https://picsum.photos/200/200?random=3",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white flex items-center w-[90vw] justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <FaChevronLeft className="text-xl" />
        </Button>
        <h2 className="text-lg font-bold text-center flex-grow">매거진</h2>
        <div className="w-10"></div>
      </div>
      <div className="w-[90vw] flex flex-col gap-4">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <Link href={`/magazine/${item.id}`}>
            <Card className="w-full" isPressable isHoverable shadow="none">
              <CardBody className="flex gap-4 flex-row justify-between">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm text-default-500">{item.title}</h3>
                  <p className="text-lg font-medium">{item.description}</p>
                  <p className="text-sm text-default-400">{item.date}</p>
                </div>
                <Image
                  alt="Card thumbnail"
                  className="object-cover w-24 h-24 rounded-lg"
                  src={item.image}
                />
              </CardBody>
            </Card>
            </Link>
            {index < items.length - 1 && <Divider className="my-2" />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-center items-center mt-6">
      <FaPlusCircle className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-24" />
      </div>
      
    </div>
  );
}
