import { useState, useCallback } from 'react';
import { SaveStatus } from '../types/editor';
import { downloadMarkdownFile } from '../lib/markdown';

export function useFileSystem(initialFileName: string = 'welcome.md') {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [fileName, setFileName] = useState<string>(initialFileName);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(Date.now());

  const isNativeSupported = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

  const markUnsaved = useCallback(() => {
    setSaveStatus(prev => (prev === 'saved' ? 'unsaved' : prev));
  }, []);

  const openLocalFile = useCallback(async (): Promise<{ text: string; name: string } | null> => {
    if (isNativeSupported) {
      try {
        const [handle] = await (window as unknown as {
          showOpenFilePicker: (options?: unknown) => Promise<FileSystemFileHandle[]>;
        }).showOpenFilePicker({
          types: [
            {
              description: 'Markdown Files',
              accept: {
                'text/markdown': ['.md', '.markdown'],
                'text/plain': ['.txt'],
              },
            },
          ],
          multiple: false,
        });

        const file = await handle.getFile();
        const text = await file.text();

        setFileHandle(handle);
        setFileName(file.name);
        setSaveStatus('saved');
        setLastSavedAt(Date.now());

        return { text, name: file.name };
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') {
          return null; // User cancelled the picker
        }
        console.error('Error opening file with native picker:', err);
      }
    }

    // Fallback using standard input element
    return new Promise<{ text: string; name: string } | null>(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt,text/plain,text/markdown';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const text = await file.text();
        setFileHandle(null);
        setFileName(file.name);
        setSaveStatus('local_only');
        setLastSavedAt(Date.now());
        resolve({ text, name: file.name });
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  }, [isNativeSupported]);

  const saveToCurrentFile = useCallback(
    async (content: string): Promise<boolean> => {
      setSaveStatus('saving');

      if (fileHandle && isNativeSupported) {
        try {
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();

          setSaveStatus('saved');
          setLastSavedAt(Date.now());
          return true;
        } catch (err) {
          console.error('Failed to write directly to file handle:', err);
        }
      }

      // If no file handle exists, prompt Save As
      return saveAsNewFile(content);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileHandle, isNativeSupported, fileName]
  );

  const saveAsNewFile = useCallback(
    async (content: string, suggestedName?: string): Promise<boolean> => {
      setSaveStatus('saving');
      const targetName = suggestedName || fileName;

      if (isNativeSupported) {
        try {
          const handle = await (window as unknown as {
            showSaveFilePicker: (options?: unknown) => Promise<FileSystemFileHandle>;
          }).showSaveFilePicker({
            suggestedName: targetName.endsWith('.md') ? targetName : `${targetName}.md`,
            types: [
              {
                description: 'Markdown Document',
                accept: { 'text/markdown': ['.md'] },
              },
            ],
          });

          const writable = await handle.createWritable();
          await writable.write(content);
          await writable.close();

          const file = await handle.getFile();
          setFileHandle(handle);
          setFileName(file.name);
          setSaveStatus('saved');
          setLastSavedAt(Date.now());
          return true;
        } catch (err: unknown) {
          if ((err as Error).name === 'AbortError') {
            setSaveStatus(fileHandle ? 'saved' : 'unsaved');
            return false;
          }
          console.error('Failed to save file:', err);
        }
      }

      // Fallback: browser file download
      downloadMarkdownFile(targetName, content);
      setSaveStatus('local_only');
      setLastSavedAt(Date.now());
      return true;
    },
    [fileName, isNativeSupported, fileHandle]
  );

  const createNewFile = useCallback((defaultTitle = 'untitled.md') => {
    setFileHandle(null);
    setFileName(defaultTitle);
    setSaveStatus('local_only');
    setLastSavedAt(Date.now());
  }, []);

  return {
    fileHandle,
    fileName,
    setFileName,
    saveStatus,
    setSaveStatus,
    lastSavedAt,
    isNativeSupported,
    markUnsaved,
    openLocalFile,
    saveToCurrentFile,
    saveAsNewFile,
    createNewFile,
  };
}
