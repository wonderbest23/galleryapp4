"use client";
import React from "react";
import { Tabs, Tab, Button, Select, SelectItem } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Card, CardBody, Divider, Image } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";


export default function MagazineList() {
  const [magazines, setMagazines] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [allLoaded, setAllLoaded] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const getMagazines = async () => {
    const { data, error } = await supabase
      .from("magazine")
      .select("*")
      .order("created_at", { ascending: false });
    setMagazines(data);
    setAllLoaded(data.length <= visibleCount);
  };

  useEffect(() => {
    getMagazines();
  }, []);

  console.log("magazines:", magazines);

  const loadMore = () => {
    const newVisibleCount = visibleCount + 5;
    setVisibleCount(newVisibleCount);
    setAllLoaded(magazines.length <= newVisibleCount);
  };

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
        {magazines.slice(0, visibleCount).map((item, index) => (
          <React.Fragment key={item.id}>
            <Link href={`/magazine/${item.id}`}>
            <Card className="w-full" isPressable isHoverable shadow="none">
              <CardBody className="flex gap-4 flex-row justify-between">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm text-default-500">{item.title}</h3>
                  <p className="text-lg font-medium">{item.subtitle}</p>
                  <p className="text-sm text-default-400">{new Date(item.created_at).getFullYear()}년 {new Date(item.created_at).getMonth() + 1}월 {new Date(item.created_at).getDate()}일</p>
                </div>
                <Image
                  alt="Card thumbnail"
                  className="object-cover w-24 h-24 rounded-lg"
                  src={item.photo[0].url}
                />
              </CardBody>
            </Card>
            </Link>
            {index < visibleCount - 1 && <Divider className="my-2" />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center mt-6 mb-24">
        {!allLoaded ? (
          <FaPlusCircle 
            className="text-red-500 text-2xl font-bold hover:cursor-pointer" 
            onClick={loadMore}
          />
        ) : (
          <p className="text-gray-500 text-sm">모든 매거진을 불러왔습니다</p>
        )}
      </div>
    </div>
  );
}
