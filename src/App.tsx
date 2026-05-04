import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';

const App = () => {
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [jsonData, setJsonData] = useState("");
  const [activeSlide, setActiveSlide] = useState(1);

  // Background Library - High Quality Islamic Imagery
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

  useEffect(() => {
    if (jsonData) handleRedraw(activeSlide);
  }, [activeSlide]);

  const handleRedraw = (slideNumber: number) => {
    try {
      const data = JSON.parse(jsonData.replace(/```json|```/g, "").trim());
      drawSlide(slideNumber, data);
    } catch (e) { console.log("Waiting for JSON..."); }
  };

  const drawSlide = (slideNum: number, data: any) => {
    if (!fabricCanvas) return;
    const f = (fabric as any).fabric;
    fabricCanvas.clear();

    // Load Unique Background for each slide
    f.Image.fromURL(bgLibrary[slideNum - 1], (img: any) => {
      img.scaleToWidth(1080);
      img.set({ originX: 'center', originY: 'center', left: 540, top: 960 });
      fabricCanvas.add(img);

      // Dark Overlay for Readability
      const overlay = new f.Rect({
        left: 540, top: 960, width: 1080, height: 1920,
        fill: 'rgba(0,0,0,0.6)', originX: 'center', originY: 'center'
      });
      fabricCanvas.add(overlay);

      // Gold Frame
      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 950, height: 1780,
        fill: 'transparent', stroke: '#D4AF37', strokeWidth: 12, originX: 'center', originY: 'center', rx: 20
      }));

      const createText = (text: string, top: number, color: string, size: number, font: string) => {
        return new f.Textbox(text || "", {
          left: 540, top, width: 850, originX: 'center',
          fontSize: size, fill: color, textAlign: 'center',
          fontFamily: font, fontWeight: 'bold', shadow: '2px 2px 10px rgba(0,0,0,0.8)'
        });
      };

      // Slide Logic (Question, Options, Answer, Explanation)
      if (slideNum === 1) {
        fabricCanvas.add(createText(data.en.q, 450, '#D4AF37', 58, 'Montserrat'));
        fabricCanvas.add(createText(data.ur.q, 900, '#ffffff', 70, 'Amiri'));
        fabricCanvas.add(createText(data.hi.q, 1350, '#ccc', 45, 'Source Sans 3'));
      } else if (slideNum === 2) {
        fabricCanvas.add(createText("QUIZ OPTIONS", 300, "#D4AF37", 50, 'Montserrat'));
        ['A', 'B', 'C', 'D'].forEach((l, i) => {
          let y = 600 + (i * 280);
          fabricCanvas.add(createText(`${l}) ${data.en.options[l]}`, y, "white", 45, 'Montserrat'));
          fabricCanvas.add(createText(data.ur.options[l], y + 80, "#D4AF37", 40, 'Amiri'));
        });
      } else if (slideNum === 3) {
        fabricCanvas.add(createText("CORRECT ANSWER", 600, "#D4AF37", 80, 'Montserrat'));
        fabricCanvas.add(createText(`${data.en.a}) ${data.en.options[data.en.a]}`, 900, "white", 90, 'Montserrat'));
      } else if (slideNum === 4) {
        fabricCanvas.add(createText("EXPLANATION", 300, "#D4AF37", 60, 'Montserrat'));
        fabricCanvas.add(createText(data.en.exp, 550, "white", 40, 'Source Sans 3'));
        fabricCanvas.add(createText(data.ur.exp, 1100, "#eee", 50, 'Amiri'));
      }
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const copyCaption = () => {
    const data = JSON.parse(jsonData.replace(/```json|```/g, ""));
    const caption = `❓ Quiz: ${data.en.q}\n\n✅ Answer: ${data.en.a}\n\n💡 Info: ${data.en.exp}\n\n#IslamicQuiz #Deen #DailyHadith #MuslimCommunity #IslamicKnowledge`;
    navigator.clipboard.writeText(caption);
    alert("Caption & Hashtags copied!");
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white', padding: '20px', textAlign: 'center' }}>
      <div style={panelStyle}>
        <h2 style={{color: '#D4AF37'}}>🕌 Islamic Studio Pro</h2>
        <textarea placeholder="Paste JSON..." onChange={(e) => setJsonData(e.target.value)} style={inputStyle} />
        <div style={{ margin: '15px 0' }}>
          {[1, 2, 3, 4].map(n => (
            <button key={n} onClick={() => setActiveSlide(n)} style={n === activeSlide ? activeBtnStyle : btnStyle}>Slide {n}</button>
          ))}
        </div>
        <button onClick={copyCaption} style={btnStyle}>📝 Copy Caption</button>
        <button onClick={() => { const link = document.createElement('a'); link.download = `Post_${activeSlide}.jpg`; link.href = fabricCanvas.toDataURL({format: 'jpeg', quality: 1}); link.click(); }} style={downloadBtnStyle}>📥 Download Slide</button>
      </div>
      <canvas id="canvas" style={{ border: '4px solid #222', borderRadius: '20px', maxWidth: '100%' }} />
    </div>
  );
};

const panelStyle = { background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #333', maxWidth: '600px', margin: '0 auto 20px auto' };
const inputStyle = { width: '100%', height: '60px', background: '#222', color: 'gold', border: '1px solid #444', borderRadius: '10px', padding: '10px' };
const btnStyle = { padding: '10px 15px', margin: '5px', borderRadius: '8px', cursor: 'pointer', background: '#333', color: 'white', border: 'none', fontWeight: 'bold' as any };
const activeBtnStyle = { ...btnStyle, background: '#D4AF37', color: 'black' };
const downloadBtnStyle = { ...btnStyle, background: 'white', color: 'black', width: '100%', marginTop: '10px' };

export default App;
