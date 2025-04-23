"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!form.email || !form.password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
  
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message || "로그인 실패");
      } else {
        // ✅ 사용자 정보를 localStorage에 저장
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("로그인 성공!");
        router.push("/main"); // 메인 페이지로 이동
      }
    } catch (err) {
      console.error("로그인 에러:", err);
      setError("서버 오류가 발생했습니다.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">로그인</CardTitle>
            <CardDescription className="text-center text-sm text-gray-600">
              이메일과 비밀번호를 입력하여 로그인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent asChild>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <Button type="submit" className="w-full mt-4">
                로그인
              </Button>

              <p className="mt-4 text-center text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/auth/signUp" className="text-blue-600 hover:underline">
                  회원가입
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
