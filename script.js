function createD3Heatmap(data, labels) {
    const margin = { top: 50, right: 25, bottom: 50, left: 60 };
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // 清除现有的图表内容
    d3.select("#heatmap").html("");

    const svg = d3.select("#heatmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(labels)
        .padding(0.05);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    const yScale = d3.scaleBand()
        .range([height, 0])
        .domain(labels)
        .padding(0.05);

    svg.append("g")
        .call(d3.axisLeft(yScale));

    const colorScale = d3.scaleLinear()
        .range(["blue", "white", "red"])
        .domain([-1, 0, 1]);

    svg.selectAll()
        .data(data.flatMap((value, i) => value.map((v, j) => ({ x: labels[j], y: labels[i], z: v }))))
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(d.y))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d.z));
}



function readAndAnalyzeFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const content = e.target.result;
            const { matrix, labels } = parseCSV(content); // 确保解析 CSV 并获取矩阵和标签
            if (matrix && matrix.length > 0) {
                const correlationMatrix = calculateCorrelationMatrix(matrix);
                document.getElementById('analysisResult').textContent = JSON.stringify(correlationMatrix, null, 2);
                createD3Heatmap(correlationMatrix, labels); // 使用 createD3Heatmap 替换 createHeatmap
            } else {
                alert('无法解析文件或文件为空！');
            }
        };

        reader.readAsText(file);
    } else {
        alert('请上传一个文件！');
    }
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