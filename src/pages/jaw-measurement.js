import axios from 'axios';
import dynamic from 'next/dynamic';
import * as faceapi from 'face-api.js';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { distanceTwoPoints, pxtocm } from '../utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Camera, AlertCircle } from "lucide-react";
import { maxRound } from '@/utils/constants';
import { excelExport } from '@/utils';

function FaceDetection() {
  const router = useRouter();
  const { baseNoseLengthCM: queryBaseNoseLengthCM } = router.query;
  const baseNoseLengthCm = queryBaseNoseLengthCM ? Number(queryBaseNoseLengthCM) : 7;

  // Refs for video and canvases
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const centerLineCanvasRef = useRef(null);
  const measurementRoundRef = useRef(0);

  // State variables
  const [resultText, setResultText] = useState([]);
  const [isInitial, setIsInitial] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isOpenEnabled, setIsOpenEnabled] = useState(false);
  const [measurementRound, setMeasurementRound] = useState(0);
  const [dataArray, setDataArray] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  // 헤더에 표시할 텍스트 (두 번째 코드의 로직)
  const headerText = isInitial
    ? "얼굴을 중앙선에 맞춰주세요."
    : measurementRound < maxRound
      ? isOpenEnabled
        ? `${Math.ceil(measurementRound / 2)} 번째: 측정(Open) 버튼을 눌러주세요.`
        : `${Math.ceil(measurementRound / 2)} 번째: 측정(Close) 버튼을 눌러주세요.`
      : '완료 되었습니다. Next 버튼을 눌러주세요.';

  // 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('모델 로드 중 오류 발생:', err);
      }
    };

    if (typeof window !== 'undefined') {
      loadModels();
    }
  }, []);

  // 모델이 로드되면 비디오 시작
  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);

  // 비디오 스트림 시작 (두 번째 코드 기능)
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error(err));
  };

  // 비디오 스트림 정지
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // 중앙선 그리기 (두 번째 코드)
  const drawCenterLine = (canvas, videoWidth, videoHeight) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(videoWidth / 2, 0);
    ctx.lineTo(videoWidth / 2, videoHeight);
    ctx.stroke();
  };

  // 특정 얼굴 랜드마크(턱끝, 코다리 위, 코끝) 그리기 및 측정값 계산 (두 번째 코드)
  const drawSpecificLandmarks = (canvas, landmarks) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const specificPoints = [
      { index: 8, color: '#FF0000' },    // 턱끝
      { index: 27, color: '#00FF00' },   // 코다리 위
      { index: 30, color: '#0000FF' }    // 코끝
    ];

    specificPoints.forEach(point => {
      const landmark = landmarks.positions[point.index];
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(landmark.x, landmark.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 두 점 사이의 거리 계산 및 cm 변환
    const twoPointsDistancePX = distanceTwoPoints(
      landmarks.positions[30].x, landmarks.positions[30].y,
      landmarks.positions[8].x, landmarks.positions[8].y
    );
    const baseNoseLengthPX = distanceTwoPoints(
      landmarks.positions[30].x, landmarks.positions[30].y,
      landmarks.positions[27].x, landmarks.positions[27].y
    );
    const lengthYcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, twoPointsDistancePX);
    const lengthXcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, landmarks.positions[30].x - landmarks.positions[27].x);

    if (measurementRoundRef.current > 0 && measurementRoundRef.current <= maxRound) {
      const getData = {
        round: measurementRoundRef.current,
        mouthState: measurementRoundRef.current % 2 === 1 ? 'closed' : 'open', // 추가: 입 상태
        baseNoseLengthCM: baseNoseLengthCm,
        baseNoseLengthPX: baseNoseLengthPX,
        lengthXcm: lengthXcm,
        lengthYcm: lengthYcm,
        chinTipX: landmarks.positions[8].x,
        chinTipY: landmarks.positions[8].y,
        noseTipX: landmarks.positions[30].x,
        noseTipY: landmarks.positions[30].y,
        noseBridgeTopX: landmarks.positions[27].x,
        noseBridgeTopY: landmarks.positions[27].y,
      };      
      setDataArray(prev => [...prev, getData]);
    }
  };

  // 비디오 재생 시 얼굴 인식 및 캔버스 그리기 (두 번째 코드)
  const handleVideoPlay = () => {
    if (canvasRef.current && videoRef.current && centerLineCanvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const centerLineCanvas = centerLineCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      centerLineCanvas.width = video.videoWidth;
      centerLineCanvas.height = video.videoHeight;

      drawCenterLine(centerLineCanvas, video.videoWidth, video.videoHeight);

      const intervalId = setInterval(async () => {
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.SsdMobilenetv1Options({
            scoreThreshold: 0.9,
            inputSize: 416,
            scaleFactor: 0.8
          })
        ).withFaceLandmarks();
        if (!detection) return;
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        drawSpecificLandmarks(canvas, resizedDetection.landmarks);
      }, 300);

      return () => clearInterval(intervalId);
    }
  };

  // Open/Close 측정 버튼 동작 (두 번째 코드)
  const onMeasure = (actionType) => {
    if (isInitial) setIsInitial(false);
    if (actionType === "close") {
      if (measurementRound !== 0 && measurementRound % 2 === 0) {
        calculateResults();
      }
      setIsOpenEnabled(true);
    } else if (actionType === "open") {
      setIsOpenEnabled(false);
    }

    if (measurementRound < maxRound) {
      const nextRound = measurementRound + 1;
      measurementRoundRef.current = nextRound;
      setMeasurementRound(nextRound);
    }
  };

  // 측정 결과 계산 (두 번째 코드)
  const calculateResults = () => {
    let maxX = -Infinity, maxY = -Infinity, minX = Infinity, minY = Infinity;
    dataArray.forEach((data) => {
      if (data.round === measurementRoundRef.current) {
        maxX = Math.max(maxX, data.lengthXcm);
        maxY = Math.max(maxY, data.lengthYcm);
        minX = Math.min(minX, data.lengthXcm);
        minY = Math.min(minY, data.lengthYcm);
      }
    });
    const getSummaryData = {
      round: Math.ceil(measurementRoundRef.current / 2),
      maxWidth: maxX,
      maxHeight: maxY,
      minWidth: minX,
      minHeight: minY
    };
    setSummaryData(prev => [...prev, getSummaryData]);
    setResultText(prev => [
      ...prev,
      `#${Math.ceil(measurementRoundRef.current / 2)} 최대 높이: ${maxY.toFixed(2)} cm / 최대 너비: ${maxX.toFixed(2)} cm
      최소 높이: ${minY.toFixed(2)} cm / 최소 너비: ${minX.toFixed(2)} cm
      차이 높이: ${(maxY - minY).toFixed(2)} cm / 차이 너비: ${(maxX - minX).toFixed(2)} cm`
    ]);
  };

  // 상태 초기화
  const handleReset = () => {
    setResultText([]);
    setIsInitial(true);
    setMeasurementRound(0);
    measurementRoundRef.current = 0;
    setDataArray([]);
    setSummaryData([]);
  };

  // DB 저장 후 다음 페이지 이동 (두 번째 코드)
  const saveDataDB = async () => {
    try {
      const response = await axios.post('/api/rawDataSaveDB', {
        rawData: dataArray,
        summaryData: summaryData
      });
      const savedId = response.data.id;
      return savedId;
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleSubmit = async () => {
    stopVideo();
    const objectId = await saveDataDB();
    localStorage.setItem('graphData', JSON.stringify(dataArray));
    localStorage.setItem('maxXY', JSON.stringify(summaryData));
    router.push({
      pathname: '/analysis-results',
      query: { objectId }
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/40 p-4 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">
            {headerText}
          </CardTitle>
          <CardDescription>
            입을 열고 닫으면서 측정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!modelsLoaded ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>모델을 불러오는 중입니다...</p>
            </div>
          ) : (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                onPlay={handleVideoPlay}
              />
              <canvas
                ref={centerLineCanvasRef}
                className="absolute inset-0 w-full h-full"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
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
        {measurementRound < maxRound ? (
          <>
            <Button
              onClick={() => onMeasure("close")}
              disabled={isOpenEnabled}  // 변경: isOpenEnabled가 true이면 비활성화
              className="gap-2"
            >
              입닫고 측정
            </Button>
            <Button
              onClick={() => onMeasure("open")}
              disabled={!isOpenEnabled}  // 변경: isOpenEnabled가 false이면 비활성화
              className="gap-2"
            >
              입열고 측정
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleSubmit} className="gap-2">
              Next
            </Button>
            <Button onClick={() => excelExport({ jsonData: dataArray, maxXY: summaryData })} className="gap-2">
              Donwload
            </Button>
          </>
        )}
        <Button onClick={handleReset} variant="secondary" className="gap-2">
          Reset
        </Button>
      </CardFooter>
      </Card>
    </div>
  );
}

export default dynamic(() => Promise.resolve(FaceDetection), { ssr: false });
