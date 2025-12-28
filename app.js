// State
let currentImage = null;
let imageData = null;
let gridCols = 10;
let gridRows = 1;
let showGridLines = true;

// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const gridSizeSlider = document.getElementById('gridSize');
const gridSizeValue = document.getElementById('gridSizeValue');
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
gridSizeSlider.addEventListener('input', handleGridSizeChange);
showGridLinesCheckbox.addEventListener('change', handleGridLinesToggle);
downloadBtn.addEventListener('click', handleDownload);

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileInfo.textContent = file.name;
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            currentImage = img;
            loadImageData();
            generateGrid();
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function loadImageData() {
    // Create a temporary canvas to get image data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = currentImage.width;
    tempCanvas.height = currentImage.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(currentImage, 0, 0);
    imageData = tempCtx.getImageData(0, 0, currentImage.width, currentImage.height);
}

function handleGridSizeChange(e) {
    gridCols = parseInt(e.target.value);
    gridSizeValue.textContent = gridCols;
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

function getAverageColor(x, y, cellW, cellH, imgWidth, imgHeight) {
    const data = imageData.data;
    let r = 0, g = 0, b = 0, count = 0;

    // Sample pixels in the cell region
    const startX = Math.floor(x);
    const startY = Math.floor(y);
    const endX = Math.min(Math.floor(x + cellW), imgWidth);
    const endY = Math.min(Math.floor(y + cellH), imgHeight);

    // Sample strategy: for larger cells, sample a grid; for smaller cells, sample all pixels
    const sampleStep = Math.max(1, Math.floor(Math.min(cellW, cellH) / 5));
    
    for (let py = startY; py < endY; py += sampleStep) {
        for (let px = startX; px < endX; px += sampleStep) {
            const idx = (py * imgWidth + px) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
        }
    }

    if (count === 0) return { r: 0, g: 0, b: 0 };

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

function generateGrid() {
    if (!currentImage || !imageData) return;

    // Calculate grid dimensions
    gridRows = calculateGridRows(gridCols, currentImage.width, currentImage.height);

    // Set canvas size (each cell is 30px)
    const cellSize = 30;
    const canvasWidth = gridCols * cellSize;
    const canvasHeight = gridRows * cellSize;

    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;

    // Calculate cell dimensions in image coordinates
    const cellW = currentImage.width / gridCols;
    const cellH = currentImage.height / gridRows;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Generate grid cells
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const imgX = col * cellW;
            const imgY = row * cellH;

            // Get average color for this cell
            const color = getAverageColor(imgX, imgY, cellW, cellH, currentImage.width, currentImage.height);

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

    // Generate labels
    generateLabels(cellSize);

    // Update resolution text
    resolutionText.textContent = `Grid: ${gridCols} × ${gridRows}`;

    // Show grid container, hide empty state
    emptyState.style.display = 'none';
    gridContainer.style.display = 'block';
    downloadBtn.disabled = false;
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

