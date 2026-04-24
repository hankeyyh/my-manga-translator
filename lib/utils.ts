import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * 获取文件扩展名
 */
export function getFileExtension(file: File) {
  const extFromName = file.name.includes('.')
    ? file.name.split('.').pop()?.toLowerCase()
    : undefined;
  const extFromType = file.type.includes('/')
    ? file.type.split('/').pop()?.toLowerCase()
    : undefined;
  return extFromName || extFromType;
}