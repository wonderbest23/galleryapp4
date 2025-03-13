"use client";
import React from "react";
import { Tabs, Tab, Card, CardBody, Button, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";


export default function App() {
  const [selected, setSelected] = useState("home");
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 상단 네비게이션 바 */}
      <div className="bg-white flex items-center">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <FaChevronLeft className="text-xl" />
        </Button>
        <h2 className="text-lg font-medium"></h2>
      </div>

      {/* Hero Image Section */}
      <div className="relative w-full h-64">
        <img
          src="https://picsum.photos/800/600"
          alt="Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button isIconOnly variant="flat" className="bg-white/80">
            <Icon icon="lucide:heart" className="text-xl" />
          </Button>
          <Button isIconOnly variant="flat" className="bg-white/80">
            <Icon icon="lucide:share" className="text-xl" />
          </Button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">김광석 초대전 전시회</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <Icon icon="lucide:star" className="text-yellow-400" />
                <span className="ml-1">4.5</span>
                <span className="text-gray-500">(91)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:map-pin" />
            <span>서울특별시 강남구 서초동 153-53</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:clock" />
            <span>2023년 05월 01일 - 2023년 05월 07일</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:info" />
            <span>평일/주말: 오후12:00부터 오후 6시까지(1시간 평균 소요)</span>
          </div>
        </div>

        <Button className="w-full mt-4" color="primary" size="lg">
          사이트연결
        </Button>
      </div>

      {/* Tabs Section */}
      <div className="mt-4 mb-16">
        <Tabs
          aria-label="Options"
          selectedKey={selected}
          onSelectionChange={setSelected}
          variant="underlined"
          fullWidth
        >
          <Tab key="home" title="홈">
            <Card className="my-4 mx-2">
              <CardBody>
                <h3 className="text-lg font-bold mb-2">시설 안내</h3>
                <p>
                  현대적인 시설과 함께하는 서울 근대미술관. 지금은 한국의
                  대표적인 예술가 김광석의 작품을 만나보실 수 있습니다.
                </p>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="gallery" title="갤러리공지">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="my-4 mx-2">
                <CardBody>
                  <h3 className="text-lg font-bold">공지사항 {i}</h3>
                  <p className="text-sm text-gray-500 mt-1">2023.05.0{i}</p>
                  <p className="mt-2">
                    전시회 관람 시간 안내 및 주의사항입니다.
                  </p>
                </CardBody>
              </Card>
            ))}
            <div className="flex justify-center items-center">
              <FaPlusCircle className="text-red-500 text-2xl font-bold hover:cursor-pointer" />
            </div>
          </Tab>
          <Tab key="reviews" title="리뷰">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="my-4 mx-2">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div>
                        <p className="font-bold">방문자{i}</p>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, j) => (
                            <Icon
                              key={j}
                              icon="lucide:star"
                              className="w-4 h-4"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2023.05.0{i}</span>
                  </div>
                  <p className="mt-2">
                    정말 좋은 전시회였습니다. 작품 하나하나가 인상적이었어요.
                  </p>
                </CardBody>
              </Card>
            ))}

            <div className="flex justify-center items-center">
              <FaPlusCircle className="text-red-500 text-2xl font-bold hover:cursor-pointer" />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
