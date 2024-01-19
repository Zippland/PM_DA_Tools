function createD3Heatmap(data, labels) {
    const margin = { top: 50, right: 25, bottom: 50, left: 60 };
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    const legendWidth = 50; // 调整图例宽度
    const totalWidth = width + margin.left + margin.right + legendWidth; // 总宽度包括图例

    // 清除现有的图表内容
    d3.select("#heatmap").html("");

    // 创建热力图和图例的 SVG 容器
    const svg = d3.select("#heatmap").append("svg")
        .attr("width", totalWidth)
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

    // 使用热力图的高度作为图例高度
    const legendHeight = height;

    // 创建颜色图例的 SVG 容器（位于热力图右侧）
    const legendSvg = d3.select("#heatmap svg").append("g")
        .attr("transform", `translate(${width + margin.left + margin.right + 10}, ${margin.top})`);

    // 创建颜色比例尺
    const legendScale = d3.scaleLinear()
        .range([legendHeight, 0])
        .domain([1, -1]);

    // 定义颜色图例的轴
    const legendAxis = d3.axisRight(legendScale)
        .tickValues([1, 0, -1]) // 明确设置刻度为 1, 0, -1
        .tickFormat(d3.format(".1f"));

    // 添加颜色图例的渐变
    legendSvg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%")
        .selectAll("stop")
        .data(colorScale.range().map(function(color, index) {
            return {
                color: color,
                offset: `${index * 50}%`,
                value: colorScale.domain()[index]
            };
        }))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // 绘制颜色图例
    legendSvg.append("rect")
        .attr("width", legendWidth - 10)
        .attr("height", legendHeight)
        .style("fill", "url(#gradient)");

    // 添加颜色图例的轴
    legendSvg.append("g")
        .attr("transform", `translate(${legendWidth - 10}, 0)`)
        .call(legendAxis)
        .selectAll("text")
        .style("font-size", "10px"); // 确保文字大小合适

    // 在热力图每个块上显示数值
    svg.selectAll()
        .data(data.flatMap((value, i) => value.map((v, j) => ({ x: labels[j], y: labels[i], z: v }))))
        .enter()
        .append("text")
        .text(d => d.z.toFixed(3)) // 显示省略到三位小数的数值
        .attr("x", d => xScale(d.x) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.y) + yScale.bandwidth() / 2)
        .attr("dy", ".35em") // 垂直居中
        .attr("text-anchor", "middle") // 水平居中
        .style("font-size", "10px") // 文字大小
        .style("fill", "black"); // 文字颜色
}



function readAndAnalyzeFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        // 检查文件类型是否为 CSV
        if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
            alert('请上传 CSV 格式的文件！');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const content = e.target.result;
            try {
                const { matrix, labels } = parseCSV(content);
                if (matrix && matrix.length > 0 && labels.length > 0) {
                    const correlationMatrix = calculateCorrelationMatrix(matrix);
                    document.getElementById('analysisResult').textContent = JSON.stringify(correlationMatrix, null, 2);
                    createD3Heatmap(correlationMatrix, labels); // 使用 createD3Heatmap 替换 createHeatmap
                } else {
                    alert('CSV 文件格式不正确：必须包含标题行和数据行');
                }
            } catch (error) {
                alert(error.message);
            }
        };

        reader.readAsText(file);
    } else {
        alert('请上传一个文件！');
    }
}




function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const labels = lines[0].split(',').map(label => label.trim());

    const matrix = lines.slice(1).map(row => {
        return row.split(',').map(value => {
            const num = parseFloat(value.trim());
            if (isNaN(num)) {
                throw new Error('数据格式错误：所有行必须只包含数字');
            }
            return num;
        });
    });

    return { matrix, labels };
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

// 获取弹窗
var modal = document.getElementById("myModal");

// 获取打开弹窗的按钮
var btn = document.getElementById("openModal");

// 获取关闭弹窗的 <span> 元素
var span = document.getElementsByClassName("close")[0];

// 点击按钮打开弹窗
btn.onclick = function() {
    modal.style.display = "block";
}

// 点击 <span> (x), 关闭弹窗
span.onclick = function() {
    modal.style.display = "none";
}

// 点击窗口外部关闭弹窗
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
