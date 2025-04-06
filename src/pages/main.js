import posts from "@/lib/data/posts" // 🔥 posts 데이터 불러오기
import Link from "next/link"
import { Bell, ChevronRight, MessageSquare, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Notice/Ad Banner */}
      <div className="bg-primary text-primary-foreground p-3 text-center relative">
        <p className="font-medium">새로운 설문조사가 시작되었습니다! 참여하고 특별 혜택을 받아보세요.</p>
        <Button
          variant="link"
          className="text-primary-foreground absolute right-4 top-1/2 -translate-y-1/2 font-bold">
          자세히 보기
        </Button>
      </div>
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">설문분석 포털</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden md:block">
              <Search
                className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="검색..."
                className="w-full rounded-md border border-input pl-8 pr-2 py-2 text-sm" />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt="사용자" />
                <AvatarFallback>사용자</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">홍길동님</p>
                <p className="text-xs text-muted-foreground">일반 회원</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Survey Analysis Results */}
          <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">설문 분석 결과</h2>
            <div className="flex gap-2">
              <Button asChild variant="default" size="sm">
                <Link href="/jaw-measurement">
                  불균형 측정하기
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                모든 결과 보기 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
            <Tabs defaultValue="satisfaction" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="satisfaction">만족도 분석</TabsTrigger>
                <TabsTrigger value="demographics">인구통계 분석</TabsTrigger>
                <TabsTrigger value="trends">추세 분석</TabsTrigger>
              </TabsList>
              <TabsContent value="satisfaction" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>서비스 만족도 분석</CardTitle>
                    <CardDescription>2023년 4분기 결과</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">만족도 차트가 표시됩니다</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">주요 만족 요소</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge>서비스 품질</Badge>
                          <Badge>응답 속도</Badge>
                          <Badge>사용자 경험</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">개선 필요 요소</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">가격 정책</Badge>
                          <Badge variant="outline">고객 지원</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      상세 분석 보기
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="demographics" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>응답자 인구통계 분석</CardTitle>
                    <CardDescription>2023년 4분기 결과</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">인구통계 차트가 표시됩니다</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">연령대별 분포</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge>20대 (34%)</Badge>
                          <Badge>30대 (28%)</Badge>
                          <Badge>40대 (22%)</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">지역별 분포</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">서울 (45%)</Badge>
                          <Badge variant="outline">경기 (25%)</Badge>
                          <Badge variant="outline">기타 (30%)</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      상세 분석 보기
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>설문 추세 분석</CardTitle>
                    <CardDescription>최근 3년간 결과 비교</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">추세 차트가 표시됩니다</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">상승 추세 항목</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge>온라인 서비스</Badge>
                          <Badge>모바일 접근성</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">하락 추세 항목</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">오프라인 서비스</Badge>
                          <Badge variant="outline">전화 상담</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      상세 분석 보기
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Board Posts Preview */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">최근 게시글</h2>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/post">
                      게시판 가기 <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <Card key={post.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{post.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback>{post.author[0]}</AvatarFallback>
                              </Avatar>
                              <span>{post.author}</span>
                              <span>•</span>
                              <span>{post.date}</span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" /> 작성자
                          </span>
                          <Link href={`/post/${post.id}`} className="text-blue-500 hover:underline ml-auto">
                            상세보기
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">내 프로필</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" alt="사용자" />
                    <AvatarFallback>사용자</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">홍길동</p>
                    <p className="text-sm text-muted-foreground">일반 회원</p>
                    <p className="text-sm text-muted-foreground">가입일: 2023.01.15</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-md border p-2">
                    <p className="text-sm text-muted-foreground">작성 게시글</p>
                    <p className="font-medium">12</p>
                  </div>
                  <div className="rounded-md border p-2">
                    <p className="text-sm text-muted-foreground">참여 설문</p>
                    <p className="font-medium">8</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  프로필 관리
                </Button>
              </CardFooter>
            </Card>

            {/* Popular Survey Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">인기 설문 분석</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((item) => (
                    <Link
                      href="#"
                      key={item}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                      <div
                        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                        {item}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">2023년 소비자 트렌드 분석 결과</p>
                        <p className="text-sm text-muted-foreground">조회 {1200 - item * 100}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  더 보기
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">빠른 링크</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    설문 참여
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    결과 검색
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <User className="mr-2 h-4 w-4" />내 활동
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    알림 설정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 bg-muted/50">
        <div
          className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2023 설문분석 포털. 모든 권리 보유.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="#" className="hover:underline">
              이용약관
            </Link>
            <Link href="#" className="hover:underline">
              개인정보처리방침
            </Link>
            <Link href="#" className="hover:underline">
              문의하기
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}



