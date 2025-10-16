import React, { useState, useRef, useCallback } from 'react';
import { SoilAnalysisResult } from '../services/geminiService';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { CameraIcon } from './icons/CameraIcon';
import { ScienceIcon } from './icons/ScienceIcon';

interface SoilAnalysisProps {
  onSubmit: (imageBase64: string) => void;
  analysis: SoilAnalysisResult | null;
  isLoading: boolean;
  error: string;
}

export const SoilAnalysis: React.FC<SoilAnalysisProps> = ({
  onSubmit,
  analysis,
  isLoading,
  error,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = useCallback(async () => {
    setCameraError('');
    setCapturedImage(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOpen(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access camera. Please ensure permissions are granted and try again.");
        setIsCameraOpen(false);
      }
    } else {
      setCameraError("Camera not supported on this device or browser.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
      }
      closeCamera();
    }
  }, [closeCamera]);

  const handleAnalyze = () => {
    if (capturedImage) {
      onSubmit(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    openCamera();
  };

  const renderResult = () => {
    if (!analysis) return null;
    return (
        <div className="space-y-4 text-left">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-gray-700">Soil Type</h4>
                <p className="text-gray-600">{analysis.soilType}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-gray-700">Texture</h4>
                <p className="text-gray-600">{analysis.texture}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-gray-700">Potential pH</h4>
                <p className="text-gray-600">{analysis.potentialPH}</p>
            </div>
             <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-gray-700">Nutrient Status</h4>
                <p className="text-gray-600">{analysis.nutrientStatus}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-bold text-gray-700">Recommendations</h4>
                <ul className="list-disc list-inside text-gray-600 whitespace-pre-wrap">
                    {analysis.recommendations.split('\n').map((item, index) => item && <li key={index}>{item.replace(/^- /, '')}</li>)}
                </ul>
            </div>
        </div>
    );
  };

  return (
    <div className="mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 border-b pb-2 mb-4">
        <ScienceIcon className="w-6 h-6 text-brand-green" />
        <h2 className="text-xl font-semibold text-gray-800">
          Soil Health Analysis
        </h2>
      </div>

      <div className="min-h-[200px] flex flex-col justify-center items-center text-center">
        {isLoading && (
          <>
            <LoadingSpinner className="w-8 h-8 mb-4" />
            <p className="font-semibold text-gray-500">Analyzing soil composition...</p>
            <p className="text-gray-500">This may take a moment.</p>
          </>
        )}
        {error && <p className="text-red-600 font-semibold">{error}</p>}
        {cameraError && <p className="text-red-600 font-semibold">{cameraError}</p>}

        {!isLoading && !error && !isCameraOpen && !capturedImage && !analysis && (
          <div className="flex flex-col items-center">
             <p className="text-gray-500 mb-4">Get an instant analysis of your soil by taking a picture.</p>
            <button
              onClick={openCamera}
              className="flex justify-center items-center gap-2 bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors duration-200"
            >
              <CameraIcon className="w-5 h-5" />
              Analyze Soil with Camera
            </button>
          </div>
        )}

        {isCameraOpen && (
          <div className="w-full">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border mb-4" />
            <div className="flex justify-center gap-4">
              <button onClick={captureImage} className="bg-brand-green text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-green-dark">Capture</button>
              <button onClick={closeCamera} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        )}

        {!isLoading && capturedImage && !analysis && (
          <div className="w-full flex flex-col items-center">
            <p className="font-semibold mb-2">Image Captured</p>
            <img src={capturedImage} alt="Captured soil" className="max-w-full max-h-64 rounded-lg border mb-4" />
            <div className="flex justify-center gap-4">
              <button onClick={handleAnalyze} className="bg-brand-green text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-green-dark">Analyze</button>
              <button onClick={handleRetake} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400">Retake</button>
            </div>
          </div>
        )}

        {!isLoading && !error && analysis && (
            <div className="w-full">
                {renderResult()}
                <button 
                  onClick={() => { setCapturedImage(null); openCamera(); }}
                  className="mt-6 flex mx-auto justify-center items-center gap-2 bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors duration-200"
                >
                  <CameraIcon className="w-5 h-5" />
                  Analyze Another Sample
                </button>
            </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};
