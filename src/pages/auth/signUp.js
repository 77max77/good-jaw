"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

export default function SignUpPage() {
  const [form, setForm] = useState({
    nickname: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthYear: "",
    gender: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    const required = ["nickname", "birthYear", "gender", "phone", "name", "email", "password", "confirmPassword"];
    for (const field of required) {
      if (!form[field]) {
        setError("모든 필수 항목을 입력해주세요.");
        return;
      }
    }
  
    if (form.password !== form.confirmPassword) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
  
    try {
      const response = await fetch("/api/auth/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: form.nickname,
          name: form.name,
          email: form.email,
          password: form.password,
          birthYear: form.birthYear,
          gender: form.gender,
          phone: form.phone,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || "회원가입에 실패했습니다.");
      } else {
        alert("회원가입이 완료되었습니다!");
        // 리디렉션 등 후속 처리
      }
    } catch (err) {
      console.error("회원가입 요청 중 오류 발생:", err);
      setError("서버 오류로 회원가입에 실패했습니다.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">회원가입</CardTitle>
            <CardDescription className="text-center text-sm text-gray-600">
              계정을 생성하려면 아래 정보를 모두 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent asChild>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                    닉네임 (필수)
                  </Label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    required
                    value={form.nickname}
                    onChange={handleChange}
                    placeholder="닉네임을 입력하세요"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    이름 (필수)
                  </Label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="이름을 입력하세요"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <div>
                  <Label htmlFor="birthYear" className="block text-sm font-medium text-gray-700">
                    출생연도 (필수)
                  </Label>
                  <input
                    id="birthYear"
                    name="birthYear"
                    type="number"
                    required
                    value={form.birthYear}
                    onChange={handleChange}
                    placeholder="YYYY"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    성별 (필수)
                  </Label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={form.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="">선택하세요</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    전화번호 (필수)
                  </Label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    이메일 (필수)
                  </Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@domain.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    비밀번호 (필수)
                  </Label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력하세요"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인 (필수)
                  </Label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <Button type="submit" className="w-full mt-4">
                회원가입
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}