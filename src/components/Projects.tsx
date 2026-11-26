import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import { repos } from '../data/repos';
import type { Repo } from '../data/repos';
import './Projects.css';

// A second copy lets four projects fill both edges of the curved track.
const railProjects = [...repos, ...repos];
const wheelPixelsPerProject = 320;
const wheelSettleDelay = 140;

function wrap(value: number, length: number): number {
  return ((value % length) + length) % length;
}

function distanceAroundRail(slot: number, position: number): number {
  const halfway = railProjects.length / 2;
  return wrap(slot - position + halfway, railProjects.length) - halfway;
}

function Projects(): JSX.Element {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeSlot, setActiveSlot] = useState(0);
  const [prdDialog, setPrdDialog] = useState<{ project: Repo; open: boolean } | null>(null);
  const project = railProjects[activeSlot];
  const [title, subtitle] = project.displayName.split(' · ');
  const prdUrl = prdDialog?.project.prdUrl;
  const hasLocalPdf = prdUrl?.startsWith('./') && /\.pdf(?:[?#]|$)/i.test(prdUrl);

  function closePrd() {
    setPrdDialog((current) => current && { ...current, open: false });
  }

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const stage = element;

    const phones = Array.from(stage.querySelectorAll<HTMLButtonElement>('.projects-phone'));
    const desktop = window.matchMedia('(min-width: 1024px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let position = 0;
    let target = 0;
    let velocity = 0;
    let selectedSlot = 0;
    let lastFrameTime = 0;
    let frame = 0;
    let wheelTimer = 0;
    let drag: { pointerId: number; x: number; y: number; start: number; moved: boolean } | null = null;
    let suppressClick = false;

    function paint() {
      for (const [slot, phone] of phones.entries()) {
        const distance = distanceAroundRail(slot, position);
        const depth = Math.abs(distance);
        const opacity = Math.min(1, Math.max(0, (3 - depth) / 0.45));
        const scale = 1 - Math.min(depth, 3) * 0.06;
        const brightness = Math.max(0.42, 1 - depth * 0.4);

        phone.style.setProperty('--phone-angle', `${distance * 30}deg`);
        phone.style.setProperty('--phone-scale', scale.toFixed(3));
        phone.style.opacity = opacity.toFixed(3);
        phone.style.filter = `brightness(${brightness.toFixed(3)})`;
        phone.style.visibility = opacity > 0 ? 'visible' : 'hidden';
      }

      const closest = wrap(Math.round(position), railProjects.length);
      if (closest !== selectedSlot) {
        selectedSlot = closest;
        setActiveSlot(closest);
      }
    }

    function animate(time: number) {
      const seconds = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 1 / 30) : 1 / 60;
      lastFrameTime = time;
      const acceleration = ((target - position) * 145 - velocity * 23) / 0.9;
      velocity += acceleration * seconds;
      position += velocity * seconds;

      if (reduceMotion.matches || (Math.abs(target - position) < 0.002 && Math.abs(velocity) < 0.02)) {
        position = reduceMotion.matches ? Math.round(target) : target;
        velocity = 0;
        lastFrameTime = 0;
        frame = 0;
        paint();
        return;
      }
      paint();
      frame = window.requestAnimationFrame(animate);
    }

    function moveTo(next: number) {
      target = next;
      if (!frame) frame = window.requestAnimationFrame(animate);
    }

    function handleWheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey) return;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!horizontal && !desktop.matches) return;

      const axisDelta = horizontal ? event.deltaX : event.deltaY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
      let pixels = axisDelta * unit;
      if (!pixels) return;

      if (!horizontal) {
        const bounds = stage.getBoundingClientRect();
        if (bounds.top > window.innerHeight * 0.28 || bounds.bottom < window.innerHeight * 0.72) return;

        // Let the surrounding page finish entering the display before the wheel turns the phones.
        const gap = pixels > 0 ? Math.max(0, bounds.top) : Math.min(0, bounds.bottom - window.innerHeight);
        if (Math.abs(gap) > 1) {
          const pageDelta = Math.sign(gap) * Math.min(Math.abs(gap), Math.abs(pixels));
          event.preventDefault();
          window.scrollBy({ top: pageDelta, behavior: 'instant' });
          pixels -= pageDelta;
        }
      }
      if (!pixels) return;

      event.preventDefault();
      moveTo(target + pixels / wheelPixelsPerProject);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => moveTo(Math.round(target)), wheelSettleDelay);
    }

    function selectSlot(slot: number) {
      window.clearTimeout(wheelTimer);
      const anchor = Math.round(target);
      moveTo(anchor + distanceAroundRail(slot, anchor));
    }

    function handleKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      selectSlot(wrap(Math.round(target) + step, railProjects.length));
    }

    function handlePointerDown(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0) return;
      suppressClick = false;
      drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: target, moved: false };
    }

    function handlePointerMove(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const offset = event.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(offset) < 8 || Math.abs(offset) <= Math.abs(event.clientY - drag.y)) return;
        drag.moved = true;
        suppressClick = true;
        stage.setPointerCapture(event.pointerId);
        window.clearTimeout(wheelTimer);
      }
      moveTo(drag.start - offset / (event.pointerType === 'touch' ? 140 : 280));
    }

    function finishPointer(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (drag.moved) moveTo(Math.round(target));
      drag = null;
    }

    function handleClick(event: MouseEvent) {
      if (suppressClick && event.detail > 0) return;
      if (!(event.target instanceof Element)) return;
      const phone = event.target.closest<HTMLButtonElement>('.projects-phone');
      if (phone) selectSlot(Number(phone.dataset.slot));
    }

    paint();
    stage.addEventListener('wheel', handleWheel, { passive: false });
    stage.addEventListener('keydown', handleKey);
    stage.addEventListener('pointerdown', handlePointerDown);
    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerup', finishPointer);
    stage.addEventListener('pointercancel', finishPointer);
    stage.addEventListener('pointerleave', finishPointer);
    stage.addEventListener('click', handleClick);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(wheelTimer);
      stage.removeEventListener('wheel', handleWheel);
      stage.removeEventListener('keydown', handleKey);
      stage.removeEventListener('pointerdown', handlePointerDown);
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerup', finishPointer);
      stage.removeEventListener('pointercancel', finishPointer);
      stage.removeEventListener('pointerleave', finishPointer);
      stage.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage?.contains(document.activeElement)) {
      stage.querySelector<HTMLElement>('[aria-selected="true"]')?.focus({ preventScroll: true });
    }
  }, [activeSlot]);

  return (
    <section id="projects" className="projects-section" aria-labelledby="projects-heading">
      <div className="projects-showcase">
        <div className="projects-sidebar">
          <div className="projects-header">
            <h2 id="projects-heading">项目展示</h2>
            <span aria-hidden="true">/</span>
            <h3>{title}</h3>
          </div>

          <div
            id="projects-description"
            className="projects-details"
            role="tabpanel"
            aria-labelledby={`project-preview-${activeSlot}`}
            aria-live="polite"
          >
            <p className="projects-meta">{subtitle ?? project.language}</p>
            <p>{project.description}</p>
            <p>{project.rationale.replace(/^\[[^\]]+\]\s*/, '')}</p>
            <div className="projects-actions">
              {project.previewUrl && (
                <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                  体验演示 <LaunchIcon />
                </a>
              )}
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <GitHubIcon /> 查看源码
              </a>
              <button
                className="projects-prd-button"
                type="button"
                aria-haspopup="dialog"
                onClick={() => setPrdDialog({ project, open: true })}
              >
                <DescriptionOutlinedIcon /> 查看 PRD
              </button>
            </div>
          </div>
        </div>

        <div className="projects-stage" ref={stageRef} onDragStart={(event) => event.preventDefault()}>
          <div className="projects-rail" role="tablist" aria-label="项目手机预览" aria-orientation="horizontal">
            {railProjects.map((item, slot) => (
              <button
                key={slot}
                id={`project-preview-${slot}`}
                className="projects-phone"
                data-slot={slot}
                type="button"
                role="tab"
                aria-label={item.displayName}
                aria-controls="projects-description"
                aria-selected={slot === activeSlot}
                tabIndex={slot === activeSlot ? 0 : -1}
              >
                {item.image ? (
                  <img
                    src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`}
                    alt={item.imageAlt ?? ''}
                    width={828}
                    height={1472}
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <span className="projects-phone-cover" style={{ background: item.gradient }}>
                    <span aria-hidden="true">{item.icon}</span>
                    <strong>{item.displayName}</strong>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog
        open={prdDialog?.open ?? false}
        onClose={closePrd}
        aria-labelledby="projects-prd-title"
        aria-describedby={hasLocalPdf ? undefined : 'projects-prd-description'}
        fullWidth
        maxWidth={hasLocalPdf ? 'lg' : 'xs'}
        slotProps={{ paper: { sx: { bgcolor: '#191d22', backgroundImage: 'none', border: '1px solid #414a53' } } }}
      >
        <DialogTitle id="projects-prd-title">{prdDialog?.project.displayName} · PRD</DialogTitle>
        {hasLocalPdf ? (
          <DialogContent dividers sx={{ p: 0 }}>
            <iframe className="projects-prd-preview" src={prdUrl} title="产品需求文档预览" />
          </DialogContent>
        ) : (
          <DialogContent>
            <DialogContentText id="projects-prd-description">
              {prdUrl ? '在新标签页查看这份产品需求文档。' : '这个项目的 PRD 暂未发布。'}
            </DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          {prdUrl && (
            <Button href={prdUrl} target="_blank" rel="noopener noreferrer">打开文档</Button>
          )}
          <Button onClick={closePrd} autoFocus>关闭</Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default Projects;
