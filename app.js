// State
let currentImage = null;
let imageData = null;
let scaledImageData = null;
let gridCols = 10;
let gridRows = 1;
let showGridLines = true;
let maxColors = 3;
let imageScale = 100;

// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const gridSizeSlider = document.getElementById('gridSize');
const gridSizeInput = document.getElementById('gridSizeInput');
const maxColorsSlider = document.getElementById('maxColors');
const maxColorsInput = document.getElementById('maxColorsInput');
const imageScaleSlider = document.getElementById('imageScale');
const imageScaleInput = document.getElementById('imageScaleInput');
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

function scaleImageToGrid(img, cols, rows, scalePercent) {
    // Create a canvas scaled to grid dimensions
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cols;
    tempCanvas.height = rows;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Calculate zoom: scale > 100 means zoom in (crop from center)
    // scale = 100 means full image, scale = 120 means crop to 100/120 of image from center
    const scaleFactor = scalePercent / 100;
    
    if (scaleFactor === 1) {
        // No zoom, use full image
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(img, 0, 0, cols, rows);
    } else if (scaleFactor > 1) {
        // Zoom in: crop from center
        const sourceWidth = img.width / scaleFactor;
        const sourceHeight = img.height / scaleFactor;
        const sourceX = (img.width - sourceWidth) / 2;
        const sourceY = (img.height - sourceHeight) / 2;
        
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle (cropped from center)
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
    if (colors.length <= maxColors) return colors;

    // Simple k-means clustering for color quantization
    // Initialize centroids with evenly distributed colors
    const centroids = [];
    for (let i = 0; i < maxColors; i++) {
        const idx = Math.floor((i / maxColors) * colors.length);
        centroids.push({ r: colors[idx].r, g: colors[idx].g, b: colors[idx].b });
    }

    // K-means iteration (simplified, fixed iterations)
    for (let iter = 0; iter < 10; iter++) {
        const clusters = Array(maxColors).fill().map(() => []);
        
        // Assign colors to nearest centroid
        colors.forEach(color => {
            let minDist = Infinity;
            let nearestIdx = 0;
            centroids.forEach((centroid, idx) => {
                const dist = Math.pow(color.r - centroid.r, 2) +
                           Math.pow(color.g - centroid.g, 2) +
                           Math.pow(color.b - centroid.b, 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = idx;
                }
            });
            clusters[nearestIdx].push(color);
        });

        // Update centroids
        centroids.forEach((centroid, idx) => {
            if (clusters[idx].length > 0) {
                const avg = clusters[idx].reduce((acc, color) => {
                    acc.r += color.r;
                    acc.g += color.g;
                    acc.b += color.b;
                    return acc;
                }, { r: 0, g: 0, b: 0 });
                centroid.r = Math.round(avg.r / clusters[idx].length);
                centroid.g = Math.round(avg.g / clusters[idx].length);
                centroid.b = Math.round(avg.b / clusters[idx].length);
            }
        });
    }

    return centroids;
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

    // Scale image to grid size for efficient sampling (with zoom applied)
    scaledImageData = scaleImageToGrid(currentImage, gridCols, gridRows, imageScale);
    
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
