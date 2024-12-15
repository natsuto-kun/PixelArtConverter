import React, { useRef, useState } from "react";
import "../style/test.css";

const CustomFileInput: React.FC<{
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      {/* カスタムデザインのボタン */}
      <button className="custom-file-button" onClick={handleClick}>
        ファイルを選択
      </button>
      {/* 隠されたinput[type="file"] */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileChange}
      />
    </div>
  );
};

const PixelArtConverter = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [resultImage, setResultImage] = useState<string | null>(null);

  const DOT_SIZE = 2;
  const SCALE = 0.5;
  const PALETTE: [number, number, number][] = [
    [172, 242, 121],
    [154, 217, 108],
    [117, 166, 83],
    [83, 115, 60],
    [13, 13, 13],
    [144, 215, 90],  // 明るめの緑
    [133, 211, 76],  // 若干暗く、落ち着いた緑
    [108, 183, 92],  // 少し青みがかった緑
    [92, 170, 85],   // わずかに灰色がかっている
    [126, 203, 116], // 少し黄色みのある緑
    [164, 231, 99],  // 明るい黄色寄りの緑
    [138, 198, 72],  // ほぼ黄緑
    [124, 182, 110], // 少し落ち着いた緑
    [102, 173, 97],  // 暗めの緑
    [147, 227, 105], // 黄緑寄りで明るい
    [131, 195, 121]  // 緑が少し濃い
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setUploadedImage(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConvert = () => {
    if (!uploadedImage || !canvasRef.current) {
      alert("画像を選択してください！");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = uploadedImage;
    const originalWidth = img.width;
    const originalHeight = img.height;

    const scaledWidth = Math.floor(originalWidth * SCALE);
    const scaledHeight = Math.floor(originalHeight * SCALE);

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];

        if (a === 0) {
          continue;
        }

        const [newR, newG, newB] = findClosestColor([r, g, b], PALETTE);

        imageData.data[i] = newR;
        imageData.data[i + 1] = newG;
        imageData.data[i + 2] = newB;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.width = scaledWidth * DOT_SIZE;
    canvas.height = scaledHeight * DOT_SIZE;

    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];

        if (a === 0) {
          continue;
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        ctx.fillRect(x * DOT_SIZE, y * DOT_SIZE, DOT_SIZE, DOT_SIZE);
      }
    }

    const dataUrl = canvas.toDataURL("image/png");
    setResultImage(dataUrl);
  };

  const findClosestColor = (
    color: [number, number, number],
    palette: [number, number, number][]
  ): [number, number, number] => {
    let closestColor = palette[0];
    let minDistance = Number.MAX_VALUE;

    palette.forEach(([pr, pg, pb]) => {
      const distance = Math.sqrt(
        Math.pow(color[0] - pr, 2) +
          Math.pow(color[1] - pg, 2) +
          Math.pow(color[2] - pb, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = [pr, pg, pb];
      }
    });

    return closestColor;
  };

  return (
    <div>
      <h1 className="h-test">画像をドット絵風に変換</h1>
      <CustomFileInput onFileChange={handleFileUpload} />
      <button className="test" onClick={handleConvert}>変換</button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {resultImage && (
        <div>
          <h2>変換後の画像</h2>
          <img src={resultImage} alt="ドット絵に変換された画像" />
        </div>
      )}
    </div>
  );
};

export default PixelArtConverter;
