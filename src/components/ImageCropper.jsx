import { useEffect, useRef, useState } from 'react';

const ImageCropper = ({ imageSrc, boxSize = 240, onCancel, onCrop }) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });

      // initial scale to cover box
      const initial = Math.max(boxSize / img.naturalWidth, boxSize / img.naturalHeight);
      setScale(initial);

      // center image
      const dispW = img.naturalWidth * initial;
      const dispH = img.naturalHeight * initial;
      setTranslate({ x: (boxSize - dispW) / 2, y: (boxSize - dispH) / 2 });
    };

    if (img.complete) onLoad();
    else img.addEventListener('load', onLoad);

    return () => img.removeEventListener('load', onLoad);
  }, [imageSrc, boxSize]);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const getDisplayed = () => {
    return { w: natural.w * scale, h: natural.h * scale };
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    const disp = getDisplayed();
    const minX = Math.min(0, boxSize - disp.w);
    const minY = Math.min(0, boxSize - disp.h);

    setTranslate((t) => ({
      x: clamp(t.x + dx, minX, 0),
      y: clamp(t.y + dy, minY, 0)
    }));
  };

  const onPointerUp = (e) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleZoom = (e) => {
    const newScale = Number(e.target.value);
    // adjust translate to keep center approximately in place
    const dispBefore = getDisplayed();
    const cx = (boxSize / 2 - translate.x) / (dispBefore.w || 1);
    const cy = (boxSize / 2 - translate.y) / (dispBefore.h || 1);

    const newDispW = natural.w * newScale;
    const newDispH = natural.h * newScale;

    const newX = boxSize / 2 - cx * newDispW;
    const newY = boxSize / 2 - cy * newDispH;

    const minX = Math.min(0, boxSize - newDispW);
    const minY = Math.min(0, boxSize - newDispH);

    setScale(newScale);
    setTranslate({ x: clamp(newX, minX, 0), y: clamp(newY, minY, 0) });
  };

  const doCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    const px = boxSize;
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');

    // source rect in original image coordinates
    const sx = ((-translate.x) / scale) || 0;
    const sy = ((-translate.y) / scale) || 0;
    const sSize = (boxSize / scale) || 0;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, px, px);

    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, px, px);

    const dataUrl = canvas.toDataURL('image/png');
    onCrop(dataUrl);
  };

  if (!imageSrc) return null;

  const minScale = Math.max(boxSize / (natural.w || boxSize), boxSize / (natural.h || boxSize));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 720, background: '#0f172a', color: 'white', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: boxSize, height: boxSize, background: '#111827', overflow: 'hidden', position: 'relative', borderRadius: 12 }}
               onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} ref={containerRef}>
            <img ref={imgRef} src={imageSrc} alt="crop" style={{ position: 'absolute', left: translate.x + 'px', top: translate.y + 'px', transform: `scale(${scale})`, transformOrigin: 'top left', userSelect: 'none', touchAction: 'none' }} draggable={false} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 12 }}>Zoom</div>
            <input type="range" min={minScale} max={Math.max(minScale * 3, minScale + 0.1)} step={0.01} value={scale} onChange={handleZoom} style={{ width: '100%' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 8, background: '#111827', color: 'white', border: '1px solid #334155' }}>Cancel</button>
              <button onClick={doCrop} style={{ padding: '8px 12px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none' }}>Crop</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
