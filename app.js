// Constants
const CELL_SIZE = 30;
const LABEL_WIDTH = 50;
const LABEL_HEIGHT = 30;
const LABEL_WIDTH_MOBILE = 45;
const LABEL_HEIGHT_MOBILE = 25;
const MOBILE_BREAKPOINT = 768;
const GRID_COLORS = {
    LINE: 'rgba(255, 107, 157, 0.2)',
    BACKGROUND: '#ffe0ec',
    TEXT: '#ff6b9d'
};

// State
let currentImage = null;
let imageData = null;
let scaledImageData = null;
let originalImageDataURL = null;
let gridCols = 10;
let gridRows = 1;
let showGridLines = true;
let maxColors = 3;
let imageScale = 100;
let offsetX = 0;
let offsetY = 0;

// DOM Elements - cache all upfront
const imageUpload = document.getElementById('imageUpload');
const gridSizeSlider = document.getElementById('gridSize');
const gridSizeInput = document.getElementById('gridSizeInput');
const maxColorsSlider = document.getElementById('maxColors');
const maxColorsInput = document.getElementById('maxColorsInput');
const imageScaleSlider = document.getElementById('imageScale');
const imageScaleInput = document.getElementById('imageScaleInput');
const offsetXSlider = document.getElementById('offsetX');
const offsetXInput = document.getElementById('offsetXInput');
const offsetYSlider = document.getElementById('offsetY');
const offsetYInput = document.getElementById('offsetYInput');
const fileInfo = document.getElementById('fileInfo');
const emptyState = document.getElementById('emptyState');
const gridContainer = document.getElementById('gridContainer');
const gridCanvas = document.getElementById('gridCanvas');
const rowLabels = document.getElementById('rowLabels');
const columnLabels = document.getElementById('columnLabels');
const resolutionText = document.getElementById('resolutionText');
const showGridLinesCheckbox = document.getElementById('showGridLines');
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');
const advancedToggle = document.getElementById('advancedToggle');
const advancedContent = document.getElementById('advancedContent');
const advancedSection = document.querySelector('.advanced-section');
const previewPanel = document.querySelector('.preview-panel');
const gridWrapper = document.querySelector('.grid-wrapper');

// Canvas context
const ctx = gridCanvas.getContext('2d');

// Debounce utility for expensive operations
let generateGridTimeout = null;
function debounceGenerateGrid() {
    clearTimeout(generateGridTimeout);
    generateGridTimeout = setTimeout(() => {
        if (currentImage) generateGrid();
    }, 50); // 50ms debounce for smooth slider interaction
}

// Generic input handler factory to reduce code duplication
function createInputHandler(setState, slider, input, onChange) {
    return {
        sliderChange: (e) => {
            const value = parseInt(e.target.value, 10);
            setState(value);
            input.value = value;
            if (currentImage) onChange();
        },
        inputChange: (e) => {
            let value = parseInt(e.target.value, 10);
            const min = parseInt(slider.min, 10);
            const max = parseInt(slider.max, 10);
            
            if (isNaN(value)) return;
            value = Math.max(min, Math.min(max, value));
            
            setState(value);
            slider.value = value;
            e.target.value = value;
            
            if (currentImage) onChange();
        },
        inputBlur: (e) => {
            let value = parseInt(e.target.value, 10);
            const min = parseInt(slider.min, 10);
            const max = parseInt(slider.max, 10);
            
            if (isNaN(value) || value < min) value = min;
            else if (value > max) value = max;
            
            setState(value);
            slider.value = value;
            e.target.value = value;
            
            if (currentImage) onChange();
        }
    };
}

// Initialize input handlers with proper state setters
const gridSizeHandler = createInputHandler(
    (v) => { gridCols = v; },
    gridSizeSlider, gridSizeInput, debounceGenerateGrid
);
const maxColorsHandler = createInputHandler(
    (v) => { maxColors = v; },
    maxColorsSlider, maxColorsInput, debounceGenerateGrid
);
const imageScaleHandler = createInputHandler(
    (v) => { imageScale = v; },
    imageScaleSlider, imageScaleInput, debounceGenerateGrid
);
const offsetXHandler = createInputHandler(
    (v) => { offsetX = v; },
    offsetXSlider, offsetXInput, debounceGenerateGrid
);
const offsetYHandler = createInputHandler(
    (v) => { offsetY = v; },
    offsetYSlider, offsetYInput, debounceGenerateGrid
);

// Event listeners
imageUpload.addEventListener('change', handleImageUpload);
advancedToggle.addEventListener('click', handleAdvancedToggle);
gridSizeSlider.addEventListener('input', gridSizeHandler.sliderChange);
gridSizeInput.addEventListener('input', gridSizeHandler.inputChange);
gridSizeInput.addEventListener('blur', gridSizeHandler.inputBlur);
maxColorsSlider.addEventListener('input', maxColorsHandler.sliderChange);
maxColorsInput.addEventListener('input', maxColorsHandler.inputChange);
maxColorsInput.addEventListener('blur', maxColorsHandler.inputBlur);
imageScaleSlider.addEventListener('input', imageScaleHandler.sliderChange);
imageScaleInput.addEventListener('input', imageScaleHandler.inputChange);
imageScaleInput.addEventListener('blur', imageScaleHandler.inputBlur);
offsetXSlider.addEventListener('input', offsetXHandler.sliderChange);
offsetXInput.addEventListener('input', offsetXHandler.inputChange);
offsetXInput.addEventListener('blur', offsetXHandler.inputBlur);
offsetYSlider.addEventListener('input', offsetYHandler.sliderChange);
offsetYInput.addEventListener('input', offsetYHandler.inputChange);
offsetYInput.addEventListener('blur', offsetYHandler.inputBlur);
showGridLinesCheckbox.addEventListener('change', handleGridLinesToggle);
shareBtn.addEventListener('click', handleShare);
downloadBtn.addEventListener('click', handleDownload);

// Check for shared URL on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadFromURL();
        checkMobileAndShowToast();
    });
} else {
    loadFromURL();
    checkMobileAndShowToast();
}

// Handle window resize with debouncing
let resizeTimeout = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentImage) scaleView(CELL_SIZE);
    }, 250);
});

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileInfo.textContent = file.name;
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            originalImageDataURL = event.target.result;
            generateGrid();
        };
        img.onerror = () => {
            alert('Error loading image. Please try a different file.');
            fileInfo.textContent = 'Error loading image';
        };
        img.src = event.target.result;
    };

    reader.onerror = () => {
        alert('Error reading file. Please try again.');
        fileInfo.textContent = 'Error reading file';
    };

    reader.readAsDataURL(file);
}

function handleGridLinesToggle(e) {
    showGridLines = e.target.checked;
    if (currentImage) {
        // Only redraw grid lines, don't regenerate entire grid
        redrawGridLines();
    }
}

function redrawGridLines() {
    if (!gridCanvas || !currentImage) return;
    
    const cellSize = CELL_SIZE;
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    
    // Redraw all cells
    if (!scaledImageData) return;
    const data = scaledImageData.data;
    const colorPalette = quantizeColors(
        Array.from({ length: data.length / 4 }, (_, i) => ({
            r: data[i * 4],
            g: data[i * 4 + 1],
            b: data[i * 4 + 2]
        })),
        maxColors
    );
    
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const idx = (row * gridCols + col) * 4;
            const originalColor = {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            };
            const color = findNearestColor(originalColor, colorPalette);
            const x = col * cellSize;
            const y = row * cellSize;
            
            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
            ctx.fillRect(x, y, cellSize, cellSize);
            
            if (showGridLines) {
                ctx.strokeStyle = GRID_COLORS.LINE;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    }
}

function calculateGridRows(cols, imgWidth, imgHeight) {
    if (!imgWidth || imgHeight <= 0) return 1;
    const aspectRatio = imgHeight / imgWidth;
    return Math.max(1, Math.round(cols * aspectRatio));
}

function scaleImageToGrid(img, cols, rows, scalePercent, offsetXPercent, offsetYPercent) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cols;
    tempCanvas.height = rows;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    const scaleFactor = scalePercent / 100;
    
    if (scaleFactor === 1 && offsetXPercent === 0 && offsetYPercent === 0) {
        // Fast path: no zoom, no offset
        tempCtx.drawImage(img, 0, 0, cols, rows);
    } else if (scaleFactor === 1) {
        // Offset only
        const offsetX = (offsetXPercent / 100) * img.width;
        const offsetY = (offsetYPercent / 100) * img.height;
        const sourceX = Math.max(0, Math.min(img.width - cols, offsetX));
        const sourceY = Math.max(0, Math.min(img.height - rows, offsetY));
        const sourceWidth = Math.min(cols, img.width - sourceX);
        const sourceHeight = Math.min(rows, img.height - sourceY);
        
        tempCtx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
    } else if (scaleFactor > 1) {
        // Zoom in with offset
        const sourceWidth = img.width / scaleFactor;
        const sourceHeight = img.height / scaleFactor;
        const maxOffsetX = (img.width - sourceWidth) / 2;
        const maxOffsetY = (img.height - sourceHeight) / 2;
        
        let sourceX = (img.width - sourceWidth) / 2 + (offsetXPercent / 100) * maxOffsetX * 2;
        let sourceY = (img.height - sourceHeight) / 2 + (offsetYPercent / 100) * maxOffsetY * 2;
        
        sourceX = Math.max(0, Math.min(img.width - sourceWidth, sourceX));
        sourceY = Math.max(0, Math.min(img.height - sourceHeight, sourceY));
        
        tempCtx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cols, rows);
    } else {
        // Zoom out
        tempCtx.drawImage(img, 0, 0, cols, rows);
    }
    
    return tempCtx.getImageData(0, 0, cols, rows);
}

function quantizeColors(colors, maxColors) {
    if (!colors || colors.length === 0) return [];
    if (maxColors <= 1) {
        const total = colors.reduce((acc, c) => ({
            r: acc.r + c.r,
            g: acc.g + c.g,
            b: acc.b + c.b
        }), { r: 0, g: 0, b: 0 });
        const len = colors.length;
        return [{
            r: Math.round(total.r / len),
            g: Math.round(total.g / len),
            b: Math.round(total.b / len)
        }];
    }

    // Calculate color ranges
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;
    
    for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        if (c.r < minR) minR = c.r;
        if (c.r > maxR) maxR = c.r;
        if (c.g < minG) minG = c.g;
        if (c.g > maxG) maxG = c.g;
        if (c.b < minB) minB = c.b;
        if (c.b > maxB) maxB = c.b;
    }
    
    const rangeR = maxR - minR || 255;
    const rangeG = maxG - minG || 255;
    const rangeB = maxB - minB || 255;
    
    // Create buckets
    const binsPerChannel = Math.ceil(Math.pow(maxColors, 1/3));
    const binSizeR = Math.max(1, rangeR / binsPerChannel);
    const binSizeG = Math.max(1, rangeG / binsPerChannel);
    const binSizeB = Math.max(1, rangeB / binsPerChannel);
    
    const buckets = new Map();
    
    for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        const binR = Math.min(binsPerChannel - 1, Math.floor((c.r - minR) / binSizeR));
        const binG = Math.min(binsPerChannel - 1, Math.floor((c.g - minG) / binSizeG));
        const binB = Math.min(binsPerChannel - 1, Math.floor((c.b - minB) / binSizeB));
        const key = `${binR},${binG},${binB}`;
        
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(c);
    }
    
    // Calculate averages
    const bucketColors = Array.from(buckets.entries()).map(([key, bucketColors]) => {
        const total = bucketColors.reduce((acc, c) => ({
            r: acc.r + c.r,
            g: acc.g + c.g,
            b: acc.b + c.b
        }), { r: 0, g: 0, b: 0 });
        const len = bucketColors.length;
        return {
            r: Math.round(total.r / len),
            g: Math.round(total.g / len),
            b: Math.round(total.b / len),
            count: len
        };
    });
    
    // Sort by frequency
    bucketColors.sort((a, b) => b.count - a.count);
    
    // Merge similar colors if needed
    while (bucketColors.length > maxColors) {
        let minDist = Infinity;
        let mergeIdx1 = 0;
        let mergeIdx2 = 1;
        
        for (let i = 0; i < bucketColors.length - 1; i++) {
            for (let j = i + 1; j < bucketColors.length; j++) {
                const dr = bucketColors[i].r - bucketColors[j].r;
                const dg = bucketColors[i].g - bucketColors[j].g;
                const db = bucketColors[i].b - bucketColors[j].b;
                const dist = dr * dr + dg * dg + db * db;
                if (dist < minDist) {
                    minDist = dist;
                    mergeIdx1 = i;
                    mergeIdx2 = j;
                }
            }
        }
        
        const c1 = bucketColors[mergeIdx1];
        const c2 = bucketColors[mergeIdx2];
        const totalCount = c1.count + c2.count;
        bucketColors[mergeIdx1] = {
            r: Math.round((c1.r * c1.count + c2.r * c2.count) / totalCount),
            g: Math.round((c1.g * c1.count + c2.g * c2.count) / totalCount),
            b: Math.round((c1.b * c1.count + c2.b * c2.count) / totalCount),
            count: totalCount
        };
        bucketColors.splice(mergeIdx2, 1);
    }
    
    // Add colors if needed (optimized)
    if (bucketColors.length < maxColors) {
        const existing = bucketColors.length;
        const sampleSize = Math.min(50, colors.length);
        
        for (let needed = bucketColors.length; needed < maxColors; needed++) {
            let bestColor = null;
            let maxMinDist = -1;
            
            for (let i = 0; i < sampleSize; i++) {
                const candidate = colors[Math.floor(Math.random() * colors.length)];
                let minDist = Infinity;
                
                for (let j = 0; j < bucketColors.length; j++) {
                    const dr = candidate.r - bucketColors[j].r;
                    const dg = candidate.g - bucketColors[j].g;
                    const db = candidate.b - bucketColors[j].b;
                    const dist = dr * dr + dg * dg + db * db;
                    if (dist < minDist) minDist = dist;
                }
                
                if (minDist > maxMinDist) {
                    maxMinDist = minDist;
                    bestColor = candidate;
                }
            }
            
            if (bestColor) {
                bucketColors.push({ r: bestColor.r, g: bestColor.g, b: bestColor.b, count: 1 });
            } else {
                const step = needed - existing;
                bucketColors.push({
                    r: Math.floor(minR + (step * rangeR) / maxColors),
                    g: Math.floor(minG + (step * rangeG) / maxColors),
                    b: Math.floor(minB + (step * rangeB) / maxColors),
                    count: 1
                });
            }
        }
    }
    
    return bucketColors.slice(0, maxColors).map(c => ({ r: c.r, g: c.g, b: c.b }));
}

function findNearestColor(color, palette) {
    if (!palette || palette.length === 0) return { r: 0, g: 0, b: 0 };
    
    let minDist = Infinity;
    let nearest = palette[0];
    
    for (let i = 0; i < palette.length; i++) {
        const p = palette[i];
        const dr = color.r - p.r;
        const dg = color.g - p.g;
        const db = color.b - p.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
            minDist = dist;
            nearest = p;
        }
    }
    
    return nearest;
}

function generateGrid() {
    if (!currentImage) return;

    // Calculate grid dimensions
    gridRows = calculateGridRows(gridCols, currentImage.width, currentImage.height);

    // Scale image to grid size
    scaledImageData = scaleImageToGrid(currentImage, gridCols, gridRows, imageScale, offsetX, offsetY);
    
    // Collect colors (optimized loop)
    const data = scaledImageData.data;
    const colorCount = data.length / 4;
    const colors = new Array(colorCount);
    for (let i = 0; i < colorCount; i++) {
        const idx = i * 4;
        colors[i] = {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2]
        };
    }

    // Quantize colors
    const colorPalette = quantizeColors(colors, maxColors);

    // Set canvas size
    const canvasWidth = gridCols * CELL_SIZE;
    const canvasHeight = gridRows * CELL_SIZE;

    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;

    // Clear and draw grid
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw all cells (optimized)
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const idx = (row * gridCols + col) * 4;
            const originalColor = {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            };
            const color = findNearestColor(originalColor, colorPalette);
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

            if (showGridLines) {
                ctx.strokeStyle = GRID_COLORS.LINE;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Scale view and generate labels
    scaleView(CELL_SIZE);
    generateLabels(CELL_SIZE);

    // Update UI
    resolutionText.textContent = `Grid: ${gridCols} × ${gridRows}`;
    emptyState.style.display = 'none';
    gridContainer.style.display = 'block';
    downloadBtn.disabled = false;
    shareBtn.disabled = false;
}

function scaleView(cellSize) {
    const canvasWidth = gridCols * cellSize;
    const canvasHeight = gridRows * cellSize;
    
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const labelWidth = isMobile ? LABEL_WIDTH_MOBILE : LABEL_WIDTH;
    const labelHeight = isMobile ? LABEL_HEIGHT_MOBILE : LABEL_HEIGHT;
    
    const totalWidth = canvasWidth + labelWidth;
    const totalHeight = canvasHeight + labelHeight + 5;
    
    const panelPadding = isMobile ? 20 : 60;
    const maxWidth = previewPanel.clientWidth - panelPadding;
    const headerHeight = isMobile ? 200 : 350;
    const maxHeight = Math.max(window.innerHeight - headerHeight, isMobile ? 300 : 400);
    
    const scaleX = maxWidth / totalWidth;
    const scaleY = maxHeight / totalHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    if (scale < 1) {
        gridWrapper.style.transform = `scale(${scale})`;
        gridWrapper.style.transformOrigin = 'top left';
        gridWrapper.style.width = `${totalWidth}px`;
        gridWrapper.style.height = `${totalHeight}px`;
        gridContainer.style.width = `${totalWidth * scale}px`;
        gridContainer.style.height = `${totalHeight * scale}px`;
    } else {
        gridWrapper.style.transform = '';
        gridWrapper.style.transformOrigin = '';
        gridWrapper.style.width = '';
        gridWrapper.style.height = '';
        gridContainer.style.width = '';
        gridContainer.style.height = '';
    }
}

function generateLabels(cellSize) {
    // Clear and regenerate
    rowLabels.innerHTML = '';
    columnLabels.innerHTML = '';

    // Use DocumentFragment for better performance
    const colFragment = document.createDocumentFragment();
    const rowFragment = document.createDocumentFragment();

    for (let col = 0; col < gridCols; col++) {
        const label = document.createElement('div');
        label.className = 'column-label';
        label.textContent = col + 1;
        label.style.width = `${cellSize}px`;
        colFragment.appendChild(label);
    }

    for (let row = 0; row < gridRows; row++) {
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = row + 1;
        label.style.height = `${cellSize}px`;
        rowFragment.appendChild(label);
    }

    columnLabels.appendChild(colFragment);
    rowLabels.appendChild(rowFragment);
}

function handleAdvancedToggle() {
    const isExpanded = advancedContent.style.display !== 'none';
    advancedContent.style.display = isExpanded ? 'none' : 'block';
    advancedSection.classList.toggle('expanded', !isExpanded);
}

function handleShare() {
    if (!currentImage || !originalImageDataURL) return;

    try {
        const params = new URLSearchParams();
        params.set('cols', gridCols.toString());
        params.set('maxColors', maxColors.toString());
        params.set('scale', imageScale.toString());
        params.set('offsetX', offsetX.toString());
        params.set('offsetY', offsetY.toString());
        params.set('gridLines', showGridLines ? '1' : '0');
        
        const baseURL = window.location.origin + window.location.pathname;
        const shareURL = new URL(baseURL);
        shareURL.search = params.toString();
        shareURL.hash = encodeURIComponent(originalImageDataURL);
        
        const urlString = shareURL.toString();
        
        if (urlString.length > 6000) {
            alert('The image is too large to share via URL. Please try a smaller image or download it instead.');
            return;
        }
        
        navigator.clipboard.writeText(urlString).then(() => {
            const originalText = shareBtn.textContent;
            shareBtn.textContent = 'Copied!';
            shareBtn.style.background = 'linear-gradient(135deg, #6bff9d 0%, #8fff8f 100%)';
            
            setTimeout(() => {
                shareBtn.textContent = originalText;
                shareBtn.style.background = '';
            }, 2000);
        }).catch(() => {
            prompt('Copy this URL to share:', urlString);
        });
    } catch (error) {
        console.error('Error generating share URL:', error);
        alert('Error generating share URL. Please try again.');
    }
}

function loadFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.substring(1);
        
        if (!urlParams.has('cols') || !hash) return;
        
        const imageDataURL = decodeURIComponent(hash);
        if (!imageDataURL.startsWith('data:image')) return;
        
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            originalImageDataURL = imageDataURL;
            
            gridCols = parseInt(urlParams.get('cols'), 10) || 10;
            maxColors = parseInt(urlParams.get('maxColors'), 10) || 3;
            imageScale = parseInt(urlParams.get('scale'), 10) || 100;
            offsetX = parseInt(urlParams.get('offsetX'), 10) || 0;
            offsetY = parseInt(urlParams.get('offsetY'), 10) || 0;
            showGridLines = urlParams.get('gridLines') === '1';
            
            // Update UI
            gridSizeSlider.value = gridCols;
            gridSizeInput.value = gridCols;
            maxColorsSlider.value = maxColors;
            maxColorsInput.value = maxColors;
            imageScaleSlider.value = imageScale;
            imageScaleInput.value = imageScale;
            offsetXSlider.value = offsetX;
            offsetXInput.value = offsetX;
            offsetYSlider.value = offsetY;
            offsetYInput.value = offsetY;
            showGridLinesCheckbox.checked = showGridLines;
            
            generateGrid();
            fileInfo.textContent = 'Shared image';
        };
        
        img.onerror = () => {
            console.error('Error loading shared image');
            fileInfo.textContent = 'Error loading shared image';
        };
        
        img.src = imageDataURL;
    } catch (error) {
        console.error('Error loading from URL:', error);
    }
}

function handleDownload() {
    if (!gridCanvas || !currentImage) return;

    const labelWidth = LABEL_WIDTH;
    const labelHeight = LABEL_HEIGHT;
    
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = gridCanvas.width + labelWidth;
    downloadCanvas.height = gridCanvas.height + labelHeight;
    const downloadCtx = downloadCanvas.getContext('2d');
    
    // White background
    downloadCtx.fillStyle = 'white';
    downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
    
    // Setup font
    downloadCtx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    downloadCtx.textAlign = 'center';
    downloadCtx.textBaseline = 'middle';
    
    // Draw column labels
    const bgColor = GRID_COLORS.BACKGROUND;
    const textColor = GRID_COLORS.TEXT;
    
    for (let col = 0; col < gridCols; col++) {
        const x = labelWidth + col * CELL_SIZE + CELL_SIZE / 2;
        const y = labelHeight / 2;
        
        downloadCtx.fillStyle = bgColor;
        downloadCtx.fillRect(labelWidth + col * CELL_SIZE, 0, CELL_SIZE, labelHeight);
        
        downloadCtx.fillStyle = textColor;
        downloadCtx.fillText((col + 1).toString(), x, y);
    }
    
    // Draw row labels
    for (let row = 0; row < gridRows; row++) {
        const x = labelWidth / 2;
        const y = labelHeight + row * CELL_SIZE + CELL_SIZE / 2;
        
        downloadCtx.fillStyle = bgColor;
        downloadCtx.fillRect(0, labelHeight + row * CELL_SIZE, labelWidth, CELL_SIZE);
        
        downloadCtx.fillStyle = textColor;
        downloadCtx.fillText((row + 1).toString(), x, y);
    }
    
    // Draw grid canvas
    downloadCtx.drawImage(gridCanvas, labelWidth, labelHeight);
    
    // Download
    const link = document.createElement('a');
    link.download = 'pikcelgrid-output.png';
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
}

// Mobile detection and toast notification
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
}

function checkMobileAndShowToast() {
    if (isMobileDevice()) {
        const toast = document.getElementById('mobileToast');
        const toastClose = document.getElementById('toastClose');
        
        if (toast && !localStorage.getItem('mobileToastDismissed')) {
            // Show toast after a short delay
            setTimeout(() => {
                toast.style.display = 'block';
                toast.classList.add('show');
            }, 500);
            
            // Close button handler
            if (toastClose) {
                toastClose.addEventListener('click', () => {
                    toast.style.animation = 'toastSlideOut 0.4s ease-out forwards';
                    setTimeout(() => {
                        toast.style.display = 'none';
                        localStorage.setItem('mobileToastDismissed', 'true');
                    }, 400);
                });
            }
            
            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                if (toast.style.display !== 'none') {
                    toast.style.animation = 'toastSlideOut 0.4s ease-out forwards';
                    setTimeout(() => {
                        toast.style.display = 'none';
                        localStorage.setItem('mobileToastDismissed', 'true');
                    }, 400);
                }
            }, 10000);
        }
    }
}
