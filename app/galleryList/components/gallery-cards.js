"use client";
import React, { useState } from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import Link from "next/link";

export function GalleryCards({ galleries }) {


  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {galleries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid gap-4 w-full justify-center items-center">
            {galleries.map((gallery, index) => (
              <Card key={index} className="w-[90vw]">
                <Link href={`/gallery/${gallery.id || index + 1}`}>
                  <CardBody className="flex gap-4 flex-row">
                    <img
                      src={gallery.thumbnail || `https://picsum.photos/200/200?random=${index}`}
                      alt={gallery.name || gallery.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col">
                          
                          <div className="text-lg font-bold">
                            {gallery.name || gallery.subtitle}
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
                          <IoMdPin />
                          {gallery.address || gallery.location}
                        </div>
                        <div className="flex flex-row gap-1">
                          <FaRegStar />
                          {gallery.visitor_rating || "1.0"}({gallery.blog_review_count || 0})
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
