import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';

const App = () => {
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [jsonData, setJsonData] = useState("");
  const [activeSlide, setActiveSlide] = useState(1);

  // High-Resolution Islamic Backgrounds
  const bgLibrary = [
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1080", // Slide 1
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1080", // Slide 2
    "https://images.unsplash.com/photo-1590076215667-875d4ef2d97e?q=80&w=1080", // Slide 3
    "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1080"  // Slide 4
  ];

  useEffect(() => {
    const canvas = new (fabric as any).fabric.StaticCanvas('canvas', {
      width: 1080,
      height: 1920,
    });
    setFabricCanvas(canvas);
    return () => canvas.dispose();
  }, []);

  useEffect(() => {
    if (jsonData) handleRedraw(activeSlide);
  }, [activeSlide]);

  const handleRedraw = (slideNumber: number) => {
    try {
      const cleanJson = jsonData.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);
      drawSlide(slideNumber, data);
    } catch (e) {
      console.log("Waiting for JSON...");
    }
  };

  const drawSlide = (slideNum: number, data: any) => {
    if (!fabricCanvas) return;
    const f = (fabric as any).fabric;
    fabricCanvas.clear();

    // Use a unique index for backgrounds. If 4 slides share 1 theme, use index 0.
    const bgUrl = bgLibrary[slideNum - 1] || bgLibrary[0];

    f.Image.fromURL(bgUrl, (img: any) => {
      // 1. Background Setup
      img.set({ originX: 'center', originY: 'center', left: 540, top: 960 });
      const scale = Math.max(1080 / img.width, 1920 / img.height);
      img.scale(scale);
      fabricCanvas.add(img);

      // 2. Darkening Layer
      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 1080, height: 1920,
        fill: 'rgba(0,0,0,0.7)', originX: 'center', originY: 'center'
      }));

      // 3. Gold Border
      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 950, height: 1780,
        fill: 'transparent', stroke: '#D4AF37', strokeWidth: 12, originX: 'center', originY: 'center', rx: 25
      }));

      const createText = (text: string, top: number, color: string, size: number, font: string) => {
        return new f.Textbox(text || "", {
          left: 540, top, width: 850, originX: 'center',
          fontSize: size, fill: color, textAlign: 'center',
          fontFamily: font, fontWeight: 'bold', shadow: '3px 3px 15px rgba(0,0,0,1)'
        });
      };

      // 4. Content Logic
      if (slideNum === 1) {
        fabricCanvas.add(createText(data.en.q, 400, '#D4AF37', 58, 'Montserrat'));
        fabricCanvas.add(createText(data.ur.q, 850, '#ffffff', 70, 'Amiri'));
        fabricCanvas.add(createText(data.hi.q, 1300, '#ccc', 45, 'Source Sans 3'));
      } 
      else if (slideNum === 2) {
        fabricCanvas.add(createText("OPTIONS / اختیارات", 250, "#D4AF37", 50, 'Montserrat'));
        ['A', 'B', 'C', 'D'].forEach((l, i) => {
          let y = 500 + (i * 320);
          fabricCanvas.add(createText(`${l}) ${data.en.options[l]}`, y, "white", 45, 'Montserrat'));
          fabricCanvas.add(createText(data.ur.options[l], y + 80, "#D4AF37", 40, 'Amiri'));
          fabricCanvas.add(createText(data.hi.options[l], y + 155, "#aaa", 32, 'Source Sans 3'));
        });
      } 
      else if (slideNum === 3) {
        const a = data.en.a;
        fabricCanvas.add(createText("CORRECT ANSWER", 400, "#D4AF37", 80, 'Montserrat'));
        fabricCanvas.add(createText(`${a}) ${data.en.options[a]}`, 750, "white", 90, 'Montserrat'));
        fabricCanvas.add(createText(data.ur.options[a], 1000, "#ffffff", 85, 'Amiri'));
        fabricCanvas.add(createText(data.hi.options[a], 1300, "#aaa", 60, 'Source Sans 3'));
      } 
      else if (slideNum === 4) {
        fabricCanvas.add(createText("EXPLANATION / وضاحت", 250, "#D4AF37", 60, 'Montserrat'));
        fabricCanvas.add(createText(data.en.exp, 450, "white", 40, 'Source Sans 3'));
        fabricCanvas.add(createText(data.ur.exp, 1000, "#eee", 50, 'Amiri'));
        fabricCanvas.add(createText(data.hi.exp, 1500, "#ccc", 35, 'Source Sans 3'));
      }
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const copyCaption = () => {
    try {
      const data = JSON.parse(jsonData.replace(/```json|```/g, "").trim());
      const cap = `❓ ${data.en.q}\n\n✅ Answer: ${data.en.a}\n\n💡 ${data.en.exp}\n\n#IslamicQuiz #Deen #MuslimCommunity`;
      navigator.clipboard.writeText(cap);
      alert("Caption Copied!");
    } catch(e) { alert("Paste JSON first"); }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white', padding: '20px', textAlign: 'center' }}>
      <div style={panelStyle}>
        <h2 style={{color: '#D4AF37'}}>🕌 Islamic Content Studio</h2>
        <textarea placeholder="Paste JSON here..." onChange={(e) => setJsonData(e.target.value)} style={inputStyle} />
        <div style={{ margin: '15px 0' }}>
          <button onClick={() => handleRedraw(activeSlide)} style={startBtnStyle}>🚀 Start Content Engine</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {[1, 2, 3, 4].map(n => (
            <button key={n} onClick={() => setActiveSlide(n)} style={n === activeSlide ? activeBtnStyle : btnStyle}>Slide {n}</button>
          ))}
        </div>
        <div style={{ marginTop: '15px' }}>
          <button onClick={copyCaption} style={btnStyle}>📝 Copy Caption</button>
          <button onClick={() => { const link = document.createElement('a'); link.download = `Slide_${activeSlide}.jpg`; link.href = fabricCanvas.toDataURL({format: 'jpeg', quality: 1}); link.click(); }} style={downloadBtnStyle}>📥 Download Slide</button>
        </div>
      </div>
      <canvas id="canvas" style={{ border: '4px solid #1a1a1a', borderRadius: '25px', maxWidth: '100%' }} />
    </div>
  );
};

const panelStyle = { background: '#0a0a0a', padding: '20px', borderRadius: '25px', border: '1px solid #333', maxWidth: '600px', margin: '0 auto 20px auto' };
const inputStyle = { width: '100%', height: '70px', background: '#111', color: 'gold', border: '1px solid #444', borderRadius: '10px', padding: '10px', boxSizing: 'border-box' as any };
const btnStyle = { padding: '10px 15px', margin: '5px', borderRadius: '8px', cursor: 'pointer', background: '#222', color: 'white', border: 'none', fontWeight: 'bold' as any };
const startBtnStyle = { ...btnStyle, background: '#D4AF37', color: 'black', width: '100%' };
const activeBtnStyle = { ...btnStyle, background: '#D4AF37', color: 'black' };
const downloadBtnStyle = { ...btnStyle,
