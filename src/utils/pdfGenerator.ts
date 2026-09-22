import jsPDF from 'jspdf';
import html2canvasPro from 'html2canvas-pro';

export interface PdfExportOptions {
  fileName?: string;
  elementId?: string;
  element?: HTMLElement | null;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (err: any) => void;
}

/**
 * Triggers the browser print dialog safely, catching any iframe sandbox restrictions.
 */
export function triggerBrowserPrint(): boolean {
  try {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return true;
    }
  } catch (err) {
    console.warn('Direct window.print() failed or restricted by sandbox:', err);
  }
  return false;
}

/**
 * Resolves the target DOM element for PDF capture, preferring active/visible elements
 * over hidden duplicate templates in the DOM.
 */
function resolveTargetElement(options: PdfExportOptions): HTMLElement {
  // If an element reference was explicitly passed
  if (options.element && document.contains(options.element)) {
    if (options.element.offsetWidth > 0 && options.element.scrollHeight > 0) {
      return options.element;
    }
  }

  // If an elementId was provided
  if (options.elementId) {
    const allMatches = Array.from(
      document.querySelectorAll<HTMLElement>(`#${options.elementId}, [id="${options.elementId}"]`)
    );

    if (allMatches.length > 0) {
      // Prioritize the element that is actively rendered and visible on screen
      const visible = allMatches.find(
        (el) =>
          el.offsetWidth > 0 &&
          el.scrollHeight > 0 &&
          window.getComputedStyle(el).display !== 'none' &&
          window.getComputedStyle(el).visibility !== 'hidden'
      );
      if (visible) return visible;

      // Otherwise return the last match (commonly modal portal instances)
      return allMatches[allMatches.length - 1];
    }
  }

  if (options.element) {
    return options.element;
  }

  throw new Error(`Target printable element "${options.elementId || 'unknown'}" could not be located.`);
}

/**
 * Finds the optimal vertical page break point (in canvas pixel coordinates)
 * so that sections, tables, table rows, cards, and stamps are never cut across page boundaries.
 */
function findOptimalPageBreakY(
  fullCanvas: HTMLCanvasElement,
  sourceY: number,
  maxPageHeightPx: number,
  elementToCapture: HTMLElement,
  scaleFactor: number
): number {
  const targetCutY = sourceY + maxPageHeightPx;
  const minCutY = sourceY + Math.floor(maxPageHeightPx * 0.58); // Don't cut earlier than 58% of page

  const containerRect = elementToCapture.getBoundingClientRect();

  // 1. Gather all atomic elements that should not be split across pages
  const atomicSelector = [
    'section',
    'header',
    'footer',
    'table',
    'tr',
    '.break-inside-avoid',
    '[data-break-avoid]',
    '.printable-dossier-document > div',
    '.printable-quote-document > div',
    'div.border',
  ].join(', ');

  const atomicNodes = Array.from(elementToCapture.querySelectorAll<HTMLElement>(atomicSelector));
  
  interface BlockBoundary {
    top: number;
    bottom: number;
    height: number;
    isOversized: boolean;
  }

  const blocks: BlockBoundary[] = [];

  for (const node of atomicNodes) {
    // Ignore hidden or print-ignored nodes
    if (
      node.offsetWidth === 0 ||
      node.offsetHeight === 0 ||
      node.classList.contains('print:hidden') ||
      node.hasAttribute('data-print-ignore')
    ) {
      continue;
    }

    const rect = node.getBoundingClientRect();
    const topPx = (rect.top - containerRect.top) * scaleFactor;
    const heightPx = rect.height * scaleFactor;
    const bottomPx = topPx + heightPx;

    // Ignore tiny spacers (< 10px)
    if (heightPx < 10) continue;

    // If an element is taller than a full page (like an enormous table), we don't treat the whole container as atomic,
    // because its internal rows (<tr>) will be tracked individually instead.
    const isOversized = heightPx > maxPageHeightPx * 0.85;

    blocks.push({
      top: topPx,
      bottom: bottomPx,
      height: heightPx,
      isOversized,
    });
  }

  // 2. Generate candidate cut positions from element tops and bottoms
  const candidateCuts = new Set<number>();

  for (const block of blocks) {
    if (block.top >= minCutY && block.top <= targetCutY + 12) {
      candidateCuts.add(Math.floor(block.top - 4)); // Cut right before element starts
    }
    if (block.bottom >= minCutY && block.bottom <= targetCutY) {
      candidateCuts.add(Math.floor(block.bottom + 4)); // Cut right after element ends
    }
  }

  // Filter candidates to those that do NOT split any non-oversized atomic block
  const validCandidates: number[] = [];
  const paddingTolerance = 6;

  for (const candY of candidateCuts) {
    if (candY < minCutY || candY > targetCutY) continue;

    let isSplittingBlock = false;

    for (const block of blocks) {
      if (block.isOversized) continue;

      // An element is split if candY is strictly inside its body (excluding outer margin tolerance)
      if (candY > block.top + paddingTolerance && candY < block.bottom - paddingTolerance) {
        isSplittingBlock = true;
        break;
      }
    }

    if (!isSplittingBlock) {
      validCandidates.push(candY);
    }
  }

  // If we found valid DOM candidates, pick the one closest to targetCutY to maximize page fill
  if (validCandidates.length > 0) {
    validCandidates.sort((a, b) => b - a);
    return validCandidates[0];
  }

  // 3. Fallback: Canvas scanline analysis to find empty / white separator space
  try {
    const ctx = fullCanvas.getContext('2d');
    if (ctx) {
      const scanStart = Math.max(minCutY, targetCutY - 200);
      const scanHeight = targetCutY - scanStart;

      if (scanHeight > 0) {
        const imgData = ctx.getImageData(0, scanStart, fullCanvas.width, scanHeight);
        const data = imgData.data;
        const width = fullCanvas.width;

        // Scan from targetCutY upwards towards scanStart
        for (let relY = scanHeight - 1; relY >= 0; relY--) {
          let isRowCleanWhite = true;
          const rowOffset = relY * width * 4;

          // Check pixels across the row (sample every 4 pixels for speed)
          for (let x = 20; x < width - 20; x += 4) {
            const idx = rowOffset + x * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // If pixel is darker than #f5f5f5 (not white/neutral background)
            if (r < 240 || g < 240 || b < 240) {
              isRowCleanWhite = false;
              break;
            }
          }

          if (isRowCleanWhite) {
            return scanStart + relY;
          }
        }
      }
    }
  } catch (canvasErr) {
    console.warn('Canvas scanline analysis skipped:', canvasErr);
  }

  // 4. Default to max page height if no clean break found
  return targetCutY;
}

/**
 * Captures the full content of a DOM element to an HTMLCanvasElement using html2canvas-pro.
 * Explicitly calculates scrollHeight and clears all viewport/overflow clipping.
 */
async function captureElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const fullContentHeight = Math.max(
    element.scrollHeight,
    element.offsetHeight,
    element.getBoundingClientRect().height,
    800
  );

  // Canonical fixed A4 document width in px (corresponds to standard 210mm A4 sheet geometry)
  const fullContentWidth = 840;

  const canvas = await html2canvasPro(element, {
    scale: 2, // High resolution (300 DPI equivalent)
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200,
    windowHeight: Math.max(fullContentHeight + 400, 2400),
    height: fullContentHeight,
    width: fullContentWidth,
    scrollY: 0,
    scrollX: 0,
    x: 0,
    y: 0,
    ignoreElements: (el) => {
      return el.classList?.contains('print:hidden') || el.classList?.contains('print-controls-toolbar') || el.hasAttribute('data-print-ignore');
    },
    onclone: (clonedDoc, clonedElement) => {
      // 1. Reset root HTML and body in cloned iframe to prevent height/overflow truncation
      if (clonedDoc.documentElement) {
        clonedDoc.documentElement.style.overflow = 'visible';
        clonedDoc.documentElement.style.height = 'auto';
        clonedDoc.documentElement.style.maxHeight = 'none';
      }
      if (clonedDoc.body) {
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.height = 'auto';
        clonedDoc.body.style.minHeight = 'auto';
        clonedDoc.body.style.maxHeight = 'none';
        clonedDoc.body.style.backgroundColor = '#ffffff';
        clonedDoc.body.style.color = '#0f172a';
      }

      // 2. Unwind all parent scroll, scale, and fixed-position constraints
      const previewWrappers = clonedDoc.querySelectorAll<HTMLElement>(
        '.print-preview-scale-wrapper, .print-preview-viewport, .printable-shipment-wrapper, .print-quote-wrapper'
      );
      previewWrappers.forEach((pw) => {
        pw.style.transform = 'none';
        pw.style.width = '100%';
        pw.style.maxWidth = '100%';
        pw.style.overflow = 'visible';
        pw.style.height = 'auto';
        pw.style.minHeight = 'auto';
        pw.style.padding = '0';
        pw.style.margin = '0';
      });

      let parent = clonedElement.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.overflow = 'visible';
        parent.style.height = 'auto';
        parent.style.minHeight = 'auto';
        parent.style.maxHeight = 'none';
        parent.style.position = 'static';
        parent.style.transform = 'none';
        parent = parent.parentElement;
      }

      // 3. Ensure the cloned document is rendered at fixed canonical A4 width without viewport clipping
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.position = 'static';
      clonedElement.style.overflow = 'visible';
      clonedElement.style.height = 'auto';
      clonedElement.style.minHeight = `${fullContentHeight}px`;
      clonedElement.style.maxHeight = 'none';
      clonedElement.style.width = '840px';
      clonedElement.style.maxWidth = '840px';
      clonedElement.style.minWidth = '840px';
      clonedElement.style.margin = '0 auto';
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.transform = 'none';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.color = '#0f172a';

      // 4. Force multi-column print layouts in the cloned DOM (regardless of mobile client window)
      clonedDoc.querySelectorAll<HTMLElement>('.dossier-header-row').forEach((el) => {
        el.style.display = 'flex';
        el.style.flexDirection = 'row';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'space-between';
      });
      clonedDoc.querySelectorAll<HTMLElement>('.dossier-parties-grid').forEach((el) => {
        el.style.display = 'grid';
        el.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        el.style.gap = '16px';
      });
      clonedDoc.querySelectorAll<HTMLElement>('.dossier-specs-grid').forEach((el) => {
        el.style.display = 'grid';
        el.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
        el.style.gap = '12px 16px';
      });
      clonedDoc.querySelectorAll<HTMLElement>('.dossier-quote-route-grid').forEach((el) => {
        el.style.display = 'grid';
        el.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        el.style.gap = '16px';
      });
      clonedDoc.querySelectorAll<HTMLElement>('.dossier-quote-cargo-grid').forEach((el) => {
        el.style.display = 'grid';
        el.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
        el.style.gap = '12px';
      });
      clonedDoc.querySelectorAll<HTMLElement>('.dossier-signatures-grid').forEach((el) => {
        el.style.display = 'grid';
        el.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        el.style.gap = '16px';
        el.style.alignItems = 'flex-end';
      });
      clonedDoc.querySelectorAll<HTMLElement>('.dossier-footer-legal-row').forEach((el) => {
        el.style.display = 'flex';
        el.style.flexDirection = 'row';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'space-between';
      });
      clonedDoc.querySelectorAll<HTMLElement>('table').forEach((el) => {
        el.style.width = '100%';
        el.style.tableLayout = 'fixed';
      });
    },
  });

  return canvas;
}

/**
 * Exports a DOM element as a complete, multi-page A4 PDF document with intelligent page breaking.
 */
export async function exportElementToPdf(options: PdfExportOptions): Promise<boolean> {
  const { fileName = 'NEXORA-Document.pdf', onStart, onComplete, onError } = options;

  let stagingWrapper: HTMLDivElement | null = null;

  try {
    onStart?.();

    const targetElement = resolveTargetElement(options);

    // Wait a frame to ensure all barcodes, images, and fonts are painted
    await new Promise((resolve) => setTimeout(resolve, 120));

    let elementToCapture = targetElement;

    // If the element has zero dimensions (e.g. rendered inside a display:none container),
    // clone it into a temporary offscreen staging container with explicit dimensions.
    const isHidden =
      targetElement.offsetWidth === 0 ||
      targetElement.scrollHeight === 0 ||
      window.getComputedStyle(targetElement).display === 'none';

    if (isHidden) {
      stagingWrapper = document.createElement('div');
      stagingWrapper.style.position = 'fixed';
      stagingWrapper.style.left = '-9999px';
      stagingWrapper.style.top = '0';
      stagingWrapper.style.width = '860px';
      stagingWrapper.style.zIndex = '-9999';
      stagingWrapper.style.opacity = '1';
      stagingWrapper.style.visibility = 'visible';
      stagingWrapper.style.display = 'block';
      stagingWrapper.style.backgroundColor = '#ffffff';
      stagingWrapper.style.color = '#0f172a';

      const cloned = targetElement.cloneNode(true) as HTMLElement;
      cloned.style.display = 'block';
      cloned.style.visibility = 'visible';
      cloned.style.position = 'static';
      cloned.style.overflow = 'visible';
      cloned.style.width = '860px';
      cloned.style.margin = '0 auto';
      cloned.style.boxShadow = 'none';

      stagingWrapper.appendChild(cloned);
      document.body.appendChild(stagingWrapper);
      elementToCapture = cloned;

      // Allow DOM repaint for staging node
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const fullCanvas = await captureElementToCanvas(elementToCapture);

    if (!fullCanvas || fullCanvas.width === 0 || fullCanvas.height === 0) {
      throw new Error('Canvas render produced empty dimensions.');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Calculate the height of one A4 page in canvas pixel space
    const maxPageCanvasHeightPx = Math.floor((fullCanvas.width * pdfPageHeight) / pdfPageWidth);
    const totalCanvasHeightPx = fullCanvas.height;

    // Calculate scale factor between canvas and DOM
    const scaleFactor = fullCanvas.height / Math.max(elementToCapture.scrollHeight, elementToCapture.offsetHeight, 1);

    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < totalCanvasHeightPx) {
      const remainingHeightPx = totalCanvasHeightPx - sourceY;

      let sliceHeightPx: number;

      if (remainingHeightPx <= maxPageCanvasHeightPx) {
        // Last page: render whatever remains
        sliceHeightPx = remainingHeightPx;
      } else {
        // Find the optimal break point that does not cut through any section, table, card, or row
        const optimalCutY = findOptimalPageBreakY(
          fullCanvas,
          sourceY,
          maxPageCanvasHeightPx,
          elementToCapture,
          scaleFactor
        );

        sliceHeightPx = Math.min(optimalCutY - sourceY, remainingHeightPx);

        // Safety fallback to prevent zero or negative progress
        if (sliceHeightPx <= 50) {
          sliceHeightPx = maxPageCanvasHeightPx;
        }
      }

      // Create a dedicated slice canvas for this page
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = fullCanvas.width;
      sliceCanvas.height = sliceHeightPx;

      const sliceCtx = sliceCanvas.getContext('2d');
      if (sliceCtx) {
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          fullCanvas,
          0,
          sourceY,
          fullCanvas.width,
          sliceHeightPx,
          0,
          0,
          fullCanvas.width,
          sliceHeightPx
        );
      }

      const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
      const renderedSliceHeightMm = (sliceHeightPx * pdfPageWidth) / fullCanvas.width;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(sliceImgData, 'JPEG', 0, 0, pdfPageWidth, renderedSliceHeightMm, undefined, 'FAST');

      sourceY += sliceHeightPx;
      pageIndex++;
    }

    pdf.save(fileName);
    onComplete?.();
    return true;
  } catch (err) {
    console.error('Failed to export PDF:', err);
    onError?.(err);
    onComplete?.();
    return false;
  } finally {
    if (stagingWrapper && stagingWrapper.parentNode) {
      stagingWrapper.parentNode.removeChild(stagingWrapper);
    }
  }
}



