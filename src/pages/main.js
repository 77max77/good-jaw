"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { ProgressChart } from "@/components/progress-chart";
import FaceMovementChart from "@/components/faceMovementChart";
import FaceMovementExtendedChart from "@/components/faceMovementChartWith_eye";
import MouthShapeChart from "@/components/mouthChart";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function Home() {
  const [user, setUser] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [infoData, setInfoData] = useState([]);
  const [activeTab, setActiveTab] = useState("distance");
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  const pathname = usePathname();
  // Load user and fetch analysis data
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      axios
       .get("/api/analysis/latest", { params: { email: u.email } })
       .then(({ data }) => {
         setGraphData(data.graphData || []);
         setInfoData(data.infoData  || []);
       })
       .catch((err) => {
         if (err.response?.status === 404) {
           // 아직 분석 기록이 없는 경우
           console.warn("분석 데이터가 없습니다:", u.email);
           setGraphData([]);
           setInfoData([]);
         } else {
           console.error("분석 데이터 로드 실패:", err);
          }
                });
              }
            }, []);

   // 2) 상단 공지사항 로드 (최신 2건)
   useEffect(() => {
    axios
      .get("/api/notices?limit=2")
      .then(({ data }) => setNotices(data))
      .catch((err) => console.error("공지사항 불러오기 실패:", err));
  }, []);
   // Stop any active camera streams when returning to home
   useEffect(() => {
    if (pathname === "/") {
      const videos = document.querySelectorAll("video");
      videos.forEach(video => {
        const stream = video.srcObject;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      });
    }
  }, [pathname]);


  // Compute summary for mouth opening
  const summary = infoData.length
    ? {
        maxH: Math.max(...infoData.map((d) => d.maxHeight)),
        minH: Math.min(...infoData.map((d) => d.minHeight)),
        maxW: Math.max(...infoData.map((d) => d.maxWidth)),
        minW: Math.min(...infoData.map((d) => d.minWidth)),
      }
    : null;

  const mouthOpening = summary ? (summary.maxH - summary.minH) * 10 : 0;
  const progressPct = summary ? (mouthOpening / 35) * 100 : 0;

  // Prepare data for chin-nose coordinate chart
  const allX = [], allY = [];
  graphData.forEach((item) => {
    allX.push(item.chinTipX, item.noseTipX);
    allY.push(item.chinTipY, item.noseTipY);
  });
  const xMin = allX.length ? Math.min(...allX) : 0;
  const xMax = allX.length ? Math.max(...allX) : 100;
  const yMin = allY.length ? Math.min(...allY) : 0;
  const yMax = allY.length ? Math.max(...allY) : 100;
  const xMargin = (xMax - xMin) * 0.5;
  const yMargin = (yMax - yMin) * 0.5;

  const coordinatesOption = {
    title: { text: "턱-코 좌표 연결", left: "center" },
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.seriesName}<br/>X: ${params.value[0].toFixed(1)} px<br/>Y: ${params.value[1].toFixed(1)} px`,
    },
    legend: { data: ["Chin Tip", "Nose Tip"], bottom: 0 },
    xAxis: { type: "value", name: "X (px)", min: xMin - xMargin, max: xMax + xMargin },
    yAxis: { type: "value", name: "Y (px)", min: yMin - yMargin, max: yMax + yMargin },
    series: [
      { name: "Chin Tip", type: "scatter", data: graphData.map((i) => [i.chinTipX, i.chinTipY]), symbolSize: 8 },
      { name: "Nose Tip", type: "scatter", data: graphData.map((i) => [i.noseTipX, i.noseTipY]), symbolSize: 8 },
      ...graphData.map((it) => ({
        name: `Round ${it.round}`,
        type: "line",
        data: [ [it.chinTipX, it.chinTipY], [it.noseTipX, it.noseTipY] ],
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


  return (
    <div className="min-h-screen flex flex-col">
    {/* ───── 상단 공지사항 배너 ───── */}
    {notices.length > 0 && (
      <div className="bg-yellow-50 text-yellow-800 px-4 py-2 flex justify-between items-center border-b border-yellow-300">
        <span className="truncate">{notices[0].title}</span>
        <Link href="/notices" className="text-blue-600 hover:underline">
          전체 보기
        </Link>
      </div>
    )}

      {/* Header */}
      <header className="border-b bg-blue-100">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <h1 className="text-2xl font-bold text-blue-700">Good-Jaw</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" placeholder="검색..." className="w-full rounded-md border border-input pl-8 pr-2 py-2 text-sm" />
            </div>
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><MessageSquare className="h-5 w-5" /></Button>
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar><AvatarImage src="/placeholder.svg" alt={user.name} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
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

      {/* Main Content */}
      <main className="container mx-auto flex-1 py-6 px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>나의 턱 평가</CardTitle><CardDescription>동작분석을 시작해보세요.</CardDescription></CardHeader>
              <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  if (!user?.noseLength) {
                    // 코 길이 정보 없으면 먼저 측정 페이지로
                    router.push("/BaseNose");
                  } else {
                    // 이미 측정된 경우 바로 평가 페이지로
                    console.log("코 길이:", user.noseLength);
                    router.push(
                      {
                        pathname: "/mediapipe-measurement", 
                        query: { baseNoseLengthCM: user.noseLength }
                      });
                  }
                }}
              >
                평가 시작
              </Button>
            </CardFooter>
            </Card>
            <Card>
              <CardHeader><CardTitle>운동 게시판 미리보기</CardTitle><CardDescription>유용한 운동 정보를 확인하세요.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex justify-between">
                    <span className="truncate w-3/4">{post.title}</span>
                    <Link href={`/post/${post.id}`} className="text-blue-500 text-sm">보기</Link>
                  </div>
                ))}
              </CardContent>
              <CardFooter><Link href="/post"><Button variant="outline" className="w-full">게시판 전체 보기</Button></Link></CardFooter>
            </Card>

            {/* Analysis Tabs */}
            {user && (
              <>
                {graphData.length > 0 ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <Card>
                      <CardHeader>
                        <CardTitle>분석 결과</CardTitle>
                        <CardDescription>
                          원하는 그래프를 선택하세요.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-64 relative overflow-hidden">
                        <TabsContent value="distance" className="h-full">
                          <MouthOpeningChart
                            current={Math.round(mouthOpening)}
                            normal={35}
                          />
                        </TabsContent>
                        <TabsContent value="deviation" className="h-full">
                          <FaceMovementChart rawData={graphData} />
                        </TabsContent>
                        <TabsContent value="coordinates" className="h-full">
                          <ReactECharts
                            option={coordinatesOption}
                            style={{ height: "100%" }}
                          />
                        </TabsContent>
                        <TabsContent value="eyesMouth" className="h-full">
                          <FaceMovementExtendedChart rawData={graphData} />
                        </TabsContent>
                        <TabsContent value="mouthShape" className="h-full">
                       <MouthShapeChart rawData={graphData} />
                      </TabsContent>
                      </CardContent>
                      <CardFooter>
                      <TabsList className="grid grid-cols-5 w-full">
                          <TabsTrigger value="distance">거리</TabsTrigger>
                          <TabsTrigger value="deviation">이동</TabsTrigger>
                          <TabsTrigger value="coordinates">좌표</TabsTrigger>
                          <TabsTrigger value="eyesMouth">눈 좌표 포함</TabsTrigger>
                          <TabsTrigger value="mouthShape">입 모양</TabsTrigger>
                        </TabsList>
                      </CardFooter>
                    </Card>
                  </Tabs>
                ) : (
                  <Card>
                    <CardContent className="text-center py-16">
                      아직 분석 결과가 없습니다. Please press 평가 시작 Button<br />
                      {/* <Button
                        onClick={() => router.push("/mediapipe-measurement")}
                        className="mt-4"
                      >
                        평가 진행하기
                      </Button> */}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>빠른 이동</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
              <Link href="/survey"><Button variant="outline" className="justify-start w-full"><User className="mr-2 h-4 w-4"/>턱 설문</Button></Link>
                {/* <Link href="/mediapipe-measurement"><Button variant="outline" className="justify-start w-full"><User className="mr-2 h-4 w-4"/>턱 평가</Button></Link> */}
                <Link href="/post"><Button variant="outline" className="justify-start w-full"><MessageSquare className="mr-2 h-4 w-4"/>게시판</Button></Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>마이페이지</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {user ? (
                  <> <p className="text-sm">이름: {user.name}</p><p className="text-sm">이메일: {user.email}</p><p className="text-sm">등급: 일반 회원</p> </>
                ) : (
                  <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>내 코 길이</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {user && user.noseLength ? (
                  <> <p className="text-sm">측정된 코 길이: {user.noseLength} cm</p><Link href="/BaseNose"><Button variant="outline" className="w-full">코 길이 수정하기</Button></Link> </>
                ) : (
                  <> <p className="text-sm">코 길이를 먼저 측정해주세요. 불균형 측정을 위해 필요한 정보입니다.</p><Link href="/BaseNose"><Button variant="default" className="w-full">코 길이 측정하기</Button></Link> </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
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
