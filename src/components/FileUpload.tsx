import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onUpload: (input: { b64?: string; text?: string }) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
       alert('Please upload an image file.');
       return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result?.toString().split(',')[1];
      if (b64) onUpload({ b64 });
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {!showTextInput ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative border-2 border-dashed p-12 transition-colors flex flex-col items-center justify-center cursor-pointer ${
              dragActive ? 'border-ink bg-ink/5' : 'border-line/30'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
            <Upload className="w-10 h-10 mb-4 opacity-40" />
            <p className="text-sm font-mono uppercase tracking-widest text-center">
              Drop image of pseudocode or click to browse
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setShowTextInput(true); }}
              className="mt-6 text-[10px] uppercase tracking-tighter underline opacity-60 hover:opacity-100"
            >
              Or enter plain text instead
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="textinput"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-line p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="label-sm">Algorithm Pseudocode</span>
              <button 
                onClick={() => setShowTextInput(false)}
                className="opacity-40 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              className="w-full h-40 bg-transparent border border-line/20 p-3 font-mono text-sm focus:outline-none focus:border-ink"
              placeholder="Paste your pseudocode here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button
              disabled={!textInput.trim() || disabled}
              onClick={() => onUpload({ text: textInput })}
              className="btn-technical w-full"
            >
              Analyse Algorithm
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
