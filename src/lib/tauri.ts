/**
 * Tauri desktop environment detection and native command bridge.
 * Safe to use in both browser and Tauri desktop environments.
 */

export function isTauri(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
  );
}

export async function getTauriCliFile(): Promise<string | null> {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const path = await invoke<string | null>('get_cli_file');
    return path || null;
  } catch (err) {
    console.warn('Failed to get CLI file from Tauri:', err);
    return null;
  }
}

export async function readNativeFile(path: string): Promise<string> {
  if (!isTauri()) {
    throw new Error('Native file read is only available in desktop app');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return await invoke<string>('read_native_file', { path });
}

export async function writeNativeFile(path: string, content: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('Native file write is only available in desktop app');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke<void>('write_native_file', { path, content });
}
