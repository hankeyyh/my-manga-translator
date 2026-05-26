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
