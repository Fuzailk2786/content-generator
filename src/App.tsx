import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

const App = () => {
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [jsonData, setJsonData] = useState('');

  useEffect(() => {
    // We target the ID 'canvas' from the HTML below
    const canvas = new (fabric as any).fabric.StaticCanvas('canvas', {
      width: 1080,
      height: 1350,
      backgroundColor: '#0a0a0a',
    });
    setFabricCanvas(canvas);

    // Cleanup function to prevent duplicate canvases
    return () => {
      canvas.dispose();
    };
  }, []);

  const generateSlides = () => {
    try {
      // Cleaning the JSON from any AI-added text
      const cleanJson = jsonData.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      drawSlide(data);
    } catch (e) {
      alert('JSON Error: Make sure you copied the whole block!');
    }
  };

  const drawSlide = (data: any) => {
    if (!fabricCanvas) return;
    const f = (fabric as any).fabric; // Shortcut to the fabric library

    fabricCanvas.clear();
    fabricCanvas.setBackgroundColor(
      '#0a0a0a',
      fabricCanvas.renderAll.bind(fabricCanvas)
    );

    // 1. Add Gold Border
    const rect = new f.Rect({
      left: 540, // Center it
      top: 675,
      width: 980,
      height: 1250,
      fill: 'transparent',
      stroke: '#FFD700',
      strokeWidth: 20,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    fabricCanvas.add(rect);

    // 2. Multilingual Content stacking
    const createText = (
      str: string,
      top: number,
      color: string,
      fontSize: number,
      isUrdu = false
    ) => {
      return new f.Textbox(str, {
        left: 540,
        top: top,
        width: 880,
        originX: 'center',
        fontSize: fontSize,
        fill: color,
        textAlign: 'center',
        fontFamily: isUrdu ? 'Noto Nastaliq Urdu' : 'Poppins',
        fontWeight: 'bold',
      });
    };

    const enQ = createText(data.en.q, 200, '#FFD700', 50);
    const urQ = createText(data.ur.q, 600, '#00ffcc', 60, true);
    const hiQ = createText(data.hi.q, 1000, '#ffffff', 40);

    fabricCanvas.add(enQ, urQ, hiQ);
    fabricCanvas.renderAll();
  };

  const downloadImage = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.9 });
    const link = document.createElement('a');
    link.download = 'Islamic_Post.jpg';
    link.href = dataURL;
    link.click();
  };

  return (
    <div
      style={{
        background: '#111',
        color: 'white',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ color: 'gold' }}>🕌 Islamic Content Factory Pro</h2>
      <textarea
        style={{
          width: '90%',
          height: '100px',
          background: '#222',
          color: 'gold',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #444',
        }}
        placeholder="Paste JSON here..."
        onChange={(e) => setJsonData(e.target.value)}
      />
      <div style={{ margin: '20px' }}>
        <button onClick={generateSlides} style={btnStyle}>
          🎨 Design Slide
        </button>
        <button
          onClick={downloadImage}
          style={{ ...btnStyle, background: 'white' }}
        >
          📥 Download JPG
        </button>
      </div>
      <canvas
        id="canvas"
        style={{
          border: '2px solid gold',
          borderRadius: '15px',
          maxWidth: '100%',
        }}
      />
    </div>
  );
};

const btnStyle = {
  padding: '12px 25px',
  margin: '5px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  background: '#FFD700',
  border: 'none',
  color: 'black',
};

export default App;
