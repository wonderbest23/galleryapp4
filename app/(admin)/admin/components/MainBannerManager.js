import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Image,
  Spinner,
} from "@heroui/react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/react";

export default function MainBannerManager() {
  const supabase = createClient();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("banner").select("*");
        if (error) {
          console.error("배너 데이터 가져오기 오류:", error);
          addToast({
            title: "로드 실패",
            description: "배너 데이터를 불러오는 중 오류가 발생했습니다.",
            variant: "error",
          });
        } else {
          // 데이터가 없으면 기본 배너 객체 생성
          if (data.length === 0) {
            setBanners([{ id: 1, url: "" }]);
          } else {
            setBanners(data);
          }
        }
      } catch (error) {
        console.error("배너 데이터 가져오기 중 예외 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleBannerChange = (e, id) => {
    const { value } = e.target;
    setBanners(
      banners.map((banner) =>
        banner.id === id ? { ...banner, url: value } : banner
      )
    );
  };
  
  const addBanner = () => {
    // 새 배너 ID는 현재 배너 중 가장 큰 ID + 1로 설정
    const newId = banners.length > 0 
      ? Math.max(...banners.map(banner => banner.id)) + 1 
      : 1;
    
    setBanners([...banners, { id: newId, url: "" }]);
  };
  
  const removeBanner = (id) => {
    if (banners.length > 1) {
      setBanners(banners.filter(banner => banner.id !== id));
    } else {
      // 마지막 배너는 삭제하지 않고 내용만 비움
      setBanners([{ id: banners[0].id, url: "" }]);
    }
  };

  const onSave = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("banner")
        .upsert(banners)
        .select();

      if (error) {
        console.error("배너 저장 오류:", error);
        addToast({
          title: "저장 실패",
          description: "배너 저장 중 오류가 발생했습니다.",
          color: "danger",
        });
      } else {
        console.log("배너 저장 성공:", data);
        addToast({
          title: "저장 완료",
          description: "메인 배너가 성공적으로 저장되었습니다.",
          color: "success",
        });
        setBanners(data);
      }
    } catch (error) {
      console.error("배너 저장 중 예외 발생:", error);
      addToast({
        title: "저장 실패",
        description: "배너 저장 중 오류가 발생했습니다.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      shadow="sm"
      radius="lg"
      className="max-w-full col-span-2 md:col-span-1"
    >
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-xl font-semibold">메인 배너 관리</p>
          <p className="text-small text-default-500">
            메인 화면에 표시될 배너를 관리합니다
          </p>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {banners.length > 0 ? (
              banners.map((banner, index) => (
                <div key={banner.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">
                      메인 배너 {index + 1}
                    </label>

                  </div>
                  
                  <Input
                    label="배너 이미지 URL"
                    type="text"
                    value={banner.url || ""}
                    onChange={(e) => handleBannerChange(e, banner.id)}
                    placeholder="배너 이미지 URL을 입력하세요"
                    radius="sm"
                    classNames={{
                      input: "text-small",
                      inputWrapper: "border-1",
                    }}
                  />
                  

                </div>
              ))
            ) : (
              <p>등록된 배너가 없습니다.</p>
            )}
            

          </div>
        )}
      </CardBody>
      <CardFooter>
        <Button 
          onPress={onSave} 
          color="primary" 
          radius="sm" 
          className="w-full"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          메인 배너 저장하기
        </Button>
      </CardFooter>
    </Card>
  );
}
