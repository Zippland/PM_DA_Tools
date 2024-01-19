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
    return csvContent.split('\n').map(row => row.split(',').map(Number));
}

function calculateCorrelationMatrix(matrix) {
    let correlationMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        correlationMatrix[i] = [];
        for (let j = 0; j < matrix[i].length; j++) {
            if (i === j) {
                correlationMatrix[i][j] = 1;
            } else {
                correlationMatrix[i][j] = math.corr(matrix.map(row => row[i]), matrix.map(row => row[j]));
            }
        }
    }
    return correlationMatrix;
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