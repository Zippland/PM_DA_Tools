function createHeatmap(data, labels) {
    const heatmapData = [{
        x: labels,
        y: labels,
        z: data,
        type: 'heatmap',
        colorscale: [
            [-1, 'blue'], // 数据值为 -1 时的颜色
            [0, 'white'],  // 数据值为 0 时的颜色
            [1, 'red']     // 数据值为 1 时的颜色
        ],
        zmin: -1, // 设置热力图数据的最小值
        zmax: 1   // 设置热力图数据的最大值
    }];

    Plotly.newPlot('correlationHeatmap', heatmapData);
}


function readAndAnalyzeFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const content = e.target.result;
            const matrix = parseCSV(content);
            const correlationMatrix = calculateCorrelationMatrix(matrix);
            document.getElementById('analysisResult').textContent = JSON.stringify(correlationMatrix, null, 2);
            createHeatmap(correlationMatrix);
        };

        reader.readAsText(file);
    } else {
        alert('请上传一个文件！');
    }

    reader.onload = function(e) {
        const content = e.target.result;
        const { matrix, labels } = parseCSV(content); // 现在返回包含标签的对象
        const correlationMatrix = calculateCorrelationMatrix(matrix);
        createHeatmap(correlationMatrix, labels); // 将标签传递给 createHeatmap
    };
}

function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const labels = lines[0].split(',').map(label => label.trim()); // 获取标题
    const matrix = lines.slice(1).map(row =>
        row.split(',').map(value => parseFloat(value.trim()))
    ).filter(row => row.every(value => !isNaN(value)));

    return { matrix, labels }; // 返回一个包含矩阵和标签的对象
}

function calculateCorrelationMatrix(matrix) {
    let correlationMatrix = [];
    let numRows = matrix.length;
    let numCols = matrix[0].length;

    for (let i = 0; i < numCols; i++) {
        correlationMatrix[i] = [];
        for (let j = 0; j < numCols; j++) {
            if (i === j) {
                correlationMatrix[i][j] = 1;
            } else {
                let colX = matrix.map(row => row[i]);
                let colY = matrix.map(row => row[j]);
                correlationMatrix[i][j] = calculatePearsonCorrelation(colX, colY);
            }
        }
    }
    return correlationMatrix;
}

// 牛顿迭代法计算平方根
function sqrt(value) {
    let x = value;
    let y = 1;
    const epsilon = 0.000001; // 精度

    while (x - y > epsilon) {
        x = (x + y) / 2;
        y = value / x;
    }

    return x;
}

function calculatePearsonCorrelation(x, y) {
    if (x.length === 0 || y.length === 0 || x.length !== y.length) {
        return 0; // 或者返回其他适当的值或错误信息
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    let n = x.length;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    let numerator = n * sumXY - sumX * sumY;
    let denominator = sqrt(n * sumX2 - sumX * sumX) * sqrt(n * sumY2 - sumY * sumY);

    if (denominator === 0) return 0;

    return numerator / denominator;
}

function downloadCSV() {
    const csvText = `Column1,Column2,Column3\nValue1,Value2,Value3\nValue4,Value5,Value6`;
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "example.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}