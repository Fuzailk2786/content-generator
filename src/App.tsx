import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';

const App = () => {
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [jsonData, setJsonData] = useState('');
  const [activeSlide, setActiveSlide] = useState(1);

  const bgLibrary = [
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1080',
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1080',
    'https://images.unsplash.com/photo-1590076215667-875d4ef2d97e?q=80&w=1080',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1080',
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
  }, [activeSlide, jsonData]);

  const handleRedraw = (slideNumber: number) => {
    try {
      const cleanJson = jsonData.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      drawSlide(slideNumber, data);
    } catch (e) {
      console.log('Waiting for JSON...');
    }
  };

  const drawSlide = (slideNum: number, data: any) => {
    if (!fabricCanvas) return;
    const f = (fabric as any).fabric;
    fabricCanvas.clear();

    const bgUrl = bgLibrary[slideNum - 1] || bgLibrary[0];

    f.Image.fromURL(bgUrl, (img: any) => {
      img.set({ originX: 'center', originY: 'center', left: 540, top: 960 });
      const scale = Math.max(1080 / img.width, 1920 / img.height);
      img.scale(scale);
      fabricCanvas.add(img);

      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 1080, height: 1920,
        fill: 'rgba(0,0,0,0.7)', originX: 'center', originY: 'center',
      }));

      fabricCanvas.add(new f.Rect({
        left: 540, top: 960, width: 950, height: 1780,
        fill: 'transparent', stroke: '#D4AF37', strokeWidth: 12, originX: 'center', originY: 'center', rx: 25,
      }));

      // --- HELPER FUNCTION FOR DYNAMIC STACKING ---
      let currentY = 300; // Start position

      const addStackedText = (text: string, color: string, size: number, font: string, spacing = 40) => {
        const textbox = new f.Textbox(text || '', {
          left: 540,
          top: currentY,
          width: 850,
          originX: 'center',
          fontSize: size,
          fill: color,
          textAlign: 'center',
          fontFamily: font,
          fontWeight: 'bold',
          shadow: '3px 3px 15px rgba(0,0,0,1)',
        });
        fabricCanvas.add(textbox);
        // Move currentY down by the height of this text + spacing
        currentY += (textbox.height + spacing);
        return textbox;
      };

      if (slideNum === 1) {
        currentY = 400; // Reset for Slide 1
        addStackedText(data.en.q, '#D4AF37', 58, 'Montserrat', 60);
        addStackedText(data.ur.q, '#ffffff', 70, 'Amiri', 60);
        addStackedText(data.hi.q, '#ccc', 45, 'Source Sans 3', 0);
      } 
      else if (slideNum === 2) {
        currentY = 250;
        addStackedText('OPTIONS / اختیارات', '#D4AF37', 55, 'Montserrat', 80);
        ['A', 'B', 'C', 'D'].forEach((l) => {
          addStackedText(`${l}) ${data.en.options[l]}`, 'white', 45, 'Montserrat', 15);
          addStackedText(data.ur.options[l], '#D4AF37', 40, 'Amiri', 15);
          addStackedText(data.hi.options[l], '#aaa', 30, 'Source Sans 3', 40);
        });
      } 
      else if (slideNum === 3) {
        currentY = 450;
        addStackedText('CORRECT ANSWER', '#D4AF37', 80, 'Montserrat', 60);
        const a = data.en.a;
        addStackedText(`${a}) ${data.en.options[a]}`, 'white', 90, 'Montserrat', 60);
        addStackedText(data.ur.options[a], '#ffffff', 85, 'Amiri', 60);
        addStackedText(data.hi.options[a], '#aaa', 60, 'Source Sans 3', 0);
      } 
      else if (slideNum === 4) {
        currentY = 300;
        addStackedText('EXPLANATION / وضاحت', '#D4AF37', 65, 'Montserrat', 80);
        addStackedText(data.en.exp, 'white', 42, 'Source Sans 3', 60);
        addStackedText(data.ur.exp, '#eee', 52, 'Amiri', 60);
        addStackedText(data.hi.exp, '#ccc', 38, 'Source Sans 3', 0);
      }

      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const copyCaption = () => {
    try {
      const data = JSON.parse(jsonData.replace(/```json|```/g, '').trim());
      const highReach = ['#IslamicQuiz', '#Deen', '#Knowledge', '#ExplorePage', '#Viral'];
      const mediumReach = ['#IslamicReminders', '#MuslimUmmah', '#DailyHadith', '#QuranVerses', '#IslamicEducation'];
      const nicheReach = ['#ProphetStories', '#IslamicHistory', '#SunnahLife', '#IslamicPosts', '#Dawah'];
      const localReach = ['#MuslimsInIndia', '#BangaloreMuslims'];
      const allHashtags = [...highReach, ...mediumReach, ...nicheReach, ...localReach].join(' ');

      const fullCaption = `❓ QUESTION:\n${data.en.q}\n\n✅ ANSWER: ${data.en.a}) ${data.en.options[data.en.a]}\n\n💡 DID YOU KNOW?\n${data.en.exp}\n\n. . .\n${allHashtags}`;
      navigator.clipboard.writeText(fullCaption);
      alert('Professional Caption & Hashtags Copied! 🚀');
    } catch (e) { alert("Please paste your JSON first."); }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white', padding: '20px', textAlign: 'center' }}>
      <div style={panelStyle}>
        <h2 style={{ color: '#D4AF37' }}>🕌 Islamic Content Studio</h2>
        <textarea placeholder="Paste JSON here..." onChange={(e) => setJsonData(e.target.value)} style={inputStyle} />
        <div style={{ margin: '15px 0' }}>
          <button onClick={() => handleRedraw(activeSlide)} style={startBtnStyle}>🚀 Start Content Engine</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setActiveSlide(n)} style={n === activeSlide ? activeBtnStyle : btnStyle}>Slide {n}</button>
          ))}
        </div>
        <div style={{ marginTop: '15px' }}>
          <button onClick={copyCaption} style={btnStyle}>📝 Copy Caption</button>
          <button onClick={() => {
            const link = document.createElement('a');
            link.download = `Slide_${activeSlide}.jpg`;
            link.href = fabricCanvas.toDataURL({ format: 'jpeg', quality: 1 });
            link.click();
          }} style={downloadBtnStyle}>📥 Download Slide</button>
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
const downloadBtnStyle = { ...btnStyle, background: 'white', color: 'black' };

export default App;
