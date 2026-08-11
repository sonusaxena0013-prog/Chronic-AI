import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUploader({ onFileSelect }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="fileUploader"
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <p>📂 Drop your file here...</p>
      ) : (
        <>
          <p>📎 Drag & Drop a file here</p>
          <p>or click to browse</p>
          <small>Supported: PDF, DOCX, TXT, MD</small>
        </>
      )}
    </div>
  );
}