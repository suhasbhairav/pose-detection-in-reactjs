import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as pose from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import * as controls from '@mediapipe/control_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkGridRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;

  const onResults = async (model) => {
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;

      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const ctx = canvasRef.current.getContext("2d");
      ctx.save();

      ctx.clearRect(0, 0, videoWidth, videoHeight);
      console.log(model);
      ctx.globalCompositeOperation = "destination-atop";
      ctx.drawImage(model.image, 0, 0, videoWidth, videoHeight);

      ctx.globalCompositeOperation = "source-over";
      drawConnectors(ctx, model.poseLandmarks, pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
      drawLandmarks(ctx, model.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
      ctx.restore();
    }
  };



  useEffect(() => {
    const poses = new pose.Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    poses.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    poses.onResults(onResults);

    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await poses.send({ image: webcamRef.current.video })
        },
        width: 1280,
        height: 1040,
      });
      camera.start();
    }
  });


  return (
    <div>
      <Webcam
        ref={webcamRef}
        audio={false}
        id="img"
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 1280,
          height: 1040,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 1280,
          height: 1040,
        }}
        id="myCanvas"
      />
      <div
        ref={landmarkGridRef}
        class="landmark-grid-container"></div>
    </div>
  );
}

export default App;
