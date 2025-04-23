"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import posts from "@/lib/data/posts";
import {
  Bell,
  ChevronRight,
  MessageSquare,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login");
  };

  // 상단 import 추가
const notices = [
  { id: 1, title: "🟦 4월 23일 업데이트 안내: 평가 항목 추가" },
  { id: 2, title: "🟨 운동 게시판 이용 가이드가 추가되었습니다." },
];


  return (
    <div className="min-h-screen flex flex-col">
      {notices.length > 0 && (
        <div className="bg-yellow-50 text-yellow-800 px-4 py-2 flex justify-between items-center border-b border-yellow-300">
          <p className="text-sm font-medium truncate">
            {notices[0].title}
          </p>
          <Link href="/notices" className="text-sm text-blue-600 hover:underline ml-4">
            전체 보기
          </Link>
        </div>
      )}
      <header className="border-b bg-blue-100">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">Good-Jaw</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="검색..."
                className="w-full rounded-md border border-input pl-8 pr-2 py-2 text-sm"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.name}님</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">로그인</Button>
                </Link>
                <Link href="/auth/signUp">
                  <Button variant="default" size="sm">회원가입</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>나의 턱 평가</CardTitle>
                <CardDescription>생활습관 설문조사 및 동작분석을 시작해보세요.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/mediapipe-measurement">
                  <Button className="w-full">평가 시작</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>운동 게시판 미리보기</CardTitle>
                <CardDescription>운동으로 해결하는 턱관절 장애에 대한 정보를 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex justify-between">
                    <p className="text-sm truncate w-3/4">{post.title}</p>
                    <Link href={`/post/${post.id}`} className="text-blue-500 text-sm">
                      보기
                    </Link>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link href="/post">
                  <Button variant="outline" className="w-full">
                    게시판 전체 보기
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>나의 분석 결과</CardTitle>
                  <CardDescription>최근 평가에 따른 결과를 시각화한 그래프입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">차트 영역 (예: Radar, Bar Chart 등)</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">빠른 이동</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href="/jaw-measurement">
                  <Button variant="outline" className="justify-start w-full">
                    <User className="mr-2 h-4 w-4" /> 턱 평가
                  </Button>
                </Link>
                <Link href="/post">
                  <Button variant="outline" className="justify-start w-full">
                    <MessageSquare className="mr-2 h-4 w-4" /> 운동 게시판
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">마이페이지</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user ? (
                  <>
                    <p className="text-sm">이름: {user.name}</p>
                    <p className="text-sm">이메일: {user.email}</p>
                    <p className="text-sm">등급: 일반 회원</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 굿턱. 모든 권리 보유.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="#" className="hover:underline">이용약관</Link>
            <Link href="#" className="hover:underline">개인정보처리방침</Link>
            <Link href="#" className="hover:underline">문의하기</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}