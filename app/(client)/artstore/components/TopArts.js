import React, { useState, useEffect } from "react";
import { Button, Card, CardBody,Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { FaRegBookmark } from "react-icons/fa";

export default function TopArts() {
  const [categories, setCategories] = useState([
    { id: 1, name: "추천상품", selected: true, genre: null },
    { id: 2, name: "현대미술", selected: false, genre: "현대미술" },
    { id: 3, name: "추상화", selected: false, genre: "추상화" },
    { id: 4, name: "명화/동양화", selected: false, genre: "명화/동양화" },
    { id: 5, name: "사진/일러스트", selected: false, genre: "사진/일러스트" },
    { id: 6, name: "기타", selected: false, genre: "기타" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [artItems, setArtItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  console.log('categories:', categories)
  console.log('selectedCategory:', selectedCategory)
  useEffect(() => {
    fetchProducts();
  }, [categories]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const selectedCategory = categories.find(category => category.selected);
      
      let query = supabase
        .from("product")
        .select("*, artist_id(*)")
        .order("created_at", { ascending: false })
        .limit(4);
      
      // 카테고리별 필터 적용
      if (selectedCategory.id === 1) {
        // 추천상품 - isRecommended가 true인 상품만 필터링
        query = query.eq('isRecommended', true);
      } else if (selectedCategory.genre) {
        // 다른 카테고리 - 해당 장르 필터링
        query = query.not('artist_id', 'is', null)
                     .ilike('artist_id.artist_genre', selectedCategory.genre);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      
      setArtItems(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (clickedId) => {
    setCategories(
      categories.map((category) => ({
        ...category,
        selected: category.id === clickedId,
      }))
    );
    setSelectedCategory(categories.find(category => category.id === clickedId));
  };
  console.log('artItems:', artItems)

  return (
    <div className="flex flex-col justify-center items-center w-[90%] h-full ">
      <div className="w-full h-full py-1 flex flex-wrap gap-y-2 gap-x-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={category.selected ? "default" : "outline"}
            className={`h-8 rounded-full px-3 py-[9px] whitespace-nowrap text-[13px] font-normal ${
              category.selected
                ? "bg-[#0042e0] text-white "
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
        {loading ? (
          <div className="col-span-2 flex justify-center items-center">
            <Spinner variant="wave" color="primary" />
          </div>
        ) : artItems.length > 0 ? (
          artItems.map((item) => (
            <Card isPressable onPress={() => router.push(`/product/${item.id}`)} key={item.id} className="rounded-lg overflow-hidden w-full cursor-pointer" shadow="none">
              <div className="relative w-full aspect-[157/200]">
                <Image
                  src={item.image[0] || "/noimage.jpg"} 
                  alt="image"
                  className=" object-cover rounded-lg"
                  fill
                />
                <div className="absolute bottom-2 right-2">
                  <FaRegBookmark className="bg-gray-500 text-white opacity-40 h-6 w-6 rounded-lg p-1.5" />
                </div>
              </div>
              <CardBody className="p-0 mt-2">
                <p className="text-[14px] font-medium line-clamp-1 text-[#606060]">{item.title}</p>
                <p className="text-[10px] text-[#606060]">{item.artist_id?.name || "알 수 없음"}</p>
                <p className="text-[14px] text-black font-bold mt-1">₩{item.price?.toLocaleString()}</p>
              </CardBody>
            </Card>
          ))
        ) : (
          <p className="col-span-2 text-center">표시할 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
