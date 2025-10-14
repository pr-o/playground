'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, Ellipse, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva';
import type { KonvaEventObject, Node as KonvaNode } from 'konva/lib/Node';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import type { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer';
import { shallow } from 'zustand/shallow';

import {
  createElementForTool,
  createImagePlaceholder,
  createTextElement,
} from '@/lib/excalidraw/geometry';
import { useElementsStore } from '@/store/excalidraw/elements-store';
import type { ExcalidrawElement, Point, ToolMode } from '@/types/excalidraw/elements';

const gridBackground =
  "bg-[url('data:image/svg+xml,%3Csvg width%3D%2740%27 height%3D%2740%27 viewBox%3D%270 0 40 40%27 fill%3D%27none%27 xmlns%3D%27http://www.w3.org/2000/svg%27%3E%3Cpath d%3D%27M40 39.5H0V40H40V39.5Z%27 fill%3D%27%23D9DEE7%27/%3E%3Cpath d%3D%27M0.5 0L0.5 40H0L0 0H0.5Z%27 fill%3D%27%23D9DEE7%27/%3E%3C/svg%3E')] bg-[length:40px_40px]";

type RenderOptions = {
  isDraft?: boolean;
  isSelected?: boolean;
  props?: Record<string, unknown>;
};

const toKonvaPoints = (points: Point[]) => points.flatMap((point) => [point.x, point.y]);

const getNodeName = (id: string) => `element-${id}`;

const getElementBounds = (element: ExcalidrawElement) => {
  if (element.type === 'ellipse') {
    return {
      minX: element.position.x - element.size.width / 2,
      maxX: element.position.x + element.size.width / 2,
      minY: element.position.y - element.size.height / 2,
      maxY: element.position.y + element.size.height / 2,
    };
  }
  return {
    minX: element.position.x,
    maxX: element.position.x + element.size.width,
    minY: element.position.y,
    maxY: element.position.y + element.size.height,
  };
};

const renderElement = (element: ExcalidrawElement, options: RenderOptions = {}) => {
  const { isDraft = false, isSelected = false, props = {} } = options;
  const nodeKey = isDraft ? `${element.id}-draft` : element.id;
  const common = {
    x: element.position.x,
    y: element.position.y,
    rotation: element.rotation,
    opacity: isDraft ? Math.min(0.85, element.opacity + 0.1) : element.opacity,
    stroke: isDraft ? '#6366F1' : isSelected ? '#2563EB' : element.strokeColor,
    strokeWidth: element.strokeWidth,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    dash:
      element.strokeStyle === 'dashed'
        ? [12, 12]
        : element.strokeStyle === 'dotted'
          ? [4, 12]
          : [],
    listening: !isDraft,
    id: element.id,
    name: getNodeName(element.id),
    shadowForStrokeEnabled: false,
    shadowColor: isSelected && !isDraft ? '#2563EB' : undefined,
    shadowOpacity: isSelected && !isDraft ? 0.35 : undefined,
    ...props,
  };

  switch (element.type) {
    case 'rectangle':
      return (
        <Rect
          key={nodeKey}
          {...common}
          width={element.size.width}
          height={element.size.height}
          cornerRadius={element.radius}
          fill={element.fillColor ?? 'transparent'}
        />
      );
    case 'ellipse':
      return (
        <Ellipse
          key={nodeKey}
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
        />
      );
    case 'line':
      return (
        <Line
          key={nodeKey}
          {...common}
          points={toKonvaPoints(element.points)}
          fillEnabled={false}
        />
      );
    case 'arrow':
      return (
        <Arrow
          key={nodeKey}
          {...common}
          points={toKonvaPoints(element.points)}
          pointerLength={18}
          pointerWidth={18}
          pointerAtBeginning={element.startArrowhead !== 'none'}
          pointerAtEnding={element.endArrowhead !== 'none'}
        />
      );
    case 'freedraw':
      return (
        <Line
          key={nodeKey}
          {...common}
          points={toKonvaPoints(element.points)}
          tension={0.5}
          bezier
          fillEnabled={false}
        />
      );
    case 'text':
      return (
        <Text
          key={nodeKey}
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
        />
      );
    case 'image':
      return (
        <Rect
          key={nodeKey}
          {...common}
          width={element.size.width}
          height={element.size.height}
          fill="#EEE"
          cornerRadius={12}
          dash={[6, 6]}
        />
      );
    default:
      return null;
  }
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type DrawingState = {
  tool: ToolMode;
  start: Point;
  points: Point[];
  element: ExcalidrawElement;
};

type TextEditorState = {
  canvasPosition: Point;
  screenPosition: { x: number; y: number };
  value: string;
};

const DRAWABLE_TOOLS: ToolMode[] = [
  'rectangle',
  'ellipse',
  'diamond',
  'arrow',
  'line',
  'draw',
];

const MIN_DIMENSION = 4;
const TRANSFORMABLE_TYPES = new Set<ExcalidrawElement['type']>([
  'rectangle',
  'ellipse',
  'image',
  'text',
]);

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<KonvaStage | null>(null);
  const drawingStateRef = useRef<DrawingState | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const transformerRef = useRef<KonvaTransformer | null>(null);
  const selectionStateRef = useRef<{ start: Point; append: boolean } | null>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [draftElement, setDraftElement] = useState<ExcalidrawElement | null>(null);
  const [textEditor, setTextEditor] = useState<TextEditorState | null>(null);
  const [selectionRect, setSelectionRect] = useState<{
    start: Point;
    end: Point;
  } | null>(null);

  const {
    elements,
    tool,
    isToolLocked,
    isCanvasLocked,
    camera,
    selectedIds,
    setCamera,
    setTool,
    addElement,
    updateElement,
    selectElements,
    clearSelection,
    toggleSelection,
  } = useElementsStore(
    (state) => ({
      elements: state.elements,
      tool: state.tool,
      isToolLocked: state.isToolLocked,
      isCanvasLocked: state.isCanvasLocked,
      camera: state.camera,
      selectedIds: state.selectedElementIds,
      setCamera: state.actions.setCamera,
      setTool: state.actions.setTool,
      addElement: state.actions.addElement,
      updateElement: state.actions.updateElement,
      selectElements: state.actions.selectElements,
      clearSelection: state.actions.clearSelection,
      toggleSelection: state.actions.toggleSelection,
    }),
    shallow,
  );

  const elementsById = useMemo(() => {
    const map = new Map<string, ExcalidrawElement>();
    for (const element of elements) {
      map.set(element.id, element);
    }
    return map;
  }, [elements]);

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

  useEffect(() => {
    if (!textEditor) {
      return;
    }
    const id = window.requestAnimationFrame(() => {
      textAreaRef.current?.focus();
      textAreaRef.current?.select();
    });
    return () => window.cancelAnimationFrame(id);
  }, [textEditor]);

  const cursorClass = useMemo(() => {
    if (isCanvasLocked) {
      return 'cursor-not-allowed';
    }
    switch (tool) {
      case 'hand':
        return 'cursor-grab';
      case 'selection':
        return 'cursor-default';
      case 'text':
        return 'cursor-text';
      case 'image':
        return 'cursor-copy';
      default:
        return 'cursor-crosshair';
    }
  }, [isCanvasLocked, tool]);

  const getCanvasPointer = useCallback((stage: KonvaStage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) {
      return null;
    }
    const scale = stage.scaleX();
    const position = stage.position();
    return {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    };
  }, []);

  const getClientPosition = useCallback((event: MouseEvent | TouchEvent) => {
    if ('clientX' in event) {
      return { x: event.clientX, y: event.clientY };
    }
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : { x: 0, y: 0 };
  }, []);

  const resetInteraction = useCallback(() => {
    drawingStateRef.current = null;
    setDraftElement(null);
  }, []);

  const finishDrawing = useCallback(() => {
    const state = drawingStateRef.current;
    if (!state) {
      return;
    }

    const element = state.element;
    const hasMeaningfulSize =
      (element.size?.width ?? 0) > MIN_DIMENSION ||
      (element.size?.height ?? 0) > MIN_DIMENSION ||
      (element.type === 'freedraw' && state.points.length > 2) ||
      (element.type === 'line' && element.points.length > 1);

    if (!hasMeaningfulSize) {
      resetInteraction();
      return;
    }

    addElement(element);
    resetInteraction();

    if (!isToolLocked) {
      setTool('selection');
    }
  }, [addElement, isToolLocked, resetInteraction, setTool]);

  const finalizeSelection = useCallback(
    (start: Point, end: Point, append: boolean) => {
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxX = Math.max(start.x, end.x);
      const maxY = Math.max(start.y, end.y);
      const width = maxX - minX;
      const height = maxY - minY;

      const isClick = Math.abs(width) < MIN_DIMENSION && Math.abs(height) < MIN_DIMENSION;
      if (isClick) {
        if (!append) {
          clearSelection();
        }
        return;
      }

      const hitElements = elements.filter((element) => {
        const bounds = getElementBounds(element);
        return (
          bounds.minX < maxX &&
          bounds.maxX > minX &&
          bounds.minY < maxY &&
          bounds.maxY > minY
        );
      });

      if (hitElements.length) {
        if (append) {
          const merged = new Set(selectedIds);
          for (const element of hitElements) {
            merged.add(element.id);
          }
          selectElements(Array.from(merged));
        } else {
          selectElements(hitElements.map((element) => element.id));
        }
      } else if (!append) {
        clearSelection();
      }
    },
    [clearSelection, elements, selectElements, selectedIds],
  );

  const commitText = useCallback(
    (value: string, position: Point) => {
      const textValue = value.trim();
      if (textValue) {
        const element = createTextElement(position, textValue);
        addElement(element);
      }
      setTextEditor(null);
      if (!isToolLocked) {
        setTool('selection');
      }
    },
    [addElement, isToolLocked, setTool],
  );

  const cancelText = useCallback(() => {
    setTextEditor(null);
    if (!isToolLocked) {
      setTool('selection');
    }
  }, [isToolLocked, setTool]);

  const handlePointerDown = useCallback(
    (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (isCanvasLocked || textEditor) {
        return;
      }

      const stage = event.target.getStage();
      if (!stage) {
        return;
      }

      const pointer = getCanvasPointer(stage);
      if (!pointer) {
        return;
      }

      if (tool === 'hand') {
        return;
      }

      if (tool === 'selection') {
        const target = event.target;
        const targetClass = target?.getClassName?.();
        const targetId =
          typeof target?.id === 'function'
            ? target.id()
            : (target as { attrs?: { id?: string } })?.attrs?.id;
        const clickedTransformer =
          targetClass === 'Transformer' || targetClass === 'TransformerAnchor';

        if (!targetId || target === stage || clickedTransformer) {
          if (!event.evt.shiftKey) {
            clearSelection();
          }
          selectionStateRef.current = {
            start: pointer,
            append: event.evt.shiftKey,
          };
          setSelectionRect({ start: pointer, end: pointer });
        } else {
          if (event.evt.shiftKey) {
            toggleSelection(targetId);
          } else if (!selectedIds.includes(targetId)) {
            selectElements([targetId]);
          }
        }
        event.evt.preventDefault();
        return;
      }

      if (tool === 'text') {
        const container = containerRef.current;
        if (!container) {
          return;
        }
        const client = getClientPosition(event.evt);
        const rect = container.getBoundingClientRect();
        setTextEditor({
          canvasPosition: pointer,
          screenPosition: {
            x: client.x - rect.left,
            y: client.y - rect.top,
          },
          value: '',
        });
        event.evt.preventDefault();
        return;
      }

      if (!DRAWABLE_TOOLS.includes(tool)) {
        return;
      }

      const initialElement = createElementForTool(tool, pointer, pointer, {
        points: [pointer, pointer],
        pressures: [0.5, 0.5],
      });

      if (!initialElement) {
        return;
      }

      drawingStateRef.current = {
        tool,
        start: pointer,
        points: [pointer, pointer],
        element: initialElement,
      };
      setDraftElement(initialElement);
      event.evt.preventDefault();
    },
    [
      getCanvasPointer,
      getClientPosition,
      isCanvasLocked,
      clearSelection,
      selectElements,
      setTextEditor,
      selectedIds,
      textEditor,
      toggleSelection,
      tool,
    ],
  );

  const handlePointerMove = useCallback(
    (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
      event.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) {
        return;
      }
      const pointer = getCanvasPointer(stage);
      if (!pointer) {
        return;
      }

      const selectionState = selectionStateRef.current;
      if (selectionState) {
        setSelectionRect({
          start: selectionState.start,
          end: pointer,
        });
        return;
      }

      const state = drawingStateRef.current;
      if (!state || state.tool === 'selection') {
        return;
      }

      if (state.tool === 'draw') {
        state.points = [...state.points, pointer];
      } else if (state.points.length) {
        state.points[state.points.length - 1] = pointer;
      }

      const nextElement = createElementForTool(state.tool, state.start, pointer, {
        points: state.tool === 'draw' ? state.points : [state.start, pointer],
      });

      if (!nextElement) {
        return;
      }

      const preserved: ExcalidrawElement = {
        ...nextElement,
        id: state.element.id,
        createdAt: state.element.createdAt,
      };

      state.element = preserved;
      setDraftElement(preserved);
    },
    [getCanvasPointer],
  );

  const handlePointerUp = useCallback(
    (event?: KonvaEventObject<MouseEvent | TouchEvent>) => {
      event?.evt.preventDefault();

      const selectionState = selectionStateRef.current;
      if (selectionState) {
        const stage = stageRef.current;
        const pointer = stage ? getCanvasPointer(stage) : null;
        finalizeSelection(
          selectionState.start,
          pointer ?? selectionState.start,
          selectionState.append,
        );
        selectionStateRef.current = null;
        setSelectionRect(null);
        return;
      }

      if (!drawingStateRef.current) {
        return;
      }
      finishDrawing();
    },
    [finalizeSelection, finishDrawing, getCanvasPointer],
  );

  const handleNodeDragEnd = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      const node = event.target;
      const id = node?.id?.();
      if (!id) {
        return;
      }
      const position = node.position();
      updateElement(id, (prev) => ({
        ...prev,
        position: { x: position.x, y: position.y },
      }));
    },
    [updateElement],
  );

  const handleNodeTransformEnd = useCallback(
    (event: KonvaEventObject<Event>) => {
      const node = event.target;
      const id = node?.id?.();
      if (!id) {
        return;
      }
      const element = elementsById.get(id);
      if (!element || !TRANSFORMABLE_TYPES.has(element.type)) {
        return;
      }

      const scaleX = node.scaleX?.() ?? 1;
      const scaleY = node.scaleY?.() ?? 1;
      if ('scaleX' in node) {
        node.scaleX?.(1);
        node.scaleY?.(1);
      }

      const position = node.position();
      const baseWidth =
        'width' in node
          ? (node as unknown as { width: () => number }).width()
          : element.size.width;
      const baseHeight =
        'height' in node
          ? (node as unknown as { height: () => number }).height()
          : element.size.height;
      const width = Math.max(MIN_DIMENSION, baseWidth * scaleX);
      const height = Math.max(MIN_DIMENSION, baseHeight * scaleY);
      const rotation =
        'rotation' in node
          ? (node as unknown as { rotation: () => number }).rotation()
          : element.rotation;

      updateElement(id, (prev) => ({
        ...prev,
        size: { width, height },
        position: { x: position.x, y: position.y },
        rotation,
      }));
    },
    [elementsById, updateElement],
  );

  useEffect(() => {
    const handleWindowPointerUp = () => {
      const selectionState = selectionStateRef.current;
      if (selectionState) {
        const stage = stageRef.current;
        const pointer = stage ? getCanvasPointer(stage) : null;
        finalizeSelection(
          selectionState.start,
          pointer ?? selectionState.start,
          selectionState.append,
        );
        selectionStateRef.current = null;
        setSelectionRect(null);
        return;
      }

      if (drawingStateRef.current) {
        finishDrawing();
      }
    };
    window.addEventListener('mouseup', handleWindowPointerUp);
    window.addEventListener('touchend', handleWindowPointerUp);
    return () => {
      window.removeEventListener('mouseup', handleWindowPointerUp);
      window.removeEventListener('touchend', handleWindowPointerUp);
    };
  }, [finalizeSelection, finishDrawing, getCanvasPointer]);

  const handleDragEnd = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      const stage = event.target.getStage();
      if (!stage) {
        return;
      }
      const position = stage.position();
      setCamera({ offset: { x: position.x, y: position.y } });
    },
    [setCamera],
  );

  const handleWheel = useCallback(
    (event: KonvaEventObject<WheelEvent>) => {
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
    },
    [camera.zoom, setCamera],
  );

  const getCanvasCenter = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) {
      return { x: 0, y: 0 };
    }
    const position = stage.position();
    const scale = stage.scaleX();
    return {
      x: (size.width / 2 - position.x) / scale,
      y: (size.height / 2 - position.y) / scale,
    };
  }, [size.height, size.width]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (isCanvasLocked) {
        return;
      }
      const items = event.clipboardData?.items;
      if (!items?.length) {
        return;
      }

      for (const item of items) {
        if (!item.type.startsWith('image/')) {
          continue;
        }
        const file = item.getAsFile();
        if (!file) {
          continue;
        }

        event.preventDefault();

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== 'string') {
            return;
          }
          const image = new window.Image();
          image.onload = () => {
            const center = getCanvasCenter();
            const maxSize = Math.max(240, Math.min(size.width, size.height) * 0.35);
            const scale = Math.min(1, maxSize / image.width);
            const width = image.width * scale;
            const height = image.height * scale;
            const start = {
              x: center.x - width / 2,
              y: center.y - height / 2,
            };
            const end = {
              x: center.x + width / 2,
              y: center.y + height / 2,
            };
            const element = createImagePlaceholder(start, end, result);
            addElement(element);
            updateElement(element.id, (prev) => ({
              ...prev,
              status: 'loaded',
              size: { width, height },
              naturalSize: { width: image.width, height: image.height },
            }));
            if (!isToolLocked) {
              setTool('selection');
            }
          };
          image.src = result;
        };
        reader.readAsDataURL(file);
        break;
      }
    };

    container.addEventListener('paste', handlePaste);
    return () => container.removeEventListener('paste', handlePaste);
  }, [
    addElement,
    getCanvasCenter,
    isCanvasLocked,
    isToolLocked,
    setTool,
    size.height,
    size.width,
    updateElement,
  ]);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) {
      return;
    }

    if (tool !== 'selection' || !selectedIds.length) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    const nodes = selectedIds
      .map((id) => {
        const element = elementsById.get(id);
        if (!element || !TRANSFORMABLE_TYPES.has(element.type)) {
          return null;
        }
        return stage.findOne<KonvaNode>(`.${getNodeName(id)}`);
      })
      .filter((node): node is KonvaNode => Boolean(node));

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [elementsById, selectedIds, tool]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-1 ${gridBackground} ${cursorClass}`}
    >
      {size.width > 0 && size.height > 0 ? (
        <Stage
          ref={(stage) => {
            stageRef.current = stage;
          }}
          width={size.width}
          height={size.height}
          scaleX={camera.zoom}
          scaleY={camera.zoom}
          x={camera.offset.x}
          y={camera.offset.y}
          draggable={tool === 'hand' && !isCanvasLocked}
          className="absolute inset-0"
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchEnd={handlePointerUp}
        >
          <Layer listening>
            {elements.map((element) =>
              renderElement(element, {
                isSelected: selectedIds.includes(element.id),
                props: {
                  draggable:
                    tool === 'selection' &&
                    !isCanvasLocked &&
                    selectedIds.includes(element.id),
                  onDragEnd: handleNodeDragEnd,
                  onTransformEnd: handleNodeTransformEnd,
                },
              }),
            )}
            <Transformer
              ref={(node) => {
                transformerRef.current = node;
              }}
              rotateEnabled
              flipEnabled={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < MIN_DIMENSION || newBox.height < MIN_DIMENSION) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
          <Layer listening={false}>
            {draftElement ? renderElement(draftElement, { isDraft: true }) : null}
            {selectionRect ? (
              <Rect
                x={Math.min(selectionRect.start.x, selectionRect.end.x)}
                y={Math.min(selectionRect.start.y, selectionRect.end.y)}
                width={Math.abs(selectionRect.end.x - selectionRect.start.x)}
                height={Math.abs(selectionRect.end.y - selectionRect.start.y)}
                fill="rgba(99, 102, 241, 0.12)"
                stroke="#6366F1"
                dash={[6, 4]}
                listening={false}
              />
            ) : null}
          </Layer>
        </Stage>
      ) : null}

      <div className="pointer-events-none absolute inset-0">
        {textEditor ? (
          <textarea
            ref={textAreaRef}
            value={textEditor.value}
            onChange={(event) =>
              setTextEditor((state) =>
                state
                  ? {
                      ...state,
                      value: event.target.value,
                    }
                  : state,
              )
            }
            onBlur={() => commitText(textEditor.value, textEditor.canvasPosition)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                commitText(textEditor.value, textEditor.canvasPosition);
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                cancelText();
              }
            }}
            className="pointer-events-auto absolute min-h-[48px] min-w-[160px] rounded-md border border-border bg-white/95 p-2 text-sm text-foreground shadow-lg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            style={{
              left: textEditor.screenPosition.x,
              top: textEditor.screenPosition.y,
              transform: 'translate(-50%, -20%)',
            }}
            placeholder="Type and press Enter to commit..."
          />
        ) : null}
      </div>
    </div>
  );
}
