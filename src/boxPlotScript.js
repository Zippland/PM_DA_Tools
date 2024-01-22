// 绑定事件到文件输入
document.getElementById('fileInput').addEventListener('change', function(event) {
    // 更改上传按钮的文字
    document.getElementById('uploadButton').textContent = '分析';

    // 读取文件
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            processData(content);
        };
        reader.readAsText(file);
    }
});

// 处理 CSV 数据
function processData(csvContent) {
    // 使用 D3 解析 CSV 数据
    const data = d3.csvParse(csvContent);

    // 假设所有列都是数值类型的数据
    const columns = data.columns;

    // 清空现有的选项
    document.getElementById('xAxis').innerHTML = '';
    document.getElementById('yAxis').innerHTML = '';

    // 为 X 轴和 Y 轴填充选项
    columns.forEach(column => {
        const optionX = document.createElement('option');
        optionX.value = column;
        optionX.textContent = column;
        document.getElementById('xAxis').appendChild(optionX);

        const optionY = document.createElement('option').cloneNode(true);
        optionY.value = column;
        optionY.textContent = column;
        document.getElementById('yAxis').appendChild(optionY);
    });
}


// 下载示例 CSV 文件
function downloadCSV() {
    const sampleData = 'Column1,Column2\n1,2\n3,4\n5,6';
    const encodedUri = encodeURI(sampleData);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 读取和创建箱型图
function readAndCreateBoxPlot() {
    const xAxisValue = document.getElementById('xAxis').value;
    const yAxisValue = document.getElementById('yAxis').value;

    if (xAxisValue === yAxisValue) {
        alert('请在 X 轴和 Y 轴中选择不同的数据列');
        return;
    }

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const data = d3.csvParse(content);
            createBoxPlot(data, xAxisValue, yAxisValue);
        };
        reader.readAsText(file);
    }
}


// 示例函数：绘制箱型图（根据你的实际需求进行实现）
function createBoxPlot(data, xAxis, yAxis) {
    // 基本配置
    const margin = {top: 10, right: 30, bottom: 30, left: 40},
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // 清除既有的图表内容
    const boxPlotArea = document.getElementById('boxPlot');
    boxPlotArea.innerHTML = '';

    // 添加 SVG 元素
    const svg = d3.select('#boxPlot')
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // X轴的比例尺
    const x = d3.scaleBand()
                .range([0, width])
                .domain(data.map(d => d[xAxis]))
                .paddingInner(1)
                .paddingOuter(0.5);

    // 添加 X 轴
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

    // Y轴的比例尺
    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => +d[yAxis])])
                .range([height, 0]);

    // 添加 Y 轴
    svg.append("g").call(d3.axisLeft(y));

    // 绘制箱型图的核心逻辑
    data.forEach((d, i) => {
        // 对每个类别的数据进行处理
        const values = d[yAxis].split(",").map(v => +v).sort(d3.ascending);
        const q1 = d3.quantile(values, .25);
        const median = d3.quantile(values, .5);
        const q3 = d3.quantile(values, .75);
        const interQuantileRange = q3 - q1;
        const min = q1 - 1.5 * interQuantileRange;
        const max = q3 + 1.5 * interQuantileRange;

        // 绘制箱体
        svg.append("rect")
           .attr("x", x(d[xAxis]))
           .attr("y", y(q3))
           .attr("width", x.bandwidth())
           .attr("height", (y(q1) - y(q3)))
           .attr("stroke", "black")
           .style("fill", "#69b3a2");

        // 绘制中位数线
        svg.append("line")
           .attr("x1", x(d[xAxis]))
           .attr("x2", x(d[xAxis]) + x.bandwidth())
           .attr("y1", y(median))
           .attr("y2", y(median))
           .attr("stroke", "black");

        // 绘制上下触须
        svg.append("line")
           .attr("x1", x(d[xAxis]) + x.bandwidth()/2)
           .attr("x2", x(d[xAxis]) + x.bandwidth()/2)
           .attr("y1", y(min))
           .attr("y2", y(q1))
           .attr("stroke", "black");
        svg.append("line")
           .attr("x1", x(d[xAxis]) + x.bandwidth()/2)
           .attr("x2", x(d[xAxis]) + x.bandwidth()/2)
           .attr("y1", y(max))
           .attr("y2", y(q3))
           .attr("stroke", "black");
    });
}



