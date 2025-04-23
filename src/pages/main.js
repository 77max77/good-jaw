"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import posts from "@/lib/data/posts";
import { Bell, MessageSquare, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MouthOpeningChart } from "@/components/mouth-opening-chart";
import { DeviationChart } from "@/components/deviation-chart";
import { ProgressChart } from "@/components/progress-chart";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function Home() {
  const [user, setUser] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [infoData, setInfoData] = useState([]);
  const [activeTab, setActiveTab] = useState("distance");
  const router = useRouter();

  // 1) 로컬 스토리지에서 user 불러오고, 2) 최신 분석 데이터 API 호출
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      axios
        .get("/api/analysis/latest", { params: { email: u.email } })
        .then(({ data }) => {
          setGraphData(data.graphData);
          setInfoData(data.infoData);
        })
        .catch((err) => {
          console.error("분석 데이터 로드 실패:", err);
        });
    }
  }, []);

  // summary 계산
  const summary = infoData.length
    ? {
        maxH: Math.max(...infoData.map((d) => d.maxHeight)),
        minH: Math.min(...infoData.map((d) => d.minHeight)),
        maxW: Math.max(...infoData.map((d) => d.maxWidth)),
        minW: Math.min(...infoData.map((d) => d.minWidth)),
      }
    : null;

  const mouthOpening = summary ? (summary.maxH - summary.minH) * 10 : 0;
  const deviation     = summary ? (summary.maxW - summary.minW) * 10 : 0;
  const progressPct   = summary ? (mouthOpening / 35) * 100 : 0;

  // 턱-코 좌표 연결용 ECharts 옵션 (CardContent 위에)
  const allX = [], allY = [];
  graphData.forEach(item => {
    allX.push(item.chinTipX, item.noseTipX);
    allY.push(item.chinTipY, item.noseTipY);
  });
  const xMin    = allX.length ? Math.min(...allX) : 0;
  const xMax    = allX.length ? Math.max(...allX) : 100;
  const yMin    = allY.length ? Math.min(...allY) : 0;
  const yMax    = allY.length ? Math.max(...allY) : 100;
  const xMargin = (xMax - xMin) * 0.5;
  const yMargin = (yMax - yMin) * 0.5;

  const coordinatesOption = {
    title: { text: "턱-코 좌표 연결", left: "center" },
    tooltip: {
      trigger: "item",
      formatter: params =>
        `${params.seriesName}<br/>X: ${params.value[0].toFixed(2)} px<br/>Y: ${params.value[1].toFixed(2)} px`,
    },
    legend: { data: ["Chin Tip", "Nose Tip"], bottom: 0 },
    xAxis: { name: "X (px)", type: "value", min: xMin - xMargin, max: xMax + xMargin },
    yAxis: { name: "Y (px)", type: "value", min: yMin - yMargin, max: yMax + yMargin },
    series: [
      {
        name: "Chin Tip",
        type: "scatter",
        symbolSize: 8,
        data: graphData.map(i => [i.chinTipX, i.chinTipY]),
      },
      {
        name: "Nose Tip",
        type: "scatter",
        symbolSize: 8,
        data: graphData.map(i => [i.noseTipX, i.noseTipY]),
      },
      ...graphData.map(item => ({
        name: `Round ${item.round}`,
        type: "line",
        data: [
          [item.chinTipX, item.chinTipY],
          [item.noseTipX, item.noseTipY],
        ],
        showSymbol: false,
        lineStyle: { type: "dashed", color: "#888" },
      })),
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login");
  };

  const notices = [
    { id: 1, title: "🟦 4월 23일 업데이트 안내: 평가 항목 추가" },
    { id: 2, title: "🟨 운동 게시판 이용 가이드가 추가되었습니다." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 공지 배너 */}
      {notices[0] && (
        <div className="bg-yellow-50 text-yellow-800 px-4 py-2 flex justify-between items-center border-b border-yellow-300">
          <span className="truncate">{notices[0].title}</span>
          <Link href="/notices" className="text-blue-600 hover:underline">전체 보기</Link>
        </div>
      )}

      {/* 헤더 */}
      <header className="border-b bg-blue-100">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
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
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><MessageSquare className="h-5 w-5" /></Button>
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm">{user.name}님</span>
                <Button variant="destructive" size="sm" onClick={handleLogout}>로그아웃</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login"><Button variant="outline" size="sm">로그인</Button></Link>
                <Link href="/auth/signUp"><Button variant="default" size="sm">회원가입</Button></Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="container mx-auto flex-1 py-6 px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* 왼쪽 */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>나의 턱 평가</CardTitle>
                <CardDescription>동작분석을 시작해보세요.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/mediapipe-measurement"><Button className="w-full">평가 시작</Button></Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>운동 게시판 미리보기</CardTitle>
                <CardDescription>유용한 운동 정보를 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {posts.slice(0, 3).map(post => (
                  <div key={post.id} className="flex justify-between">
                    <span className="truncate w-3/4">{post.title}</span>
                    <Link href={`/post/${post.id}`} className="text-blue-500 text-sm">보기</Link>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link href="/post"><Button variant="outline" className="w-full">게시판 전체 보기</Button></Link>
              </CardFooter>
            </Card>

            {/* 분석 결과 탭 카드 */}
            {user && graphData.length > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <Card>
                  <CardHeader>
                    <CardTitle>분석 결과</CardTitle>
                    <CardDescription>원하는 그래프를 탭으로 선택하세요.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-60">
                    <TabsContent value="distance" className="h-full">
                      <MouthOpeningChart current={Math.round(mouthOpening)} normal={35} />
                    </TabsContent>
                    <TabsContent value="deviation" className="h-full">
                      <DeviationChart data={graphData} normal={{ min: 7, max: 10 }} />
                    </TabsContent>
                    <TabsContent value="progress" className="h-full">
                      <ProgressChart mouthOpeningPercentage={Math.min(progressPct, 100)} />
                    </TabsContent>
                    <TabsContent value="coordinates" className="h-full">
                      <ReactECharts option={coordinatesOption} style={{ height: "100%" }} />
                    </TabsContent>
                  </CardContent>
                  <CardFooter>
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="distance">거리</TabsTrigger>
                      <TabsTrigger value="deviation">치우침</TabsTrigger>
                      <TabsTrigger value="progress">진행</TabsTrigger>
                      <TabsTrigger value="coordinates">좌표</TabsTrigger>
                    </TabsList>
                  </CardFooter>
                </Card>
              </Tabs>
            )}
          </div>

          {/* 오른쪽 */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>빠른 이동</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href="/jaw-measurement">
                  <Button variant="outline" className="justify-start w-full">
                    <User className="mr-2 h-4 w-4" /> 턱 평가
                  </Button>
                </Link>
                <Link href="/post">
                  <Button variant="outline" className="justify-start w-full">
                    <MessageSquare className="mr-2 h-4 w-4" /> 게시판
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>마이페이지</CardTitle></CardHeader>
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

      {/* 푸터 */}
      <footer className="border-t py-6 bg-muted/50">
        <div className="container mx-auto text-center text-sm text-muted-foreground px-4">
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
