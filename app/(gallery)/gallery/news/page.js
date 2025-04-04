"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Pagination, Switch, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { addToast } from "@heroui/react";
import useUserInfoStore from "../store/userInfo";
import { v4 as uuidv4 } from "uuid";

export default function NewsPage() {
  const { userInfo } = useUserInfoStore();
  // Supabase 클라이언트 생성
  const supabase = createClient();

  // 상태 관리
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedKey, setSelectedKey] = useState(new Set([]));
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [galleryId, setGalleryId] = useState(null);
  const [newNotification, setNewNotification] = useState({
    title: "",
    description: "",
    thumbnail: "",
    is_active: true,
  });

  const itemsPerPage = 5;

  // 소식 데이터 로드 함수
  const loadNotifications = async () => {
    if (userInfo?.url) {
      setIsLoading(true);
      try {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage - 1;

        let query = supabase
          .from("gallery_notification")
          .select("*", { count: "exact" })
          .range(start, end)
          .order("created_at", { ascending: false })
          .eq("naver_gallery_url", userInfo?.url);

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`
          );
        }

        const { data, error, count } = await query;

        if (error) throw error;

        setNotifications(data || []);
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      } catch (error) {
        console.error("소식 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 페이지나 검색어가 변경될 때 데이터 로드
  useEffect(() => {
    loadNotifications();
  }, [currentPage, searchTerm]);

  // userInfo가 변경될 때 데이터 로드하는 useEffect 추가
  useEffect(() => {
    if (userInfo?.url) {
      loadNotifications();
    }
  }, [userInfo]);

  // 신규 소식 생성 핸들러
  const handleNewNotification = () => {
    setSelectedNotification(null);
    setIsCreatingNew(true);
    setSelectedKey(new Set([]));
    // 신규 소식 상태 초기화
    setNewNotification({
      title: "",
      description: "",
      thumbnail: "",
      is_active: true,
    });
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
    }
  };

  // 신규 소식 필드 값 변경 핸들러
  const handleNewFieldChange = (field, value) => {
    setNewNotification({
      ...newNotification,
      [field]: value,
    });
  };

  // 신규 소식 저장 핸들러
  const handleSaveNew = async () => {
    try {
      // 갤러리 ID 가져오기
      const { data: galleryData, error: galleryError } = await supabase
        .from("gallery")
        .select("id")
        .eq("url", userInfo.url)
        .single();

      if (galleryError) throw galleryError;

      // Supabase에 새 소식 데이터 저장
      const { data, error } = await supabase
        .from("gallery_notification")
        .insert([
          {
            title: newNotification.title || "",
            description: newNotification.description || "",
            user_id: userInfo.id,
            naver_gallery_url: userInfo.url,
            gallery_id: galleryData.id,
          },
        ])
        .select();

      if (error) throw error;

      // 저장된 데이터로 상태 업데이트
      const savedNotification = data[0];
      setIsCreatingNew(false);
      setSelectedNotification(savedNotification);
      setSelectedKey(new Set([savedNotification.id.toString()]));

      // 데이터 새로고침
      loadNotifications();

      addToast({
        title: "저장 완료",
        description: "소식이 성공적으로 등록되었습니다.",
        color: "success",
      });
    } catch (error) {
      console.log("소식 저장 중 오류 발생:", error);
      addToast({
        title: "저장 실패",
        description: "소식 저장 중 오류가 발생했습니다.",
        color: "danger",
      });
    }
  };

  // 소식 선택 핸들러
  const handleSelectNotification = (notification) => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
    }

    setSelectedNotification(notification);
    setSelectedKey(new Set([notification.id.toString()]));
  };

  // 필드 값 변경 핸들러
  const handleFieldChange = (field, value) => {
    setSelectedNotification({
      ...selectedNotification,
      [field]: value,
    });
  };

  // 이미지 업로드 및 처리 핸들러
  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: "업로드 오류",
          description: "파일 크기는 5MB 이하여야 합니다.",
          color: "danger",
        });
        return;
      }

      // 파일 형식 제한
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        addToast({
          title: "업로드 오류",
          description:
            "JPG, PNG, GIF, WEBP 형식의 이미지만 업로드할 수 있습니다.",
          color: "danger",
        });
        return;
      }

      // 업로드 중임을 표시
      setIsLoading(true);

      // 파일 이름은 고유하게 생성 (UUID + 원본 파일명)
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `gallery_notification/${fileName}`;

      // Supabase storage에 이미지 업로드
      const { data, error } = await supabase.storage
        .from("gallery_notification")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // 업로드된 이미지의 공개 URL 생성
      const { data: publicUrlData } = supabase.storage
        .from("gallery_notification")
        .getPublicUrl(filePath);

      // 이미지 URL을 소식 정보에 저장
      handleFieldChange("thumbnail", publicUrlData.publicUrl);

      addToast({
        title: "업로드 성공",
        description: "이미지가 성공적으로 업로드되었습니다.",
        color: "success",
      });
    } catch (error) {
      console.log("이미지 업로드 중 오류 발생:", error);
      addToast({
        title: "업로드 오류",
        description: `이미지 업로드 중 오류가 발생했습니다: ${error.message}`,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 소식 업데이트 핸들러
  const handleUpdate = async () => {
    if (!selectedNotification) return;
    let galleryId = null;

    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("url", userInfo.url)
      .single();
    console.log("data:", data);

    setIsLoading(true);
    try {
      // Supabase에 업데이트 데이터 저장
      const { error } = await supabase
        .from("gallery_notification")
        .update({
          title: selectedNotification.title,
          description: selectedNotification.description,
          gallery_id: data.id,

          naver_gallery_url: userInfo.url,
          user_id: userInfo.id,
        })
        .eq("id", selectedNotification.id);

      if (error) throw error;

      addToast({
        title: "저장 완료",
        description: "소식 정보가 성공적으로 업데이트되었습니다.",
        color: "success",
      });

      // 데이터 새로고침
      loadNotifications();
    } catch (error) {
      console.log("소식 업데이트 중 오류 발생:", error);
      addToast({
        title: "저장 실패",
        description: "소식 정보 업데이트 중 오류가 발생했습니다.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 소식 삭제 핸들러
  const handleDelete = async () => {
    if (!selectedNotification) return;

    if (window.confirm("정말로 이 소식을 삭제하시겠습니까?")) {
      try {
        // Supabase에서 소식 삭제
        const { error } = await supabase
          .from("gallery_notification")
          .delete()
          .eq("id", selectedNotification.id);

        if (error) throw error;

        // 상태 초기화
        setSelectedNotification(null);
        setSelectedKey(new Set([]));

        // 데이터 새로고침
        loadNotifications();

        addToast({
          title: "삭제 완료",
          description: "소식이 성공적으로 삭제되었습니다.",
          color: "success",
        });
      } catch (error) {
        console.log("소식 삭제 중 오류 발생:", error);
        addToast({
          title: "삭제 실패",
          description: "소식 삭제 중 오류가 발생했습니다.",
          color: "danger",
        });
      }
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // selectedKey 변경 핸들러
  const handleKeyChange = (keys) => {
    setSelectedKey(keys);

    if (keys.size > 0) {
      const selectedId = Number(Array.from(keys)[0]);
      const notification = notifications.find((n) => n.id === selectedId);

      if (notification) {
        handleSelectNotification(notification);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">소식 관리</h1>
        </div>

        {/* 검색 및 신규 등록 영역 */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Input
            placeholder="소식 검색..."
            value={searchTerm}
            onValueChange={handleSearchChange}
            startContent={
              <Icon icon="lucide:search" className="text-default-400" />
            }
            className="w-full md:w-1/3"
          />
          <Button
            onClick={handleNewNotification}
            className="bg-primary text-white"
            disabled={isCreatingNew}
          >
            <Icon icon="lucide:plus" className="text-lg mr-1" />
            신규 소식 등록
          </Button>
        </div>

        {/* 소식 목록 영역 */}
        <section className="rounded-lg overflow-x-auto">
          <table className="w-full border-collapse border-spacing-0  min-w-[600px]">
            <thead className="bg-default-100">
              <tr>
                <th className="p-3 text-left border-b w-1/6">제목</th>

                <th className="p-3 text-left border-b w-1/2">내용</th>
                <th className="p-3 text-left border-b w-1/6">등록일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    소식 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={`border-b cursor-pointer ${
                      selectedKey.has(notification.id.toString())
                        ? "bg-primary-100"
                        : ""
                    }`}
                    onClick={() => handleSelectNotification(notification)}
                  >
                    <td className="p-3">{notification.title}</td>

                    <td className="p-3 ">
                      <div className="line-clamp-1 overflow-hidden text-ellipsis">
                        {notification.description}
                      </div>
                    </td>
                    <td className="p-3 ">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
        {/* 페이지네이션 */}
        <div className="flex justify-center mt-4">
          <Pagination
            total={totalPages}
            initialPage={1}
            page={currentPage}
            onChange={handlePageChange}
          />
        </div>

        {/* 소식 상세 정보 영역 */}
        <section className="bg-content2 rounded-lg p-4">
          {isCreatingNew ? (
            <div className="space-y-6">
              <div className="flex justify-end space-x-2 mb-4">
                <Button
                  onClick={handleSaveNew}
                  color="primary"
                  className="flex items-center"
                  isLoading={isLoading}
                >
                  <Icon icon="lucide:save" className="text-lg mr-1" />
                  저장
                </Button>
                <Button
                  onClick={handleCancel}
                  color="default"
                  variant="light"
                  className="flex items-center"
                >
                  취소
                </Button>
              </div>

              {/* 신규 소식 폼 영역 */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      제목
                    </label>
                    <Input
                      placeholder="소식 제목을 입력하세요"
                      value={newNotification.title}
                      onChange={(e) =>
                        handleNewFieldChange("title", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">내용</label>
                  <Textarea
                    placeholder="소식 내용을 입력하세요"
                    value={newNotification.description}
                    onChange={(e) =>
                      handleNewFieldChange("description", e.target.value)
                    }
                    className="w-full"
                    rows={5}
                  />
                </div>
              </div>
            </div>
          ) : selectedNotification ? (
            <div>
              <div className="flex justify-end space-x-2 mb-4">
                <Button
                  onClick={handleUpdate}
                  color="primary"
                  className="flex items-center"
                  isLoading={isLoading}
                >
                  <Icon icon="lucide:save" className="text-lg mr-1" />
                  저장
                </Button>
                <Button
                  onClick={handleDelete}
                  color="danger"
                  variant="light"
                  className="flex items-center"
                >
                  <Icon icon="lucide:trash" className="text-lg mr-1" />
                  삭제
                </Button>
              </div>

              {/* 직접 편집 가능한 폼 영역 */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      제목
                    </label>
                    <Input
                      value={selectedNotification.title || ""}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">내용</label>
                  <Textarea
                    value={selectedNotification.description || ""}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    className="w-full"
                    rows={5}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-default-500 py-8">
              소식을 선택하거나 신규 등록 버튼을 클릭하세요.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
