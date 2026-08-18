import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function CVPdfViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setNumPages(null);
    setLoadError(null);
  }, [url]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const updateWidth = () => {
      setContainerWidth(node.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const pageWidth = containerWidth > 0 ? Math.min(containerWidth - 24, 900) : undefined;

  return (
    <div ref={containerRef} className="cv-pdf-viewer">
      <Document
        file={url}
        onLoadSuccess={({ numPages: total }) => {
          setNumPages(total);
          setLoadError(null);
        }}
        onLoadError={(error) => {
          console.error('PDF load error:', error);
          setLoadError('Unable to render this PDF inline.');
        }}
        loading={
          <div className="cv-pdf-loading">
            <div className="cv-pdf-spinner" aria-hidden="true" />
            <p>Loading CV preview…</p>
          </div>
        }
        error={
          <div className="cv-pdf-error">
            <p>{loadError || 'Unable to load PDF preview.'}</p>
          </div>
        }
      >
        {numPages &&
          Array.from({ length: numPages }, (_, index) => (
            <div key={`page_${index + 1}`} className="cv-pdf-page">
              <Page
                pageNumber={index + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              {numPages > 1 && (
                <span className="cv-pdf-page-label">
                  Page {index + 1} of {numPages}
                </span>
              )}
            </div>
          ))}
      </Document>
    </div>
  );
}
