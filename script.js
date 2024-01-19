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
    if (x.length === 0 || y.length === 0) {
        return 0; // 或者返回其他适当的值或错误信息
    }

    let meanX = math.mean(x);
    let meanY = math.mean(y);
    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < x.length; i++) {
        numerator += (x[i] - meanX) * (y[i] - meanY);
        denominatorX += math.pow(x[i] - meanX, 2);
        denominatorY += math.pow(y[i] - meanY, 2);
    }

    return numerator / (math.sqrt(denominatorX) * math.sqrt(denominatorY));
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