import axios from 'axios';
import dynamic from 'next/dynamic';
import * as faceapi from 'face-api.js';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { excelExport } from '@/utils';

// Utility functions
const distanceTwoPoints = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const pxtocm = (baseCM, basePX, measuredPX) => (measuredPX / basePX) * baseCM;

function FaceDetection() {
  const router = useRouter();
  const { baseNoseLengthCM: queryBaseNoseLengthCM } = router.query;
  const baseNoseLengthCm = queryBaseNoseLengthCM ? Number(queryBaseNoseLengthCM) : 7;

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const centerLineCanvasRef = useRef(null);
  const measurementRoundRef = useRef(0);
  const latestLandmarksRef = useRef(null);

  // State
  const [isMirrored, setIsMirrored] = useState(false);
  const [resultText, setResultText] = useState([]);
  const [isInitial, setIsInitial] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isOpenEnabled, setIsOpenEnabled] = useState(false);
  const [measurementRound, setMeasurementRound] = useState(0);
  const [dataArray, setDataArray] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  // 3 sets of measurements (closed + open = 1 set, so 6 rounds total)
  const maxRound = 6;

  // Header text
  const headerText = isInitial
    ? "얼굴을 중앙의 가이드라인에 맞춰주세요."
    : measurementRound < maxRound
      ? isOpenEnabled
        ? `${Math.ceil(measurementRound / 2)} 번째: 입을 열고 측정 버튼을 눌러주세요.`
        : `${Math.ceil(measurementRound / 2)} 번째: 입을 닫고 측정 버튼을 눌러주세요.`
      : '완료 되었습니다. Next 버튼을 눌러주세요.';

  // Load face-api.js models
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

  // Start video stream when models are loaded
  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);

  // Start video stream
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error('startVideo error:', err));
  };

  // Stop video stream
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Draw center line and face guideline image
  const drawCenterLine = (canvas, width, height) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // 중앙 세로선
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // 얼굴 윤곽 이미지 오버레이
    const guideImage = new Image();
    guideImage.src = '/images/faceline.png';
    guideImage.onload = () => {
      ctx.drawImage(
        guideImage,
        width / 2 - width * 0.2,
        height / 2 - height * 0.45,
        width * 0.4,
        height * 1
      );
    };
  };

  // Draw specific landmarks with different colors
  const drawTransformedLandmarks = (canvas, landmarks) => {
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    const intrinsicWidth = video.videoWidth;
    const intrinsicHeight = video.videoHeight;
    const renderedWidth = video.clientWidth;
    const renderedHeight = video.clientHeight;

    // Calculate scale and offset for object-cover
    const scaleX = renderedWidth / intrinsicWidth;
    const scaleY = renderedHeight / intrinsicHeight;
    const scale = Math.max(scaleX, scaleY);
    const displayedWidth = intrinsicWidth * scale;
    const displayedHeight = intrinsicHeight * scale;
    const offsetX = (displayedWidth - renderedWidth) / 2;
    const offsetY = (displayedHeight - renderedHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Specific landmark indices with corresponding colors
    const pointsWithColors = [

      { index: 27, color: 'blue' },   // Nose bridge
      { index: 30, color: 'green' },  // Nose tip
      { index: 8, color: 'yellow' },  // Chin tip
      { index: 3, color: 'red' },     // Left jaw start
      { index: 13, color: 'red' }     // Right jaw start
    ];

    pointsWithColors.forEach(({ index, color }) => {
      const point = landmarks.positions[index];
      const x = point.x * scale - offsetX;
      const y = point.y * scale - offsetY;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    });
  };

  // Handle video play and face detection
  const handleVideoPlay = () => {
    if (!canvasRef.current || !videoRef.current || !centerLineCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const centerLineCanvas = centerLineCanvasRef.current;

    // Set canvas size to rendered video size
    const renderedWidth = video.clientWidth;
    const renderedHeight = video.clientHeight;
    canvas.width = renderedWidth;
    canvas.height = renderedHeight;
    centerLineCanvas.width = renderedWidth;
    centerLineCanvas.height = renderedHeight;

    drawCenterLine(centerLineCanvas, renderedWidth, renderedHeight);

    // Face detection loop
    const detect = async () => {
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.SsdMobilenetv1Options({
            scoreThreshold: 0.9,
            inputSize: 416,
            scaleFactor: 0.8
          })
        )
        .withFaceLandmarks();
      
      if (detection && detection.landmarks) {
        latestLandmarksRef.current = detection.landmarks;
        drawTransformedLandmarks(canvas, detection.landmarks);
        if (measurementRoundRef.current > 0 && measurementRoundRef.current <= maxRound) {
          recordMeasurement(detection.landmarks);
        }
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

  // Record measurement data
  const recordMeasurement = (landmarks) => {
    const noseTip = landmarks.positions[30];
    const noseBridge = landmarks.positions[27];
    const chinTip = landmarks.positions[8];
    const leftJaw = landmarks.positions[3];
    const rightJaw = landmarks.positions[13];

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    const noseTipX = noseTip.x;
    const noseTipY = noseTip.y;
    const noseBridgeX = noseBridge.x;
    const noseBridgeY = noseBridge.y;
    const chinTipX = chinTip.x;
    const chinTipY = chinTip.y;
    const leftJawX = leftJaw.x;
    const rightJawX = rightJaw.x;

    const baseNoseLengthPX = distanceTwoPoints(noseTipX, noseTipY, noseBridgeX, noseBridgeY);
    const noseToChinPX = distanceTwoPoints(noseTipX, noseTipY, chinTipX, chinTipY);
    const jawWidthPX = distanceTwoPoints(leftJawX, noseTipY, rightJawX, noseTipY);
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
      leftJawX,
      rightJawX,
    };

    if (!dataArray.some(data => data.round === measurementRoundRef.current)) {
      setDataArray(prev => [...prev, measurement]);
    }
  };

  // Calculate measurement results after each set (closed + open)
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

  // Handle measurement actions
  const onMeasure = (actionType) => {
    if (!latestLandmarksRef.current) return;
    if (isInitial) setIsInitial(false);

    if (actionType === "close") {
      setIsOpenEnabled(true);
    } else if (actionType === "open") {
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

  // Reset state
  const handleReset = () => {
    setResultText([]);
    setIsInitial(true);
    setMeasurementRound(0);
    setIsOpenEnabled(false);
    measurementRoundRef.current = 0;
    setDataArray([]);
    setSummaryData([]);
  };

  // Save data to DB and navigate
  const saveDataDB = async () => {
    try {
      const response = await axios.post('/api/rawDataSaveDB', {
        rawData: dataArray,
        summaryData: summaryData
      });
      return response.data.id;
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
                onPlay={handleVideoPlay}
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

export default dynamic(() => Promise.resolve(FaceDetection), { ssr: false });