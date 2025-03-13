"use client";
import React from "react";
import { Button, Card, CardBody, Divider, Image } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import MagazineCarousel from "./components/magazine-carousel";
export default function page() {
  const router = useRouter();
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
        <MagazineCarousel />
      </div>
      <div className="flex flex-col gap-2 my-4 w-[90vw] mb-24">
        <div className="text-2xl font-bold">Ipsum Lorem</div>
        <div className="text-end text-sm text-gray-500">June 24,2024</div>
        <div className="text-sm text-gray-500">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam quos, doloremque, voluptatum, reiciendis asperiores distinctio atque repellendus eveniet doloribus tempora accusamus. Quisquam quos, doloremque, voluptatum, reiciendis asperiores distinctio atque repellendus eveniet doloribus tempora accusamus. Quisquam quos, doloremque, voluptatum, reiciendis asperiores distinctio atque repellendus eveniet doloribus tempora accusamus. Quisquam quos, doloremque, voluptatum, reiciendis asperiores distinctio atque repellendus eveniet doloribus tempora accusamus. Quisquam quos, doloremque, voluptatum, reiciendis asperiores distinctio atque repellendus eveniet doloribus tempora accusamus.
        </div>
      </div>
    </div>
  );
}
