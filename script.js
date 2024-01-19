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
        };

        reader.readAsText(file);
    } else {
        alert('请上传一个文件！');
    }
}

function parseCSV(csvContent) {
    // 更新 CSV 解析逻辑，确保每个元素都是数字
    return csvContent.trim().split('\n').map(row => 
        row.split(',').map(value => parseFloat(value.trim())).filter(value => !isNaN(value))
    );
}

function calculateCorrelationMatrix(matrix) {
    let correlationMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        correlationMatrix[i] = [];
        for (let j = 0; j < matrix[i].length; j++) {
            if (i === j) {
                correlationMatrix[i][j] = 1;
            } else {
                correlationMatrix[i][j] = calculatePearsonCorrelation(matrix.map(row => row[i]), matrix.map(row => row[j]));
            }
        }
    }
    return correlationMatrix;
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
    let denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

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