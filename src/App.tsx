import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';

const App = () => {
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [jsonData, setJsonData] = useState("");
  const [activeSlide, setActiveSlide] = useState(1);

  const bgLibrary = [
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1080",
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1080",
    "https://images.unsplash.com/photo-1590076215667-875d4ef2d97e?q=80&w=1080",
    "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1080"
  ];

  useEffect(() => {
    const canvas = new (fabric as any).fabric.StaticCanvas('canvas', {
      width: 1080,
      height: 1920,
    });
    setFabricCanvas(canvas);
    return () => canvas.dispose();
  }, []);

  // Automatically redraws when slide number changes
  useEffect(() => {
    if (jsonData) handleRedraw(activeSlide);
  }, [activeSlide]);

  const handleRedraw = (slideNumber: number) => {
    try {
      const cleanJson = jsonData.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);
      drawSlide(slideNumber, data);
    } catch (e) {
      console.log("Waiting for valid JSON input...");
    }
  };

  const drawSlide = (slideNum: number, data: any) => {
    if (!fabricCanvas) return;
    const f = (fabric as any).fabric;
    fabricCanvas.clear();

    // Load Unique Background
    f.Image.fromURL(bgLibrary[slideNum - 1] || bgLibrary[0], (img: any) => {
      img.scaleToWidth(1080);
      img.set({ originX: 'center', originY: 'center', left: 540, top: 960 });
      fabricCanvas.add(img);

      const overlay = new f.Rect({
        left: 540, top: 960, width: 1080, height: 1920,
        fill: 'rgba(0,0,0,0.65)', originX: 'center', originY: 'center'
      });
      fabricCanvas.add(overlay);

      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 950, height: 1780,
        fill: 'transparent', stroke: '#D4AF37', strokeWidth: 12, originX: 'center', originY: 'center', rx: 25
      }));

      const createText = (text: string, top: number, color: string, size: number, font: string) => {
        return new f.Textbox(text || "", {
          left: 540, top, width: 850, originX: 'center',
          fontSize: size, fill: color, textAlign: 'center',
          fontFamily: font, fontWeight: 'bold', shadow: '3px 3px 15px rgba(0,0,0,0.9)'
        });
      };

      // --- MULTILINGUAL LOGIC FOR ALL SLIDES ---
      if (slideNum === 1) { // QUESTION
        fabricCanvas.add(createText(data.en.q, 400, '#D4AF37', 58, 'Montserrat'));
        fabricCanvas.add(createText(data.ur.q, 850, '#ffffff', 70, 'Amiri'));
        fabricCanvas.add(createText(data.hi.q, 1300, '#ccc', 45, 'Source Sans 3'));
      } 
      else if (slideNum === 2) { // OPTIONS
        fabricCanvas.add(createText("CHOOSE ONE / ایک منتخب کریں", 250, "#D4AF37", 50, 'Montserrat'));
        ['A', 'B', 'C', 'D'].forEach((l, i) => {
          let y = 500 + (i * 320);
          fabricCanvas.add(createText(`${l}) ${data.en.options[l]}`, y, "white", 45, 'Montserrat'));
          fabricCanvas.add(createText(data.ur.options[l], y + 80, "#D4AF37", 40, 'Amiri'));
          fabricCanvas.add(createText(data.hi.options[l], y + 155, "#aaa", 32, 'Source Sans 3'));
        });
      } 
      else if (slideNum === 3) { // CORRECT ANSWER
        const a = data.en.a;
        fabricCanvas.add(createText("CORRECT ANSWER", 400, "#D4AF37", 80, 'Montserrat'));
        fabricCanvas.add(createText(`${a}) ${data.en.options[a]}`, 750, "white", 90, 'Montserrat'));
        fabricCanvas.add(createText(data.ur.options[a], 1000, "#ffffff", 85, 'Amiri'));
        fabricCanvas.add(createText(data.hi.options[a], 1300, "#aaa", 60, 'Source Sans 3'));
      } 
      else if (slideNum === 4) { // EXPLANATION
        fabricCanvas.add(createText("EXPLANATION / وضاحت", 250, "#D4AF37", 60, 'Montserrat'));
        fabricCanvas.add(createText(data.en.exp, 450, "white", 40, 'Source Sans 3'));
        fabricCanvas.add(createText(data.ur.exp, 1000, "#eee", 50, 'Amiri'));
        fabricCanvas.add(createText(data.hi.exp, 1500, "#ccc", 35, 'Source Sans 3'));
      }
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const copyCaption = () => {
    const data = JSON.parse(jsonData.replace(/```json|```/g, ""));
    const caption = `❓ ${data.en.q}\n\n✅ Answer: ${data.en.a}\n\n💡 ${data.en.exp}\n\n#IslamicQuiz #Deen #DailyHadith #Muslim`;
    navigator.clipboard.writeText(caption);
    alert("Caption Copied!");
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white', padding: '20px', textAlign: 'center' }}>
      <div style={panelStyle}>
        <h2 style={{color: '#D4AF37', margin: '0 0 10px 0'}}>🕌 Islamic Content Studio</h2>
        <textarea 
          placeholder="Paste JSON here..." 
          onChange={(e) => setJsonData(e.target.value)}
          style={inputStyle} 
        />
        <div style={{ margin: '15px 0' }}>
          <button onClick={() => handleRedraw(activeSlide)} style={startBtnStyle}>🚀 Start Content Engine</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(n => (
            <button key={n} onClick={() => setActiveSlide(n)} style={n === activeSlide ? activeBtnStyle : btnStyle}>Slide {n}</button>
          ))}
        </div>
        <div style={{ marginTop: '15px' }}>
          <button onClick={copyCaption} style={btnStyle}>📝 Copy Caption</button>
          <button onClick={() => { const link = document.createElement('a'); link.download = `Slide_${activeSlide}.jpg`;
