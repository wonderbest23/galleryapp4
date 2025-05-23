'use client'
import React,{use,useEffect} from "react";
import {Form, Input, Button} from "@heroui/react";
import { adminSignInAction } from "@/app/actions";
import {addToast} from "@heroui/toast"
export default function App({searchParams}) {
  const [errors, setErrors] = React.useState({});
  const error=use(searchParams)?.error
  useEffect(()=>{
    if(error){
      addToast({
        title: "로그인 실패",
        description: error,
        color:'danger'
      })
    }
  },[error])
  
  return (
    <Form
      className="w-full h-screen justify-center items-center space-y-4"
      validationErrors={errors}
      action={adminSignInAction}
    >
      <div className="flex flex-col gap-4 md:max-w-[30%] w-full max-w-[80%]">
        <h1 className="text-2xl font-bold text-center">관리자 로그인</h1>
        <div className="text-center">
            <p>(!)경고 해당사이트에 접근하지마세요. </p>
            <p>
              <a 
                href="https://www.artandbridge.com/gallery/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 underline cursor-pointer"
               >
                갤러리페이지로 이동하기(클릭)
             </a>
           </p>
        </div>
        <Input
          isRequired
          label="이메일"
          labelPlacement="outside"
          name="email"
          placeholder="이메일을 입력해주세요"
          type="email"
        />

        <Input
          isRequired
          label="비밀번호"
          labelPlacement="outside"
          name="password"
          placeholder="비밀번호를 입력해주세요"
          type="password"
        />

        <div className="flex gap-4">
          <Button className="w-full" color="primary" type="submit">
            로그인
          </Button>
        </div>
      </div>
    </Form>
  );
}

