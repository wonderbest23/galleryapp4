"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, Card, CardBody, Spinner, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from "next/image";
import { FaTag } from "react-icons/fa6";

const Messages = ({ user }) => {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({});
  console.log("user:", user);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!user) return;
        
        const supabase = createClient();
        
        // 사용자가 참여한 모든 채팅 가져오기 (host_id 또는 user_id가 현재 사용자)
        const { data, error } = await supabase
          .from('chat_list')
          .select('*, product_id(*)')
          .or(`host_id.eq.${user.id},user_id.eq.${user.id}`);
        
        if (error) {
          console.log('채팅 목록 불러오기 오류:', error);
          return;
        }
        
        if (data) {
          setChats(data);
          
          // 채팅 참여자들의 프로필 정보를 가져오기
          const uniqueUserIds = new Set();
          data.forEach(chat => {
            if (chat.host_id !== user.id) uniqueUserIds.add(chat.host_id);
            if (chat.user_id !== user.id) uniqueUserIds.add(chat.user_id);
          });
          
          const profileData = {};
          for (const id of uniqueUserIds) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', id)
              .single();
            
            if (profile) {
              profileData[id] = profile;
            }
          }
          
          setProfiles(profileData);
        }
      } catch (error) {
        console.log('채팅 목록 불러오기 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  const getLastMessageTime = (updatedAt) => {
    if (!updatedAt) return '';
    return formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: ko });
  };

  const getChatPartnerName = (chat) => {
    const isHost = chat.host_id === user.id;
    const partnerId = isHost ? chat.user_id : chat.host_id;
    const partnerProfile = isHost ? chat.user_profiles : chat.profiles;
    
    if (partnerProfile) {
      return partnerProfile.full_name || partnerProfile.email || '이름 없음';
    }
    
    return '사용자';
  };

  const handleChatClick = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  // 가격 형식화 (천 단위 콤마)
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 w-full">
        <Spinner variant="wave" color="primary" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 w-full">
        <p className="text-gray-500">메시지 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="grid gap-4 w-full">
        {chats.map((chat) => (
          <Card 
            key={chat.id} 
            className="w-full max-w-full"
            onClick={() => handleChatClick(chat.id)}
          >
            <CardBody className="flex gap-4 flex-row justify-center items-center cursor-pointer">
              <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                <Image 
                  src={chat.product_id.image[0] || "/noimage.jpg"} 
                  alt="제품 이미지" 
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-col w-full min-w-0">
                <div className="flex flex-row justify-between items-start">
                  <div className="flex flex-col min-w-0">
                    <div className="text-xs text-gray-500">
                      채팅
                    </div>
                    <div className="text-lg font-bold truncate">
                      {chat.product_id.name}
                    </div>
                  </div>
                </div>

                <Divider orientation="horizontal" className="bg-gray-300" />
                
                <div className="text-xs flex flex-col my-2">
                  <div className="flex flex-row gap-1 items-center">
                    <FaTag className="text-blue-500" />
                    {formatPrice(chat.product_id.price)}원
                  </div>
                  <div className="flex flex-row gap-1 items-center mt-1">
                    <span className="text-gray-500">
                      {getLastMessageTime(chat.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Messages; 