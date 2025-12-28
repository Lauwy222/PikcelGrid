// State
let currentImage = null;
let imageData = null;
let scaledImageData = null;
let gridCols = 10;
let gridRows = 1;
let showGridLines = true;
let maxColors = 3;
let imageScale = 100;
let offsetX = 0;
let offsetY = 0;

// DOM Elements
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
const downloadBtn = document.getElementById('downloadBtn');

// Canvas context
const ctx = gridCanvas.getContext('2d');

// Initialize
imageUpload.addEventListener('change', handleImageUpload);
gridSizeSlider.addEventListener('input', handleGridSizeSliderChange);
gridSizeInput.addEventListener('input', handleGridSizeInputChange);
gridSizeInput.addEventListener('blur', handleGridSizeInputBlur);
maxColorsSlider.addEventListener('input', handleMaxColorsSliderChange);
maxColorsInput.addEventListener('input', handleMaxColorsInputChange);
maxColorsInput.addEventListener('blur', handleMaxColorsInputBlur);
imageScaleSlider.addEventListener('input', handleImageScaleSliderChange);
imageScaleInput.addEventListener('input', handleImageScaleInputChange);
imageScaleInput.addEventListener('blur', handleImageScaleInputBlur);
offsetXSlider.addEventListener('input', handleOffsetXSliderChange);
offsetXInput.addEventListener('input', handleOffsetXInputChange);
offsetXInput.addEventListener('blur', handleOffsetXInputBlur);
offsetYSlider.addEventListener('input', handleOffsetYSliderChange);
offsetYInput.addEventListener('input', handleOffsetYInputChange);
offsetYInput.addEventListener('blur', handleOffsetYInputBlur);
showGridLinesCheckbox.addEventListener('change', handleGridLinesToggle);
downloadBtn.addEventListener('click', handleDownload);

// Handle window resize to recalculate scaling
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentImage) {
            const cellSize = 30;
            scaleView(cellSize);
        }
    }, 250);
});

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileInfo.textContent = file.name;
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            currentImage = img;
            generateGrid();
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function handleGridSizeSliderChange(e) {
    const value = parseInt(e.target.value);
    gridCols = value;
    gridSizeInput.value = value;
    if (currentImage) {
        generateGrid();
    }
}

function handleGridSizeInputChange(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(gridSizeSlider.min);
    const max = parseInt(gridSizeSlider.max);
    
    if (isNaN(value)) return;
    
    // Clamp value to min/max
    value = Math.max(min, Math.min(max, value));
    
    gridCols = value;
    gridSizeSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleGridSizeInputBlur(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(gridSizeSlider.min);
    const max = parseInt(gridSizeSlider.max);
    
    if (isNaN(value) || value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }
    
    gridCols = value;
    gridSizeSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleMaxColorsSliderChange(e) {
    const value = parseInt(e.target.value);
    maxColors = value;
    maxColorsInput.value = value;
    if (currentImage) {
        generateGrid();
    }
}

function handleMaxColorsInputChange(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(maxColorsSlider.min);
    const max = parseInt(maxColorsSlider.max);
    
    if (isNaN(value)) return;
    
    // Clamp value to min/max
    value = Math.max(min, Math.min(max, value));
    
    maxColors = value;
    maxColorsSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleMaxColorsInputBlur(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(maxColorsSlider.min);
    const max = parseInt(maxColorsSlider.max);
    
    if (isNaN(value) || value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }
    
    maxColors = value;
    maxColorsSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleImageScaleSliderChange(e) {
    const value = parseInt(e.target.value);
    imageScale = value;
    imageScaleInput.value = value;
    if (currentImage) {
        generateGrid();
    }
}

function handleImageScaleInputChange(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(imageScaleSlider.min);
    const max = parseInt(imageScaleSlider.max);
    
    if (isNaN(value)) return;
    
    // Clamp value to min/max
    value = Math.max(min, Math.min(max, value));
    
    imageScale = value;
    imageScaleSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleImageScaleInputBlur(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(imageScaleSlider.min);
    const max = parseInt(imageScaleSlider.max);
    
    if (isNaN(value) || value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }
    
    imageScale = value;
    imageScaleSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleOffsetXSliderChange(e) {
    const value = parseInt(e.target.value);
    offsetX = value;
    offsetXInput.value = value;
    if (currentImage) {
        generateGrid();
    }
}

function handleOffsetXInputChange(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(offsetXSlider.min);
    const max = parseInt(offsetXSlider.max);
    
    if (isNaN(value)) return;
    
    // Clamp value to min/max
    value = Math.max(min, Math.min(max, value));
    
    offsetX = value;
    offsetXSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleOffsetXInputBlur(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(offsetXSlider.min);
    const max = parseInt(offsetXSlider.max);
    
    if (isNaN(value) || value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }
    
    offsetX = value;
    offsetXSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleOffsetYSliderChange(e) {
    const value = parseInt(e.target.value);
    offsetY = value;
    offsetYInput.value = value;
    if (currentImage) {
        generateGrid();
    }
}

function handleOffsetYInputChange(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(offsetYSlider.min);
    const max = parseInt(offsetYSlider.max);
    
    if (isNaN(value)) return;
    
    // Clamp value to min/max
    value = Math.max(min, Math.min(max, value));
    
    offsetY = value;
    offsetYSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleOffsetYInputBlur(e) {
    let value = parseInt(e.target.value);
    const min = parseInt(offsetYSlider.min);
    const max = parseInt(offsetYSlider.max);
    
    if (isNaN(value) || value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }
    
    offsetY = value;
    offsetYSlider.value = value;
    e.target.value = value;
    
    if (currentImage) {
        generateGrid();
    }
}

function handleGridLinesToggle(e) {
    showGridLines = e.target.checked;
    if (currentImage) {
        generateGrid();
    }
}

function calculateGridRows(cols, imgWidth, imgHeight) {
    const aspectRatio = imgHeight / imgWidth;
    const rows = Math.max(1, Math.round(cols * aspectRatio));
    return rows;
}

function scaleImageToGrid(img, cols, rows, scalePercent, offsetXPercent, offsetYPercent) {
    // Create a canvas scaled to grid dimensions
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cols;
    tempCanvas.height = rows;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Calculate zoom: scale > 100 means zoom in (crop from center)
    // scale = 100 means full image, scale = 120 means crop to 100/120 of image from center
    const scaleFactor = scalePercent / 100;
    
    if (scaleFactor === 1) {
        // No zoom, use full image (but still apply offset if any)
        if (offsetXPercent === 0 && offsetYPercent === 0) {
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(img, 0, 0, cols, rows);
        } else {
            // Apply offset even at 100% scale
            const offsetX = (offsetXPercent / 100) * img.width;
            const offsetY = (offsetYPercent / 100) * img.height;
            const sourceX = Math.max(0, Math.min(img.width - cols, offsetX));
            const sourceY = Math.max(0, Math.min(img.height - rows, offsetY));
            const sourceWidth = Math.min(cols, img.width - sourceX);
            const sourceHeight = Math.min(rows, img.height - sourceY);
            
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, sourceWidth, sourceHeight
            );
        }
    } else if (scaleFactor > 1) {
        // Zoom in: crop with offset applied
        const sourceWidth = img.width / scaleFactor;
        const sourceHeight = img.height / scaleFactor;
        
        // Calculate center position, then apply offset
        let sourceX = (img.width - sourceWidth) / 2;
        let sourceY = (img.height - sourceHeight) / 2;
        
        // Apply offset (as percentage of the available movement range)
        const maxOffsetX = (img.width - sourceWidth) / 2;
        const maxOffsetY = (img.height - sourceHeight) / 2;
        sourceX += (offsetXPercent / 100) * maxOffsetX * 2;
        sourceY += (offsetYPercent / 100) * maxOffsetY * 2;
        
        // Clamp to image boundaries
        sourceX = Math.max(0, Math.min(img.width - sourceWidth, sourceX));
        sourceY = Math.max(0, Math.min(img.height - sourceHeight, sourceY));
        
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle (cropped with offset)
            0, 0, cols, rows  // Destination rectangle (full canvas)
        );
    } else {
        // Zoom out: scale down (this case is less common but supported)
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(img, 0, 0, cols, rows);
    }
    
    return tempCtx.getImageData(0, 0, cols, rows);
}

function quantizeColors(colors, maxColors) {
    if (colors.length === 0) return [];
    if (maxColors <= 1) {
        // Return average color if maxColors is 1
        const avg = colors.reduce((acc, c) => {
            acc.r += c.r;
            acc.g += c.g;
            acc.b += c.b;
            return acc;
        }, { r: 0, g: 0, b: 0 });
        return [{
            r: Math.round(avg.r / colors.length),
            g: Math.round(avg.g / colors.length),
            b: Math.round(avg.b / colors.length)
        }];
    }

    // Use a threshold/contrast-based approach: cluster colors by similarity
    // This guarantees we get exactly maxColors distinct colors
    
    // Calculate color ranges in the image
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;
    
    colors.forEach(color => {
        minR = Math.min(minR, color.r);
        maxR = Math.max(maxR, color.r);
        minG = Math.min(minG, color.g);
        maxG = Math.max(maxG, color.g);
        minB = Math.min(minB, color.b);
        maxB = Math.max(maxB, color.b);
    });
    
    const rangeR = maxR - minR || 255;
    const rangeG = maxG - minG || 255;
    const rangeB = maxB - minB || 255;
    
    // Create buckets based on maxColors
    // Use a 3D grid approach: divide each channel into bins
    const binsPerChannel = Math.ceil(Math.pow(maxColors, 1/3));
    const binSizeR = Math.max(1, rangeR / binsPerChannel);
    const binSizeG = Math.max(1, rangeG / binsPerChannel);
    const binSizeB = Math.max(1, rangeB / binsPerChannel);
    
    // Create buckets and collect colors
    const buckets = new Map();
    
    colors.forEach(color => {
        const binR = Math.min(binsPerChannel - 1, Math.floor((color.r - minR) / binSizeR));
        const binG = Math.min(binsPerChannel - 1, Math.floor((color.g - minG) / binSizeG));
        const binB = Math.min(binsPerChannel - 1, Math.floor((color.b - minB) / binSizeB));
        const key = `${binR},${binG},${binB}`;
        
        if (!buckets.has(key)) {
            buckets.set(key, []);
        }
        buckets.get(key).push(color);
    });
    
    // Calculate average color for each bucket
    const bucketColors = Array.from(buckets.entries()).map(([key, bucketColors]) => {
        const avg = bucketColors.reduce((acc, c) => {
            acc.r += c.r;
            acc.g += c.g;
            acc.b += c.b;
            return acc;
        }, { r: 0, g: 0, b: 0 });
        return {
            r: Math.round(avg.r / bucketColors.length),
            g: Math.round(avg.g / bucketColors.length),
            b: Math.round(avg.b / bucketColors.length),
            count: bucketColors.length
        };
    });
    
    // Sort by frequency (most common colors first)
    bucketColors.sort((a, b) => b.count - a.count);
    
    // If we have more buckets than maxColors, merge similar ones
    while (bucketColors.length > maxColors) {
        // Find two most similar colors and merge them
        let minDist = Infinity;
        let mergeIdx1 = 0;
        let mergeIdx2 = 1;
        
        for (let i = 0; i < bucketColors.length; i++) {
            for (let j = i + 1; j < bucketColors.length; j++) {
                const dist = Math.pow(bucketColors[i].r - bucketColors[j].r, 2) +
                           Math.pow(bucketColors[i].g - bucketColors[j].g, 2) +
                           Math.pow(bucketColors[i].b - bucketColors[j].b, 2);
                if (dist < minDist) {
                    minDist = dist;
                    mergeIdx1 = i;
                    mergeIdx2 = j;
                }
            }
        }
        
        // Merge the two closest colors (weighted by count)
        const totalCount = bucketColors[mergeIdx1].count + bucketColors[mergeIdx2].count;
        bucketColors[mergeIdx1] = {
            r: Math.round((bucketColors[mergeIdx1].r * bucketColors[mergeIdx1].count + 
                          bucketColors[mergeIdx2].r * bucketColors[mergeIdx2].count) / totalCount),
            g: Math.round((bucketColors[mergeIdx1].g * bucketColors[mergeIdx1].count + 
                          bucketColors[mergeIdx2].g * bucketColors[mergeIdx2].count) / totalCount),
            b: Math.round((bucketColors[mergeIdx1].b * bucketColors[mergeIdx1].count + 
                          bucketColors[mergeIdx2].b * bucketColors[mergeIdx2].count) / totalCount),
            count: totalCount
        };
        
        bucketColors.splice(mergeIdx2, 1);
    }
    
    // If we have fewer than maxColors, add evenly spaced colors
    while (bucketColors.length < maxColors) {
        // Add colors that are different from existing ones
        const existingColors = bucketColors.map(c => ({ r: c.r, g: c.g, b: c.b }));
        
        // Try to find a color that's far from all existing ones
        let bestColor = null;
        let maxMinDist = -1;
        
        // Sample from the original colors
        for (let i = 0; i < Math.min(100, colors.length); i++) {
            const candidate = colors[Math.floor(Math.random() * colors.length)];
            let minDist = Infinity;
            
            existingColors.forEach(existing => {
                const dist = Math.pow(candidate.r - existing.r, 2) +
                           Math.pow(candidate.g - existing.g, 2) +
                           Math.pow(candidate.b - existing.b, 2);
                if (dist < minDist) minDist = dist;
            });
            
            if (minDist > maxMinDist) {
                maxMinDist = minDist;
                bestColor = candidate;
            }
        }
        
        if (bestColor) {
            bucketColors.push({ r: bestColor.r, g: bestColor.g, b: bestColor.b, count: 1 });
        } else {
            // Fallback: add evenly spaced colors in the color space
            const step = bucketColors.length;
            bucketColors.push({
                r: Math.floor(minR + (step * rangeR) / maxColors),
                g: Math.floor(minG + (step * rangeG) / maxColors),
                b: Math.floor(minB + (step * rangeB) / maxColors),
                count: 1
            });
        }
    }
    
    // Return exactly maxColors colors (remove count property)
    return bucketColors.slice(0, maxColors).map(c => ({ r: c.r, g: c.g, b: c.b }));
}

function findNearestColor(color, palette) {
    let minDist = Infinity;
    let nearest = palette[0];
    
    palette.forEach(paletteColor => {
        const dist = Math.pow(color.r - paletteColor.r, 2) +
                   Math.pow(color.g - paletteColor.g, 2) +
                   Math.pow(color.b - paletteColor.b, 2);
        if (dist < minDist) {
            minDist = dist;
            nearest = paletteColor;
        }
    });
    
    return nearest;
}

function generateGrid() {
    if (!currentImage) return;

    // Calculate grid dimensions
    gridRows = calculateGridRows(gridCols, currentImage.width, currentImage.height);

    // Scale image to grid size for efficient sampling (with zoom and offset applied)
    scaledImageData = scaleImageToGrid(currentImage, gridCols, gridRows, imageScale, offsetX, offsetY);
    
    // Collect all colors from scaled image
    const colors = [];
    const data = scaledImageData.data;
    for (let i = 0; i < data.length; i += 4) {
        colors.push({
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        });
    }

    // Quantize colors to maxColors palette
    const colorPalette = quantizeColors(colors, maxColors);

    // Set canvas size (each cell is 30px)
    const cellSize = 30;
    const canvasWidth = gridCols * cellSize;
    const canvasHeight = gridRows * cellSize;

    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Generate grid cells using quantized colors
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const idx = (row * gridCols + col) * 4;
            const originalColor = {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            };

            // Find nearest color in palette
            const color = findNearestColor(originalColor, colorPalette);

            // Draw cell
            const x = col * cellSize;
            const y = row * cellSize;

            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.fillRect(x, y, cellSize, cellSize);

            // Draw grid line if enabled
            if (showGridLines) {
                ctx.strokeStyle = 'rgba(255, 107, 157, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    }

    // Scale view to fit in viewport
    scaleView(cellSize);

    // Generate labels
    generateLabels(cellSize);

    // Update resolution text
    resolutionText.textContent = `Grid: ${gridCols} × ${gridRows}`;

    // Show grid container, hide empty state
    emptyState.style.display = 'none';
    gridContainer.style.display = 'block';
    downloadBtn.disabled = false;
}

function scaleView(cellSize) {
    const canvasWidth = gridCols * cellSize;
    const canvasHeight = gridRows * cellSize;
    const totalWidth = canvasWidth + 50; // +50 for row labels
    const totalHeight = canvasHeight + 35; // +35 for column labels + margin
    
    // Get available space in preview panel
    const previewPanel = document.querySelector('.preview-panel');
    const maxWidth = previewPanel.clientWidth - 60; // padding
    const maxHeight = Math.max(window.innerHeight - 350, 400); // minimum 400px height
    
    // Calculate scale to fit (don't scale up, only down)
    const scaleX = maxWidth / totalWidth;
    const scaleY = maxHeight / totalHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    const gridWrapper = document.querySelector('.grid-wrapper');
    
    if (scale < 1) {
        // Scale the entire wrapper
        gridWrapper.style.transform = `scale(${scale})`;
        gridWrapper.style.transformOrigin = 'top left';
        
        // Set wrapper to actual size, transform will scale it visually
        gridWrapper.style.width = `${totalWidth}px`;
        gridWrapper.style.height = `${totalHeight}px`;
        
        // Container needs to account for scaled dimensions to prevent overflow
        gridContainer.style.width = `${totalWidth * scale}px`;
        gridContainer.style.height = `${totalHeight * scale}px`;
    } else {
        // Reset scaling when no scaling needed
        gridWrapper.style.transform = '';
        gridWrapper.style.transformOrigin = '';
        gridWrapper.style.width = '';
        gridWrapper.style.height = '';
        gridContainer.style.width = '';
        gridContainer.style.height = '';
    }
}

function generateLabels(cellSize) {
    // Clear existing labels
    rowLabels.innerHTML = '';
    columnLabels.innerHTML = '';

    // Generate column labels (1-indexed)
    for (let col = 0; col < gridCols; col++) {
        const label = document.createElement('div');
        label.className = 'column-label';
        label.textContent = col + 1;
        label.style.width = `${cellSize}px`;
        columnLabels.appendChild(label);
    }

    // Generate row labels (1-indexed)
    for (let row = 0; row < gridRows; row++) {
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = row + 1;
        label.style.height = `${cellSize}px`;
        rowLabels.appendChild(label);
    }
}

function handleDownload() {
    if (!gridCanvas) return;

    // Create a link element
    const link = document.createElement('a');
    link.download = 'pikcelgrid-output.png';
    link.href = gridCanvas.toDataURL('image/png');
    link.click();
}
