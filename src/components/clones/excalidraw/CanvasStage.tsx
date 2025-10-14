'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, Ellipse, Layer, Line, Rect, Stage, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { shallow } from 'zustand/shallow';

import { ExcalidrawElement } from '@/types/excalidraw/elements';
import { useElementsStore } from '@/store/excalidraw/elements-store';

const gridBackground =
  "bg-[url('data:image/svg+xml,%3Csvg width%3D%2740%27 height%3D%2740%27 viewBox%3D%270 0 40 40%27 fill%3D%27none%27 xmlns%3D%27http://www.w3.org/2000/svg%27%3E%3Cpath d%3D%27M40 39.5H0V40H40V39.5Z%27 fill%3D%27%23D9DEE7%27/%3E%3Cpath d%3D%27M0.5 0L0.5 40H0L0 0H0.5Z%27 fill%3D%27%23D9DEE7%27/%3E%3C/svg%3E')] bg-[length:40px_40px]";

const toKonvaPoints = (points: { x: number; y: number }[]) =>
  points.flatMap((point) => [point.x, point.y]);

const renderElement = (element: ExcalidrawElement) => {
  const common = {
    key: element.id,
    x: element.position.x,
    y: element.position.y,
    rotation: element.rotation,
    opacity: element.opacity,
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    dash:
      element.strokeStyle === 'dashed'
        ? [12, 12]
        : element.strokeStyle === 'dotted'
          ? [4, 12]
          : [],
  };

  switch (element.type) {
    case 'rectangle':
      return (
        <Rect
          {...common}
          width={element.size.width}
          height={element.size.height}
          cornerRadius={element.radius}
          fill={element.fillColor ?? 'transparent'}
          listening
        />
      );
    case 'ellipse':
      return (
        <Ellipse
          {...common}
          radius={{
            x: element.size.width / 2,
            y: element.size.height / 2,
          }}
          fill={element.fillColor ?? 'transparent'}
          offset={{
            x: element.size.width / 2,
            y: element.size.height / 2,
          }}
          listening
        />
      );
    case 'line':
      return (
        <Line
          {...common}
          points={toKonvaPoints(element.points)}
          fillEnabled={false}
          listening
        />
      );
    case 'arrow':
      return (
        <Arrow
          {...common}
          points={toKonvaPoints(element.points)}
          pointerLength={18}
          pointerWidth={18}
          pointerAtBeginning={element.startArrowhead !== 'none'}
          pointerAtEnding={element.endArrowhead !== 'none'}
          listening
        />
      );
    case 'freedraw':
      return (
        <Line
          {...common}
          points={toKonvaPoints(element.points)}
          tension={0.5}
          bezier
          fillEnabled={false}
          listening
        />
      );
    case 'text':
      return (
        <Text
          {...common}
          text={element.text}
          fontFamily={element.fontFamily}
          fontSize={element.fontSize}
          fontStyle={element.fontWeight >= 600 ? 'bold' : 'normal'}
          lineHeight={element.lineHeight}
          width={element.size.width}
          height={element.size.height}
          align={element.textAlign}
          verticalAlign={element.verticalAlign}
          fill={element.strokeColor}
          listening
        />
      );
    case 'image':
      return (
        <Rect
          {...common}
          width={element.size.width}
          height={element.size.height}
          fill="#EEE"
          cornerRadius={12}
          dash={[6, 6]}
          listening
        />
      );
    default:
      return null;
  }
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const { elements, tool, camera, setCamera } = useElementsStore(
    (state) => ({
      elements: state.elements,
      tool: state.tool,
      camera: state.camera,
      setCamera: state.actions.setCamera,
    }),
    shallow,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      setSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const cursorClass = useMemo(() => {
    if (tool === 'hand') {
      return 'cursor-grab';
    }
    if (tool === 'selection') {
      return 'cursor-default';
    }
    return 'cursor-crosshair';
  }, [tool]);

  const handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    const stage = event.target.getStage();
    if (!stage) {
      return;
    }
    const position = stage.position();
    setCamera({ offset: { x: position.x, y: position.y } });
  };

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = event.target.getStage();
    if (!stage) {
      return;
    }

    const scaleBy = 1.05;
    const oldScale = camera.zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) {
      return;
    }

    const stagePosition = stage.position();
    const pointerPointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const constrainedScale = clamp(newScale, 0.25, 3);

    const newPosition = {
      x: pointer.x - pointerPointTo.x * constrainedScale,
      y: pointer.y - pointerPointTo.y * constrainedScale,
    };

    setCamera({
      zoom: Number(constrainedScale.toFixed(3)),
      offset: newPosition,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-1 ${gridBackground} ${cursorClass}`}
    >
      {size.width > 0 && size.height > 0 ? (
        <Stage
          width={size.width}
          height={size.height}
          scaleX={camera.zoom}
          scaleY={camera.zoom}
          x={camera.offset.x}
          y={camera.offset.y}
          draggable={tool === 'hand'}
          className="absolute inset-0"
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
        >
          <Layer listening>{elements.map((element) => renderElement(element))}</Layer>
          <Layer listening={false} />
        </Stage>
      ) : null}

      <div className="pointer-events-none absolute inset-0">
        {/* Selection overlays will be rendered atop Konva nodes in future phases. */}
      </div>
    </div>
  );
}
