import React, { useEffect, useRef, useState } from 'react';
import CameraPhoto, { FACING_MODES, IMAGE_TYPES } from 'jslib-html5-camera-photo';

type CameraProps = {
  onSnapPhoto: (dataUri: string) => void;
}

export function Camera(props: CameraProps) {
  const [cameraPhoto, setCameraPhoto] = useState<CameraPhoto | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { onSnapPhoto } = props;

  useEffect(() => {
    if (videoRef.current === null) {
      console.log('no videoRef available');
      return;
    }

    const cameraPhoto = new CameraPhoto(videoRef.current);
    setCameraPhoto(cameraPhoto);

    cameraPhoto.startCamera(FACING_MODES.ENVIRONMENT)
      .then(() => {
        console.log('camera started');
      })
      .catch((error) => {
        console.error('Camera not started', error);
      });

    return function cleanup() {
      cameraPhoto.stopCamera()
        .then(() => {
          console.log('Camera stoped');
        })
        .catch((error) => {
          console.log('No camera to stop', error);
        });

    }
  }, []);

  function snapPhoto() {
    const dataUri = cameraPhoto?.getDataUri({
      sizeFactor: 1,
      imageType: IMAGE_TYPES.JPG,
      imageCompression: .95,
      isImageMirror: false
    });
    if (dataUri) {
      onSnapPhoto(dataUri);
    }
  }

  return (<div>
    <video
      ref={videoRef}
      autoPlay={true}
      onClick={snapPhoto}
    />
  </div>);
}