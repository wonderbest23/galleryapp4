"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody, Image, Button, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function MyArtworks({ user, profile }) {
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAvailable, setTotalAvailable] = useState(10); // 총 등록 가능 수
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 사용자가 로그인한 경우에만 데이터 가져오기
    if (user?.id) {
      fetchUserArtworks();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserArtworks = async () => {
    try {
      setIsLoading(true);
      // product 테이블에서 artist_id가 현재 사용자 ID와 일치하는 작품 데이터 가져오기
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .eq('artist_id', user.id);

      if (error) {
        console.error('Error fetching artworks:', error);
        return;
      }

      // 데이터가 있으면 setArtworks로 설정
      setArtworks(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log("profile:", profile);

  return (
    <div className="grid grid-cols-4 gap-4 w-[90%]">
      {isLoading ? (
        <div className="col-span-4 flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          {artworks.length > 0 ? (
            artworks.map((artwork) => (
              <Card key={artwork.id} className="col-span-1" shadow="none">
                <CardBody className="p-0">
                  <Link href={`/product/${artwork.id}`}>
                    <img
                      src={artwork?.image?.[0] || "/noimage.jpg"}
                      alt={artwork.title}
                      className="object-cover w-full aspect-square"
                    />
                  </Link>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              등록된 작품이 없습니다.
            </div>
          )}
        </>
      )}
      
      <div className="col-span-4 text-center text-[12px] text-gray-500 font-bold mt-4">
        현재등록 {artworks.length}건 / 신규등록 가능 수 {profile?.artist_credit}건
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
