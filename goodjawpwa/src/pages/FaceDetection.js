import * as faceapi from 'face-api.js';
import { useLocation, useNavigate} from 'react-router-dom'
import React, { useRef, useEffect, useState } from 'react';
import {distanceTwoPoints,pxtocm,distanceWidth} from '../utils';
import { Header, ButtonContainer, ResultText } from "../components";

function FaceDetection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { baseNoseLengthCM = 7 } = location.state || {};

  /* Refs for video, landmark canvas, and center line canvas */
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const measurementRoundRef = useRef(1); 
  const isOpenEnabledRef = useRef(false); 
  const centerLineCanvasRef = useRef(null);

  /* UseState */
  const [resultText, setResultText] = useState([]);
  const [isInitial, setIsInitial] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isOpenEnabled, setIsOpenEnabled] = useState(false);
  const [isSendEnabled, setIsSendEnabled] = useState(false); 
  const [startChin, setStartChin] = useState({ x: 0, y: 0 });
  const [measurementRound, setMeasurementRound] = useState(1);
  const [measurestartchinx, setMeasurestartchinx] = useState(true);

  const [landmarkPoints, setLandmarkPoints] = useState({ chinTip: { x: 0, y: 0 }, noseBridgeTop: { x: 0, y: 0 }, noseTip: { x: 0, y: 0 }});

  /* State to track if models are loaded and to store specific landmark points */  
  const [distance, setDistance] = useState({ noseX: 0, chinX: 0, lengthHeightCM: 0, baseNoseLengthPX: 0});
  const [openMouse, setOpenMouse] = useState([{ noseX: 0, chinX: 0, lengthHeightCM: 0, baseNoseLengthPX:0}]);
  const [closeMouse, setCloseMouse] = useState([{ noseX: 0, chinX: 0, lengthHeightCM: 0, baseNoseLengthPX:0}]);

  /* analysisData */
  const [analysisData, setAnalysisData] = useState({
    content: "string", 
    maxWidth: 0,
    maxHeight: 0,
    array1: [[0,0]], 
    array2: [[0,0]], 
    array3: [[0,0]], 
  });

  /* Header Text */
  const headerText = isInitial
  ? "얼굴을 중앙선에 맞춰주세요."
  : isSendEnabled
    ? "측정이 완료되었습니다. \n 리셋 or 전송 버튼을 눌러주세요."
    : measurementRound <= 3
      ? isOpenEnabled
        ? `${measurementRound} 번째: 측정(Open) 버튼을 눌러주세요.`
        : `${measurementRound} 번째: 측정(Close) 버튼을 눌러주세요.`
      : '';


  /* Load models when the component mounts */
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        // faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        // faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // TinyFaceDetector 대신 더 정확한 모델 사용
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL), // tiny 모델 대신 전체 모델 사용
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]).then(() => setModelsLoaded(true));
    };
    loadModels();
  }, []);


  /* Start the video stream once models are loaded */
   useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);


  /* [Function] Function to start video streaming from the user's camera */
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error(err));
  };


  /* [Function] Stop the video stream */
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks(); 
      tracks.forEach((track) => track.stop()); 
      videoRef.current.srcObject = null; 
    }
  };


  /* [Function] Draw specific landmarks (chin tip, nose bridge top, nose tip) on the canvas */
  const drawSpecificLandmarks = (canvas, landmarks) => {
    const updatedPoints = {};
    const ctx = canvas.getContext('2d');

    const specificPoints = [
      { index: 8, color: '#FF0000', label: 'chinTip' },
      { index: 27, color: '#00FF00', label: 'noseBridgeTop' },
      { index: 30, color: '#0000FF', label: 'noseTip' }
    ];
    
    specificPoints.forEach(point => {
      const landmark = landmarks.positions[point.index];
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(landmark.x, landmark.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      // Save landmark position for displaying below the video
      updatedPoints[point.label] = { x: landmark.x, y: landmark.y };
    });

    setLandmarkPoints(updatedPoints)
    calculatemeasure(updatedPoints)

    const twoPointsDistancePX = distanceTwoPoints(landmarks.positions[30].x, landmarks.positions[30].y, landmarks.positions[8].x, landmarks.positions[8].y);
    const baseNoseLengthPX = distanceTwoPoints(landmarks.positions[30].x, landmarks.positions[30].y, landmarks.positions[27].x, landmarks.positions[27].y);
    const lengthHeightCM = pxtocm(baseNoseLengthCM,baseNoseLengthPX,twoPointsDistancePX);
    const currentDistance = {
      noseX: landmarks.positions[30].x, //x
      chinX: landmarks.positions[8].x,
      lengthHeightCM: lengthHeightCM, //y
      baseNoseLengthPX:baseNoseLengthPX,
    }
    setDistance(currentDistance);
  };


  /* [Function] Draw a vertical center line on the video (fixed on the centerLineCanvas) */
  const drawCenterLine = (canvas, videoWidth, videoHeight) => {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(videoWidth / 2, 0); // Start top center
    ctx.lineTo(videoWidth / 2, videoHeight); // Draw to the bottom center
    ctx.stroke();
  };


  /* [Function] Function to handle video playback, called when video starts playing */
  const handleVideoPlay = () => {
    if (canvasRef.current && videoRef.current && centerLineCanvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const centerLineCanvas = centerLineCanvasRef.current;

      canvas.width = video.width;
      canvas.height = video.height;
      centerLineCanvas.width = video.width;
      centerLineCanvas.height = video.height;

      drawCenterLine(centerLineCanvas, video.width, video.height);

      setInterval(async () => {
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.SsdMobilenetv1Options( {
            scoreThreshold: 0.85,  // 높은 신뢰도 설정
            inputSize: 512,       // 입력 크기 최적화 224, 320, 416, 512, 608 중 선택 높을 수록 정확도 높아짐 속돈 느려짐
            scaleFactor: 0.8      // 스케일 팩터 조정
          })
        // faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        ).withFaceLandmarks();
        if(!detection) return;
        const resizedDetection = faceapi.resizeResults(detection, displaySize);

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSpecificLandmarks(canvas, resizedDetection.landmarks);
        // resizedDetections.forEach((detection) => {
        //   drawSpecificLandmarks(canvas, detection.landmarks);
        // });
      }, 200); // 500ms Update
    }
  };


  /* [Function] Function to calculate chin displacement. */
  const calculatemeasure = (updatedPoints) => {
    const currentRound = measurementRoundRef.current; 

    if (!landmarkPoints.chinTip || !landmarkPoints.noseTip) {
      console.error("Missing required landmarks for calculation");
      return;
    }

    // 1. 현재 턱 좌표 가져오기
    const biaschinX = updatedPoints.chinTip.x;
    const biaschinY = updatedPoints.chinTip.y;
    
    // 2. 시작 좌표 초기화 (최초 1회)
    let { x: startchinX, y: startchinY } = startChin;
    if (measurestartchinx) {
      setStartChin({ x: biaschinX, y: biaschinY });
      setMeasurestartchinx(false);
    }
    
    // 3. Scaling factor 계산 (픽셀 -> cm 변환)
    const susic = baseNoseLengthCM / (updatedPoints.noseTip.y - updatedPoints.noseBridgeTop.y);
    
    // 4. 변화량 계산
    const measureHeight = Math.sqrt(Math.pow(biaschinX - startchinX, 2) + Math.pow(biaschinY - startchinY, 2)) * -1;
    const measureWidth = Math.abs(biaschinX - startchinX);
    
    // 5. cm 변환
    const heightCM = susic * measureHeight;
    const widthCM = susic * measureWidth;

    // 6. 현재 라운드에 데이터 추가
    if (isOpenEnabledRef.current) {
      setAnalysisData((prev) => {
        const updatedData = { ...prev };
  
        if (currentRound === 1) {
          updatedData.array1 = [...(updatedData.array1 || []), [widthCM, heightCM]];
        } else if (currentRound === 2) {
          updatedData.array2 = [...(updatedData.array2 || []), [widthCM, heightCM]];
        } else if (currentRound === 3) {
          updatedData.array3 = [...(updatedData.array3 || []), [widthCM, heightCM]];
        }
        console.log(`Updated array${currentRound}:`, updatedData[`array${currentRound}`]);
        return updatedData;
      });
    } else {
      console.log("Open 상태가 아니므로 데이터를 추가하지 않습니다.");
    }
  }


  /* [Function] A function that compares Open and Close state data to calculate height and width. */
  const calculateResults = (currentOpenMouse, currentCloseMouse) => {
      
    // 1.  Open 및 Close 상태의 거리 데이터를 기반으로 결과를 계산
    if (!currentCloseMouse.lengthHeightCM || !currentOpenMouse.lengthHeightCM) {
      console.error("Missing values for closeMouse or openMouse:", {
        currentCloseMouse,
        currentOpenMouse,
      });
      return;
    }

    // 2. Open 상태와 Close 상태 간의 높이 차이를 계산
    const currentHeight = Math.abs(currentOpenMouse.lengthHeightCM - currentCloseMouse.lengthHeightCM);

    // 3. Open 상태와 Close 상태 간의 턱 위치(`chinX`) 차이를 계산하여 픽셀 단위로 너비를 구함
    const currentWidthPX = distanceWidth(currentOpenMouse.chinX, currentCloseMouse.chinX);
    
    // 4. 너비 변환 (픽셀 → 센티미터)
    const currentWidth = pxtocm(baseNoseLengthCM, currentCloseMouse.baseNoseLengthPX, currentWidthPX);

    // 5. 측정 결과를 `analysisData` 상태에 저장
    setAnalysisData((prev) => {
      const updatedData = { ...prev };
      
      updatedData[`array${measurementRound}`] = [...(updatedData[`array${measurementRound}`] || []), [currentHeight, currentWidth]];
      updatedData.maxHeight = Math.max(updatedData.maxHeight, currentHeight);
      updatedData.maxWidth = Math.max(updatedData.maxWidth, currentWidth);

      return updatedData;
    });

    // 6. 현재 측정 결과를 문자열 형식으로 변환하여 사용자에게 표시할 텍스트로 추가합니다.
    setResultText((prev) => [
      ...prev,
      `#${measurementRound} 높이: ${currentHeight.toFixed(2)} cm / 너비: ${currentWidth.toFixed(2)} cm`,
    ]);
  };  


 /* [Function] Handles the measurement process by storing distances and transitioning between Open and Close states. */
  const onMeasure = (actionType) => {
    if (isInitial) setIsInitial(false);

    if (measurementRound > 3) return; 

    if (actionType === "close") {
      // Close 버튼 동작
      setCloseMouse(distance);
      setIsOpenEnabled(true);
      isOpenEnabledRef.current = true;
    } else if (actionType === "open") {
      // Open 버튼 동작
      setOpenMouse(distance);
      calculateResults(distance, closeMouse);
      setIsOpenEnabled(false);
      isOpenEnabledRef.current = false;

      if (measurementRound < 3) {
        // 다음 라운드로 진행
        setMeasurementRound((prevRound) => {
          const nextRound = prevRound + 1;
          measurementRoundRef.current = nextRound;
          return nextRound;
        });
      } else {
        // 전송 버튼 활성화
        setIsSendEnabled(true);
      }
    }
  };


  /* [Function] Resets all states to their initial values. */
  const handleReset = () => {
    setResultText([]);
    setIsInitial(true); 
    setMeasurementRound(1); 
    setIsOpenEnabled(false);
    setIsSendEnabled(false);
    setMeasurestartchinx(true); 
    setStartChin({ x: 0, y: 0 });
    measurementRoundRef.current = 1; 
    isOpenEnabledRef.current = false; 
    setAnalysisData({ content: "string", maxWidth: 0, maxHeight: 0, array1: [], array2: [], array3: []});
  };


  /* [Function] Navigates to the evaluation analysis result page  */
  const handleSubmit = () => {
    stopVideo(); 
    navigate('/EvaluateAnalysisResultPage', { state: { analysisData: analysisData }});
  }

 
  return (
    <div style={styles.fullScreen}>
      {/* Header */}
      <Header headerText={headerText} />
  
      {/* Video and Canvas Area */}
      <div style={styles.videoArea}>
        <div style={styles.videoWrapper}>
          <video
            ref={videoRef}
            width="700"
            height="500"
            autoPlay
            muted
            playsInline // iOS 호환성을 위해 추가
            onPlay={handleVideoPlay}
            style={styles.video} 
          />
          <canvas ref={centerLineCanvasRef} style={styles.canvas} /> {/* 중앙선 고정 canvas */}
          <canvas ref={canvasRef} style={styles.canvas} /> {/* 얼굴 인식 업데이트 canvas */}
        </div>
      </div>
  
      {/* Result Text */}
      <ResultText resultText={resultText} />
  
      {/* Button Area */}
      <ButtonContainer
        onMeasure={onMeasure}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        isOpenEnabled={isOpenEnabled}
        isSendEnabled={isSendEnabled}
        measurementRound={measurementRound}
      />
    </div>
  );
}
  
 export default FaceDetection;
  
 const styles = {
  fullScreen: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#ffffff",
    padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)", // iOS safe area
  },
  videoArea: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginTop: "60px",
  },
  videoWrapper: {
    position: "relative",
    borderRadius: "15px",
    overflow: "hidden", 
  },
  video: {
    width: "100%",
    height: "100%",
    transform: "scaleX(-1)", 
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transform: "scaleX(-1)", 
  }
};

