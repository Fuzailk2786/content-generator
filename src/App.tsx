import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';

const App = () => {
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [jsonData, setJsonData] = useState("");
  const [activeSlide, setActiveSlide] = useState(1);

  useEffect(() => {
    const canvas = new (fabric as any).fabric.StaticCanvas('canvas', {
      width: 1080,
      height: 1920,
      backgroundColor: '#050505',
    });
    setFabricCanvas(canvas);
    return () => canvas.dispose();
  }, []);

  // CRITICAL FIX: This tells the app to redraw WHENEVER the slide number changes
  useEffect(() => {
    if (jsonData) {
      handleRedraw(activeSlide);
    }
  }, [activeSlide]);

  const handleRedraw = (slideNumber: number) => {
    try {
      const cleanJson = jsonData.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);
      drawSlide(slideNumber, data);
    } catch (e) {
      console.log("Waiting for valid JSON...");
    }
  };

  const drawSlide = (slideNum: number, data: any) => {
    if (!fabricCanvas) return;
    const f = (fabric as any).fabric;
    fabricCanvas.clear();
    fabricCanvas.setBackgroundColor('#050505', fabricCanvas.renderAll.bind(fabricCanvas));

    // Gold Frame
    fabricCanvas.add(new f.Rect({
      left: 540, top: 960, width: 980, height: 1820,
      fill: 'transparent', stroke: '#D4AF37', strokeWidth: 20, originX: 'center', originY: 'center'
    }));

    const createText = (text: string, top: number, color: string, size: number, font: string) => {
      return new f.Textbox(text || "", {
        left: 540, top, width: 880, originX: 'center',
        fontSize: size, fill: color, textAlign: 'center',
        fontFamily: font, fontWeight: 'bold'
      });
    };

    if (slideNum === 1) {
      fabricCanvas.add(createText(data.en?.q, 350, '#D4AF37', 55, 'Montserrat'));
      fabricCanvas.add(createText(data.ur?.q, 800, '#ffffff', 75, 'Amiri'));
      fabricCanvas.add(createText(data.hi?.q, 1300, '#aaa', 45, 'Source Sans 3'));
    } 
    else if (slideNum === 2) {
      fabricCanvas.add(createText("CHOOSE ONE", 250, "#D4AF37", 55, 'Montserrat'));
      ['A', 'B', 'C', 'D'].forEach((l, i) => {
        let yBase = 500 + (i * 320);
        fabricCanvas.add(createText(`${l}) ${data.en?.options?.[l]}`, yBase, "white", 45, 'Montserrat'));
        fabricCanvas.add(createText(data.ur?.options?.[l], yBase + 85, "#D4AF37", 45, 'Amiri'));
        fabricCanvas.add(createText(data.hi?.options?.[l], yBase + 160, "#aaa", 30, 'Source Sans 3'));
      });
    }
    else if (slideNum === 3) {
      const a = data.en?.a;
      fabricCanvas.add(createText("CORRECT ANSWER", 400, "#D4AF37", 80, 'Montserrat'));
      fabricCanvas.add(createText(`${a}) ${data.en?.options?.[a]}`, 700, "white", 75, 'Montserrat'));
      fabricCanvas.add(createText(data.ur?.options?.[a], 950, "#ffffff", 80, 'Amiri'));
      fabricCanvas.add(createText(data.hi?.options?.[a], 1250, "#aaa", 55, 'Source Sans 3'));
    }
    else if (slideNum === 4) {
      fabricCanvas.add(createText("EXPLANATION", 250, "#D4AF37", 65, 'Montserrat'));
      fabricCanvas.add(createText(data.en?.exp, 450, "white", 40, 'Source Sans 3'));
      fabricCanvas.add(createText(data.ur?.exp, 1000, "#ffffff", 55, 'Amiri'));
      fabricCanvas.add(createText(data.hi?.exp, 1500, "#aaa", 35, 'Source Sans 3'));
    }
    fabricCanvas.renderAll();
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white', padding: '20px', textAlign: 'center', fontFamily: 'Montserrat' }}>
      <div style={panelStyle}>
        <h2 style={{color: '#D4AF37', margin: '0 0 15px 0'}}>🕌 Islamic Content Factory Pro</h2>
        <textarea 
          placeholder="Paste JSON here..." 
          onChange={(e) => setJsonData(e.target.value)}
          style={inputStyle}
        />
        <div style={{ margin: '15px 0' }}>
          {[1, 2, 3, 4].map(n => (
            <button key={n} onClick={() => setActiveSlide(n)} style={n === activeSlide ? activeBtnStyle : btnStyle}>
              Slide {n}
            </button>
          ))}
        </div>
        <button onClick={() => { const link = document.createElement('a'); link.download = `Slide_${activeSlide}.jpg`; link.href = fabricCanvas.toDataURL({format: 'jpeg', quality: 1}); link.click(); }} style={downloadBtnStyle}>📥 Download Slide {activeSlide}</button>
      </div>
      <canvas id="canvas" style={{ border: '4px solid #222', borderRadius: '20px', maxWidth: '100%' }} />
    </div>
  );
};

const panelStyle = { background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #333', maxWidth: '600px', margin: '0 auto 20px auto' };
const inputStyle = { width: '100%', height: '80px', background: '#222', color: '#D4AF37', border: '1px solid #444', borderRadius: '10px', padding: '10px', boxSizing: 'border-box' as const };
const btnStyle = { padding: '10px 20px', margin: '5px', borderRadius: '8px', cursor: 'pointer', background: '#333', color: 'white', border: 'none', fontWeight: 'bold' as const };
const activeBtnStyle = { ...btnStyle, background: '#D4AF37', color: 'black' };
const downloadBtnStyle = { ...btnStyle, background: 'white', color: 'black', width: '100%', marginTop: '10px' };

export default App;
