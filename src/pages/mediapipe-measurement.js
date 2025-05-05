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

  const [isMirrored, setIsMirrored] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const centerLineCanvasRef = useRef(null);
  const latestLandmarksRef = useRef(null);
  const faceLandmarkerRef = useRef(null);

  const [isInitial, setIsInitial] = useState(true);
  const [measurementRound, setMeasurementRound] = useState(0);
  const measurementRoundRef = useRef(0);
  const [resultText, setResultText] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isOpenEnabled, setIsOpenEnabled] = useState(false);
  const [dataArray, setDataArray] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  const maxRound = 6; // 3세트 (입닫기+입열기 3번)
  useEffect(() => {
    let intervalId;
    if (modelsLoaded) {
      intervalId = setInterval(() => {
        if (latestLandmarksRef.current) {
          recordMeasurement(latestLandmarksRef.current);
        }
      }, 300); // 0.3초
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [modelsLoaded]);
  
  useEffect(() => {
    const img = new Image();
    img.src = '/images/faceline.png';
    img.onload = () => console.log('Image preloaded');
    img.onerror = () => console.error('Image preload failed');
  }, []);

  useEffect(() => {
    async function setupFaceLandmarker() {
      try {
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
      } catch (err) {
        console.error('FaceLandmarker setup error:', err);
      }
    }
    setupFaceLandmarker();
  }, []);

  // useEffect(() => {
  //   // measurementRound가 짝수일 때(즉, open 버튼을 누른 후) 결과 계산
  //   // 단, 0이 아닌 경우만
  //   if (measurementRound > 0 && measurementRound % 2 === 0) {
  //     calculateResults(dataArray, measurementRound);
  //   }
  // }, [dataArray, measurementRound]);

  useEffect(() => {
       // 짝수 라운드(=open 버튼 눌렀을 때) 한 번만 계산
      if (measurementRound > 0 && measurementRound % 2 === 0) {
         calculateResults();
      }
     }, [measurementRound]);

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

  const detectFace = async () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const currentTime = Date.now();
      const results = await faceLandmarkerRef.current.detectForVideo(videoRef.current, currentTime);
      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        latestLandmarksRef.current = landmarks;
        drawResults(landmarks);
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

  const drawResults = (landmarks) => {
    if (!canvasRef.current || !videoRef.current) return;

    const renderedWidth = videoRef.current.clientWidth;
    const renderedHeight = videoRef.current.clientHeight;
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
      drawCenterLine(centerLineCanvasRef.current, renderedWidth, renderedHeight);
    }

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, renderedWidth, renderedHeight);

    // 특정 랜드마크 인덱스와 색상 (코브리지:6, 코끝:1, 턱끝:152, 턱 시작점:234,454)
    const pointsWithColors = [
      { index: 6, color: 'blue' },     // 코브리지
      { index: 1, color: 'green' },    // 코끝
      { index: 152, color: 'purple' }, // 턱끝
      { index: 234, color: 'red' },    // 왼쪽 턱 시작
      { index: 454, color: 'red' },    // 오른쪽 턱 시작
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
        width / 2 - width * 0.2,
        height / 2 - height * 0.45,
        width * 0.4,
        height * 1
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

  const recordMeasurement = (landmarks) => {
    if (!landmarks[6] || !landmarks[1] || !landmarks[152] || !landmarks[234] || !landmarks[454]) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    const noseTip = landmarks[1];
    const noseBridge = landmarks[6];
    const chinTip = landmarks[152];
    const leftJawStart = landmarks[234];
    const rightJawStart = landmarks[454];

    const noseTipX = noseTip.x * videoWidth;
    const noseTipY = noseTip.y * videoHeight;
    const noseBridgeX = noseBridge.x * videoWidth;
    const noseBridgeY = noseBridge.y * videoHeight;
    const chinTipX = chinTip.x * videoWidth;
    const chinTipY = chinTip.y * videoHeight;
    const leftJawStartX = leftJawStart.x * videoWidth;
    const leftJawStartY = leftJawStart.y * videoHeight;
    const rightJawStartX = rightJawStart.x * videoWidth;
    const rightJawStartY = rightJawStart.y * videoHeight;

    const baseNoseLengthPX = distanceTwoPoints(noseTipX, noseTipY, noseBridgeX, noseBridgeY);
    const noseToChinPX = distanceTwoPoints(noseTipX, noseTipY, chinTipX, chinTipY);
    const horizontalDiffPX = Math.abs(noseTipX - noseBridgeX);
    const leftJawToNosePX = distanceTwoPoints(leftJawStartX, leftJawStartY, noseTipX, noseTipY);
    const rightJawToNosePX = distanceTwoPoints(rightJawStartX, rightJawStartY, noseTipX, noseTipY);

    const lengthYcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, noseToChinPX);
    const lengthXcm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, horizontalDiffPX);
    const leftJawToNoseCm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, leftJawToNosePX);
    const rightJawToNoseCm = pxtocm(baseNoseLengthCm, baseNoseLengthPX, rightJawToNosePX);

    const measurement = {
      round: measurementRoundRef.current,
      mouthState: measurementRoundRef.current % 2 === 1 ? 'closed' : 'open',
      baseNoseLengthCM: baseNoseLengthCm,
      baseNoseLengthPX: baseNoseLengthPX,
      lengthXcm,
      lengthYcm,
      leftJawToNoseCm,
      rightJawToNoseCm,
      noseTipX,
      noseTipY,
      noseBridgeX,
      noseBridgeY,
      chinTipX,
      chinTipY,
      leftJawStartX,
      leftJawStartY,
      rightJawStartX,
      rightJawStartY,
    };

    // setDataArray(prev => {
    //   if (prev.some(data => data.round === measurementRoundRef.current)) {
    //     return prev; // 중복 방지
    //   }
    //   return [...prev, measurement];
    // });
    setDataArray(prev => [...prev, measurement]);
  };

  const onMeasure = (actionType) => {
    if (!latestLandmarksRef.current) return;
    if (isInitial) setIsInitial(false);

    const currentRound = measurementRoundRef.current + 1;
    measurementRoundRef.current = currentRound;
    setMeasurementRound(currentRound);

    recordMeasurement(latestLandmarksRef.current);

    if (actionType === 'close') {
      setIsOpenEnabled(true);
    } else if (actionType === 'open') {
       setIsOpenEnabled(false);
      // 결과 계산은 useEffect([measurementRound]) 에서 한 번만
    // } else if (actionType === 'open') {
    //   setIsOpenEnabled(false);
    //   calculateResults();
    }
  };

  const calculateResults = () => {
    const currentRound = measurementRoundRef.current;
    const closedMeasurement = dataArray.find(data => data.round === currentRound - 1);
    const openMeasurement = dataArray.find(data => data.round === currentRound);

    if (!closedMeasurement || !openMeasurement) return;

    const asymmetry = Math.abs(closedMeasurement.leftJawToNoseCm - closedMeasurement.rightJawToNoseCm);

    const summary = {
      round: Math.ceil(currentRound / 2),
      maxWidth: Math.max(closedMeasurement.lengthXcm, openMeasurement.lengthXcm),
      maxHeight: Math.max(closedMeasurement.lengthYcm, openMeasurement.lengthYcm),
      minWidth: Math.min(closedMeasurement.lengthXcm, openMeasurement.lengthXcm),
      minHeight: Math.min(closedMeasurement.lengthYcm, openMeasurement.lengthYcm),
      asymmetry: asymmetry,
    };

    setSummaryData(prev => {
      const updatedSummary = [...prev];
      const existingIndex = updatedSummary.findIndex(s => s.round === summary.round);
      if (existingIndex >= 0) {
        updatedSummary[existingIndex] = summary;
      } else {
        updatedSummary.push(summary);
      }
      return updatedSummary;
    });

    setResultText(prev => [
      ...prev,
      `#${summary.round} 최대 높이: ${summary.maxHeight.toFixed(2)} cm / 최대 너비: ${summary.maxWidth.toFixed(2)} cm / 불균형: ${asymmetry.toFixed(2)} cm`
    ]);
  };

  const handleReset = () => {
    setResultText([]);
    setIsInitial(true);
    setMeasurementRound(0);
    setIsOpenEnabled(false);
    measurementRoundRef.current = 0;
    setDataArray([]);
    setSummaryData([]);
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const saveDataDB = async () => {
  try {
    const response = await axios.post('/api/rawDataSaveDB', {
      user, // ← user 정보 추가
      rawData: dataArray,
      summaryData: summaryData
    });
    const savedId = response.data.id;
    return savedId;
  } catch (error) {
    console.error('데이터 저장 중 오류:', error);
  }
};


const handleSubmit = async () => {
  stopVideo();
  let objectId = null;

  if (user) {
    // 로그인 되어 있으면 DB에 저장
    objectId = await saveDataDB();
  } else {
    console.log('로그인되지 않은 상태이므로 DB 저장을 건너뜁니다.');
  }

  // 공통으로 로컬에 저장하고 결과 페이지로 이동
  localStorage.setItem('graphData', JSON.stringify(dataArray));
  localStorage.setItem('maxXY', JSON.stringify(summaryData));

  // objectId가 null인 경우 query 없이 이동해도 되고,
  // 필요하다면 objectId가 없을 땐 빈 문자열이나 기본값을 넘겨도 됩니다.
  router.push({
    pathname: '/analysis-results',
    query: objectId ? { objectId } : {}
  });
};


  const headerText = isInitial
    ? "얼굴을 중앙의 가이드에 맞춰주세요."
    : measurementRound < maxRound
      ? isOpenEnabled
        ? `${Math.ceil(measurementRound / 2)} 번째: 입을 열고 측정 버튼을 눌러주세요.`
        : `${Math.ceil(measurementRound / 2)} 번째: 입을 닫고 측정 버튼을 눌러주세요.`
      : '완료 되었습니다. Next 버튼을 눌러주세요.';

      const [user, setUser] = useState(null);

      useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }, []);

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