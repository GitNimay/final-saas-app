import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { KanbanBoard, KanbanItem } from '../../types';
import { Plus, X, CheckCircle2, GripVertical, Circle } from 'lucide-react';

interface Props {
  data: KanbanBoard;
  onUpdate?: (newData: KanbanBoard) => void;
}

const RoadmapTab: React.FC<Props> = ({ data, onUpdate }) => {
  const [board, setBoard] = useState(data);
  const [enabled, setEnabled] = useState(false);
  const [addingColumnId, setAddingColumnId] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<'Frontend' | 'Backend' | 'Design' | 'Marketing'>('Frontend');
  const addInputRef = useRef<HTMLInputElement>(null);

  // Animation frame fix for dnd in React 18 StrictMode
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  useEffect(() => {
    setBoard(data);
  }, [data]);

  useEffect(() => {
    if (addingColumnId && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [addingColumnId]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startCol = board.columns[source.droppableId];
    const endCol = board.columns[destination.droppableId];

    const newColumns = { ...board.columns };

    if (startCol.id === endCol.id) {
      const newItems = Array.from(startCol.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      newColumns[startCol.id] = { ...startCol, items: newItems };
    } else {
      const startItems = Array.from(startCol.items);
      const [removed] = startItems.splice(source.index, 1);
      const endItems = Array.from(endCol.items);
      endItems.splice(destination.index, 0, removed);
      newColumns[startCol.id] = { ...startCol, items: startItems };
      newColumns[endCol.id] = { ...endCol, items: endItems };
    }

    const newBoard = { ...board, columns: newColumns };
    setBoard(newBoard);
    if (onUpdate) onUpdate(newBoard);
  };

  const addItem = (columnId: string) => {
    if (!newItemContent.trim()) {
      setAddingColumnId(null);
      return;
    }
    const newItem: KanbanItem = { id: `new-${Date.now()}`, content: newItemContent, tag: selectedTag };
    const column = board.columns[columnId];
    const newItems = [...column.items, newItem];

    const newColumns = { ...board.columns, [columnId]: { ...column, items: newItems } };
    const newBoard = { ...board, columns: newColumns };

    setBoard(newBoard);
    if (onUpdate) onUpdate(newBoard);
    setNewItemContent('');
    setAddingColumnId(null);
  };

  const getTagStyle = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('frontend')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (t.includes('backend')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (t.includes('design')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    if (t.includes('marketing')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  };

  const tagOptions = [
    { name: 'Frontend', color: 'bg-blue-500' },
    { name: 'Backend', color: 'bg-emerald-500' },
    { name: 'Design', color: 'bg-pink-500' },
    { name: 'Marketing', color: 'bg-orange-500' },
  ];

  if (!enabled) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center gap-3">
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 w-48 bg-zinc-900/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full overflow-x-auto p-2 custom-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 h-full min-w-max pb-2">
          {board.columnOrder.map((colId, idx) => {
            const column = board.columns[colId];
            return (
              <div key={column.id} className="w-[240px] flex flex-col h-full max-h-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden">

                {/* Column Header */}
                <div className="px-3 py-2.5 border-b border-white/[0.06] flex justify-between items-center bg-[#0c0c0c]">
                  <div className="flex items-center gap-2">
                    {column.title === 'Done' ? (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    ) : (
                      <Circle size={8} className={`
                        ${idx === 0 ? 'text-zinc-500 fill-zinc-500/20' :
                          idx === 1 ? 'text-indigo-500 fill-indigo-500/20' :
                            idx === 2 ? 'text-amber-500 fill-amber-500/20' :
                              'text-purple-500 fill-purple-500/20'}
                      `} />
                    )}
                    <h3 className="font-semibold text-zinc-200 text-xs tracking-wide">{column.title}</h3>
                  </div>
                  <span className="text-[9px] bg-zinc-800/60 text-zinc-500 px-1.5 py-0.5 rounded-md font-mono">
                    {column.items.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto custom-scrollbar p-2 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : 'bg-transparent'
                        }`}
                    >
                      <div className="space-y-2 min-h-[60px]">
                        {column.items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  relative p-2.5 rounded-lg border transition-all duration-200 group cursor-grab active:cursor-grabbing
                                  ${snapshot.isDragging
                                    ? 'bg-zinc-800 border-white/20 shadow-xl shadow-black/40 scale-[1.02] z-50 ring-1 ring-white/10'
                                    : 'bg-[#111113] border-white/[0.04] hover:border-white/10 hover:bg-[#161618]'
                                  }
                                `}
                                style={provided.draggableProps.style}
                              >
                                <div className="flex justify-between items-start mb-1.5 gap-1">
                                  <div className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${getTagStyle(item.tag)}`}>
                                    {item.tag}
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-400 transition-opacity">
                                    <GripVertical size={10} />
                                  </div>
                                </div>
                                <p className="text-xs text-zinc-300 font-medium leading-snug">{item.content}</p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {addingColumnId === column.id ? (
                          <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-white/10 mt-1.5 animate-in fade-in zoom-in-95 duration-200">
                            <input
                              ref={addInputRef}
                              type="text"
                              value={newItemContent}
                              onChange={(e) => setNewItemContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addItem(column.id);
                                if (e.key === 'Escape') setAddingColumnId(null);
                              }}
                              placeholder="Task title..."
                              className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none mb-2.5 font-medium"
                            />

                            <div className="flex items-center gap-1.5 mb-2.5">
                              {tagOptions.map((t) => (
                                <button
                                  key={t.name}
                                  onClick={() => setSelectedTag(t.name as any)}
                                  className={`w-4 h-4 rounded-full ${t.color} transition-all ${selectedTag === t.name ? 'ring-2 ring-white scale-110' : 'opacity-30 hover:opacity-100'}`}
                                  title={t.name}
                                />
                              ))}
                              <span className="text-[10px] text-zinc-500 ml-1.5 font-medium">{selectedTag}</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <button onClick={() => setAddingColumnId(null)} className="text-zinc-500 hover:text-white transition-colors p-0.5"><X size={12} /></button>
                              <button onClick={() => addItem(column.id)} className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded-md hover:bg-zinc-200 transition-colors">Add</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingColumnId(column.id);
                              setNewItemContent('');
                              setSelectedTag('Frontend');
                            }}
                            className="w-full py-2 mt-1.5 border border-dashed border-zinc-800 text-zinc-600 rounded-lg text-[10px] font-medium hover:bg-zinc-900 hover:text-zinc-400 hover:border-zinc-700 transition-all flex items-center justify-center gap-1.5 opacity-50 hover:opacity-100"
                          >
                            <Plus size={10} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default RoadmapTab;
