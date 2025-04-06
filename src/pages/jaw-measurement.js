"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import * as faceapi from "face-api.js"
import axios from "axios"
import { useRouter } from "next/router"
import { distanceTwoPoints, pxtocm } from "../utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { RefreshCw, Camera, AlertCircle } from "lucide-react"

// 최대 측정 라운드 수 (예: 입열고/닫고 4회)
const MAX_ROUND = 4

function IntegratedFaceMeasurementPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const centerLineCanvasRef = useRef(null)
  const measurementRoundRef = useRef(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [resultText, setResultText] = useState([])
  const [isInitial, setIsInitial] = useState(true)
  // isOpenEnabled: open/close 버튼 토글을 위해 open 상태면 true, 닫힌 상태면 false
  const [isOpenEnabled, setIsOpenEnabled] = useState(false)
  const [measurementRound, setMeasurementRound] = useState(0)
  const [dataArray, setDataArray] = useState([])
  const [summaryData, setSummaryData] = useState([])

  const router = useRouter()
  const baseNoseLengthCm = 7 // 기준 코 길이(cm)

  // 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models")
        ])
        setModelsLoaded(true)
      } catch (err) {
        console.error("모델 로드 실패:", err)
        setErrorMessage("모델을 불러오는 데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    loadModels()
  }, [])

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("카메라 접근 오류:", error)
      setErrorMessage("카메라 권한이 필요합니다.")
    }
  }

  // 카메라 정지
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  // 중앙선 그리기
  const drawCenterLine = (canvas, width, height) => {
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "rgba(0, 255, 255, 0.5)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()
  }

  // 현재 비디오 프레임에서 얼굴 landmark를 측정하여 결과를 리턴
  const captureMeasurement = async () => {
    setErrorMessage("")
    if (!videoRef.current || !canvasRef.current || !centerLineCanvasRef.current || !modelsLoaded)
      return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const centerLineCanvas = centerLineCanvasRef.current

    // canvas 크기 설정 및 중앙선 그리기
    canvas.width = video.width
    canvas.height = video.height
    centerLineCanvas.width = video.width
    centerLineCanvas.height = video.height
    drawCenterLine(centerLineCanvas, video.width, video.height)

    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    // 얼굴 검출 및 landmark 측정
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ scoreThreshold: 0.9, inputSize: 416 }))
      .withFaceLandmarks()

    if (!detection) {
      setErrorMessage("얼굴을 감지하지 못했습니다. 정면을 바라봐 주세요.")
      return null
    }

    const resized = faceapi.resizeResults(detection, displaySize)
    const landmarks = resized.landmarks
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 주요 포인트: 턱(8), 코끝(30), 코 윗부분(27)
    const chin = landmarks.positions[8]
    const noseTip = landmarks.positions[30]
    const noseTop = landmarks.positions[27]

    // 포인트 표시
    ctx.fillStyle = "red"
    ctx.beginPath()
    ctx.arc(chin.x, chin.y, 4, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "blue"
    ctx.beginPath()
    ctx.arc(noseTip.x, noseTip.y, 4, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "green"
    ctx.beginPath()
    ctx.arc(noseTop.x, noseTop.y, 4, 0, 2 * Math.PI)
    ctx.fill()

    // 거리 측정: 코 윗부분과 코끝의 거리 기준
    const basePX = distanceTwoPoints(noseTip.x, noseTip.y, noseTop.x, noseTop.y)
    const height = distanceTwoPoints(noseTip.x, noseTip.y, chin.x, chin.y)
    const width = Math.abs(noseTip.x - chin.x)
    const heightCm = pxtocm(baseNoseLengthCm, basePX, height)
    const widthCm = pxtocm(baseNoseLengthCm, basePX, width)

    return { heightCm, widthCm, basePX, chin, noseTip, noseTop }
  }

  // open/close 측정 버튼 클릭 시 호출 – 현재 프레임에서 측정하고 데이터 저장
  const onMeasure = async (actionType) => {
    // actionType: "open" (입열고) 또는 "close" (입닫고)
    if (isInitial) setIsInitial(false)
    const measurement = await captureMeasurement()
    if (!measurement) return

    const { heightCm, widthCm, basePX, chin, noseTip, noseTop } = measurement

    // 측정 라운드 증가
    const currentRound = measurementRoundRef.current + 1
    measurementRoundRef.current = currentRound
    setMeasurementRound(currentRound)

    // 측정 데이터 객체 생성 (추후 DB 전송 및 차이 계산에 활용)
    const measurementData = {
      round: currentRound,
      baseNoseLengthCM: baseNoseLengthCm,
      baseNoseLengthPX: basePX,
      heightCm,
      widthCm,
      chinX: chin.x,
      chinY: chin.y,
      noseTipX: noseTip.x,
      noseTipY: noseTip.y,
      noseTopX: noseTop.x,
      noseTopY: noseTop.y,
      action: actionType
    }
    setDataArray((prev) => [...prev, measurementData])

    // 결과 텍스트 업데이트
    const newText = `#${Math.ceil(currentRound / 2)} - ${actionType === "open" ? "입열고" : "입닫고"} 측정: 높이 ${heightCm.toFixed(
      2
    )}cm, 너비 ${widthCm.toFixed(2)}cm.`
    setResultText((prev) => [...prev, newText])

    // 버튼 토글: 보통 "입열고" 후엔 "입닫고"로 진행
    setIsOpenEnabled(actionType === "open")
  }

  // (옵션) 모든 측정 데이터를 기반으로 결과 요약 계산
  const calculateResults = () => {
    let maxWidth = -Infinity,
      maxHeight = -Infinity,
      minWidth = Infinity,
      minHeight = Infinity

    dataArray.forEach((data) => {
      if (data.widthCm > maxWidth) maxWidth = data.widthCm
      if (data.heightCm > maxHeight) maxHeight = data.heightCm
      if (data.widthCm < minWidth) minWidth = data.widthCm
      if (data.heightCm < minHeight) minHeight = data.heightCm
    })

    const summary = { maxWidth, maxHeight, minWidth, minHeight }
    setSummaryData((prev) => [...prev, summary])
    setResultText((prev) => [
      ...prev,
      `측정 결과: 최대 높이 ${maxHeight.toFixed(2)}cm, 최소 높이 ${minHeight.toFixed(
        2
      )}cm, 최대 너비 ${maxWidth.toFixed(2)}cm, 최소 너비 ${minWidth.toFixed(2)}cm.`
    ])
  }

  // 리셋: 모든 상태 초기화
  const handleReset = () => {
    setResultText([])
    setIsInitial(true)
    setMeasurementRound(0)
    measurementRoundRef.current = 0
    setDataArray([])
    setSummaryData([])
  }

  // 데이터 전송 후 다음 페이지 이동 (DB 저장 API 호출)
  const handleSubmit = async () => {
    stopCamera()
    try {
      const response = await axios.post("/api/rawDataSaveDB", {
        rawData: dataArray,
        summaryData: summaryData
      })
      const savedId = response.data.id
      router.push({
        pathname: "/EvaluateAnalysisResultPage",
        query: { objectId: savedId }
      })
    } catch (error) {
      console.error("데이터 전송 실패:", error)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/40 p-4 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">
            얼굴 거리 측정 (연속 측정)
          </CardTitle>
          <CardDescription>입을 열고 닫으면서 측정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>모델을 불러오는 중입니다...</p>
            </div>
          ) : (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                width="640"
                height="480"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={centerLineCanvasRef}
                className="absolute inset-0 w-full h-full"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                  <Camera className="h-12 w-12 mb-4" />
                  <p className="text-center px-4">카메라 사용을 허용해 주세요</p>
                </div>
              )}
            </div>
          )}
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
          {resultText.length > 0 && (
            <div className="bg-muted p-4 rounded-lg text-sm">
              {resultText.map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 justify-center">
          {!isCameraActive ? (
            <Button onClick={startCamera} disabled={isLoading} className="gap-2">
              <Camera className="h-4 w-4" /> 카메라 시작하기
            </Button>
          ) : (
            <>
              {measurementRound < MAX_ROUND ? (
                <>
                  <Button
                    onClick={() => onMeasure("close")}
                    className="gap-2"
                    disabled={isOpenEnabled}
                  >
                    입닫고 측정
                  </Button>
                  <Button
                    onClick={() => onMeasure("open")}
                    className="gap-2"
                    disabled={!isOpenEnabled}
                  >
                    입열고 측정
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSubmit} className="gap-2">
                    Next
                  </Button>
                  {/* 필요에 따라 excel export 버튼도 추가 가능 */}
                </>
              )}
              <Button onClick={handleReset} variant="secondary" className="gap-2">
                Reset
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>측정 결과는 참고용입니다. 정확한 판단은 전문가의 조언을 받으세요.</p>
      </div>
    </div>
  )
}

export default dynamic(
  () => Promise.resolve(IntegratedFaceMeasurementPage),
  { ssr: false }
)
