import * as faceapi from 'face-api.js';
import React, { useRef, useEffect, useState } from 'react';

/* Web에서는 정상적으로 작동하지만, iPhone에서 PWA로 실행할 때, 제 생각에는 모델 성능 저하가 발생하여 점이 약간 부정확하게 표시되는 문제가 발생하는 것 같습니다. (특히 턱부분) */

function App() {
  /* Refs for video, landmark canvas, and center line canvas */
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const centerLineCanvasRef = useRef(null);

  /* State to track if models are loaded and to store specific landmark points */
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [landmarkPoints, setLandmarkPoints] = useState({ chinTip: { x: 0, y: 0 }, noseBridgeTop: { x: 0, y: 0 }, noseTip: { x: 0, y: 0 }});


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
    setLandmarkPoints(updatedPoints);
  };


  /* [Function] Function to handle video playback, called when video starts playing */
  const handleVideoPlay = () => {
    if (canvasRef.current && videoRef.current && centerLineCanvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const centerLineCanvas = centerLineCanvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.width;
      canvas.height = video.height;
      centerLineCanvas.width = video.width;
      centerLineCanvas.height = video.height;

      // Draw the center line
      drawCenterLine(centerLineCanvas, video.width, video.height);

      // Update landmarks periodically
      setInterval(async () => {
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 })
          // faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        ).withFaceLandmarks();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Clear previous drawings and draw landmarks
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizedDetections.forEach((detection) => {
          drawSpecificLandmarks(canvas, detection.landmarks);
        });
      }, 100); // 100ms Update
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


  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <div style={styles.topNavBar}>동작 분석 중</div>

      {/* Video and Canvas Area */}
      <div style={styles.videoArea}>
        <div style={styles.videoWrapper}>
          <video
            ref={videoRef}
            width="700"
            height="500"
            autoPlay
            muted
            playsInline // ** iOS 호환성을 위해 추가 **
            onPlay={handleVideoPlay}
          />
          <canvas ref={centerLineCanvasRef} style={styles.canvas} /> {/* 중앙선 고정 canvas */}
          <canvas ref={canvasRef} style={styles.canvas} /> {/* 얼굴 인식 업데이트 canvas */}
        </div>
      </div>

      {/* Display Landmark Points */}
      <div style={styles.landmarkPoints}>
        <h3>Landmark Points</h3>
        <p>
          Nose Bridge Top: (X: {landmarkPoints.noseBridgeTop.x.toFixed(2)}, Y:{' '}
          {landmarkPoints.noseBridgeTop.y.toFixed(2)})
        </p>
        <p>
          Nose Tip: (X: {landmarkPoints.noseTip.x.toFixed(2)}, Y:{' '}
          {landmarkPoints.noseTip.y.toFixed(2)})
        </p>
        <p>
          Chin Tip: (X: {landmarkPoints.chinTip.x.toFixed(2)}, Y:{' '}
          {landmarkPoints.chinTip.y.toFixed(2)})
        </p>
      </div>
    </div>
  );
}

export default App;

/* Styles component */
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  topNavBar: {
    width: '100%',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  videoArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flex: 1,
  },
  videoWrapper: {
    position: 'relative',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  landmarkPoints: {
    marginBottom: '20px',
    textAlign: 'center',
  },
};

/* ------------------------------------ 주석 코드 ------------------------------------ */

  // const handleVideoPlay = () => {
  //   setInterval(async () => {
  //     if (canvasRef.current && videoRef.current) {
  //       const video = videoRef.current;
  //       const canvas = canvasRef.current;

  //       // Set canvas dimensions to match video
  //       canvas.width = video.width;
  //       canvas.height = video.height;

  //       const displaySize = { width: video.width, height: video.height };
  //       faceapi.matchDimensions(canvas, displaySize);

  //       const detections = await faceapi.detectAllFaces(video, 
  //         new faceapi.SsdMobilenetv1Options({ 
  //           minConfidence: 0.7 // 높은 신뢰도 임계값 설정
  //         })
  //       ).withFaceLandmarks();

  //       const resizedDetections = faceapi.resizeResults(detections, displaySize);
  //       console.log(resizedDetections);
  //       // Clear previous drawings
  //       canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  //       // Draw specific landmarks for each detected face
  //       resizedDetections.forEach(detection => {
  //         drawSpecificLandmarks(canvas, detection.landmarks);
  //       });

  //       // Draw only nose landmarks for each detected face
  //       // resizedDetections.forEach(detection => {
  //       //   drawNoseLandmarks(canvas, detection.landmarks);
  //       // });
  //       // Draw face detections
  //       // faceapi.draw.drawDetections(canvas, resizedDetections);
        
  //       // Draw face landmarks
  //       // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  //     }
  //   }, 100);
  // }

    // const drawNoseLandmarks = (canvas, landmarks) => {
  //   const ctx = canvas.getContext('2d');
  //   // Nose points are from index 27 to 35
  //   const nosePoints = landmarks.positions.slice(27, 36);
    
  //   ctx.beginPath();
  //   ctx.fillStyle = '#FF0000';
  //   nosePoints.forEach(point => {
  //     ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
  //   });
  // }
