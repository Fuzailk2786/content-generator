import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';
import JSZip from 'jszip'; // <--- THIS LINE IS CRITICAL

const App = () => {
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [jsonData, setJsonData] = useState('');
  const [activeSlide, setActiveSlide] = useState(1);
  const [isTransparent, setIsTransparent] = useState(false); // New Feature

  const bgLibrary = [
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1080',
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1080',
    'https://images.unsplash.com/photo-1590076215667-875d4ef2d97e?q=80&w=1080',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1080',
    'https://images.unsplash.com/photo-1590076215667-875d4ef2d97e?q=80&w=1080' // Slide 5 BG
  ];

  useEffect(() => {
    const canvas = new (fabric as any).fabric.StaticCanvas('canvas', {
      width: 1080, height: 1920,
    });
    setFabricCanvas(canvas);
    return () => canvas.dispose();
  }, []);

  useEffect(() => {
    if (jsonData) handleRedraw(activeSlide);
  }, [activeSlide, jsonData, isTransparent]);

  const handleRedraw = (slideNumber: number) => {
    try {
      const cleanJson = jsonData.replace(/```json|
```/g, '').trim();
      const data = JSON.parse(cleanJson);
      drawSlide(slideNumber, data);
    } catch (e) { console.log('Waiting for JSON...'); }
  };

  const drawSlide = async (slideNum: number, data: any) => {
    if (!fabricCanvas) return;
    const f = (fabric as any).fabric;
    fabricCanvas.clear();

    if (!isTransparent) {
      const bgUrl = bgLibrary[slideNum - 1] || bgLibrary[0];
      await new Promise((resolve) => {
        f.Image.fromURL(bgUrl, (img: any) => {
          img.set({ originX: 'center', originY: 'center', left: 540, top: 960 });
          img.scale(Math.max(1080 / img.width, 1920 / img.height));
          fabricCanvas.add(img);
          resolve(true);
        }, { crossOrigin: 'anonymous' });
      });

      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 1080, height: 1920,
        fill: 'rgba(0,0,0,0.7)', originX: 'center', originY: 'center'
      }));

      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 950, height: 1780,
        fill: 'transparent', stroke: '#D4AF37', strokeWidth: 12, originX: 'center', originY: 'center', rx: 25
      }));
    }

    let currentY = 350;
    const addText = (text: string, color: string, size: number, font: string, spacing = 40) => {
      const tb = new f.Textbox(text || '', {
        left: 540, top: currentY, width: 850, originX: 'center',
        fontSize: size, fill: color, textAlign: 'center',
        fontFamily: font, fontWeight: 'bold', shadow: isTransparent ? '' : '3px 3px 15px rgba(0,0,0,1)'
      });
      fabricCanvas.add(tb);
      currentY += (tb.height + spacing);
    };

    if (slideNum === 1) {
      addText(data.en.q, '#D4AF37', 60, 'Montserrat', 60);
      addText(data.ur.q, '#ffffff', 75, 'Amiri', 60);
      addText(data.hi.q, '#ccc', 45, 'Source Sans 3', 0);
    } else if (slideNum === 2) {
      addText('OPTIONS', '#D4AF37', 55, 'Montserrat', 80);
      ['A', 'B', 'C', 'D'].forEach(l => {
        addText(`${l}) ${data.en.options[l]}`, 'white', 45, 'Montserrat', 10);
        addText(data.ur.options[l], '#D4AF37', 40, 'Amiri', 40);
      });
    } else if (slideNum === 3) {
      addText('CORRECT ANSWER', '#D4AF37', 80, 'Montserrat', 80);
      addText(`${data.en.a}) ${data.en.options[data.en.a]}`, 'white', 90, 'Montserrat', 60);
      addText(data.ur.options[data.en.a], '#ffffff', 85, 'Amiri', 0);
    } else if (slideNum === 4) {
      addText('EXPLANATION', '#D4AF37', 65, 'Montserrat', 80);
      addText(data.en.exp, 'white', 42, 'Source Sans 3', 60);
      addText(data.ur.exp, '#eee', 52, 'Amiri', 0);
    } else if (slideNum === 5) {
      currentY = 500;
      addText("Did you know this already?", '#D4AF37', 60, 'Montserrat', 40);
      addText("Comment 'SubhanAllah' if you learned something new today!", 'white', 45, 'Source Sans 3', 150);
      addText("🔖 Save this to your 'Knowledge' folder", '#ffffff', 40, 'Montserrat', 30);
      addText("👥 Tag a friend to test their Deen", '#D4AF37', 40, 'Montserrat', 0);
    }
    fabricCanvas.renderAll();
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const data = JSON.parse(jsonData.replace(/```json|```/g, '').trim());
    for (let i = 1; i <= 5; i++) {
      await drawSlide(i, data);
      const dataURL = fabricCanvas.toDataURL({ format: 'png' });
      zip.file(`Slide_${i}.png`, dataURL.split(',')[1], { base64: true });
    }
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = isTransparent ? "Transparent_Assets.zip" : "Islamic_Carousel.zip";
    link.click();
    handleRedraw(activeSlide);
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white', padding: '20px', textAlign: 'center' }}>
      <div style={panelStyle}>
        <h2 style={{ color: '#D4AF37' }}>🕌 Islamic Content Studio Pro</h2>
        <textarea placeholder="Paste JSON..." onChange={(e) => setJsonData(e.target.value)} style={inputStyle} />
        <div style={{ margin: '15px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <input type="checkbox" id="trans" checked={isTransparent} onChange={(e) => setIsTransparent(e.target.checked)} />
          <label htmlFor="trans" style={{ color: '#00ffcc', fontWeight: 'bold' }}>Enable Transparent Mode (for Video Editing)</label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setActiveSlide(n)} style={n === activeSlide ? activeBtnStyle : btnStyle}>Slide {n}</button>
          ))}
        </div>
        <button onClick={downloadZip} style={zipBtnStyle}>📦 Download All (5 Slides) as ZIP</button>
      </div>
      <canvas id="canvas" style={{ border: '4px solid #1a1a1a', borderRadius: '25px', maxWidth: '100%' }} />
    </div>
  );
};

const panelStyle = { background: '#0a0a0a', padding: '20px', borderRadius: '25px', border: '1px solid #333', maxWidth: '600px', margin: '0 auto 20px auto' };
const inputStyle = { width: '100%', height: '60px', background: '#111', color: 'gold', border: '1px solid #444', borderRadius: '10px', padding: '10px' };
const btnStyle = { padding: '10px 15px', margin: '5px', borderRadius: '8px', cursor: 'pointer', background: '#222', color: 'white', border: 'none', fontWeight: 'bold' as any };
const activeBtnStyle = { ...btnStyle, background: '#D4AF37', color: 'black' };
const zipBtnStyle = { ...btnStyle, background: '#00ffcc', color: 'black', width: '100%', marginTop: '10px' };

export default App;
