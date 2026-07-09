import { useState, useEffect } from 'react';
import { 
  CircleCheck, Circle, Trash2, Plus, Pencil, Check, 
  Sun, Moon, Search, Calendar, Tag, AlertCircle, GripVertical, X
} from 'lucide-react';

import DatePickerRaw from "react-multi-date-picker";
import persianRaw from "react-date-object/calendars/persian";
import persianFaRaw from "react-date-object/locales/persian_fa";
import DateObjectRaw from "react-date-object";

const DatePicker = DatePickerRaw.default || DatePickerRaw;
const persian = persianRaw.default || persianRaw;
const persian_fa = persianFaRaw.default || persianFaRaw;
const DateObject = DateObjectRaw.default || DateObjectRaw;

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [availableTags, setAvailableTags] = useState(() => {
    const savedTags = localStorage.getItem('todo-tags');
    return savedTags ? JSON.parse(savedTags) : [];
  });

  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState(''); 
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState(null);

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const todayStr = new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('todo-tags', JSON.stringify(availableTags));
  }, [availableTags]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const trimmedCategory = category.trim();
    if (trimmedCategory && !availableTags.includes(trimmedCategory)) {
      setAvailableTags([...availableTags, trimmedCategory]);
    }
    
    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      category: trimmedCategory || 'بدون برچسب',
      priority: priority || 'بدون اولویت',
      dueDate: dueDate ? (typeof dueDate.format === 'function' ? dueDate.format("YYYY/MM/DD") : String(dueDate)) : '',
    };
    
    setTodos([...todos, newTodo]);
    setInputValue('');
    setCategory('');
    setPriority('');
    setDueDate(null);
  };

  const deleteTag = (e, tagToDelete) => {
    e.stopPropagation();
    const updatedTags = availableTags.filter(t => t !== tagToDelete);
    setAvailableTags(updatedTags);
    if (category === tagToDelete) {
      setCategory('');
    }
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newTodos = [...todos];
    const draggedTodo = newTodos[draggedItemIndex];
    newTodos.splice(draggedItemIndex, 1);
    newTodos.splice(index, 0, draggedTodo);

    setDraggedItemIndex(index);
    setTodos(newTodos);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const isDragEnabled = filter === 'all' && searchQuery === '';

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'active') matchesFilter = !todo.completed;
    else if (filter === 'completed') matchesFilter = todo.completed;
    else if (filter === 'today') matchesFilter = todo.dueDate === todayStr;
    
    return matchesSearch && matchesFilter;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const progressPercent = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  const getPriorityColor = (level) => {
    switch(level) {
      case 'بالا': return 'text-red-500 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50';
      case 'متوسط': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50';
      case 'پایین': return 'text-green-500 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50';
      default: return 'hidden';
    }
  };

  const filteredTags = availableTags.filter(tag => tag && tag.includes(category));

  return (
    <div className="min-h-screen flex justify-center items-center p-2 sm:p-4 font-sans bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-[95vh] sm:h-[90vh] flex flex-col rounded-3xl overflow-hidden relative transition-colors duration-300">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 shadow-md z-10 shrink-0" dir="rtl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">لیست کارها</h1>
            </div>
            <button 
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm cursor-pointer"
            >
              {isDarkMode ? <Sun size={22} className="text-yellow-300" /> : <Moon size={22} />}
            </button>
          </div>

          <div className="relative mb-4">
            <Search size={18} className="absolute right-3 top-2.5 text-blue-200" />
            <input 
              type="text" 
              placeholder="جستجوی تسک..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-xl py-2 pr-10 pl-4 outline-none focus:bg-white/20 transition-all text-sm"
            />
          </div>

          <div className="w-full">
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span>پیشرفت شما</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-3 pb-0 border-b border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-800" dir="rtl">
          {[
            { id: 'all', label: 'همه' },
            { id: 'today', label: 'امروز' },
            { id: 'active', label: 'در حال انجام' },
            { id: 'completed', label: 'تکمیل شده' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`pb-2 px-1 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                filter === f.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50" dir="rtl">
          {filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <p className="mt-4 font-medium">هیچ تسکی پیدا نشد!</p>
            </div>
          ) : (
            filteredTodos.map((todo, index) => (
              <div
                key={todo.id}
                draggable={isDragEnabled}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col p-3 rounded-2xl border transition-all duration-200 ${
                  todo.completed 
                    ? 'bg-gray-100 border-gray-200 opacity-60 dark:bg-gray-800/60 dark:border-gray-700' 
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-600'
                } ${draggedItemIndex === index ? 'opacity-50 scale-95' : ''}`}
              >
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {isDragEnabled && (
                      <div className="cursor-grab text-gray-300 dark:text-gray-500 hover:text-gray-500 active:cursor-grabbing">
                        <GripVertical size={16} />
                      </div>
                    )}
                    <button type="button" onClick={() => toggleComplete(todo.id)} className={`flex-shrink-0 transition-colors cursor-pointer ${todo.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-500 hover:text-blue-400'}`}>
                      {todo.completed ? <CircleCheck size={24} /> : <Circle size={24} />}
                    </button>
                    
                    {editingId === todo.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                          className="flex-1 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-500 rounded-lg px-2 py-1 outline-none text-sm dark:text-white"
                        />
                        <button type="button" onClick={() => saveEdit(todo.id)} className="text-green-600 bg-green-100 dark:bg-green-900/40 p-1 rounded-lg cursor-pointer">
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className={`truncate text-sm transition-all ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                        {todo.text}
                      </span>
                    )}
                  </div>

                  {editingId !== todo.id && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button type="button" onClick={() => startEditing(todo)} className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2 mr-7 pr-1">
                  {todo.category && todo.category !== 'بدون برچسب' && (
                    <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium max-w-[120px] truncate">
                      <Tag size={10} className="shrink-0" /> <span className="truncate">{todo.category}</span>
                    </span>
                  )}
                  {todo.priority && todo.priority !== 'بدون اولویت' && (
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium shrink-0 ${getPriorityColor(todo.priority)}`}>
                      <AlertCircle size={10} /> {todo.priority}
                    </span>
                  )}
                  {todo.dueDate && (
                    <span className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/30 dark:border-purple-800/50 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium shrink-0">
                      <Calendar size={10} /> {todo.dueDate}
                    </span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <form onSubmit={addTodo} className="flex flex-col gap-2" dir="rtl">
            
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="کار جدیدی اضافه کن..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white w-10 h-10 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none shrink-0 cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex gap-2 mt-1 relative z-50">
              
              <div className="relative flex-1">
                <div className="flex items-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                  <input 
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onFocus={() => setShowTagDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                    placeholder="برچسب..."
                    className="w-full bg-transparent text-[11px] px-2 py-1.5 outline-none dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  {category && (
                    <button 
                      type="button" 
                      onClick={() => setCategory('')}
                      className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                
                {showTagDropdown && filteredTags.length > 0 && (
                  <ul className="absolute bottom-full mb-1 w-full max-h-32 overflow-y-auto overflow-x-hidden custom-scroll bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-xl rounded-lg z-50 py-1 text-xs dark:text-white">
                    {filteredTags.map((tag, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center justify-between px-2 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-50 dark:border-gray-600 last:border-0"
                      >
                        <span 
                          className="flex-1 text-right truncate cursor-pointer ml-2"
                          onClick={() => { setCategory(tag); setShowTagDropdown(false); }}
                        >
                          {tag}
                        </span>
                        <button 
                          type="button" 
                          onClick={(e) => deleteTag(e, tag)} 
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded-md shrink-0 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative flex-1">
                <div 
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  onBlur={() => setTimeout(() => setShowPriorityDropdown(false), 200)}
                  tabIndex={0}
                  className="relative flex justify-between items-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] cursor-pointer outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                >
                  <span className={`truncate ${priority ? '' : 'text-gray-500 dark:text-gray-400'}`}>{priority ? `اولویت: ${priority}` : 'اولویت...'}</span>
                  {priority && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setPriority(''); }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {showPriorityDropdown && (
                  <ul className="absolute bottom-full mb-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-xl rounded-lg z-50 py-1 text-xs dark:text-white overflow-hidden">
                    {['بالا', 'متوسط', 'پایین'].map((level) => (
                      <li 
                        key={level}
                        onClick={() => { setPriority(level); setShowPriorityDropdown(false); }}
                        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-600 last:border-0 text-right truncate"
                      >
                        اولویت {level}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex-1 w-full relative flex items-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={dueDate}
                  onChange={setDueDate}
                  calendarPosition="top-center"
                  fixMainPosition={true}
                  portal={true}
                  render={(value, openCalendar) => (
                    <input 
                      onClick={openCalendar}
                      value={value || ''}
                      readOnly
                      placeholder="تاریخ سررسید"
                      className="w-full bg-transparent text-[11px] px-2 py-1.5 outline-none cursor-pointer text-center placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-white truncate"
                    />
                  )}
                />
                {dueDate && (
                  <button 
                    type="button" 
                    onClick={() => setDueDate(null)}
                    className="absolute left-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;