import * as faceapi from 'face-api.js';
import { useState, useRef, useEffect } from 'react';

import Button from '@components/Button';

function Webcam() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);

  const videoRef = useRef();
  const canvasRef = useRef();
  const videoHeight = 480;
  const videoWidth = 640;

  useEffect(() => {
    /* Load the models from the models folder and set the modelsLoaded state to true. */
    const loadModels = async () => {
      const MODEL_URL = 'models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('error:', err);
      });
  };

  const handleVideoOnPlay = () => {
    if (window.interval) clearInterval(window.interval);
    window.interval = setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        /* Creating a canvas element and setting the width and height of the canvas element. */
        canvasRef.current.innerHTML = faceapi.createCanvas(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight,
        };

        /* Matching the dimensions of the canvas element with the dimensions of the video element. */
        faceapi.matchDimensions(canvasRef.current, displaySize);

        /* Detecting all the faces in the video and then getting the face landmarks and face
        expressions. */
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        /* This is getting the emotion from the face detection. */
        let emotions = detections[0]?.expressions || [];
        if (emotions) {
          const emotion = Object.entries(emotions).sort((x, y) => y[1] - x[1])[0];
          const element = document.getElementById('emotion');
          if (element) element.innerText = emotion && emotion.length > 0 ? emotion[0] : 'Not Detected';
        }
      }
    }, 100);
  };

  const closeWebcam = () => {
    let video = videoRef.current;
    video.pause();
    video.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  };

  return (
    <div>
      <div className='text-center p-2.5'>
        <Button onClink={captureVideo && modelsLoaded ? closeWebcam : startVideo}>
          {captureVideo && modelsLoaded ? 'Close Webcam' : 'Open Webcam'}
        </Button>
      </div>
      {captureVideo &&
        (modelsLoaded ? (
          <div>
            <div className='flex justify-center p-2.5'>
              <video
                ref={videoRef}
                height={videoHeight}
                width={videoWidth}
                onPlay={handleVideoOnPlay}
                className='rounded-md'
              />
              <canvas ref={canvasRef} className='absolute' />
            </div>
            <div className='text-4xl text-center uppercase lg:text-xl'>
              Your emotion is{' '}
              <span id='emotion' className='text-5xl font-semibold text-purple-600 lg:text-2xl'>
                Happy
              </span>
              !
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        ))}
    </div>
  );
}

export default Webcam;
