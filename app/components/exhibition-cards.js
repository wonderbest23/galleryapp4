"use client";
import React, { useState } from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import Link from "next/link";
export function ExhibitionCards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const exhibitions = Array(5).fill({
    title: "수원 갤러리",
    subtitle: "김광석 초대전 전시회",
    date: "2024.03.15 - 2024.04.15",
    location: "서울 강남구",
    review: "4.0(225)",
  });

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="grid gap-4 w-full justify-center items-center">
          {exhibitions.map((exhibition, index) => (
            <Card key={index} className="w-[90vw]">
              <Link href={`/gallery/${index + 1}`}>
                <CardBody className="flex gap-4 flex-row">
                  <img
                    src={`https://picsum.photos/200/200?random=${index}`}
                    alt={exhibition.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row justify-between items-start">
                      <div className="flex flex-col">
                        <div className="text-xs ">{exhibition.title}</div>
                        <div className="text-lg font-bold">
                          {exhibition.subtitle}
                        </div>
                      </div>
                      <div>
                        <FaRegBookmark className="text-gray-500 text-medium" />
                      </div>
                    </div>

                    <Divider
                      orientation="horizontal"
                      className=" bg-gray-300"
                    />
                    <div className="text-xs flex flex-col my-2">
                      <div className="flex flex-row gap-1">
                        <FaRegCalendar />
                        {exhibition.date}
                      </div>
                      <div className="flex flex-row gap-1">
                        <IoMdPin />
                        {exhibition.location}
                      </div>
                      <div className="flex flex-row gap-1">
                        <FaRegStar />
                        {exhibition.review}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Link>
            </Card>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          {exhibitions.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentIndex === index ? "bg-red-500" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        <button
          className="mt-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          onClick={() => console.log("플러스 버튼 클릭")}
        >
          +
        </button>
      </div>
    </>
  );
}
