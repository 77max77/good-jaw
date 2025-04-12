// pages/face-measurement.js
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { maxRound } from '@/utils/constants';
import { excelExport } from '@/utils';

// 만약 ../utils 에서 distanceTwoPoints, pxtocm를 제공한다면 import하고,
// 없다면 아래와 같이 내부에서 정의할 수 있습니다.
const distanceTwoPoints = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const pxtocm = (baseCM, basePX, measuredPX) => (measuredPX / basePX) * baseCM;

function FaceMeasurement() {
  const router = useRouter();
  const { baseNoseLengthCM: queryBaseNoseLengthCM } = router.query;
  const baseNoseLengthCm = queryBaseNoseLengthCM ? Number(queryBaseNoseLengthCM) : 7;

  // 좌우 반전 상태 추가
  const [isMirrored, setIsMirrored] = useState(false);

  // video 및 canvas 관련 ref들
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const centerLineCanvasRef = useRef(null);
  // 최신 얼굴 랜드마크를 저장할 ref
  const latestLandmarksRef = useRef(null);
  // MediaPipe FaceLandmarker 인스턴스를 저장할 ref
  const faceLandmarkerRef = useRef(null);

  // 상태 변수들
  const [isInitial, setIsInitial] = useState(true);
  const [measurementRound, setMeasurementRound] = useState(0);
  const measurementRoundRef = useRef(0);
  const [resultText, setResultText] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isOpenEnabled, setIsOpenEnabled] = useState(false);
  const [dataArray, setDataArray] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  // Mediapipe 모델 및 FaceLandmarker 설정
  useEffect(() => {
    async function setupFaceLandmarker() {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/face_landmarker.task',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });
      setModelsLoaded(true);
      startVideo();
    }
    setupFaceLandmarker();
  }, []);

  // 비디오 스트림 시작
  const startVideo = async () => {
    try {
      const constraints = { audio: false, video: { facingMode: 'user' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        detectFace();
      }
    } catch (err) {
      console.error('비디오 시작 중 오류 발생:', err);
    }
  };

  // requestAnimationFrame을 이용한 얼굴 탐지 루프
  const detectFace = async () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const currentTime = Date.now();
      const results = await faceLandmarkerRef.current.detectForVideo(videoRef.current, currentTime);
      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        latestLandmarksRef.current = landmarks;
        drawResults(landmarks);
        // 측정 중이면 (최대 측정 횟수 미만) 해당 프레임의 값도 저장
        if (measurementRoundRef.current > 0 && measurementRoundRef.current <= maxRound) {
          recordMeasurement(landmarks);
        }
      }
    }
    requestAnimationFrame(detectFace);
  };

  // 렌더링된 비디오 크기를 기준으로, 스케일과 오프셋을 계산한 후에
  // 얼굴 랜드마크와 중앙선을 캔버스에 그리는 함수
  const drawResults = (landmarks) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    // rendered(실제 화면에 표시되는) 크기 구하기
    const renderedWidth = videoRef.current.clientWidth;
    const renderedHeight = videoRef.current.clientHeight;
    
    // 비디오의 intrinsic(실제) 해상도
    const intrinsicWidth = videoRef.current.videoWidth;
    const intrinsicHeight = videoRef.current.videoHeight;
    
    // 가로, 세로에 대한 스케일 계산
    const scaleX = renderedWidth / intrinsicWidth;
    const scaleY = renderedHeight / intrinsicHeight;
    // object-cover인 경우, 더 큰 스케일이 적용되어 크롭됩니다.
    const scale = Math.max(scaleX, scaleY);
    
    // 스케일 후 실제 비디오 표시 크기 계산
    const displayedVideoWidth = intrinsicWidth * scale;
    const displayedVideoHeight = intrinsicHeight * scale;
    
    // 크롭(offset) 값 계산: 초과되는 부분은 양쪽(혹은 상하)에서 동일하게 잘려 나갑니다.
    const offsetX = (displayedVideoWidth - renderedWidth) / 2;
    const offsetY = (displayedVideoHeight - renderedHeight) / 2;
    
    // 캔버스 크기를 실제 표시되는 크기에 맞춤
    canvasRef.current.width = renderedWidth;
    canvasRef.current.height = renderedHeight;
    
    if (centerLineCanvasRef.current) {
      centerLineCanvasRef.current.width = renderedWidth;
      centerLineCanvasRef.current.height = renderedHeight;
      drawCenterLine(centerLineCanvasRef.current, renderedWidth, renderedHeight);
    }
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, renderedWidth, renderedHeight);
    
    // 각 랜드마크를 보정된 좌표에 맞춰 그립니다.
    landmarks.forEach((landmark) => {
      const xIntrinsic = landmark.x * intrinsicWidth;
      const yIntrinsic = landmark.y * intrinsicHeight;
      const xScaled = xIntrinsic * scale - offsetX;
      const yScaled = yIntrinsic * scale - offsetY;
      
      ctx.beginPath();
      ctx.arc(xScaled, yScaled, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  };

  // 캔버스에 중앙선 그리기 (보정된 크기로)
  const drawCenterLine = (canvas, width, height) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
  };

  // 측정을 위한 데이터 기록 (내재 해상도를 이용한 측정)
  const recordMeasurement = (landmarks) => {
    if (landmarks.length < 153) return; // 충분한 포인트가 없으면 패스
    const noseTip = landmarks[1];
    const noseBridge = landmarks[6];
    const chinTip = landmarks[152];

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    // 내재 해상도 기준 좌표 (측정은 일관된 방식으로 진행)
    const noseTipX = noseTip.x * videoWidth;
    const noseTipY = noseTip.y * videoHeight;
    const noseBridgeX = noseBridge.x * videoWidth;
    const noseBridgeY = noseBridge.y * videoHeight;
    const chinTipX = chinTip.x * videoWidth;
    const chinTipY = chinTip.y * videoHeight;

    const baseNoseLengthPX = distanceTwoPoints(noseTipX, noseTipY, noseBridgeX, noseBridgeY);
    const noseToChinPX = distanceTwoPoints(noseTipX, noseTipY, chinTipX, chinTipY);
    const horizontalDiffPX = Math.abs(noseTipX - noseBridgeX);

    const lengthYcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, noseToChinPX);
    const lengthXcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, horizontalDiffPX);

    const measurement = {
      round: measurementRoundRef.current,
      // 홀수: 입닫힘, 짝수: 입열림 (예시)
      mouthState: measurementRoundRef.current % 2 === 1 ? 'closed' : 'open',
      baseNoseLengthCM: baseNoseLengthCm,
      baseNoseLengthPX: baseNoseLengthPX,
      lengthXcm,
      lengthYcm,
      chinTipX,
      chinTipY,
      noseTipX,
      noseTipY,
      noseBridgeX,
      noseBridgeY,
    };

    if (dataArray.some(data => data.round === measurementRoundRef.current)) return;
    setDataArray(prev => [...prev, measurement]);
  };

  // 측정 버튼 클릭 시 동작 (입닫기, 입열기)
  const onMeasure = (actionType) => {
    if (!latestLandmarksRef.current) return;
    if (isInitial) setIsInitial(false);

    if (actionType === 'close') {
      if (measurementRound !== 0 && measurementRound % 2 === 0) {
        calculateResults();
      }
      setIsOpenEnabled(true);
    } else if (actionType === 'open') {
      setIsOpenEnabled(false);
    }
    const nextRound = measurementRound + 1;
    measurementRoundRef.current = nextRound;
    setMeasurementRound(nextRound);
    recordMeasurement(latestLandmarksRef.current);
  };

  // 두 번의 측정(입닫기/입열기 한 쌍)에 대해 결과 요약 계산
  const calculateResults = () => {
    const currentRound = measurementRoundRef.current;
    const measurement = dataArray.find(data => data.round === currentRound);
    if (!measurement) return;
    const summary = {
      round: Math.ceil(currentRound / 2),
      maxWidth: measurement.lengthXcm,
      maxHeight: measurement.lengthYcm,
      minWidth: measurement.lengthXcm,
      minHeight: measurement.lengthYcm,
    };
    setSummaryData(prev => [...prev, summary]);
    setResultText(prev => [
      ...prev,
      `#${Math.ceil(currentRound / 2)} 최대 높이: ${measurement.lengthYcm.toFixed(
        2
      )} cm / 최대 너비: ${measurement.lengthXcm.toFixed(2)} cm`
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

  // 비디오 스트림 정지
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // DB 저장 후 다음 페이지로 이동
  const saveDataDB = async () => {
    try {
      const response = await axios.post('/api/rawDataSaveDB', {
        rawData: dataArray,
        summaryData: summaryData
      });
      const savedId = response.data.id;
      return savedId;
    } catch (error) {
      console.error('데이터 저장 중 오류:', error);
      alert('데이터 저장 실패. 다시 시도해주세요.');
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

  // 헤더에 표시할 텍스트
  const headerText = isInitial
    ? "얼굴을 중앙선에 맞춰주세요."
    : measurementRound < maxRound
      ? isOpenEnabled
        ? `${Math.ceil(measurementRound / 2)} 번째: 측정(Open) 버튼을 눌러주세요.`
        : `${Math.ceil(measurementRound / 2)} 번째: 측정(Close) 버튼을 눌러주세요.`
      : '완료 되었습니다. Next 버튼을 눌러주세요.';

  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/40 p-4 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">{headerText}</CardTitle>
          <CardDescription>입을 열고 닫으면서 측정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!modelsLoaded ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>모델을 불러오는 중입니다...</p>
            </div>
          ) : (
            // 비디오와 캔버스를 감싸는 컨테이너에 좌우 반전 스타일 적용
            <div
              className="relative aspect-video bg-black rounded-lg overflow-hidden"
              style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
            >
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={centerLineCanvasRef} className="absolute inset-0 w-full h-full" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
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
                disabled={isOpenEnabled}
                className="gap-2"
              >
                입닫고 측정
              </Button>
              <Button
                onClick={() => onMeasure("open")}
                disabled={!isOpenEnabled}
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
              <Button
                onClick={() => excelExport({ jsonData: dataArray, maxXY: summaryData })}
                className="gap-2"
              >
                Download
              </Button>
            </>
          )}
          {/* 좌우 반전 토글 버튼 */}
          <Button onClick={() => setIsMirrored(prev => !prev)} className="gap-2">
            {isMirrored ? '반전 해제' : '좌우 반전'}
          </Button>
          <Button onClick={handleReset} variant="secondary" className="gap-2">
            Reset
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default dynamic(() => Promise.resolve(FaceMeasurement), { ssr: false });
