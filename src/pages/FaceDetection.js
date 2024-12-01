import axios from 'axios';
import dynamic from 'next/dynamic';
import * as faceapi from 'face-api.js';
import { useRouter } from 'next/router';
import React, { useRef, useEffect, useState } from 'react';
import {distanceTwoPoints,pxtocm} from '../utils';
import { Header, ResultText } from "../components";
import Button from '@/components/common/Button'; // button
import {excelExport} from '@/utils'; // excel export
import { maxRound } from '@/utils/constants';

function FaceDetection() {
 
  const router = useRouter();
  const { baseNoseLengthCM: baseNoseLengthCm = 7 } = router.query;

  /* Refs for video, landmark canvas, and center line canvas */
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const measurementRoundRef = useRef(0); 
  const centerLineCanvasRef = useRef(null);


  /* UseState */
  const [resultText, setResultText] = useState([]);
  const [isInitial, setIsInitial] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isOpenEnabled, setIsOpenEnabled] = useState(false);
  const [measurementRound, setMeasurementRound] = useState(0);

  const [dataArray,setDataArray] = useState([])
  const [summaryData, setSummaryData] = useState([]);
  

  /* Header Text */
  const headerText = isInitial
  ? "얼굴을 중앙선에 맞춰주세요. 측정이 완료되었습니다. \n 리셋 or 전송 버튼을 눌러주세요."
    : measurementRound <= maxRound
      ? isOpenEnabled
        ? `${Math.ceil(measurementRound/2)} 번째: 측정(Open) 버튼을 눌러주세요.`
        : `${Math.ceil(measurementRound/2)} 번째: 측정(Close) 버튼을 눌러주세요.`
      : '';


  /* Load models when the component mounts */
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; // 모델은 public/models에 저장
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
      loadModels(); // 브라우저 환경에서만 로드
    }
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
    });


    const twoPointsDistancePX = distanceTwoPoints(landmarks.positions[30].x, landmarks.positions[30].y, landmarks.positions[8].x, landmarks.positions[8].y);
    const baseNoseLengthPX = distanceTwoPoints(landmarks.positions[30].x, landmarks.positions[30].y, landmarks.positions[27].x, landmarks.positions[27].y);
    const lengthYcm = pxtocm(baseNoseLengthCm,baseNoseLengthPX,twoPointsDistancePX);
    const lengthXcm = pxtocm(baseNoseLengthCm,baseNoseLengthPX,landmarks.positions[30].x - landmarks.positions[27].x);
    const currentDistance = {
      noseX: landmarks.positions[30].x, //x
      chinX: landmarks.positions[8].x,
      lengthYcm: lengthYcm, //y
      baseNoseLengthPX:baseNoseLengthPX,
      lengthXcm: lengthXcm // x 값의 변화량을 측정한값을 해도 될듯 위의 noseX, chinX 값 삭제 해도 될듯
    }
    // console.log("measurementRoundRef",measurementRoundRef)
    if(measurementRoundRef.current>0 && measurementRoundRef.current<=maxRound ){
      const getData = {
        round: measurementRoundRef.current,
        baseNoseLengthCM: baseNoseLengthCm,
        baseNoseLengthPX:baseNoseLengthPX,
        lengthXcm: lengthXcm, //x
        lengthYcm: lengthYcm, //y         
        chinTipX: landmarks.positions[8].x,
        chinTipY: landmarks.positions[8].y,
        noseTipX: landmarks.positions[30].x,
        noseTipY: landmarks.positions[30].y,
        noseBridgeTopX: landmarks.positions[27].x,
        noseBridgeTopY: landmarks.positions[27].y,
      }
      // console.log("getData", getData)
      dataArray.push(getData)
      setDataArray(dataArray)
    }
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


  /* [Function] A function that compares Open and Close state data to calculate height and width. */
  const calculateResults = () => {
    var maxX = -1000, maxY = 0, minX = 1000, minY = 1000;
    dataArray.forEach((data) => {
      if(data.round == measurementRoundRef.current){
        maxX = Math.max(maxX, data.lengthXcm);
        maxY = Math.max(maxY, data.lengthYcm);
        minX = Math.min(minX, data.lengthXcm);
        minY = Math.min(minY, data.lengthYcm);
      }
    })
    const getSummaryData = {
        round:Math.ceil(measurementRoundRef.current/2),
        maxWidth:maxX, 
        maxHeight:maxY,
        minWidth:minX,
        minHeight:minY
    };
    summaryData.push(getSummaryData);
    setSummaryData(summaryData);
    setResultText((prev) => [
      ...prev,
      `#${Math.ceil(measurementRoundRef.current/2)} 최대 높이: ${maxY.toFixed(2)} cm / 최대 너비: ${maxX.toFixed(2)} cm
      최소 높이: ${minY.toFixed(2)} cm / 최소 너비: ${minX.toFixed(2)} cm
      차이 높이: ${(maxY-minY).toFixed(2)} cm / 차이 너비: ${(maxX-minX).toFixed(2)} cm
      `,
    ]);
  };  


  const onMeasure = (actionType) => {
    if (isInitial) setIsInitial(false);
    console.log("onMeasure",measurementRound)
    if (actionType === "close") {
      // Close 버튼 동작
      if(measurementRound!=0 && measurementRound%2 == 0){
        calculateResults();
      }
      setIsOpenEnabled(true);
    } else if (actionType === "open") {
      // Open 버튼 동작
      setIsOpenEnabled(false);
    }

    if (measurementRound <=maxRound) {
      // 다음 라운드로 진행
      setMeasurementRound((prevRound) => {
        const nextRound = prevRound + 1;
        measurementRoundRef.current = nextRound;
        return nextRound;
      });
    }
    
  };


  /* [Function] Resets all states to their initial values. */
  const handleReset = () => {
    setResultText([]);
    setIsInitial(true); 
    setMeasurementRound(0); 
    setIsOpenEnabled(false);
    measurementRoundRef.current = 0; 
    setDataArray([])
    setSummaryData([]);
  };


  /* [Function] Navigates to the evaluation analysis result page  */
  const handleSubmit = async () => {
    stopVideo();

    const objectId = await saveDataDB();
    localStorage.setItem('graphData', JSON.stringify(dataArray)); //graphData 저장
    localStorage.setItem('maxXY', JSON.stringify(summaryData)); //graphData 저장
    
    router.push({
      pathname: '/EvaluateAnalysisResultPage',
      query: { 
        objectId: objectId,
       }, 
    });
    
  };


  const saveDataDB = async () => {
    try {
      // Call your API endpoint to save the data
      const response = await axios.post('/api/rawDataSaveDB',
         {rawData: dataArray, summaryData: summaryData}
      );
  
      // Handle success response
      const savedId = response.data.id; // 서버에서 반환한 ObjectId
      console.log('Data saved successfully:', response.data);
      
      return savedId
    } catch (error) {
      // Handle errors
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
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
      <div style={styles.buttonContainer}>
            {(measurementRound <= maxRound) ? (<>
                <Button
                  title="close"
                  label={"입닫고 측정"}
                  enable={!isOpenEnabled}
                  onClick={()=>onMeasure("close")}
                />
                <Button
                  title="open"
                  label={"입열고 측정"}
                  enable={isOpenEnabled}
                  onClick={()=>onMeasure("open")}
                />
              </>
            ):(<>
              <Button
              title="send"
              label={"Save and Next"}
              onClick={()=>handleSubmit()}
            />
            <Button
              title="Donwload"
              label={"Donwload"}
              onClick={()=>excelExport({jsonData:dataArray,maxXY:summaryData})}
            />
          </>)
          }
          <Button
            title="reset"
            label={"reset"}
            onClick={()=>handleReset()}
          />
        </div>
    </div>
  );
}
  
export default dynamic(() => Promise.resolve(FaceDetection), { ssr: false });
  
 const styles = {
  button: {
    padding: "10px 10px",
    fontSize: "16px",
    color: "#ffffff",
    backgroundColor: "#a8d8ff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
    marginBottom: "20px",
  },
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

