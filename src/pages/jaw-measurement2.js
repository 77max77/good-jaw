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
import { excelExport } from '@/utils';

// Utility functions
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

  // 3 sets of measurements (closed + open = 1 set, so 6 rounds total)
  const maxRound = 6;

  // 이미지 미리 로드
  useEffect(() => {
    const img = new Image();
    img.src = '/images/faceline.png';
    img.onload = () => console.log('Image preloaded');
    img.onerror = () => console.error('Image preload failed');
  }, []);

  // Mediapipe 모델 및 FaceLandmarker 설정
  useEffect(() => {
    async function setupFaceLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        console.log('Vision tasks resolved');
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/face_landmarker.task',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });
        console.log('FaceLandmarker loaded');
        setModelsLoaded(true);
        startVideo();
      } catch (err) {
        console.error('FaceLandmarker setup error:', err);
      }
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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          detectFace();
        };
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
        if (measurementRoundRef.current > 0 && measurementRoundRef.current <= maxRound) {
          recordMeasurement(landmarks);
        }
      } else if (centerLineCanvasRef.current) {
        const renderedWidth = videoRef.current.clientWidth;
        const renderedHeight = videoRef.current.clientHeight;
        centerLineCanvasRef.current.width = renderedWidth;
        centerLineCanvasRef.current.height = renderedHeight;
        drawCenterLine(centerLineCanvasRef.current, renderedWidth, renderedHeight);
      }
    }
    requestAnimationFrame(detectFace);
  };

  // 렌더링된 비디오 크기를 기준으로, 스케일과 오프셋을 계산한 후에
  // 특정 얼굴 랜드마크와 중앙선을 캔버스에 그리는 함수
  const drawResults = (landmarks) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const renderedWidth = videoRef.current.clientWidth;
    const renderedHeight = videoRef.current.clientHeight;
    console.log('Rendered size:', renderedWidth, renderedHeight);
    
    const intrinsicWidth = videoRef.current.videoWidth;
    const intrinsicHeight = videoRef.current.videoHeight;
    
    const scaleX = renderedWidth / intrinsicWidth;
    const scaleY = renderedHeight / intrinsicHeight;
    const scale = Math.max(scaleX, scaleY);
    
    const displayedVideoWidth = intrinsicWidth * scale;
    const displayedVideoHeight = intrinsicHeight * scale;
    
    const offsetX = (displayedVideoWidth - renderedWidth) / 2;
    const offsetY = (displayedVideoHeight - renderedHeight) / 2;
    
    canvasRef.current.width = renderedWidth;
    canvasRef.current.height = renderedHeight;
    
    if (centerLineCanvasRef.current) {
      centerLineCanvasRef.current.width = renderedWidth;
      centerLineCanvasRef.current.height = renderedHeight;
      console.log('Drawing center line and guide...');
      drawCenterLine(centerLineCanvasRef.current, renderedWidth, renderedHeight);
    }
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, renderedWidth, renderedHeight);

    // Specific landmark indices with corresponding colors
    const pointsWithColors = [

      { index: 6, color: 'blue' },     // Nose bridge
      { index: 1, color: 'green' },    // Nose tip
      { index: 152, color: 'purple' }, // Chin tip
      { index: 234, color: 'red' },    // Left jaw start
      { index: 454, color: 'red' }     // Right jaw start
    ];

    pointsWithColors.forEach(({ index, color }) => {
      if (landmarks[index]) {
        const landmark = landmarks[index];
        const xIntrinsic = landmark.x * intrinsicWidth;
        const yIntrinsic = landmark.y * intrinsicHeight;
        const xScaled = xIntrinsic * scale - offsetX;
        const yScaled = yIntrinsic * scale - offsetY;
        
        ctx.beginPath();
        ctx.arc(xScaled, yScaled, 3, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    });
  };

  // 캔버스에 중앙선과 얼굴 윤곽 이미지 그리기
  const drawCenterLine = (canvas, width, height) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    const guideImage = new Image();
    guideImage.src = '/images/faceline.png';
    const drawImage = () => {
      ctx.drawImage(
        guideImage,
        width / 2 - width * 0.2, // 중앙 정렬 (x)
        height / 2 - height * 0.45, // 중앙 정렬 (y)
        width * 0.4, // 이미지 너비 (비디오 너비의 30%)
        height * 1 // 이미지 높이 (비디오 높이의 50%)
      );
    };
    if (guideImage.complete) {
      drawImage();
    } else {
      guideImage.onload = drawImage;
      guideImage.onerror = () => {
        console.error('Failed to load image');
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, width * 0.15, height * 0.25, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = 'limegreen';
        ctx.lineWidth = 3;
        ctx.stroke();
      };
    }
  };

  // 측정을 위한 데이터 기록 (내재 해상도를 이용한 측정)
  const recordMeasurement = (landmarks) => {
    if (landmarks.length < 454) return;
    const noseTip = landmarks[1];
    const noseBridge = landmarks[6];
    const chinTip = landmarks[152];
    const leftJaw = landmarks[234];  // Left jaw start
    const rightJaw = landmarks[454]; // Right jaw start

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const noseTipX = noseTip.x * videoWidth;
    const noseTipY = noseTip.y * videoHeight;
    const noseBridgeX = noseBridge.x * videoWidth;
    const noseBridgeY = noseBridge.y * videoHeight;
    const chinTipX = chinTip.x * videoWidth;
    const chinTipY = chinTip.y * videoHeight;
    const leftJawX = leftJaw.x * videoWidth;
    const leftJawY = leftJaw.y * videoHeight;
    const rightJawX = rightJaw.x * videoWidth;
    const rightJawY = rightJaw.y * videoHeight;

    const baseNoseLengthPX = distanceTwoPoints(noseTipX, noseTipY, noseBridgeX, noseBridgeY);
    const noseToChinPX = distanceTwoPoints(noseTipX, noseTipY, chinTipX, chinTipY);
    const jawWidthPX = distanceTwoPoints(leftJawX, leftJawY, rightJawX, rightJawY);
    const horizontalDiffPX = Math.abs(noseTipX - noseBridgeX);

    const lengthYcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, noseToChinPX);
    const lengthXcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, jawWidthPX);
    const horizontalOffsetCm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, horizontalDiffPX);

    const measurement = {
      round: measurementRoundRef.current,
      mouthState: measurementRoundRef.current % 2 === 1 ? 'closed' : 'open',
      baseNoseLengthCM: baseNoseLengthCm,
      baseNoseLengthPX: baseNoseLengthPX,
      lengthXcm,
      lengthYcm,
      horizontalOffsetCm,
      chinTipX,
      chinTipY,
      noseTipX,
      noseTipY,
      noseBridgeX,
      noseBridgeY,
      leftJawX,  // Added left jaw start X
      leftJawY,  // Added left jaw start Y
      rightJawX, // Added right jaw start X
      rightJawY  // Added right jaw start Y
    };

    if (dataArray.some(data => data.round === measurementRoundRef.current)) return;
    setDataArray(prev => [...prev, measurement]);
  };

  // 측정 버튼 클릭 시 동작 (입닫기, 입열기)
  const onMeasure = (actionType) => {
    if (!latestLandmarksRef.current) return;
    if (isInitial) setIsInitial(false);

    if (actionType === 'close') {
      setIsOpenEnabled(true);
    } else if (actionType === 'open') {
      setIsOpenEnabled(false);
      // Calculate results after the open measurement (end of a set)
      calculateResults();
    }

    if (measurementRound < maxRound) {
      const nextRound = measurementRound + 1;
      measurementRoundRef.current = nextRound;
      setMeasurementRound(nextRound);
      recordMeasurement(latestLandmarksRef.current);
    }
  };

  // 두 번의 측정(입닫기/입열기 한 쌍)에 대해 결과 요약 계산
  const calculateResults = () => {
    const currentRound = measurementRoundRef.current;
    // Find the closed and open measurements for the current set
    const closedMeasurement = dataArray.find(data => data.round === currentRound - 1);
    const openMeasurement = dataArray.find(data => data.round === currentRound);
    
    if (!closedMeasurement || !openMeasurement) return;

    const summary = {
      round: Math.ceil(currentRound / 2),
      maxWidth: Math.max(closedMeasurement.lengthXcm, openMeasurement.lengthXcm),
      maxHeight: Math.max(closedMeasurement.lengthYcm, openMeasurement.lengthYcm),
      minWidth: Math.min(closedMeasurement.lengthXcm, openMeasurement.lengthXcm),
      minHeight: Math.min(closedMeasurement.lengthYcm, openMeasurement.lengthYcm),
    };
    
    setSummaryData(prev => [...prev, summary]);
    setResultText(prev => [
      ...prev,
      `#${Math.ceil(currentRound / 2)} 최대 높이: ${summary.maxHeight.toFixed(2)} cm / 최대 너비: ${summary.maxWidth.toFixed(2)} cm`
    ]);
  };

  // 상태 초기화
  const handleReset = () => {
    setResultText([]);
    setIsInitial(true);
    setMeasurementRound(0);
    setIsOpenEnabled(false);
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
    ? "얼굴을 중앙의 가이드에 맞춰주세요."
    : measurementRound < maxRound
      ? isOpenEnabled
        ? `${Math.ceil(measurementRound / 2)} 번째: 입을 열고 측정 버튼을 눌러주세요.`
        : `${Math.ceil(measurementRound / 2)} 번째: 입을 닫고 측정 버튼을 눌러주세요.`
      : '완료 되었습니다. Next 버튼을 눌러주세요.';

  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/40 p-4 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">{headerText}</CardTitle>
          <CardDescription>입을 열고 닫으면서 3세트 측정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!modelsLoaded ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>모델을 불러오는 중입니다...</p>
            </div>
          ) : (
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
              <canvas ref={centerLineCanvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }} />
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