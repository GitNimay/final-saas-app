
import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { KanbanBoard, KanbanItem } from '../../types';
import { Plus, X, MoreHorizontal, CheckCircle2, GripVertical, Circle } from 'lucide-react';

interface Props {
  data: KanbanBoard;
  onUpdate?: (newData: KanbanBoard) => void;
}

const RoadmapTab: React.FC<Props> = ({ data, onUpdate }) => {
  const [board, setBoard] = useState(data);
  const [enabled, setEnabled] = useState(false); // StrictMode fix
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

    // Copy map to avoid mutating state directly
    const newColumns = { ...board.columns };

    if (startCol.id === endCol.id) {
      // Reordering within the same column
      const newItems = Array.from(startCol.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      newColumns[startCol.id] = { ...startCol, items: newItems };
    } else {
      // Moving between columns
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
    if (t.includes('frontend')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20';
    if (t.includes('backend')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20';
    if (t.includes('design')) return 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/20';
    if (t.includes('marketing')) return 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/20';
    return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
  };

  const tagOptions = [
      { name: 'Frontend', color: 'bg-blue-500' },
      { name: 'Backend', color: 'bg-emerald-500' },
      { name: 'Design', color: 'bg-pink-500' },
      { name: 'Marketing', color: 'bg-orange-500' },
  ];

  if (!enabled) {
    return (
        <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-md space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-xl animate-pulse"></div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] w-full overflow-x-auto p-4 custom-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full min-w-max pb-4">
          {board.columnOrder.map((colId, idx) => {
            const column = board.columns[colId];
            return (
              <div key={column.id} className="w-[320px] flex flex-col h-full max-h-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl">
                
                {/* Column Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#0c0c0e]">
                    <div className="flex items-center gap-3">
                        {column.title === 'Done' ? (
                            <CheckCircle2 size={16} className="text-emerald-500"/> 
                        ) : (
                            <Circle size={12} className={`
                                ${idx === 0 ? 'text-zinc-400 dark:text-zinc-500 fill-zinc-500/20' : 
                                  idx === 1 ? 'text-indigo-500 fill-indigo-500/20' : 
                                  idx === 2 ? 'text-amber-500 fill-amber-500/20' : 
                                  'text-purple-500 fill-purple-500/20'}
                            `}/>
                        )}
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">{column.title}</h3>
                    </div>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/50 font-mono">
                        {column.items.length}
                    </span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto custom-scrollbar p-3 transition-colors duration-200 ${
                          snapshot.isDraggingOver ? 'bg-zinc-100 dark:bg-zinc-900/50' : 'bg-transparent'
                      }`}
                    >
                      <div className="space-y-3 min-h-[100px]">
                        {column.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                                <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                    relative p-4 rounded-xl border transition-all duration-200 group shadow-sm
                                    ${snapshot.isDragging 
                                        ? 'bg-white dark:bg-zinc-800 border-indigo-500/50 shadow-2xl scale-105 z-50 ring-1 ring-indigo-500/30' 
                                        : 'bg-white dark:bg-[#121214] border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-50 dark:hover:bg-[#18181b]'
                                    }
                                `}
                                style={provided.draggableProps.style}
                                >
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                        <div className={`text-[9px] px-2 py-1 rounded-md border font-bold uppercase tracking-wider ${getTagStyle(item.tag)}`}>
                                            {item.tag}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 transition-opacity cursor-grab active:cursor-grabbing">
                                            <GripVertical size={14} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{item.content}</p>
                                </div>
                            )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {addingColumnId === column.id ? (
                            <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-indigo-500/30 shadow-lg mt-2 animate-in fade-in zoom-in-95 duration-200">
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
                                    className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none mb-4 font-medium"
                                />
                                
                                <div className="flex items-center gap-2 mb-4">
                                    {tagOptions.map((t) => (
                                        <button
                                            key={t.name}
                                            onClick={() => setSelectedTag(t.name as any)}
                                            className={`w-5 h-5 rounded-full ${t.color} transition-all ${selectedTag === t.name ? 'ring-2 ring-zinc-900 dark:ring-white scale-110' : 'opacity-30 hover:opacity-100'}`}
                                            title={t.name}
                                        />
                                    ))}
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 font-medium">{selectedTag}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <button onClick={() => setAddingColumnId(null)} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-white transition-colors p-1"><X size={14} /></button>
                                    <button onClick={() => addItem(column.id)} className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">Add</button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => {
                                    setAddingColumnId(column.id);
                                    setNewItemContent('');
                                    setSelectedTag('Frontend');
                                }}
                                className="w-full py-3 mt-2 border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex items-center justify-center gap-2 opacity-60 hover:opacity-100 group"
                            >
                                <Plus size={14} className="group-hover:scale-110 transition-transform"/> Add Ticket
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
