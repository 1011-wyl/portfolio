import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { repos } from '../data/repos';
import './Projects.css';

const rotationDelay = 6500;
const projectCount = repos.length;

function wrapIndex(index: number): number {
  return ((index % projectCount) + projectCount) % projectCount;
}

function getPhoneSlot(index: number, activeIndex: number): string {
  if (index === activeIndex) return 'active';
  if (index === wrapIndex(activeIndex + 1)) return 'next';
  if (index === wrapIndex(activeIndex - 1)) return 'previous';
  return 'hidden';
}

function Projects(): JSX.Element {
  const showcase = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressPreviewClick = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() => !document.hidden);
  const project = repos[activeIndex];
  const [title, subtitle] = project.displayName.split(' · ');
  const isRotating = isPlaying && isVisible && isPageVisible && !isHovered;

  useEffect(() => {
    const element = showcase.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.intersectionRatio >= 0.4);
    }, { threshold: 0.4 });
    observer.observe(element);

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pauseForReducedMotion = (event: MediaQueryListEvent) => {
      if (event.matches) setIsPlaying(false);
    };
    const updatePageVisibility = () => setIsPageVisible(!document.hidden);
    motionPreference.addEventListener('change', pauseForReducedMotion);
    document.addEventListener('visibilitychange', updatePageVisibility);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener('change', pauseForReducedMotion);
      document.removeEventListener('visibilitychange', updatePageVisibility);
    };
  }, []);

  useEffect(() => {
    if (!isRotating) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => wrapIndex(index + 1));
    }, rotationDelay);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isRotating]);

  function moveBy(step: number) {
    setActiveIndex((index) => wrapIndex(index + step));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressPreviewClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function finishSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    const xDistance = event.clientX - start.x;
    const yDistance = event.clientY - start.y;
    if (Math.abs(xDistance) < 36 || Math.abs(xDistance) <= Math.abs(yDistance) * 1.25) return;

    suppressPreviewClick.current = true;
    moveBy(xDistance < 0 ? 1 : -1);
  }

  return (
    <section id="projects" className="projects-section" aria-labelledby="projects-heading">
      <div
        ref={showcase}
        className="projects-showcase"
        role="group"
        aria-roledescription="轮播"
        aria-labelledby="projects-heading"
        onKeyDown={handleKeyDown}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setIsHovered(true);
        }}
        onPointerLeave={() => setIsHovered(false)}
        onFocusCapture={(event) => {
          if (event.target.matches(':focus-visible') && !event.currentTarget.contains(event.relatedTarget)) {
            setIsPlaying(false);
          }
        }}
      >
        <h2 id="projects-heading" className="projects-heading">项目展示</h2>

        <div className="projects-details" aria-live={isRotating ? 'off' : 'polite'} aria-atomic="true">
          <div key={project.name} className="projects-copy">
            <h3 className="projects-name">
              {title}
              {subtitle && <span>{subtitle}</span>}
            </h3>
            <p>{project.description}</p>
            <ul className="projects-tags" aria-label="项目标签">
              {project.techStack.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </div>
          <div className="projects-actions">
            {project.previewUrl && (
              <a className="projects-action projects-action-primary" href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                体验演示 <LaunchIcon />
              </a>
            )}
            <a className="projects-action" href={project.url} target="_blank" rel="noopener noreferrer">
              <GitHubIcon /> 查看源码
            </a>
          </div>
        </div>

        <div
          className="projects-stage"
          onPointerDown={startSwipe}
          onPointerUp={finishSwipe}
          onPointerCancel={() => { gesture.current = null; }}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            if (event.detail !== 0 && suppressPreviewClick.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressPreviewClick.current = false;
            }
          }}
        >
          {repos.map((item, index) => (
            <span
              key={item.name}
              className="projects-stage-light"
              data-active={index === activeIndex}
              style={{ background: item.gradient }}
              aria-hidden="true"
            />
          ))}
          <div className="projects-devices">
            {repos.map((item, index) => {
              const slot = getPhoneSlot(index, activeIndex);
              const isActive = slot === 'active';

              return (
                <div
                  key={item.name}
                  className="projects-phone"
                  data-slot={slot}
                  aria-hidden={!isActive}
                >
                  <div className="projects-phone-screen">
                    {item.image ? (
                      <img
                        src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`}
                        alt={isActive ? item.imageAlt || item.displayName : ''}
                        width={828}
                        height={1472}
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <div className="projects-phone-cover" style={{ background: item.gradient }}>
                        <span aria-hidden="true">{item.icon}</span>
                        <strong>{item.displayName}</strong>
                      </div>
                    )}
                    {isActive && (
                      <a
                        className="projects-phone-link"
                        tabIndex={-1}
                        href={item.previewUrl || item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${item.previewUrl ? '体验' : '查看源码：'}${item.displayName}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="projects-controls" role="group" aria-label="项目切换">
          <button type="button" aria-label="上一个项目" onClick={() => moveBy(-1)}>
            <ChevronLeftIcon />
          </button>
          <button type="button" aria-label="下一个项目" onClick={() => moveBy(1)}>
            <ChevronRightIcon />
          </button>
          <div className="projects-pagination">
            {repos.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-label={item.displayName}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label={isPlaying ? '暂停自动轮播' : '开始自动轮播'}
            onClick={() => setIsPlaying((playing) => !playing)}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Projects;
