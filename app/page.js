"use client";
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ExhibitionCarousel } from "./components/exhibition-carousel";
import { CategoryButtons } from "./components/category-buttons";
import { ExhibitionCards } from "./components/exhibition-cards";
import { GallerySection } from "./components/gallery-section";
import { MagazineCarousel } from "./components/magazine-carousel";
import { Input, Tabs, Tab, Card, CardBody, Button } from "@heroui/react";
import { useEffect, useState } from "react";
import GalleryCards from "./components/gallery-cards";
import { createClient } from "@/utils/supabase/client";
export default function Home() {
  const [exhibitionCategory, setExhibitionCategory] = useState("all");
  const [selectedTab, setSelectedTab] = useState("recommended");
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const supabase = createClient();
  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
    } else {
      setUser(data?.user);
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  const getFavorites = async () => {
    const { data, error } = await supabase.from("favorite").select("*").eq("name", user.email);
    if (error) {
      console.error("Error fetching favorites:", error);
    } else {
      setFavorites(data || []);
    }
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full">
      {/* Banner Carousel */}
      <ExhibitionCarousel user={user}/>

      {/* Category Buttons */}
      <CategoryButtons />

      {/* Exhibition Tabs */}
      <Tabs
        aria-label="Exhibition options"
        variant="underlined"
        className="w-full flex justify-center items-center"
        onSelectionChange={(key) => setExhibitionCategory(key.toString())}
      >
        <Tab
          key="all"
          title="전체전시"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards exhibitionCategory={exhibitionCategory} user={user}/>
        </Tab>
        <Tab
          key="free"
          title="무료전시"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards exhibitionCategory={exhibitionCategory} user={user}/>
        </Tab>
        <Tab
          key="recommended"
          title="추천전시"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards exhibitionCategory={exhibitionCategory} user={user}/>
        </Tab>
      </Tabs>

      {/* Gallery Section */}
      <Tabs
        className="w-full max-w-[900px] mx-auto flex justify-center items-center"
        aria-label="Gallery options"
        variant="underlined"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key.toString())}
      >
        <Tab key="recommended" title="추천갤러리">
          <GalleryCards selectedTab={selectedTab} user={user}/>
        </Tab>
        <Tab key="new" title="신규갤러리">
          <GalleryCards selectedTab={selectedTab} user={user}/>
        </Tab>
        <Tab key="now" title="전시갤러리">
          <GalleryCards selectedTab={selectedTab} user={user}/>
        </Tab>
      </Tabs>

      {/* Magazine Section */}
      <MagazineCarousel />
    </div>
  );
}
